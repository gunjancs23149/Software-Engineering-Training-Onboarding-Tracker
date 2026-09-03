import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  Sparkles,
  Shield,
  User as UserIcon,
  LogOut,
  Settings,
  Check,
  Award,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { formatDate } from '../../utils/formatters';

interface NavbarProps {
  pageTitle: string;
  pageSubtitle?: string;
  onOpenSearch: () => void;
  onOpenMobileMenu: () => void;
  onNavigate: (tab: string, targetId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  pageTitle,
  pageSubtitle,
  onOpenSearch,
  onOpenMobileMenu,
  onNavigate,
}) => {
  const { currentUser, role, logout, switchRole } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useData();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const userNotifications = notifications.filter(
    (n) => n.userId === 'all' || n.userId === currentUser?.id
  );
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Left Title & Mobile Menu */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl lg:hidden transition-colors cursor-pointer"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-display truncate">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="hidden sm:block text-xs text-slate-500 truncate">{pageSubtitle}</p>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-500 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 rounded-xl transition-all group cursor-pointer"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <span className="hidden md:inline font-medium">Search anything...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white border border-slate-200 rounded text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
          title={`Switch to ${resolvedTheme === 'light' ? 'Dark' : 'Light'} theme`}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4.5 h-4.5 text-amber-400 animate-in spin-in-180 duration-200" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-slate-600 animate-in spin-in-180 duration-200" />
          )}
        </button>

        {/* 1-Click Role Switch Pill */}
        <button
          onClick={() => switchRole(role === 'ADMIN' ? 'DEVELOPER' : 'ADMIN')}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-2xs cursor-pointer ${
            role === 'ADMIN'
              ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
          }`}
          title="Click to toggle Admin / Developer perspective"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Role: <strong>{role === 'ADMIN' ? 'Manager (Admin)' : 'Developer (Aarav)'}</strong></span>
        </button>

        {/* Notifications Bell & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-50 text-rose-600 rounded-full border border-rose-200">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {userNotifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No notifications right now
                  </div>
                ) : (
                  userNotifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.linkTo) onNavigate(notif.linkTo.replace('/', ''), notif.targetId);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                        !notif.isRead ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-blue-600" style={{ opacity: notif.isRead ? 0 : 1 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{notif.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    onNavigate('notifications');
                    setIsNotifOpen(false);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  View all notifications
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 pl-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="relative">
              <img
                src={currentUser?.profileImage || currentUser?.avatar}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
              />
              {currentUser?.authProvider === 'google' && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center ring-1 ring-slate-200 shadow-2xs"
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
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-500 font-medium">{currentUser?.role === 'ADMIN' ? 'Training Lead' : currentUser?.title}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
                  {currentUser?.authProvider === 'google' && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
                      Google
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-md">
                    {currentUser?.role}
                  </span>
                  <span className="text-[10px] text-slate-500">{currentUser?.teamName}</span>
                </div>
              </div>

              <div className="space-y-1">
                {/* 1. My Profile */}
                <button
                  onClick={() => {
                    if (currentUser?.role === 'ADMIN') {
                      onNavigate('settings');
                    } else if (currentUser?.id) {
                      onNavigate('developers', currentUser.id);
                    } else {
                      onNavigate('developer-dashboard');
                    }
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  My Profile
                </button>

                {/* 2. Account Settings */}
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  Account Settings
                </button>

                {/* Theme Toggle in Dropdown */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {resolvedTheme === 'dark' ? (
                      <Sun className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-500" />
                    )}
                    <span>Theme: <strong>{resolvedTheme === 'dark' ? 'Dark' : 'Light'}</strong></span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                    Toggle
                  </span>
                </button>

                <div className="border-t border-slate-100 my-1" />

                {/* 3. Logout */}
                <button
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
