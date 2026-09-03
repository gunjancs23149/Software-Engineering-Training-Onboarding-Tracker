import React, { useState } from 'react';
import { X, UserPlus, Shield, Check, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface GoogleAccountOption {
  googleId: string;
  name: string;
  email: string;
  profileImage: string;
  isExisting: boolean;
  roleHint?: string;
}

interface GoogleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { googleId: string; name: string; email: string; profileImage: string }) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

export const GoogleAccountModal: React.FC<GoogleAccountModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
}) => {
  const { users } = useData();
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Build account list from existing users and demo options
  const defaultAccounts: GoogleAccountOption[] = [
    {
      googleId: 'google-109876543210',
      name: 'Alex Morgan',
      email: 'admin@onboardpro.dev',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isExisting: true,
      roleHint: 'Training Director (Admin)',
    },
    {
      googleId: 'google-102938475610',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@onboardpro.dev',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      isExisting: true,
      roleHint: 'Frontend Engineer (Existing Dev)',
    },
    {
      googleId: 'google-new-candidate',
      name: 'Devina Kapoor',
      email: 'devina.kapoor@googlemail.com',
      profileImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      isExisting: false,
      roleHint: 'First-time Google Sign-In Candidate',
    },
  ];

  // Include any other Google users from state
  const googleUsersInState: GoogleAccountOption[] = users
    .filter((u) => u.authProvider === 'google' || u.googleId)
    .filter((u) => !defaultAccounts.some((da) => da.email.toLowerCase().trim() === u.email.toLowerCase().trim()))
    .map((u) => ({
      googleId: u.googleId || `google-${u.id}`,
      name: u.name,
      email: u.email,
      profileImage: u.profileImage || u.avatar,
      isExisting: true,
      roleHint: u.role === 'ADMIN' ? 'Admin' : `${u.title || 'Developer'} (${u.teamName || 'Engineering'})`,
    }));

  const seenEmails = new Set<string>();
  const allAccounts: GoogleAccountOption[] = [];
  for (const acc of [...defaultAccounts, ...googleUsersInState]) {
    const norm = acc.email.toLowerCase().trim();
    if (!seenEmails.has(norm)) {
      seenEmails.add(norm);
      allAccounts.push(acc);
    }
  }

  const handleSelect = (acc: GoogleAccountOption) => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSelectAccount({
        googleId: acc.googleId,
        name: acc.name,
        email: acc.email,
        profileImage: acc.profileImage,
      });
      setIsSubmitting(false);
    }, 350);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const googleId = `google-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      onSelectAccount({
        googleId,
        name: customName.trim(),
        email: customEmail.trim().toLowerCase(),
        profileImage: selectedAvatar,
      });
      setIsSubmitting(false);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden relative">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Official Google 'G' SVG Logo */}
            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-2xs border border-slate-100 shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Sign in with Google</h3>
              <p className="text-xs text-slate-500">Choose an account to continue to OnboardPro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            title="Cancel sign in"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Selector List */}
        {!isCustomMode ? (
          <div className="p-6 space-y-4">
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {allAccounts.map((acc) => (
                <button
                  key={`google_acc_${acc.email}`}
                  disabled={isSubmitting}
                  onClick={() => handleSelect(acc)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all text-left group disabled:opacity-60 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={acc.profileImage}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {acc.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                      {acc.roleHint && (
                        <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-400">
                          {acc.roleHint}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {acc.isExisting ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                        Existing
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        New Onboard
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Use Another Account Button */}
            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 transition-all text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-700">
                Sign in with another Google Account
                <p className="text-[11px] text-slate-400 font-normal">Enter custom Google name & email</p>
              </div>
            </button>
          </div>
        ) : (
          /* Custom Google Account Entry Form */
          <form onSubmit={handleCustomSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Google Full Name
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Maya Lin"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Google Account Email
              </label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="e.g. maya.lin@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Google Profile Picture
              </label>
              <div className="grid grid-cols-6 gap-2 pt-1">
                {PRESET_AVATARS.map((img, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedAvatar(img)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      selectedAvatar === img
                        ? 'border-blue-600 ring-2 ring-blue-600/30 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Avatar" className="w-full h-full object-cover" />
                    {selectedAvatar === img && (
                      <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Back to Account List
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !customName || !customEmail}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Privacy & Scope Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
          <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            To continue, Google will share your name, email address, language preference, and profile picture with <strong>OnboardPro</strong>.
          </span>
        </div>
      </div>
    </div>
  );
};
