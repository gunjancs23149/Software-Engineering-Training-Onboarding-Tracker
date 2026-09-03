import React from 'react';
import {
  Activity,
  CheckCircle2,
  BookOpen,
  Award,
  AlertTriangle,
  UserPlus,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { ActivityLog } from '../../types';

interface RecentActivityProps {
  logs: ActivityLog[];
  onViewDeveloper?: (devId: string) => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ logs, onViewDeveloper }) => {
  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'complete_module':
        return { icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'pass_assessment':
        return { icon: Award, bg: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
      case 'start_module':
        return { icon: BookOpen, bg: 'bg-blue-50 text-blue-600 border-blue-200' };
      case 'miss_deadline':
        return { icon: AlertTriangle, bg: 'bg-rose-50 text-rose-600 border-rose-200' };
      case 'add_developer':
        return { icon: UserPlus, bg: 'bg-sky-50 text-sky-600 border-sky-200' };
      case 'earn_badge':
        return { icon: Sparkles, bg: 'bg-amber-50 text-amber-600 border-amber-200' };
      default:
        return { icon: Activity, bg: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Recent Activity
            </h3>
            <p className="text-xs text-slate-500">Live events across training lifecycle</p>
          </div>
        </div>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      <div className="my-4 space-y-3.5 max-h-80 overflow-y-auto pr-1">
        {logs.slice(0, 6).map((log) => {
          const { icon: Icon, bg } = getActivityIcon(log.type);
          return (
            <div key={log.id} className="flex items-start gap-3 text-xs">
              <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${bg}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 font-medium leading-snug">
                  {log.developerId && onViewDeveloper ? (
                    <span
                      onClick={() => onViewDeveloper(log.developerId!)}
                      className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                    >
                      {log.message}
                    </span>
                  ) : (
                    log.message
                  )}
                </p>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                  {log.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-slate-100 text-center">
        <span className="text-[11px] font-semibold text-slate-400">
          Showing real-time automated webhook and audit trail
        </span>
      </div>
    </div>
  );
};
