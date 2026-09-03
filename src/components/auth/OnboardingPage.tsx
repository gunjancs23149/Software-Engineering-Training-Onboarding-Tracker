import React, { useState } from 'react';
import {
  Code2,
  Sparkles,
  Layers,
  Briefcase,
  Award,
  IdCard,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../context/RouterContext';
import { ExperienceLevel } from '../../types';

export const OnboardingPage: React.FC = () => {
  const { pendingGoogleUser, completeGoogleOnboarding, currentUser } = useAuth();
  const { teams } = useData();
  const { success, error } = useToast();
  const { navigateToTab } = useRouter();

  // Active user to display (either pending Google signup or existing user)
  const userToOnboard = pendingGoogleUser || currentUser;

  const [employeeId, setEmployeeId] = useState(
    userToOnboard?.employeeId || `EMP-${Math.floor(1020 + Math.random() * 80)}`
  );
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || 'team-frontend');
  const [developerRole, setDeveloperRole] = useState('Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Junior');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToOnboard?.email) {
      error('Onboarding Error', 'No active Google session found. Please sign in again.');
      navigateToTab('login');
      return;
    }

    setIsSubmitting(true);

    try {
      completeGoogleOnboarding({
        employeeId: employeeId.trim() || `EMP-${Math.floor(1000 + Math.random() * 900)}`,
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        developerRole,
        experienceLevel,
      });

      // Trigger celebration confetti
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });

      success(
        'Profile Created Successfully!',
        `Welcome to OnboardPro, ${userToOnboard.name}! Your developer dashboard is ready.`
      );

      setTimeout(() => {
        navigateToTab('developer-dashboard');
      }, 400);
    } catch (err: any) {
      error('Failed to create profile', err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between py-10 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10 px-4">
        {/* Brand Header */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/25 mb-3">
          <Code2 className="w-6 h-6" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/80 border border-blue-800/50 rounded-full text-blue-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Google Authentication Verified</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">
          Welcome to OnboardPro 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Let’s set up your developer profile.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 relative z-10">
        <div className="bg-white text-slate-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200">
          {/* Auto-populated Google Account Info Banner */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-6 flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={
                  userToOnboard?.profileImage ||
                  userToOnboard?.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                }
                alt={userToOnboard?.name || 'Developer'}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-md"
              />
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-xs border border-slate-200"
                title="Google Account"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24">
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
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{userToOnboard?.name}</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-md shrink-0">
                  Google Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{userToOnboard?.email}</p>
              <span className="inline-block mt-0.5 text-[10px] text-slate-400">Role: Developer (Default)</span>
            </div>
          </div>

          <form onSubmit={handleComplete} className="space-y-4">
            {/* Auto-populated details view */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={userToOnboard?.name || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="text"
                  disabled
                  value={userToOnboard?.email || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold cursor-not-allowed"
                />
              </div>
            </div>

            {/* Employee ID */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <IdCard className="w-3.5 h-3.5 text-blue-600" />
                <span>Employee ID</span>
              </label>
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="EMP-1024"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-mono"
              />
            </div>

            {/* Team Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Team</span>
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Developer Role Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Developer Role</span>
              </label>
              <select
                value={developerRole}
                onChange={(e) => setDeveloperRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Frontend Engineer">Frontend Engineer (React / TypeScript)</option>
                <option value="Backend Engineer">Backend Engineer (Node / Go / Python)</option>
                <option value="Fullstack Engineer">Fullstack Software Engineer</option>
                <option value="DevOps & Infrastructure Engineer">DevOps & Cloud Engineer</option>
                <option value="QA Automation Engineer">QA Automation Engineer</option>
                <option value="Data Engineer">Data & Analytics Engineer</option>
              </select>
            </div>

            {/* Experience Level Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>Experience Level</span>
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Junior">Junior</option>
                <option value="Associate">Associate</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 px-4 text-center border-t border-slate-800/80 text-[11px] sm:text-xs text-slate-400 leading-relaxed z-10 mt-6">
        © 2026 OnboardPro System · Software Engineering Training &amp; Readiness Platform ·{' '}
        <span className="text-slate-300 font-medium">Developed by Gunjan Hedaoo</span>
      </footer>
    </div>
  );
};
