import React, { useState } from 'react';
import {
  User as UserIcon,
  Bell,
  Sliders,
  Database,
  RotateCcw,
  Download,
  Upload,
  Save,
  Palette,
  Sun,
  Moon,
  Laptop,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const SettingsPage: React.FC = () => {
  const { currentUser, role, updateCurrentUserProfile } = useAuth();
  const { resetToDemoData, exportDatabaseJSON, importDatabaseJSON } = useData();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { success, error } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'appearance' | 'notifications' | 'training' | 'data'>('profile');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    title: currentUser?.title || '',
    teamName: currentUser?.teamName || '',
    avatar: currentUser?.avatar || '',
  });

  // Notification Preferences
  const [notificationsConfig, setNotificationsConfig] = useState({
    emailOnCompletion: true,
    deadlineReminders: true,
    slackWebhook: true,
    overdueEscalation: true,
  });

  // Training Configuration
  const [trainingConfig, setTrainingConfig] = useState({
    defaultPassingScore: 75,
    onboardingDurationDays: 30,
    reminderHoursBefore: 48,
    requireReviewApproval: true,
  });

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile(profileData);
    success('Profile Saved', 'User profile details updated successfully.');
  };

  const handleExportJSON = () => {
    const dataStr = exportDatabaseJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `onboardpro-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    success('Database Exported', 'Full JSON backup downloaded.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importDatabaseJSON(content);
      if (ok) {
        success('Import Successful', 'Database loaded from JSON file.');
      } else {
        error('Import Failed', 'Invalid JSON backup format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
          Settings & Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage system preferences, role permissions, notification hooks, and database backups.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        {[
          { id: 'profile', label: 'Profile & Account', icon: UserIcon },
          { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
          { id: 'notifications', label: 'Notification Preferences', icon: Bell },
          { id: 'training', label: 'Training Parameters', icon: Sliders },
          { id: 'data', label: 'Database & Reset', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Appearance & Theme Panel */}
      {activeSubTab === 'appearance' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 font-display">Theme & Interface Customization</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose your preferred visual theme for the OnboardPro platform. Your preference will be remembered across sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Light Theme Card */}
            <div
              onClick={() => {
                setTheme('light');
                success('Light Theme Applied', 'Interface switched to Light mode.');
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20 shadow-md'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-300'
              }`}
            >
              {theme === 'light' && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                <Sun className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Light Theme</h4>
              <p className="text-xs text-slate-500 mt-1">
                Clean and bright high-contrast interface optimized for daytime productivity.
              </p>
              <div className="mt-4 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="h-2 w-16 bg-blue-600 rounded" />
                <div className="h-2 w-full bg-slate-200 rounded" />
                <div className="h-2 w-3/4 bg-slate-100 rounded" />
              </div>
            </div>

            {/* Dark Theme Card */}
            <div
              onClick={() => {
                setTheme('dark');
                success('Dark Theme Applied', 'Interface switched to Dark mode.');
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                theme === 'dark'
                  ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20 shadow-md'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-300'
              }`}
            >
              {theme === 'dark' && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
              <div className="w-10 h-10 rounded-xl bg-indigo-900/40 text-indigo-400 flex items-center justify-center mb-3">
                <Moon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Dark Theme</h4>
              <p className="text-xs text-slate-500 mt-1">
                Sleek, low-glare deep navy/slate palette designed to reduce eye strain.
              </p>
              <div className="mt-4 p-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-2xs space-y-1.5">
                <div className="h-2 w-16 bg-blue-500 rounded" />
                <div className="h-2 w-full bg-slate-800 rounded" />
                <div className="h-2 w-3/4 bg-slate-700 rounded" />
              </div>
            </div>

            {/* System Default Card */}
            <div
              onClick={() => {
                setTheme('system');
                success('System Theme Applied', 'Interface will match your operating system theme.');
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                theme === 'system'
                  ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20 shadow-md'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-300'
              }`}
            >
              {theme === 'system' && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center mb-3">
                <Laptop className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">System Sync</h4>
              <p className="text-xs text-slate-500 mt-1">
                Automatically switches between Light and Dark mode based on your device settings.
              </p>
              <div className="mt-4 p-2.5 rounded-xl bg-gradient-to-r from-white to-slate-900 border border-slate-200 shadow-2xs space-y-1.5">
                <div className="h-2 w-16 bg-blue-600 rounded" />
                <div className="h-2 w-full bg-slate-300/60 rounded" />
                <div className="h-2 w-3/4 bg-slate-400/40 rounded" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Currently Active: <strong className="text-slate-800 uppercase font-bold">{resolvedTheme} MODE</strong></span>
            <span>Shortcut: <strong>⌘K / Navbar Toggle</strong></span>
          </div>
        </div>
      )}

      {/* 1. Profile Settings */}
      {activeSubTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={profileData.avatar || currentUser?.profileImage || currentUser?.avatar}
                  alt={currentUser?.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-200 shadow-sm"
                />
                {currentUser?.authProvider === 'google' && (
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center ring-1 ring-slate-200 shadow-2xs"
                    title="Google OAuth"
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
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{profileData.name || 'User'}</h3>
                  {currentUser?.authProvider === 'google' ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                      Google OAuth
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md">
                      Local Account
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{profileData.title} • {role}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 inline-block">
                    Role: {role}
                  </span>
                  {currentUser?.employeeId && (
                    <span className="text-[10px] font-mono font-semibold text-slate-500">
                      {currentUser.employeeId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Authentication Details Pill */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-slate-400">Auth Method:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {currentUser?.authProvider === 'google' ? 'Google Sign-In (OAuth 2.0)' : 'Corporate Email / Password'}
                </span>
              </div>
              {currentUser?.googleId && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] text-slate-400">Google ID:</span>
                  <span className="font-mono text-[10px] text-slate-600 truncate max-w-[140px]">
                    {currentUser.googleId}
                  </span>
                </div>
              )}
              {currentUser?.lastLogin && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] text-slate-400">Last Login:</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(currentUser.lastLogin).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={profileData.title}
                  onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Squad / Department
                </label>
                <input
                  type="text"
                  value={profileData.teamName}
                  onChange={(e) => setProfileData({ ...profileData, teamName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={profileData.avatar}
                onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-[11px]"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Notification Preferences */}
      {activeSubTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Notification Preferences
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control webhook triggers, email digests, and SLA escalation alerts.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 'emailOnCompletion',
                label: 'Email Alert on Module & Assessment Completion',
                desc: 'Notify managers immediately when an engineer passes an onboarding test.',
              },
              {
                id: 'deadlineReminders',
                label: 'Automated 48-Hour Deadline Reminders',
                desc: 'Send gentle nudges to developers 2 days before module due date.',
              },
              {
                id: 'slackWebhook',
                label: 'Engineering Slack / Teams Broadcast Sync',
                desc: 'Broadcast badge awards and completed certifications to #eng-onboarding channel.',
              },
              {
                id: 'overdueEscalation',
                label: 'Manager Escalation on Overdue SLA Threshold',
                desc: 'Flag developers as "Overdue / At Risk" if uncompleted past target date.',
              },
            ].map((pref) => (
              <div
                key={pref.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{pref.label}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{pref.desc}</p>
                </div>

                <input
                  type="checkbox"
                  checked={(notificationsConfig as any)[pref.id]}
                  onChange={(e) =>
                    setNotificationsConfig({
                      ...notificationsConfig,
                      [pref.id]: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded border-slate-300 cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => success('Preferences Saved', 'Notification settings saved.')}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* 3. Training Parameters */}
      {activeSubTab === 'training' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Training & Assessment Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set organizational passing standards and onboarding duration timelines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Default Passing Score (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={trainingConfig.defaultPassingScore}
                onChange={(e) =>
                  setTrainingConfig({ ...trainingConfig, defaultPassingScore: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-bold text-blue-600"
              />
              <p className="text-[11px] text-slate-500">Minimum grade required for certificate issuance</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Onboarding Window (Days)
              </label>
              <input
                type="number"
                min="7"
                max="90"
                value={trainingConfig.onboardingDurationDays}
                onChange={(e) =>
                  setTrainingConfig({ ...trainingConfig, onboardingDurationDays: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
              />
              <p className="text-[11px] text-slate-500">Target duration for new cohort developers</p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => success('Configuration Saved', 'Training parameters updated.')}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* 4. Database & Reset */}
      {activeSubTab === 'data' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Data Management & Demo Sandbox
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Export database state, import custom scenario JSON, or reset to realistic seed data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export JSON */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Export Application State</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Download all developers, enrollments, assessment scores, and comments as a portable JSON file.
                </p>
              </div>
              <button
                onClick={handleExportJSON}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download JSON Backup
              </button>
            </div>

            {/* Import JSON */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Import Database JSON</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Restore previously exported dataset or test customized assessment scenarios.
                </p>
              </div>
              <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload JSON File</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
          </div>

          {/* Reset to Demo Data */}
          <div className="p-5 bg-rose-50/60 rounded-2xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-rose-900">Reset Demo Database</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Restores the 8 demo developers, 12 modules, assessments, and initial progress state for viva demonstration.
              </p>
            </div>
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Demo Data
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="Reset to Default Demo State?"
        message="This will reset all localStorage state, clear test submissions, and restore the initial 8 developers and training curriculum."
        confirmLabel="Yes, Reset Database"
        isDestructive={true}
        onConfirm={resetToDemoData}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};
