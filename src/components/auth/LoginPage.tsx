import React, { useState } from 'react';
import {
  Code2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Check,
  Terminal,
  Layers,
  Cpu,
  Shield,
  Activity,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../context/RouterContext';
import { GoogleAccountModal } from './GoogleAccountModal';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { success, error, warning, info } = useToast();
  const { navigateToTab } = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [googleAuthState, setGoogleAuthState] = useState<'idle' | 'connecting' | 'success'>('idle');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Email / Password Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      error('Work Email Required', 'Please enter your work email.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(cleanEmail, password);
      setIsLoading(false);

      if (res && res.success && res.user) {
        if (res.isNew) {
          success(`Account Created: Welcome, ${res.user.name}!`, 'Your developer workspace is ready.');
        } else {
          success(`Welcome back, ${res.user.name}!`, 'Signed in successfully.');
        }

        if (res.user.role === 'ADMIN') {
          navigateToTab('dashboard');
        } else {
          navigateToTab('developer-dashboard');
        }
      } else {
        error('Login Failed', 'Unable to sign in with those credentials. Please try again.');
      }
    }, 300);
  };

  // Google OAuth Flow Initiation
  const handleContinueWithGoogle = async () => {
    setGoogleAuthState('connecting');

    try {
      // Check backend OAuth configuration
      const configRes = await fetch('/api/auth/config')
        .then((r) => r.json())
        .catch(() => null);

      if (configRes && configRes.isGoogleConfigured) {
        // Direct redirect to live Google OAuth 2.0 flow
        window.location.href = '/auth/google';
        return;
      }

      // If client ID is unconfigured in local sandbox, open Google Account Selector modal
      setGoogleAuthState('idle');
      setIsGoogleModalOpen(true);
    } catch {
      setGoogleAuthState('idle');
      setIsGoogleModalOpen(true);
    }
  };

  // Callback from Google Account Selector
  const handleGoogleAccountSelected = (account: {
    googleId: string;
    name: string;
    email: string;
    profileImage: string;
  }) => {
    setIsGoogleModalOpen(false);
    setGoogleAuthState('connecting');

    setTimeout(() => {
      try {
        const result = loginWithGoogle(account);
        setGoogleAuthState('success');

        setTimeout(() => {
          if (result.isNewUser) {
            // First-time Google user -> Route to Onboarding
            navigateToTab('onboarding');
          } else if (result.user) {
            // Existing user -> Route to role dashboard
            if (result.user.role === 'ADMIN') {
              navigateToTab('dashboard');
            } else {
              navigateToTab('developer-dashboard');
            }
          }
        }, 350);
      } catch {
        setGoogleAuthState('idle');
        error('Authentication Failed', 'Google sign-in was unsuccessful. Please try again.');
      }
    }, 450);
  };

  const handleGoogleModalClose = () => {
    setIsGoogleModalOpen(false);
    setGoogleAuthState('idle');
    warning('Sign-in Cancelled', 'Sign-in cancelled. You can try again.');
  };

  // Compact 1-Click Demo Login Handlers
  const handleDemoLogin = (demoEmail: string, roleTitle: string) => {
    setEmail(demoEmail);
    setPassword('onboardpro123');
    setIsLoading(true);
    setTimeout(() => {
      const res = login(demoEmail);
      setIsLoading(false);
      if (res && res.success && res.user) {
        success(`Logged in as ${roleTitle}`, 'Workspace ready.');
        if (res.user.role === 'ADMIN') {
          navigateToTab('dashboard');
        } else {
          navigateToTab('developer-dashboard');
        }
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />
      {/* Top Floating Theme Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold shadow-lg backdrop-blur-md cursor-pointer"
          title={`Switch to ${resolvedTheme === 'light' ? 'Dark' : 'Light'} theme`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-300" />
          )}
          <span>{resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden min-h-[640px]">
          
          {/* ========================================================= */}
          {/* LEFT SIDE: Professional Enterprise Branding Panel         */}
          {/* ========================================================= */}
          <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-[#0c1322] via-[#0f172a] to-[#111827] p-10 lg:p-12 flex-col justify-between border-r border-slate-800/80 relative overflow-hidden">
            {/* Background Grid & Ambient Elements */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            />

            {/* Top Brand Header */}
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-extrabold tracking-tight text-white font-display">
                      Onboard<span className="text-blue-400">Pro</span>
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md">
                      Enterprise
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Software Engineering Readiness</p>
                </div>
              </div>
            </div>

            {/* Main Value Proposition */}
            <div className="my-auto py-8 relative z-10 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-800/50 text-blue-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Production-Ready Engineer Track</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight font-display">
                  Developer Onboarding,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                    Built for Engineering Teams.
                  </span>
                </h2>
                <p className="text-sm text-slate-300/90 leading-relaxed max-w-lg">
                  Track technical training, assessments, and developer readiness from one centralized workspace.
                </p>
              </div>

              {/* 3 Value Checklist Highlights */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>Track developer progress in real-time</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>Manage mandatory technical training modules</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>Measure engineering readiness and assessment scores</span>
                </div>
              </div>

              {/* Minimal Code Terminal Graphic */}
              <div className="p-4 rounded-2xl bg-[#080d19]/90 border border-slate-800 text-left font-mono text-[11px] text-slate-400 shadow-xl space-y-1.5">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] text-slate-500">onboardpro-cli v2.4</span>
                </div>
                <p className="text-blue-400 font-semibold">$ onboardpro status --squad="frontend-core"</p>
                <p className="text-emerald-400">✓ 8 Developers Active · Average Readiness: 84%</p>
                <p className="text-slate-500">// Auto-syncing Google Workspace &amp; Learning Milestones</p>
              </div>
            </div>

            {/* Bottom Panel Footnote */}
            <div className="relative z-10 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                SOC-2 &amp; Google OAuth 2.0 Security
              </span>
              <span>SaaS Edition</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: Authentication Card                           */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 bg-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between text-slate-900">
            {/* Mobile Brand Header */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 font-display">OnboardPro</span>
                <p className="text-xs text-slate-500">Developer Onboarding Workspace</p>
              </div>
            </div>

            <div className="w-full max-w-sm mx-auto my-auto space-y-6">
              {/* Header */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
                  Welcome back
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Sign in to your OnboardPro workspace
                </p>
              </div>

              {/* 1. PRIMARY OPTION: Official Google Sign-In Button */}
              <div>
                <button
                  type="button"
                  id="google-continue-button"
                  disabled={googleAuthState === 'connecting'}
                  onClick={handleContinueWithGoogle}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-300 hover:border-slate-400 shadow-2xs hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                >
                  {googleAuthState === 'connecting' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                      <span className="text-slate-600 text-xs font-medium">Connecting to Google...</span>
                    </>
                  ) : googleAuthState === 'success' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-medium text-xs">Authentication successful</span>
                    </>
                  ) : (
                    <>
                      {/* Official Google 4-Color SVG Logo */}
                      <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span className="font-semibold text-slate-800 tracking-tight">
                        Continue with Google
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Clean Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="shrink mx-3 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  or
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              {/* 2. Corporate Email & Password Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Work Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="block w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-slate-600 font-medium text-[11px] sm:text-xs">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      info(
                        'Password Recovery',
                        'For instant demonstration access, click “Continue with Google” or use a Demo Role below.'
                      )
                    }
                    className="text-[11px] sm:text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 sm:py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Compact Demo Access Section */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Demo Access
                  </span>
                  <span className="text-[10px] text-slate-400">Project Evaluation</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('admin@onboardpro.dev', 'Alex Morgan (Admin)')}
                    className="py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Admin Demo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('aarav.sharma@onboardpro.dev', 'Aarav Sharma (Developer)')}
                    className="py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Developer Demo</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 text-center mt-2">
                  Demo accounts are available for project demonstration.
                </p>
              </div>
            </div>

            {/* Mobile Footer Note */}
            <div className="pt-6 text-center text-[10px] text-slate-400">
              SOC-2 Type II Certified · Google OAuth 2.0 Security
            </div>
          </div>
        </div>
      </div>

      {/* Global Footer */}
      <footer className="py-4 px-4 text-center border-t border-slate-800/80 text-[11px] sm:text-xs text-slate-400 leading-relaxed z-10">
        © 2026 OnboardPro System · Software Engineering Training &amp; Readiness Platform ·{' '}
        <span className="text-slate-300 font-medium">Developed by Gunjan Hedaoo</span>
      </footer>

      {/* Google Account Selector Modal */}
      <GoogleAccountModal
        isOpen={isGoogleModalOpen}
        onClose={handleGoogleModalClose}
        onSelectAccount={handleGoogleAccountSelected}
      />
    </div>
  );
};
