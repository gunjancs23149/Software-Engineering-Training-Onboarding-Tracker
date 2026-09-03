import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Filter,
  Users,
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useData } from '../../context/DataContext';
import { exportToCSV, printFormattedReport } from '../../utils/exportUtils';
import { formatDate } from '../../utils/formatters';

type ReportType =
  | 'developer_progress'
  | 'training_completion'
  | 'module_performance'
  | 'assessment_performance'
  | 'overdue_training'
  | 'team_comparison';

export const ReportsDashboard: React.FC = () => {
  const { users, modules, enrollments, assessments, attempts, teams } = useData();

  const developers = users.filter((u) => u.role === 'DEVELOPER');
  const [selectedReport, setSelectedReport] = useState<ReportType>('developer_progress');
  const [dateRange, setDateRange] = useState('LAST_30_DAYS');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');

  const reportNavList = [
    { id: 'developer_progress' as ReportType, label: '1. Developer Progress Report', icon: Users },
    { id: 'training_completion' as ReportType, label: '2. Training Completion Report', icon: CheckCircle2 },
    { id: 'module_performance' as ReportType, label: '3. Module Performance Report', icon: BookOpen },
    { id: 'assessment_performance' as ReportType, label: '4. Assessment Performance Report', icon: Award },
    { id: 'overdue_training' as ReportType, label: '5. Overdue Training Report', icon: AlertTriangle },
    { id: 'team_comparison' as ReportType, label: '6. Team Comparison Report', icon: TrendingUp },
  ];

  // Team comparison data
  const teamComparisonData = teams.map((team) => {
    const teamDevs = developers.filter((d) => d.teamName === team.name);
    const avgProgress =
      teamDevs.length > 0
        ? Math.round(teamDevs.reduce((acc, d) => acc + d.overallProgress, 0) / teamDevs.length)
        : team.averageProgress;
    const avgScore =
      teamDevs.length > 0
        ? Math.round(teamDevs.reduce((acc, d) => acc + d.assessmentAverage, 0) / teamDevs.length)
        : team.averageAssessmentScore;
    const completionRate =
      teamDevs.length > 0
        ? Math.round(
            (teamDevs.filter((d) => d.status === 'Completed').length / teamDevs.length) * 100
          )
        : team.completionRate;

    return {
      name: team.name.replace(' & Infrastructure', '').replace(' Platform', ''),
      fullName: team.name,
      'Avg Progress': avgProgress,
      'Avg Score': avgScore,
      'Completion %': completionRate,
    };
  });

  const handleExportCSV = () => {
    if (selectedReport === 'developer_progress') {
      const headers = ['ID', 'Name', 'Team', 'Role', 'Progress %', 'Completed Modules', 'Status', 'Assessment Avg'];
      const rows = developers.map((d) => [
        d.employeeId,
        d.name,
        d.teamName,
        d.title,
        d.overallProgress,
        `${d.completedModulesCount}/${d.totalModulesCount}`,
        d.status,
        `${d.assessmentAverage}%`,
      ]);
      exportToCSV('Developer-Progress-Report', headers, rows);
    } else if (selectedReport === 'module_performance') {
      const headers = ['Code', 'Title', 'Category', 'Duration', 'Passing Score', 'Completion Rate %', 'Learners'];
      const rows = modules.map((m) => [
        m.code,
        m.title,
        m.category,
        m.durationLabel,
        m.passingScore,
        m.completionRate,
        m.learnersCount,
      ]);
      exportToCSV('Module-Performance-Report', headers, rows);
    } else if (selectedReport === 'team_comparison') {
      const headers = ['Squad', 'Avg Progress %', 'Avg Assessment Score %', 'Completion Rate %'];
      const rows = teamComparisonData.map((t) => [t.fullName, t['Avg Progress'], t['Avg Score'], t['Completion %']]);
      exportToCSV('Team-Comparison-Report', headers, rows);
    } else {
      const headers = ['Attempt ID', 'Assessment', 'Developer', 'Score %', 'Passed', 'Time Taken (s)', 'Submitted At'];
      const rows = attempts.map((a) => [a.id, a.assessmentTitle, a.developerName, a.score, a.passed ? 'YES' : 'NO', a.timeTakenSeconds, a.submittedAt]);
      exportToCSV('Assessments-Report', headers, rows);
    }
  };

  const handlePrint = () => {
    let tableHTML = '';
    if (selectedReport === 'developer_progress') {
      tableHTML = `
        <table>
          <thead>
            <tr><th>Developer</th><th>Squad</th><th>Role</th><th>Progress</th><th>Status</th><th>Score Avg</th></tr>
          </thead>
          <tbody>
            ${developers
              .map(
                (d) => `<tr>
              <td><strong>${d.name}</strong> (${d.employeeId})</td>
              <td>${d.teamName}</td>
              <td>${d.title}</td>
              <td>${d.overallProgress}%</td>
              <td>${d.status}</td>
              <td>${d.assessmentAverage}%</td>
            </tr>`
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else {
      tableHTML = `
        <table>
          <thead>
            <tr><th>Squad</th><th>Average Progress</th><th>Average Assessment Score</th><th>Completion Rate</th></tr>
          </thead>
          <tbody>
            ${teamComparisonData
              .map(
                (t) => `<tr>
              <td><strong>${t.fullName}</strong></td>
              <td>${t['Avg Progress']}%</td>
              <td>${t['Avg Score']}%</td>
              <td>${t['Completion %']}%</td>
            </tr>`
              )
              .join('')}
          </tbody>
        </table>
      `;
    }

    printFormattedReport('Technical Onboarding Analytics & Verification Report', 'Executive Summary and Developer Competency Audit', tableHTML);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
              Reporting & Analytics
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Enterprise Dashboard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate audit-ready completion summaries, squad cross-comparisons, and assessment analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Report / PDF
          </button>
        </div>
      </div>

      {/* Report Selector Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {reportNavList.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedReport === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedReport(item.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Team Comparison Chart & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Comparison Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Squad Technical Competency Comparison
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare velocity, pass rates, and completion percentages across squads
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-mono">
              5 Engineering Squads
            </span>
          </div>

          <div className="h-72 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamComparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => `${val}%`}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Avg Progress" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Avg Score" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Completion %" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Squad Performance KPI Summary */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Squad Health Overview
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Top performing squads</p>
          </div>

          <div className="my-4 space-y-3.5">
            {teams.map((t) => (
              <div key={t.id} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{t.name}</span>
                  <span className="text-xs font-extrabold text-blue-600">{t.averageProgress}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Lead: {t.leadName}</span>
                  <span className="text-emerald-600 font-semibold">Avg: {t.averageAssessmentScore}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 text-center font-medium">
            Updated continuously via event webhooks
          </div>
        </div>
      </div>

      {/* Detailed Dynamic Report Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              {reportNavList.find((r) => r.id === selectedReport)?.label}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Detailed raw audit records and metrics</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {selectedReport === 'developer_progress' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Developer</th>
                  <th className="py-3.5 px-4">Squad</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Progress %</th>
                  <th className="py-3.5 px-4 text-center">Modules Finished</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Assessment Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {developers.map((dev) => (
                  <tr key={dev.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      {dev.name} ({dev.employeeId})
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{dev.teamName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{dev.title}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">{dev.overallProgress}%</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {dev.completedModulesCount} / {dev.totalModulesCount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                        {dev.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right font-extrabold text-emerald-600">
                      {dev.assessmentAverage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'module_performance' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Module</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Passing %</th>
                  <th className="py-3.5 px-4 text-center">Completion Rate</th>
                  <th className="py-3.5 px-6 text-right">Active Learners</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modules.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      [{mod.code}] {mod.title}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{mod.category}</td>
                    <td className="py-3.5 px-4 text-slate-600">{mod.difficulty}</td>
                    <td className="py-3.5 px-4 text-slate-600">{mod.durationLabel}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">{mod.passingScore}%</td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600">{mod.completionRate}%</td>
                    <td className="py-3.5 px-6 text-right font-bold text-slate-700">{mod.learnersCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(selectedReport === 'assessment_performance' || selectedReport === 'training_completion' || selectedReport === 'overdue_training' || selectedReport === 'team_comparison') && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Squad Name</th>
                  <th className="py-3.5 px-4">Lead</th>
                  <th className="py-3.5 px-4">Engineers</th>
                  <th className="py-3.5 px-4">Average Progress</th>
                  <th className="py-3.5 px-4">Average Score</th>
                  <th className="py-3.5 px-6 text-right">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teams.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-6 font-bold text-slate-900">{t.name}</td>
                    <td className="py-3.5 px-4 text-slate-700">{t.leadName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{t.developerCount} engineers</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">{t.averageProgress}%</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">{t.averageAssessmentScore}%</td>
                    <td className="py-3.5 px-6 text-right font-extrabold text-purple-600">{t.completionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
