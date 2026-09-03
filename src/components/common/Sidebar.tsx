import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GitGraph,
  CheckSquare,
  FileBarChart,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Code2,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Award,
  ListTodo,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, role, logout, switchRole } = useAuth();
  const { notifications, users, modules } = useData();
  const { resolvedTheme, toggleTheme } = useTheme();

  const unreadCount = notifications.filter((n) => !n.isRead && (n.userId === 'all' || n.userId === currentUser?.id)).length;
  const activeDevsCount = users.filter((u) => u.role === 'DEVELOPER').length;

  const navItems = [
    {
      id: role === 'ADMIN' ? 'dashboard' : 'developer-dashboard',
      label: role === 'ADMIN' ? 'Dashboard' : 'My Onboarding',
      icon: LayoutDashboard,
      badge: null,
    },
    ...(role === 'ADMIN'
      ? [
          {
            id: 'developers',
            label: 'Developers',
            icon: Users,
            badge: `${activeDevsCount}`,
          },
        ]
      : [
          {
            id: 'checklist',
            label: 'Onboarding Checklist',
            icon: ListTodo,
            badge: null,
          },
        ]),
    {
      id: 'modules',
      label: 'Training Modules',
      icon: BookOpen,
      badge: `${modules.length}`,
    },
    {
      id: 'progress',
      label: 'Progress Tracker',
      icon: GitGraph,
      badge: null,
    },
    {
      id: 'assessments',
      label: 'Assessments',
      icon: CheckSquare,
      badge: null,
    },
    ...(role === 'ADMIN'
      ? [
          {
            id: 'reports',
            label: 'Reports & Analytics',
            icon: FileBarChart,
            badge: null,
          },
        ]
      : []),
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? `${unreadCount}` : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0f172a] text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-18 px-4 border-b border-slate-800/80">
          <div
            onClick={() => onSelectTab(role === 'ADMIN' ? 'dashboard' : 'developer-dashboard')}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-white tracking-tight font-display">OnboardPro</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                    SaaS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">Engineering Onboarding</p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Quick Switcher Pill (Viva Friendly) */}
        {!isCollapsed && (
          <div className="mx-3 mt-3.5 p-2 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${role === 'ADMIN' ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="text-xs font-semibold text-slate-200">
                {role === 'ADMIN' ? 'Admin Portal' : 'Developer View'}
              </span>
            </div>
            <button
              onClick={() => switchRole(role === 'ADMIN' ? 'DEVELOPER' : 'ADMIN')}
              className="text-[10px] font-bold px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
              title="Switch role for demo demonstration"
            >
              <Sparkles className="w-3 h-3" />
              Switch
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 relative group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      item.badgeColor || (isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Tooltip / Dot indicator */}
                {isCollapsed && item.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <div className="relative shrink-0">
              <img
                src={currentUser?.profileImage || currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.name || 'User'}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-700 shrink-0"
              />
              {currentUser?.authProvider === 'google' && (
                <div
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center ring-1 ring-slate-700 shadow-2xs"
                  title="Google Account"
                >
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
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
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                  {role === 'ADMIN' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.title || role}</p>
              </div>
            )}
            {!isCollapsed && (
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title={`Switch to ${resolvedTheme === 'light' ? 'Dark' : 'Light'} theme`}
                >
                  {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
