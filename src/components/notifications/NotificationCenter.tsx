import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Check,
  Trash2,
  Filter,
  ExternalLink,
  Shield,
  Sparkles,
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface NotificationCenterProps {
  onNavigate: (tab: string, targetId?: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useData();
  const { currentUser } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'all' | 'training_completed' | 'deadline_approaching' | 'overdue' | 'system'>('all');

  const userNotifications = notifications.filter(
    (n) => n.userId === 'all' || n.userId === currentUser?.id
  );

  const filteredNotifications = userNotifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'training_completed':
        return { icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'assessment_passed':
        return { icon: Award, bg: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
      case 'deadline_approaching':
      case 'reminder':
        return { icon: Clock, bg: 'bg-amber-50 text-amber-600 border-amber-200' };
      case 'overdue':
        return { icon: AlertTriangle, bg: 'bg-rose-50 text-rose-600 border-rose-200' };
      default:
        return { icon: Sparkles, bg: 'bg-blue-50 text-blue-600 border-blue-200' };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
              Notification Center
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time alerts on module completions, upcoming milestones, and SLA deadlines.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors w-fit cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'training_completed', label: 'Training Completed' },
          { id: 'deadline_approaching', label: 'Deadlines' },
          { id: 'overdue', label: 'Overdue Alerts' },
          { id: 'system', label: 'System & Badges' },
        ].map((tab) => {
          const isSelected = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card divide-y divide-slate-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">No notifications in this category</p>
            <p className="text-xs text-slate-400 mt-1">You are all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const { icon: Icon, bg } = getNotificationIcon(notif.type);

            return (
              <div
                key={notif.id}
                className={`p-5 flex items-start justify-between gap-4 transition-colors hover:bg-slate-50/80 ${
                  !notif.isRead ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-2xl border shrink-0 mt-0.5 ${bg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                      <span>{notif.timestamp}</span>
                      {notif.linkTo && (
                        <button
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            onNavigate(notif.linkTo!.replace('/', ''), notif.targetId);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open details</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
