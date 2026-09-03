import React from 'react';
import { Award, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface CircularProgressCardProps {
  progressPercentage: number;
  completedModules: number;
  totalModules: number;
  readyDevelopers: number;
  totalDevelopers: number;
}

export const CircularProgressCard: React.FC<CircularProgressCardProps> = ({
  progressPercentage,
  completedModules,
  totalModules,
  readyDevelopers,
  totalDevelopers,
}) => {
  const radius = 70;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const remainingModules = Math.max(0, totalModules - completedModules);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-display">
            Overall Onboarding Progress
          </h2>
          <p className="text-xs text-slate-500">Cohort technical readiness & completion</p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
          <Sparkles className="w-3.5 h-3.5" />
          Live Cohort
        </span>
      </div>

      <div className="my-6 flex flex-col sm:flex-row items-center justify-around gap-6">
        {/* SVG Circular Progress */}
        <div className="relative flex items-center justify-center">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            {/* Background Track */}
            <circle
              stroke="#f1f5f9"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress Stroke */}
            <circle
              stroke="url(#progressGradient)"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* SVG Gradient */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-3xl font-extrabold text-slate-900 font-display">
              {progressPercentage}%
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Completed
            </span>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-3 w-full sm:w-auto">
          <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Completed Modules</p>
              <p className="text-xs font-bold text-emerald-600">{completedModules} modules verified</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Remaining Modules</p>
              <p className="text-xs font-bold text-amber-600">{remainingModules} modules in progress</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Production Ready</p>
              <p className="text-xs font-bold text-indigo-600">{readyDevelopers} of {totalDevelopers} engineers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
        <span>Target: 100% completion in 4 weeks</span>
        <span className="font-semibold text-blue-600">On Schedule</span>
      </div>
    </div>
  );
};
