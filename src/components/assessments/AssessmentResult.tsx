import React, { useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { Assessment, AssessmentAttempt } from '../../types';
import confetti from 'canvas-confetti';

interface AssessmentResultProps {
  assessment: Assessment;
  attempt: AssessmentAttempt;
  xpEarned: number;
  onRetake: () => void;
  onReturnDashboard: () => void;
  onViewCertificates?: () => void;
}

export const AssessmentResult: React.FC<AssessmentResultProps> = ({
  assessment,
  attempt,
  xpEarned,
  onRetake,
  onReturnDashboard,
  onViewCertificates,
}) => {
  useEffect(() => {
    if (attempt.passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [attempt.passed]);

  const minutes = Math.floor(attempt.timeTakenSeconds / 60);
  const seconds = attempt.timeTakenSeconds % 60;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Result Hero Banner */}
      <div
        className={`rounded-3xl p-8 border shadow-xl text-center relative overflow-hidden ${
          attempt.passed
            ? 'bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 text-white border-emerald-500/40'
            : 'bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-950 text-white border-rose-500/40'
        }`}
      >
        {/* Glow ambient */}
        <div
          className={`absolute inset-0 opacity-10 blur-3xl pointer-events-none ${
            attempt.passed ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />

        <div className="relative z-10 space-y-3">
          <div
            className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-lg ${
              attempt.passed
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-rose-500 text-white shadow-rose-500/30'
            }`}
          >
            {attempt.passed ? <Award className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 border border-white/20">
            {attempt.passed ? 'Assessment Passed ✓' : 'Assessment Threshold Not Met'}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display">
            Your Score: {attempt.score}%
          </h1>

          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            {attempt.feedback}
          </p>

          {attempt.passed && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>+{xpEarned} XP Awarded & Technical Competency Verified</span>
            </div>
          )}
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10 relative z-10">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Correct Answers</span>
            <p className="text-xl font-bold text-white mt-1">
              {attempt.correctAnswers} / {attempt.totalQuestions}
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Time Taken</span>
            <p className="text-xl font-bold text-white mt-1">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Passing Threshold</span>
            <p className="text-xl font-bold text-white mt-1">
              {assessment.passingScore}%
            </p>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onRetake}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Assessment
        </button>

        <div className="flex items-center gap-2">
          {attempt.passed && onViewCertificates && (
            <button
              onClick={onViewCertificates}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              View Certificate
            </button>
          )}

          <button
            onClick={onReturnDashboard}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Rationales & Review */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display">
            Detailed Question Review & Explanations
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Review technical rationale for each question to reinforce learning.
          </p>
        </div>

        <div className="space-y-4">
          {assessment.questions.map((q, idx) => {
            const userAns = attempt.userAnswers.find((ua) => ua.questionId === q.id);
            const isCorrect = userAns?.isCorrect ?? false;
            const selectedIdx = userAns?.selectedIndex ?? -1;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isCorrect
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                        isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{q.question}</h4>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                {q.codeSnippet && (
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                    <code>{q.codeSnippet}</code>
                  </pre>
                )}

                <div className="space-y-1.5 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isUserPick = selectedIdx === optIdx;
                    const isRightOption = optIdx === q.correctIndex;

                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
                          isRightOption
                            ? 'bg-emerald-100/70 border-emerald-300 font-bold text-emerald-900'
                            : isUserPick && !isRightOption
                            ? 'bg-rose-100/70 border-rose-300 font-bold text-rose-900'
                            : 'bg-white border-slate-200 text-slate-600 opacity-70'
                        }`}
                      >
                        <span>{opt}</span>
                        {isRightOption && <span className="text-[10px] font-extrabold text-emerald-700">✓ Correct Answer</span>}
                        {isUserPick && !isRightOption && <span className="text-[10px] font-extrabold text-rose-700">✗ Your Choice</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-slate-100/80 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200/60">
                  <strong className="text-slate-900">Technical Rationale:</strong> {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
