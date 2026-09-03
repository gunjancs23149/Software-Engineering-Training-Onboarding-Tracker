import React from 'react';
import { KPICards } from './KPICards';
import { CircularProgressCard } from './CircularProgressCard';
import { AnalyticsCharts } from './AnalyticsCharts';
import { DeveloperProgressTable } from './DeveloperProgressTable';
import { UpcomingDeadlines } from './UpcomingDeadlines';
import { RecentActivity } from './RecentActivity';
import { useData } from '../../context/DataContext';
import { calculateKPIData } from '../../utils/calculations';
import { Sparkles, ArrowRight, UserPlus } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string, targetId?: string) => void;
  onAddDeveloper: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onAddDeveloper }) => {
  const { users, modules, enrollments, activityLogs, sendDeveloperReminder } = useData();

  const developers = users.filter((u) => u.role === 'DEVELOPER');
  const kpiData = calculateKPIData(users, enrollments, modules);

  const completedMandatoryTotal = enrollments.filter(
    (e) => e.status === 'completed' || e.progress === 100
  ).length;
  const readyDevs = developers.filter((d) => d.status === 'Completed').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        {/* Glow ambient background decoration */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            Engineering Training & Onboarding Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
            Good morning, Admin 👋
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Monitor technical onboarding, identify pending modules, track progress, view assessment scores, and manage onboarding requirements.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={onAddDeveloper}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Developer
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all backdrop-blur-md cursor-pointer"
          >
            <span>View Reports</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Top KPI Cards */}
      <KPICards data={kpiData} />

      {/* 2. Middle Row: Circular Progress & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CircularProgressCard
            progressPercentage={kpiData.averageProgress}
            completedModules={completedMandatoryTotal}
            totalModules={modules.length * developers.length || 88}
            readyDevelopers={readyDevs}
            totalDevelopers={developers.length}
          />
        </div>

        <div className="lg:col-span-2">
          <UpcomingDeadlines
            enrollments={enrollments}
            modules={modules}
            users={users}
            onNavigateToModule={(modId) => onNavigate('modules', modId)}
            onSendReminder={(devId, modName) => sendDeveloperReminder(devId, modName)}
          />
        </div>
      </div>

      {/* 3. Analytics Charts */}
      <AnalyticsCharts modules={modules} users={users} />

      {/* 4. Developer Progress Table */}
      <DeveloperProgressTable
        developers={developers}
        enrollments={enrollments}
        onViewDeveloper={(devId) => onNavigate('developers', devId)}
        onViewAllDevelopers={() => onNavigate('developers')}
        onAddDeveloper={onAddDeveloper}
        onSendReminder={(devId) => sendDeveloperReminder(devId)}
      />

      {/* 5. Live Activity Stream */}
      <RecentActivity
        logs={activityLogs}
        onViewDeveloper={(devId) => onNavigate('developers', devId)}
      />
    </div>
  );
};
