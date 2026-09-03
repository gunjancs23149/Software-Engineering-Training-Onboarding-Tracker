import React, { useState } from 'react';
import {
  GitGraph,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  Users,
  Search,
  Download,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { User, TrainingModule, Enrollment } from '../../types';
import { useData } from '../../context/DataContext';
import { calculateFunnelStats } from '../../utils/calculations';
import { exportToCSV } from '../../utils/exportUtils';
import { formatDate } from '../../utils/formatters';

interface ProgressTrackerProps {
  onViewDeveloper: (devId: string) => void;
  onViewModule: (modId: string) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  onViewDeveloper,
  onViewModule,
}) => {
  const { users, modules, enrollments } = useData();

  const developers = users.filter((u) => u.role === 'DEVELOPER');
  const activeModules = modules.filter((m) => !m.archived).slice(0, 8); // Top 8 key track modules for matrix

  const [teamFilter, setTeamFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const teams = Array.from(new Set(developers.map((d) => d.teamName)));

  const filteredDevs = developers.filter((dev) => {
    const matchTeam = teamFilter === 'ALL' || dev.teamName === teamFilter;
    const matchSearch = dev.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTeam && matchSearch;
  });

  const funnelData = calculateFunnelStats(enrollments);

  const getCellStatus = (devId: string, moduleId: string) => {
    const enr = enrollments.find((e) => e.developerId === devId && e.moduleId === moduleId);
    if (!enr) return { type: 'not_enrolled', symbol: '—', label: 'Not Enrolled', classes: 'text-slate-300' };

    if (enr.status === 'completed' || enr.progress === 100) {
      return {
        type: 'completed',
        symbol: '✓',
        label: `Completed (${enr.score !== null ? `${enr.score}%` : '100%'})`,
        classes: 'bg-emerald-100 text-emerald-700 border-emerald-300 font-bold',
      };
    }

    if (enr.status === 'overdue') {
      return {
        type: 'overdue',
        symbol: '!',
        label: `Overdue (Due: ${formatDate(enr.dueDate)})`,
        classes: 'bg-rose-100 text-rose-700 border-rose-300 font-bold animate-pulse',
      };
    }

    if (enr.status === 'in_progress' || enr.progress > 0) {
      return {
        type: 'in_progress',
        symbol: '●',
        label: `In Progress (${enr.progress}%)`,
        classes: 'bg-blue-100 text-blue-700 border-blue-300 font-bold',
      };
    }

    return {
      type: 'pending',
      symbol: '○',
      label: `Pending (Due: ${formatDate(enr.dueDate)})`,
      classes: 'bg-amber-50 text-amber-600 border-amber-200 font-bold',
    };
  };

  const handleExportCSV = () => {
    const headers = ['Developer', 'Team', ...activeModules.map((m) => m.code), 'Overall %'];
    const rows = filteredDevs.map((dev) => [
      dev.name,
      dev.teamName,
      ...activeModules.map((m) => {
        const s = getCellStatus(dev.id, m.id);
        return s.label;
      }),
      `${dev.overallProgress}%`,
    ]);
    exportToCSV('OnboardPro-Progress-Matrix', headers, rows);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
              Progress Tracker
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Matrix & Funnel Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cross-developer module completion matrix and cohort conversion pipeline.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs cursor-pointer w-fit"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          Export Matrix CSV
        </button>
      </div>

      {/* 1. Onboarding Completion Funnel */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Onboarding Completion Funnel
            </h3>
            <p className="text-xs text-slate-500">Curriculum conversion across lifecycle stages</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {funnelData[funnelData.length - 1]?.count || 0} Modules Completed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {funnelData.map((stage, idx) => (
            <div
              key={stage.stage}
              className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {stage.stage}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Step {idx + 1}
                </span>
              </div>

              <div className="my-3">
                <p className="text-2xl font-extrabold text-slate-900 font-display">
                  {stage.count}
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stage.percentage}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-200/60">
                <span>Conversion</span>
                <span className="text-blue-600">{stage.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Developer × Modules Matrix View */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        {/* Controls Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Developer Competency Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status across mandatory technical training milestones
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search engineer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            {/* Team Filter */}
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Squads</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Matrix Legend */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-300 inline-flex items-center justify-center font-bold text-xs">
              ✓
            </span>
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 border border-blue-300 inline-flex items-center justify-center font-bold text-xs">
              ●
            </span>
            In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 inline-flex items-center justify-center font-bold text-xs">
              ○
            </span>
            Pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-rose-100 text-rose-700 border border-rose-300 inline-flex items-center justify-center font-bold text-xs">
              !
            </span>
            Overdue
          </span>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-6 min-w-[200px]">Developer</th>
                <th className="py-3.5 px-4 min-w-[130px]">Squad</th>
                {activeModules.map((mod) => (
                  <th
                    key={mod.id}
                    onClick={() => onViewModule(mod.id)}
                    className="py-3.5 px-3 text-center cursor-pointer hover:text-blue-600 min-w-[90px]"
                    title={`${mod.title} (${mod.category})`}
                  >
                    <div>{mod.code}</div>
                    <div className="text-[9px] text-slate-400 font-normal truncate max-w-[80px] mx-auto">
                      {mod.category.split(' ')[0]}
                    </div>
                  </th>
                ))}
                <th className="py-3.5 px-6 text-right min-w-[100px]">Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDevs.map((dev) => (
                <tr key={dev.id} className="hover:bg-blue-50/30 transition-colors">
                  {/* Developer Name & Avatar */}
                  <td className="py-3.5 px-6">
                    <div
                      onClick={() => onViewDeveloper(dev.id)}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <img
                        src={dev.avatar}
                        alt={dev.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {dev.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{dev.title}</p>
                      </div>
                    </div>
                  </td>

                  {/* Team */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {dev.teamName}
                    </span>
                  </td>

                  {/* Matrix Columns */}
                  {activeModules.map((mod) => {
                    const status = getCellStatus(dev.id, mod.id);
                    return (
                      <td key={mod.id} className="py-3.5 px-3 text-center">
                        <div
                          title={`${dev.name} - ${mod.title}: ${status.label}`}
                          className={`w-7 h-7 mx-auto rounded-lg border inline-flex items-center justify-center text-xs transition-transform hover:scale-110 cursor-pointer shadow-2xs ${status.classes}`}
                        >
                          {status.symbol}
                        </div>
                      </td>
                    );
                  })}

                  {/* Overall % */}
                  <td className="py-3.5 px-6 text-right font-bold text-slate-800">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] ${
                        dev.overallProgress === 100
                          ? 'bg-emerald-100 text-emerald-800'
                          : dev.overallProgress >= 75
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {dev.overallProgress}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
