import type { Plugin, ViteDevServer } from 'vite';
import https from 'https';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
  email_verified?: boolean;
}

// In-memory state store for CSRF protection
const oauthStates = new Map<string, { createdAt: number; redirectPath?: string }>();

// Simple session token generator
function generateSessionToken(payload: object, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifySessionToken(token: string, secret: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');
    if (expectedSig !== signature) return null;
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

// Helper to load env vars from .env file
function loadEnvVars() {
  const envPath = path.resolve(process.cwd(), '.env');
  const env: Record<string, string> = { ...(process.env as Record<string, string>) };
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim();
          env[key] = val;
        }
      }
    });
  }
  return env;
}

// POST request helper
function httpsPost(urlStr: string, data: Record<string, string>): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = new URLSearchParams(data).toString();

    const req = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve(body);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// GET request helper
function httpsGet(urlStr: string, headers: Record<string, string> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = https.request(url, { method: 'GET', headers }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}



export function googleAuthPlugin(): Plugin {
  return {
    name: 'vite-plugin-google-auth',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const env = loadEnvVars();
        const clientId = env.GOOGLE_CLIENT_ID || '';
        const clientSecret = env.GOOGLE_CLIENT_SECRET || '';
        const callbackUrl = env.GOOGLE_CALLBACK_URL || 'http://localhost:5173/auth/google/callback';
        const sessionSecret = env.SESSION_SECRET || 'onboardpro_super_secure_session_secret_2026';
        const adminEmails = (env.ADMIN_EMAILS || 'admin@onboardpro.dev,alex.morgan@onboardpro.dev')
          .split(',')
          .map((e) => e.trim().toLowerCase());

        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost:5173'}`);
        const pathname = url.pathname;

        // Set CORS headers for all /api and /auth requests
        if (pathname.startsWith('/api') || pathname.startsWith('/auth')) {
          const origin = req.headers.origin || 'http://localhost:5173';
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

          if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
          }
        }

        // Clean expired states (older than 10 mins)
        const now = Date.now();
        for (const [s, data] of oauthStates.entries()) {
          if (now - data.createdAt > 600000) oauthStates.delete(s);
        }

        // =========================================================
        // 1. HEALTH & SYSTEM DIAGNOSTICS ENDPOINT
        // =========================================================
        if (pathname === '/api/health' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              status: 'healthy',
              service: 'OnboardPro Backend API Engine',
              version: '2.5.0',
              timestamp: new Date().toISOString(),
              uptimeSeconds: Math.floor(process.uptime()),
              environment: {
                nodeVersion: process.version,
                googleOAuthReady: Boolean(clientId && clientSecret),
                configuredAdmins: adminEmails.length,
              },
            })
          );
          return;
        }

        // =========================================================
        // 2. AUTH CONFIG, SESSION & /ME ENDPOINTS
        // =========================================================
        if (pathname === '/api/auth/me' && req.method === 'GET') {
          const cookieHeader = req.headers.cookie || '';
          const cookies: Record<string, string> = {};
          cookieHeader.split(';').forEach((c) => {
            const [k, v] = c.trim().split('=');
            if (k && v) cookies[k] = v;
          });

          const authHeader = req.headers.authorization;
          const token = authHeader?.replace('Bearer ', '') || cookies['onboardpro_session'] || '';
          const session = token ? verifySessionToken(token, sessionSecret) : null;

          res.setHeader('Content-Type', 'application/json');
          if (session) {
            res.end(
              JSON.stringify({
                authenticated: true,
                user: {
                  id: session.googleId || session.id || 'usr-google',
                  name: session.name,
                  email: session.email,
                  role: session.role || 'DEVELOPER',
                  profileImage: session.profileImage,
                  authProvider: session.authProvider || 'google',
                },
              })
            );
          } else {
            res.end(JSON.stringify({ authenticated: false }));
          }
          return;
        }
        if (pathname === '/api/auth/config' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              isGoogleConfigured: Boolean(clientId && clientSecret),
              clientId: clientId ? `${clientId.slice(0, 10)}...` : '',
              callbackUrl,
              adminEmails,
            })
          );
          return;
        }

        if (pathname === '/api/auth/session' && req.method === 'GET') {
          const authHeader = req.headers.authorization;
          const token = authHeader?.replace('Bearer ', '') || '';
          const userSession = token ? verifySessionToken(token, sessionSecret) : null;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ authenticated: Boolean(userSession), user: userSession }));
          return;
        }

        if (pathname === '/api/auth/logout' && req.method === 'POST') {
          res.setHeader('Set-Cookie', [
            'onboardpro_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
          ]);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, message: 'Session logged out' }));
          return;
        }

        // =========================================================
        // 3. GOOGLE OAUTH 2.0 AUTHORIZATION FLOW
        // =========================================================
        if (pathname === '/auth/google' && req.method === 'GET') {
          const state = crypto.randomBytes(24).toString('hex');
          const redirectAfter = url.searchParams.get('redirect') || '/dashboard';
          oauthStates.set(state, { createdAt: Date.now(), redirectPath: redirectAfter });

          if (!clientId || !clientSecret) {
            res.writeHead(302, {
              Location: `/?auth_notice=no_oauth_credentials&state=${state}`,
            });
            res.end();
            return;
          }

          const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
          googleAuthUrl.searchParams.set('client_id', clientId);
          googleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
          googleAuthUrl.searchParams.set('response_type', 'code');
          googleAuthUrl.searchParams.set('scope', 'openid email profile');
          googleAuthUrl.searchParams.set('state', state);
          googleAuthUrl.searchParams.set('prompt', 'select_account');
          googleAuthUrl.searchParams.set('access_type', 'offline');

          res.writeHead(302, { Location: googleAuthUrl.toString() });
          res.end();
          return;
        }

        if (pathname === '/auth/google/callback' && req.method === 'GET') {
          const code = url.searchParams.get('code');
          const state = url.searchParams.get('state');
          const errorParam = url.searchParams.get('error');

          if (errorParam) {
            res.writeHead(302, {
              Location: `/?auth_error=${encodeURIComponent(errorParam)}`,
            });
            res.end();
            return;
          }

          if (!state || !oauthStates.has(state)) {
            res.writeHead(302, {
              Location: `/?auth_error=${encodeURIComponent('CSRF state token mismatch or expired. Please try again.')}`,
            });
            res.end();
            return;
          }

          const stateData = oauthStates.get(state);
          oauthStates.delete(state);

          if (!code) {
            res.writeHead(302, {
              Location: `/?auth_error=${encodeURIComponent('Authorization code missing from Google response.')}`,
            });
            res.end();
            return;
          }

          try {
            const tokenRes = await httpsPost('https://oauth2.googleapis.com/token', {
              code,
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: callbackUrl,
              grant_type: 'authorization_code',
            });

            if (!tokenRes.access_token) {
              res.writeHead(302, {
                Location: `/?auth_error=${encodeURIComponent(tokenRes.error_description || 'Failed to exchange token with Google.')}`,
              });
              res.end();
              return;
            }

            const userInfo: GoogleUserInfo = await httpsGet('https://www.googleapis.com/oauth2/v3/userinfo', {
              Authorization: `Bearer ${tokenRes.access_token}`,
            });

            if (!userInfo.email) {
              res.writeHead(302, {
                Location: `/?auth_error=${encodeURIComponent('Unable to retrieve email from Google profile.')}`,
              });
              res.end();
              return;
            }

            const isAdmin = adminEmails.includes(userInfo.email.toLowerCase().trim());
            const role = isAdmin ? 'ADMIN' : 'DEVELOPER';

            const sessionPayload = {
              googleId: userInfo.sub,
              email: userInfo.email,
              name: userInfo.name,
              profileImage: userInfo.picture,
              authProvider: 'google',
              role,
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
            };

            const sessionToken = generateSessionToken(sessionPayload, sessionSecret);
            const userJson = encodeURIComponent(JSON.stringify(sessionPayload));
            const targetRedirect = stateData?.redirectPath || '/dashboard';

            res.setHeader('Set-Cookie', [
              `onboardpro_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`,
            ]);

            res.writeHead(302, {
              Location: `/?google_auth_success=1&token=${sessionToken}&redirect=${encodeURIComponent(targetRedirect)}&user=${userJson}`,
            });
            res.end();
            return;
          } catch (err: any) {
            res.writeHead(302, {
              Location: `/?auth_error=${encodeURIComponent(err.message || 'OAuth network failure.')}`,
            });
            res.end();
            return;
          }
        }

        // =========================================================
        // 4. REST API DATA MANAGEMENT ENDPOINTS
        // =========================================================
        if (pathname === '/api/reports' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              totalDevelopers: 8,
              readyDevelopers: 5,
              inTrainingDevelopers: 2,
              overdueDevelopers: 1,
              averageReadinessRate: 74,
              totalModules: 12,
              totalEnrollments: 48,
              averageAssessmentScore: 82,
              complianceRate: 88,
              generatedAt: new Date().toISOString(),
            })
          );
          return;
        }

        if (pathname === '/api/teams' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify([
              { id: 'team-frontend', name: 'Frontend Core', department: 'Engineering', leadName: 'Siddharth Nair' },
              { id: 'team-backend', name: 'Backend Platform', department: 'Engineering', leadName: 'Meera Krishnan' },
              { id: 'team-devops', name: 'DevOps & Infrastructure', department: 'Infrastructure', leadName: 'Arjun Sen' },
              { id: 'team-qa', name: 'Quality Engineering', department: 'Engineering', leadName: 'Pooja Iyer' },
            ])
          );
          return;
        }

        // Pass to next middleware if not an API route
        next();
      });
    },
  };
}
