import React from 'react';
import {
  CheckSquare,
  Clock,
  Award,
  Users,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Assessment, AssessmentAttempt } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

interface AssessmentListProps {
  onStartAssessment: (assessmentId: string) => void;
  onViewAttempt?: (attempt: AssessmentAttempt) => void;
}

export const AssessmentList: React.FC<AssessmentListProps> = ({
  onStartAssessment,
  onViewAttempt,
}) => {
  const { assessments, attempts } = useData();
  const { currentUser, role } = useAuth();

  const userAttempts = attempts.filter((a) => a.developerId === currentUser?.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
              Technical Assessments
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              {assessments.length} Active Evaluations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mandatory timed assessments to validate developer mastery and unlock production privileges.
          </p>
        </div>
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((asm) => {
          const userBestAttempt = userAttempts
            .filter((a) => a.assessmentId === asm.id)
            .sort((a, b) => b.score - a.score)[0];

          return (
            <div
              key={asm.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {asm.moduleTitle}
                  </span>
                  {userBestAttempt?.passed && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Passed ({userBestAttempt.score}%)
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {asm.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {asm.description}
                </p>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>{asm.questions.length} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{asm.durationMinutes} Minutes</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-emerald-600">
                    <Award className="w-3.5 h-3.5" />
                    <span>Passing: {asm.passingScore}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-blue-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Avg Score: {asm.averageScore}%</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onStartAssessment(asm.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{userBestAttempt ? 'Retake Assessment' : 'Take Assessment'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attempts History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              {role === 'ADMIN' ? 'Recent Cohort Assessment Submissions' : 'My Assessment History'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified scores and timestamped completion records
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {attempts.length} attempts recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Assessment</th>
                <th className="py-3 px-4">Developer</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Time Taken</th>
                <th className="py-3 px-6 text-right">Submitted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No assessment attempts recorded yet.
                  </td>
                </tr>
              ) : (
                attempts.slice(0, 8).map((att) => (
                  <tr key={att.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      {att.assessmentTitle}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {att.developerName}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-blue-600">
                      {att.score}%
                    </td>
                    <td className="py-3.5 px-4">
                      {att.passed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {Math.floor(att.timeTakenSeconds / 60)}m {att.timeTakenSeconds % 60}s
                    </td>
                    <td className="py-3.5 px-6 text-right text-slate-400 font-medium">
                      {att.submittedAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
