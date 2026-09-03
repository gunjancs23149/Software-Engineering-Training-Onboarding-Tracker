import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrainingModule, User } from '../../types';

interface AnalyticsChartsProps {
  modules: TrainingModule[];
  users: User[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ modules, users }) => {
  const developers = users.filter((u) => u.role === 'DEVELOPER');

  // 1. Module Completion Data (Bar Chart)
  const moduleCompletionData = modules.slice(0, 6).map((m) => ({
    name: m.code,
    fullName: m.title,
    completion: m.completionRate,
  }));

  // 2. Status Distribution (Pie / Doughnut)
  const statusCounts = {
    Completed: developers.filter((d) => d.status === 'Completed').length,
    'On Track': developers.filter((d) => d.status === 'On Track').length,
    'In Progress': developers.filter((d) => d.status === 'In Progress').length,
    'At Risk': developers.filter((d) => d.status === 'At Risk').length,
    Overdue: developers.filter((d) => d.status === 'Overdue').length,
  };

  const statusData = [
    { name: 'Completed', value: statusCounts.Completed || 1, color: '#10b981' },
    { name: 'On Track', value: statusCounts['On Track'] || 2, color: '#3b82f6' },
    { name: 'In Progress', value: statusCounts['In Progress'] || 2, color: '#0ea5e9' },
    { name: 'At Risk', value: statusCounts['At Risk'] || 1, color: '#f59e0b' },
    { name: 'Overdue', value: statusCounts.Overdue || 1, color: '#ef4444' },
  ];

  // 3. Progress Trend over Time (Line Chart)
  const trendData = [
    { week: 'Week 1', Actual: 28, Target: 25 },
    { week: 'Week 2', Actual: 54, Target: 50 },
    { week: 'Week 3', Actual: 72, Target: 75 },
    { week: 'Week 4', Actual: 88, Target: 100 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Bar Chart: Module Completion Rate */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Module Completion Rate
          </h3>
          <p className="text-xs text-slate-500">Percentage completed across active cohort</p>
        </div>

        <div className="h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moduleCompletionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                formatter={(val: any, _name: any, item: any) => [`${val}%`, item.payload.fullName]}
              />
              <Bar dataKey="completion" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Doughnut Chart: Developer Status */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Developer Onboarding Status
          </h3>
          <p className="text-xs text-slate-500">Cohort distribution by health criteria</p>
        </div>

        <div className="h-56 mt-2 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => [`${val} Engineers`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-100">
          {statusData.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span>{s.name} ({s.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Line Chart: Onboarding Progress Over Time */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Onboarding Progress Over Time
          </h3>
          <p className="text-xs text-slate-500">Actual velocity vs targeted milestone</p>
        </div>

        <div className="h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
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
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="Actual" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
