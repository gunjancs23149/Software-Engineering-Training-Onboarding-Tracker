import React from 'react';
import { Calendar, AlertCircle, Clock, Bell, ArrowRight } from 'lucide-react';
import { Enrollment, TrainingModule, User } from '../../types';
import { formatDate } from '../../utils/formatters';

interface UpcomingDeadlinesProps {
  enrollments: Enrollment[];
  modules: TrainingModule[];
  users: User[];
  onNavigateToModule: (moduleId: string) => void;
  onSendReminder: (devId: string, moduleName: string) => void;
}

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({
  enrollments,
  modules,
  users,
  onNavigateToModule,
  onSendReminder,
}) => {
  // Get active or overdue enrollments
  const pendingEnrollments = enrollments
    .filter((e) => e.status !== 'completed' && e.progress < 100)
    .slice(0, 4)
    .map((e) => {
      const mod = modules.find((m) => m.id === e.moduleId);
      const dev = users.find((u) => u.id === e.developerId);
      const isOverdue = e.status === 'overdue';
      return {
        ...e,
        moduleTitle: mod?.title || 'Training Module',
        moduleCode: mod?.code || 'TR-101',
        developerName: dev?.name || 'Developer',
        developerAvatar: dev?.avatar || '',
        priority: isOverdue ? 'High (Overdue)' : e.progress > 50 ? 'Medium' : 'High',
        isOverdue,
      };
    });

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Upcoming Deadlines
            </h3>
            <p className="text-xs text-slate-500">Target completion dates requiring attention</p>
          </div>
        </div>
      </div>

      <div className="my-4 space-y-3">
        {pendingEnrollments.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No imminent pending deadlines.</p>
        ) : (
          pendingEnrollments.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                item.isOverdue
                  ? 'bg-rose-50/60 border-rose-200/80 hover:bg-rose-50'
                  : 'bg-slate-50/70 border-slate-200/60 hover:bg-slate-50'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.isOverdue
                        ? 'bg-rose-100 text-rose-700 border border-rose-300'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {item.moduleCode}
                  </span>
                </div>
                <h4
                  onClick={() => onNavigateToModule(item.moduleId)}
                  className="text-xs font-bold text-slate-800 hover:text-blue-600 cursor-pointer truncate"
                >
                  {item.moduleTitle}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{item.developerName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Due: {formatDate(item.dueDate)}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                <button
                  onClick={() => onSendReminder(item.developerId, item.moduleTitle)}
                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-100/70 rounded-xl transition-colors"
                  title="Nudge / Send Reminder"
                >
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Automatic reminders triggered 48h before deadline</span>
        <span className="font-semibold text-slate-600">Active SLA</span>
      </div>
    </div>
  );
};
