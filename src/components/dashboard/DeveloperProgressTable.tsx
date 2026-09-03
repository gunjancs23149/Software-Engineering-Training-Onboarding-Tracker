import React, { useState } from 'react';
import { Search, Eye, Filter, ArrowRight, UserPlus, BellRing, Sparkles } from 'lucide-react';
import { User, Enrollment } from '../../types';
import { getStatusBadgeClasses } from '../../utils/formatters';

interface DeveloperProgressTableProps {
  developers: User[];
  enrollments: Enrollment[];
  onViewDeveloper: (devId: string) => void;
  onViewAllDevelopers: () => void;
  onAddDeveloper: () => void;
  onSendReminder: (devId: string) => void;
}

export const DeveloperProgressTable: React.FC<DeveloperProgressTableProps> = ({
  developers,
  enrollments,
  onViewDeveloper,
  onViewAllDevelopers,
  onAddDeveloper,
  onSendReminder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = developers.filter((dev) => {
    const matchesSearch =
      dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = teamFilter === 'ALL' || dev.teamName === teamFilter;
    const matchesStatus = statusFilter === 'ALL' || dev.status === statusFilter;
    return matchesSearch && matchesTeam && matchesStatus;
  });

  const teams = Array.from(new Set(developers.map((d) => d.teamName)));

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
      {/* Header & Controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Developer Progress Overview
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              {filtered.length} Active Engineers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time technical training milestones and health status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search developer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Squads</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Add Developer Button */}
          <button
            onClick={onAddDeveloper}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Developer
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-6">Developer</th>
              <th className="py-3 px-4">Team</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4 w-44">Progress</th>
              <th className="py-3 px-4 text-center">Completed</th>
              <th className="py-3 px-4 text-center">Pending</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No developers matched the filter criteria.
                </td>
              </tr>
            ) : (
              filtered.slice(0, 6).map((dev) => {
                const statusStyles = getStatusBadgeClasses(dev.status);
                const pendingCount = Math.max(0, dev.totalModulesCount - dev.completedModulesCount);

                return (
                  <tr key={dev.id} className="hover:bg-blue-50/30 transition-colors group">
                    {/* Developer Avatar & Name */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={dev.avatar}
                          alt={dev.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {dev.name}
                          </p>
                          <p className="text-[11px] text-slate-400">{dev.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                        {dev.teamName}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {dev.title}
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                          <span className="text-slate-700">{dev.overallProgress}%</span>
                          <span className="text-slate-400 text-[10px]">
                            {dev.completedModulesCount}/{dev.totalModulesCount}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              dev.overallProgress === 100
                                ? 'bg-emerald-500'
                                : dev.overallProgress >= 75
                                ? 'bg-blue-600'
                                : dev.overallProgress >= 40
                                ? 'bg-sky-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${dev.overallProgress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Completed */}
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                      {dev.completedModulesCount}
                    </td>

                    {/* Pending */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                      {pendingCount}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusStyles.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                        {dev.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSendReminder(dev.id)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Send onboarding reminder"
                        >
                          <BellRing className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onViewDeveloper(dev.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer link to view all developers */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Showing {Math.min(6, filtered.length)} of {developers.length} developers
        </p>
        <button
          onClick={onViewAllDevelopers}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
        >
          <span>View All Developers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
