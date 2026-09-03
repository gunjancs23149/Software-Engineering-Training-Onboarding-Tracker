import React from 'react';
import {
  BookOpen,
  Clock,
  Award,
  Users,
  CheckCircle2,
  ChevronRight,
  Edit2,
  Share2,
  Archive,
  Terminal,
  GitBranch,
  Code2,
  Database,
  Network,
  Box,
  Workflow,
  Cloud,
  ShieldAlert,
  Zap,
  FileCode2,
} from 'lucide-react';
import { TrainingModule } from '../../types';

interface ModuleCardProps {
  module: TrainingModule;
  onView: (modId: string) => void;
  onEdit?: (mod: TrainingModule) => void;
  onAssign?: (mod: TrainingModule) => void;
  onArchive?: (modId: string) => void;
  isAdmin?: boolean;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  onView,
  onEdit,
  onAssign,
  onArchive,
  isAdmin = true,
}) => {
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Development Environment':
        return Terminal;
      case 'Git & Version Control':
        return GitBranch;
      case 'Programming Standards':
        return Code2;
      case 'Software Testing':
        return CheckCircle2;
      case 'Database Fundamentals':
        return Database;
      case 'API Development':
        return Network;
      case 'Docker & Containers':
        return Box;
      case 'CI/CD':
        return Workflow;
      case 'Cloud Fundamentals':
        return Cloud;
      case 'Cybersecurity':
        return ShieldAlert;
      case 'Agile & Scrum':
        return Zap;
      case 'Code Review':
        return FileCode2;
      default:
        return BookOpen;
    }
  };

  const Icon = getCategoryIcon(module.category);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-elevated transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono">
              {module.code}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                module.mandatory
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {module.mandatory ? 'Mandatory' : 'Optional'}
            </span>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              module.difficulty === 'Beginner'
                ? 'bg-emerald-50 text-emerald-700'
                : module.difficulty === 'Intermediate'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-indigo-50 text-indigo-700'
            }`}
          >
            {module.difficulty}
          </span>
        </div>

        {/* Title & Category */}
        <div className="flex items-start gap-3 my-2">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0 group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              onClick={() => onView(module.id)}
              className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer leading-snug"
            >
              {module.title}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{module.category}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {module.description}
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{module.durationLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{module.learnersCount} Learners</span>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
            <span className="text-slate-500">Cohort Completion</span>
            <span className="text-blue-600 font-bold">{module.completionRate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${module.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onView(module.id)}
          className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer flex-1 justify-center"
        >
          <span>View Module</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {isAdmin && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(module)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Edit module"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onAssign && (
              <button
                onClick={() => onAssign(module)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                title="Assign to developers"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            {onArchive && (
              <button
                onClick={() => onArchive(module.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Archive module"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
