import http from 'http';
import https from 'https';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, 'dist');

// MIME types map for production static asset serving
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
};

// Load .env in development if present
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  const env = { ...process.env };
  if (fs.existsSync(envPath)) {
    try {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const k = trimmed.slice(0, idx).trim();
            const v = trimmed.slice(idx + 1).trim();
            if (!process.env[k]) env[k] = v;
          }
        }
      }
    } catch {}
  }
  return env;
}

const env = loadEnv();
const PORT = Number(process.env.PORT) || 5000;
const SESSION_SECRET = env.SESSION_SECRET || process.env.SESSION_SECRET || 'onboardpro_super_secure_session_secret_2026';
const ADMIN_EMAILS = (env.ADMIN_EMAILS || process.env.ADMIN_EMAILS || 'admin@onboardpro.dev,alex.morgan@onboardpro.dev')
  .split(',')
  .map((e) => e.trim().toLowerCase());

const oauthStates = new Map();

// Helper: Token Generator & Verifier
function generateSessionToken(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifySessionToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
    if (expectedSig !== signature) return null;
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function httpsPost(urlStr, data) {
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

function httpsGet(urlStr, headers = {}) {
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

// Serve a static file from disk
function serveStaticFile(filePath, res, isImmutable = false) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stat = fs.statSync(filePath);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': isImmutable
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=3600',
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error reading static asset');
  }
}

// Serve the index.html SPA entrypoint
function serveIndexHtml(res) {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    try {
      const content = fs.readFileSync(indexPath, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end(content);
    } catch {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading application index.html');
    }
  } else {
    // Fallback if dist/index.html was not generated yet
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>OnboardPro Building...</title>
        <style>
          body { font-family: sans-serif; background: #0b1120; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #111827; padding: 2.5rem; border-radius: 1.5rem; border: 1px solid #1e293b; max-width: 500px; text-align: center; }
          h1 { color: #60a5fa; margin-top: 0; }
          code { background: #1e293b; padding: 0.2rem 0.5rem; border-radius: 0.4rem; color: #38bdf8; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>OnboardPro Production Server</h1>
          <p>The production build is initializing. Please run <code>npm run build</code> to generate static bundle assets.</p>
        </div>
      </body>
      </html>
    `);
  }
}

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const baseUrl = `${proto}://${host}`;
  const url = new URL(req.url || '/', baseUrl);
  const pathname = url.pathname;

  const clientId = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';
  const callbackUrl = env.GOOGLE_CALLBACK_URL || process.env.GOOGLE_CALLBACK_URL || `${baseUrl}/auth/google/callback`;

  // Clean expired OAuth states (10 min ttl)
  const now = Date.now();
  for (const [s, data] of oauthStates.entries()) {
    if (now - data.createdAt > 600000) oauthStates.delete(s);
  }

  // CORS Headers for API & Auth routes
  if (pathname.startsWith('/api') || pathname.startsWith('/auth')) {
    const origin = req.headers.origin || baseUrl;
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

  // =========================================================================
  // API ROUTE HANDLERS
  // =========================================================================

  // 1. Health Check
  if (pathname === '/api/health' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'healthy',
        service: 'OnboardPro Combined Production Engine',
        version: '2.5.0',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        environment: {
          nodeVersion: process.version,
          googleOAuthReady: Boolean(clientId && clientSecret),
          configuredAdmins: ADMIN_EMAILS.length,
          distAvailable: fs.existsSync(path.join(DIST_DIR, 'index.html')),
        },
      })
    );
    return;
  }

  // 2. Auth Config
  if (pathname === '/api/auth/config' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        isGoogleConfigured: Boolean(clientId && clientSecret),
        clientId: clientId ? `${clientId.slice(0, 10)}...` : '',
        callbackUrl,
        adminEmails: ADMIN_EMAILS,
      })
    );
    return;
  }

  // 3. Current Authenticated User (/api/auth/me)
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const cookieHeader = req.headers.cookie || '';
    const cookies = {};
    cookieHeader.split(';').forEach((c) => {
      const [k, v] = c.trim().split('=');
      if (k && v) cookies[k] = v;
    });

    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || cookies['onboardpro_session'] || '';
    const session = token ? verifySessionToken(token, SESSION_SECRET) : null;

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

  // 4. Session Validation
  if (pathname === '/api/auth/session' && req.method === 'GET') {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || '';
    const userSession = token ? verifySessionToken(token, SESSION_SECRET) : null;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ authenticated: Boolean(userSession), user: userSession }));
    return;
  }

  // 5. Logout
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    res.setHeader('Set-Cookie', [
      'onboardpro_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    ]);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, message: 'Session logged out' }));
    return;
  }

  // 6. Reports
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

  // 7. Teams
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

  // =========================================================================
  // GOOGLE OAUTH ROUTES
  // =========================================================================

  // 8. Initiate Google OAuth Flow
  if (pathname === '/auth/google' && req.method === 'GET') {
    const state = crypto.randomBytes(24).toString('hex');
    const redirectAfter = url.searchParams.get('redirect') || '/dashboard';
    oauthStates.set(state, { createdAt: Date.now(), redirectPath: redirectAfter });

    if (!clientId || !clientSecret) {
      res.writeHead(302, { Location: `/?auth_notice=no_oauth_credentials&state=${state}` });
      res.end();
      return;
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', callbackUrl);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('prompt', 'select_account');
    authUrl.searchParams.set('access_type', 'offline');

    res.writeHead(302, { Location: authUrl.toString() });
    res.end();
    return;
  }

  // 9. Google OAuth Callback
  if (pathname === '/auth/google/callback' && req.method === 'GET') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const errorParam = url.searchParams.get('error');

    if (errorParam) {
      res.writeHead(302, { Location: `/?auth_error=${encodeURIComponent(errorParam)}` });
      res.end();
      return;
    }

    if (!state || !oauthStates.has(state)) {
      res.writeHead(302, { Location: `/?auth_error=${encodeURIComponent('CSRF state token mismatch or expired. Please try again.')}` });
      res.end();
      return;
    }

    const stateData = oauthStates.get(state);
    oauthStates.delete(state);

    if (!code) {
      res.writeHead(302, { Location: `/?auth_error=${encodeURIComponent('Authorization code missing from Google response.')}` });
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
        res.writeHead(302, { Location: `/?auth_error=${encodeURIComponent(tokenRes.error_description || 'Failed to exchange token with Google.')}` });
        res.end();
        return;
      }

      const userInfo = await httpsGet('https://www.googleapis.com/oauth2/v3/userinfo', {
        Authorization: `Bearer ${tokenRes.access_token}`,
      });

      if (!userInfo.email) {
        res.writeHead(302, { Location: `/?auth_error=${encodeURIComponent('Unable to retrieve email from Google profile.')}` });
        res.end();
        return;
      }

      const isAdmin = ADMIN_EMAILS.includes(userInfo.email.toLowerCase().trim());
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

      const sessionToken = generateSessionToken(sessionPayload, SESSION_SECRET);
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
    } catch (err) {
      res.writeHead(302, { Location: `/?auth_error=${encodeURIComponent(err.message || 'OAuth network failure.')}` });
      res.end();
      return;
    }
  }

  // =========================================================================
  // STRICT API 404 CATCHER (Never return HTML for unknown API routes)
  // =========================================================================
  if (pathname.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API endpoint not found', path: pathname }));
    return;
  }

  // =========================================================================
  // PRODUCTION STATIC ASSET SERVING & SPA FALLBACK
  // =========================================================================

  // If path has an extension or starts with /assets/, try to serve static file from /dist
  const safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
  const candidateFilePath = path.join(DIST_DIR, safePath);

  // Security check: ensure path is within DIST_DIR
  if (candidateFilePath.startsWith(DIST_DIR) && fs.existsSync(candidateFilePath)) {
    try {
      const stat = fs.statSync(candidateFilePath);
      if (stat.isFile()) {
        const isImmutable = pathname.startsWith('/assets/');
        serveStaticFile(candidateFilePath, res, isImmutable);
        return;
      }
    } catch {}
  }

  // SPA Fallback: for all other web routes (/login, /dashboard, /developer, etc.), return index.html
  serveIndexHtml(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ OnboardPro Combined Production Server running on port ${PORT}`);
  console.log(`➜ Local: http://localhost:${PORT}/`);
  console.log(`➜ Health: http://localhost:${PORT}/api/health`);
});
