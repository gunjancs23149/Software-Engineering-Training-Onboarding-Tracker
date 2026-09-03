import http from 'http';
import https from 'https';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  const env = { ...process.env };
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
        }
      }
    }
  }
  return env;
}

const env = loadEnv();
const PORT = process.env.PORT || 5000;
const CLIENT_ID = env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET || '';
const CALLBACK_URL = env.GOOGLE_CALLBACK_URL || `http://localhost:${PORT}/auth/google/callback`;
const SESSION_SECRET = env.SESSION_SECRET || 'onboardpro_super_secure_session_secret_2026';
const ADMIN_EMAILS = (env.ADMIN_EMAILS || 'admin@onboardpro.dev,alex.morgan@onboardpro.dev')
  .split(',')
  .map((e) => e.trim().toLowerCase());

const oauthStates = new Map();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || `localhost:${PORT}`}`);
  const pathname = url.pathname;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 1. Health Check
  if (pathname === '/api/health' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'healthy',
        service: 'OnboardPro Dedicated Backend Server',
        version: '2.5.0',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        googleOAuthConfigured: Boolean(CLIENT_ID && CLIENT_SECRET),
      })
    );
    return;
  }

  // 2. Auth Config
  if (pathname === '/api/auth/config' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        isGoogleConfigured: Boolean(CLIENT_ID && CLIENT_SECRET),
        clientId: CLIENT_ID ? `${CLIENT_ID.slice(0, 10)}...` : '',
        callbackUrl: CALLBACK_URL,
        adminEmails: ADMIN_EMAILS,
      })
    );
    return;
  }

  // 3. Reports
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
      })
    );
    return;
  }

  // 4. Teams
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

  // 5. Google Auth Initiation
  if (pathname === '/auth/google' && req.method === 'GET') {
    const state = crypto.randomBytes(24).toString('hex');
    oauthStates.set(state, { createdAt: Date.now() });

    if (!CLIENT_ID || !CLIENT_SECRET) {
      res.writeHead(302, { Location: `http://localhost:5173/?auth_notice=no_oauth_credentials&state=${state}` });
      res.end();
      return;
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', CALLBACK_URL);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('prompt', 'select_account');

    res.writeHead(302, { Location: authUrl.toString() });
    res.end();
    return;
  }

  // 6. Logout
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    res.setHeader('Set-Cookie', ['onboardpro_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT']);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, message: 'Logged out' }));
    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`✓ OnboardPro Backend API running on http://localhost:${PORT}`);
});
