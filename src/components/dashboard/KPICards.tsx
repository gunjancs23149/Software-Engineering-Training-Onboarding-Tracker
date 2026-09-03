import React from 'react';
import {
  Users,
  UserCheck,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { DashboardKPIData } from '../../types';

interface KPICardsProps {
  data: DashboardKPIData;
}

export const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  const cards = [
    {
      title: 'Total Developers',
      value: data.totalDevelopers,
      change: data.totalDevelopersChange,
      isPositive: true,
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Active Onboarding',
      value: data.activeOnboarding,
      change: data.activeOnboardingChange,
      isPositive: true,
      icon: UserCheck,
      iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
    },
    {
      title: 'Completed Onboarding',
      value: data.completedOnboarding,
      change: data.completedOnboardingChange,
      isPositive: true,
      icon: Award,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Average Progress',
      value: `${data.averageProgress}%`,
      change: data.averageProgressChange,
      isPositive: true,
      icon: TrendingUp,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Modules Completed',
      value: data.modulesCompleted,
      change: data.modulesCompletedChange,
      isPositive: true,
      icon: CheckCircle2,
      iconBg: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      title: 'Overdue Training',
      value: data.overdueTraining,
      change: data.overdueTrainingChange,
      isPositive: false,
      icon: AlertOctagon,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card hover:shadow-elevated transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                {card.value}
              </div>

              <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
                {card.isPositive ? (
                  <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    {card.change}
                  </span>
                ) : (
                  <span className="inline-flex items-center text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                    {card.change}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
