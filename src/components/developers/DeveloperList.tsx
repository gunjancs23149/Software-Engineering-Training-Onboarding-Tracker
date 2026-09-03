import React, { useState } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Eye,
  Edit,
  BookOpen,
  BellRing,
  ArrowUpDown,
  MoreVertical,
  Download,
  Trash2,
} from 'lucide-react';
import { User, Enrollment } from '../../types';
import { useData } from '../../context/DataContext';
import { formatDate, getStatusBadgeClasses } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface DeveloperListProps {
  onViewProfile: (devId: string) => void;
  onAddDeveloper: () => void;
  onAssignTraining: (dev: User) => void;
}

export const DeveloperList: React.FC<DeveloperListProps> = ({
  onViewProfile,
  onAddDeveloper,
  onAssignTraining,
}) => {
  const { users, enrollments, sendDeveloperReminder, deleteDeveloper } = useData();

  const developers = users.filter((u) => u.role === 'DEVELOPER');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'joinDate'>('progress');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [deleteTargetDev, setDeleteTargetDev] = useState<User | null>(null);

  // Teams & Roles for filtering
  const teams = Array.from(new Set(developers.map((d) => d.teamName)));
  const roles = Array.from(new Set(developers.map((d) => d.title)));

  // Filter & Sort logic
  const filteredDevelopers = developers
    .filter((dev) => {
      const matchSearch =
        dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dev.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTeam = selectedTeam === 'ALL' || dev.teamName === selectedTeam;
      const matchStatus = selectedStatus === 'ALL' || dev.status === selectedStatus;
      const matchRole = selectedRole === 'ALL' || dev.title === selectedRole;

      return matchSearch && matchTeam && matchStatus && matchRole;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortBy === 'progress') {
        return sortOrder === 'asc'
          ? a.overallProgress - b.overallProgress
          : b.overallProgress - a.overallProgress;
      }
      if (sortBy === 'joinDate') {
        return sortOrder === 'asc'
          ? new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime()
          : new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      }
      return 0;
    });

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Team', 'Role', 'Join Date', 'Progress %', 'Completed Modules', 'Status', 'Assessment Avg'];
    const rows = filteredDevelopers.map((d) => [
      d.employeeId,
      d.name,
      d.email,
      d.teamName,
      d.title,
      d.joinDate,
      d.overallProgress,
      `${d.completedModulesCount}/${d.totalModulesCount}`,
      d.status,
      `${d.assessmentAverage}%`,
    ]);
    exportToCSV('OnboardPro-Developers-Directory', headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            Developers
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage developer onboarding, track individual technical progress, and assign modules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={onAddDeveloper}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/25 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Developer
          </button>
        </div>
      </div>

      {/* Control & Multi-Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Team Filter */}
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Squads</option>
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="On Track">On Track</option>
          <option value="In Progress">In Progress</option>
          <option value="At Risk">At Risk</option>
          <option value="Overdue">Overdue</option>
        </select>

        {/* Sort Trigger */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs text-slate-600">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="progress">Sort: Progress %</option>
            <option value="name">Sort: Name</option>
            <option value="joinDate">Sort: Join Date</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 hover:text-blue-600 font-bold"
            title="Toggle sort direction"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Developer Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Developer</th>
                <th className="py-3.5 px-4">Team</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Join Date</th>
                <th className="py-3.5 px-4 w-44">Progress</th>
                <th className="py-3.5 px-4 text-center">Modules</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDevelopers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600">No developers match this criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing filters or search term.</p>
                  </td>
                </tr>
              ) : (
                filteredDevelopers.map((dev) => {
                  const statusStyles = getStatusBadgeClasses(dev.status);
                  return (
                    <tr key={dev.id} className="hover:bg-blue-50/30 transition-colors group">
                      {/* Avatar & Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={dev.avatar}
                            alt={dev.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <p
                              onClick={() => onViewProfile(dev.id)}
                              className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              {dev.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {dev.employeeId} • {dev.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Team */}
                      <td className="py-4 px-4 font-medium text-slate-700">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {dev.teamName}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4 text-slate-700 font-medium">
                        {dev.title}
                      </td>

                      {/* Join Date */}
                      <td className="py-4 px-4 text-slate-500 font-medium">
                        {formatDate(dev.joinDate)}
                      </td>

                      {/* Progress Bar */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                            <span className="text-slate-800">{dev.overallProgress}%</span>
                            <span className="text-[10px] text-slate-400">
                              {dev.completedModulesCount} of {dev.totalModulesCount} done
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

                      {/* Modules Count */}
                      <td className="py-4 px-4 text-center font-bold text-slate-700">
                        <span className="text-emerald-600">{dev.completedModulesCount}</span>
                        <span className="text-slate-400"> / {dev.totalModulesCount}</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusStyles.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                          {dev.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => sendDeveloperReminder(dev.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Send training reminder"
                          >
                            <BellRing className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onAssignTraining(dev)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Assign training module"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onViewProfile(dev.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            onClick={() => setDeleteTargetDev(dev)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete developer"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Footer */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredDevelopers.length} of {developers.length} registered engineers</span>
          <span className="font-semibold text-slate-600">Enterprise Cohort Directory</span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTargetDev !== null}
        title={`Remove ${deleteTargetDev?.name}?`}
        message="This will unenroll the developer from all active modules and remove their onboarding progress records. This action cannot be undone."
        confirmLabel="Remove Developer"
        isDestructive={true}
        onConfirm={() => {
          if (deleteTargetDev) deleteDeveloper(deleteTargetDev.id);
        }}
        onCancel={() => setDeleteTargetDev(null)}
      />
    </div>
  );
};
