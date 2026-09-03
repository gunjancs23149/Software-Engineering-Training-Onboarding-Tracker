import React from 'react';
import {
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Zap,
} from 'lucide-react';
import { User, TrainingModule, Enrollment, Badge } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { GamificationWidget } from './GamificationWidget';
import { formatDate } from '../../utils/formatters';

interface DeveloperDashboardProps {
  onNavigateToModule: (moduleId: string) => void;
  onNavigate: (tab: string, targetId?: string) => void;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  onNavigateToModule,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const { users, modules, enrollments, badges } = useData();

  const developer: User = currentUser || users[1];
  const devEnrollments = enrollments.filter((e) => e.developerId === developer.id);

  // Next recommended module: First in_progress or pending module
  const nextEnrollment =
    devEnrollments.find((e) => e.status === 'in_progress' && e.progress < 100) ||
    devEnrollments.find((e) => e.status === 'pending') ||
    devEnrollments[0];

  const nextModule = modules.find((m) => m.id === nextEnrollment?.moduleId) || modules[3];

  const completedModulesCount = devEnrollments.filter(
    (e) => e.status === 'completed' || e.progress === 100
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Personalized Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Engineering Onboarding Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
            Welcome back, {developer.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Complete your mandatory technical onboarding modules, pass assessments, and become production-ready.
          </p>
        </div>

        {/* 4 Summary Stat Pills */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-blue-200 uppercase">Progress</span>
            <p className="text-xl font-extrabold text-white mt-0.5">{developer.overallProgress}%</p>
          </div>
          <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-blue-200 uppercase">Modules</span>
            <p className="text-xl font-extrabold text-white mt-0.5">
              {completedModulesCount}/{developer.totalModulesCount}
            </p>
          </div>
          <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-blue-200 uppercase">Assessment Avg</span>
            <p className="text-xl font-extrabold text-white mt-0.5">{developer.assessmentAverage}%</p>
          </div>
          <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[90px]">
            <span className="text-[10px] font-bold text-blue-200 uppercase">Days Left</span>
            <p className="text-xl font-extrabold text-white mt-0.5">{developer.daysRemaining}</p>
          </div>
        </div>
      </div>

      {/* Next Recommended Training Card */}
      {nextModule && (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/80 rounded-3xl p-6 sm:p-7 border border-blue-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                Next Recommended Training
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">
                {nextModule.code}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
              {nextModule.title}
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              {nextModule.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
              <span>⏱ {nextModule.durationLabel}</span>
              <span>•</span>
              <span>🎯 Passing Score: {nextModule.passingScore}%</span>
              <span>•</span>
              <span className="text-blue-700 font-bold">Week {nextModule.weekNumber} Curriculum</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToModule(nextModule.id)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/25 shrink-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Continue Training</span>
          </button>
        </div>
      )}

      {/* Gamification & Leaderboard Section */}
      <GamificationWidget user={developer} allUsers={users} badges={badges} />

      {/* My Onboarding Journey Modules */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              My Onboarding Journey
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Step-by-step technical curriculum to reach full production engineering readiness
            </p>
          </div>
          <button
            onClick={() => onNavigate('checklist')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View Checklist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod) => {
            const enr = devEnrollments.find((e) => e.moduleId === mod.id);
            const isCompleted = enr?.status === 'completed' || enr?.progress === 100;
            const isInProgress = enr?.status === 'in_progress' && enr?.progress < 100;
            const progress = enr?.progress || 0;

            return (
              <div
                key={mod.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : isInProgress
                    ? 'bg-blue-50/50 border-blue-200'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {mod.code}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : isInProgress ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700">
                        <Clock className="w-3 h-3" /> In Progress
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Pending</span>
                    )}
                  </div>

                  <h4
                    onClick={() => onNavigateToModule(mod.id)}
                    className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer truncate"
                  >
                    {mod.title}
                  </h4>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>⏱ {mod.durationLabel}</span>
                    <span>•</span>
                    <span>Progress: <strong>{progress}%</strong></span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCompleted ? 'bg-emerald-500' : progress > 50 ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToModule(mod.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    isCompleted
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                  }`}
                >
                  {isCompleted ? 'Review' : 'Continue'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
