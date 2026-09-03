import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Flag,
  Sparkles,
  HelpCircle,
  X,
  Award,
} from 'lucide-react';
import { Assessment, AssessmentQuestion, AssessmentAttempt } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface TakeAssessmentProps {
  assessment: Assessment;
  onCancel: () => void;
  onComplete: (attempt: AssessmentAttempt, passed: boolean, xpEarned: number) => void;
}

export const TakeAssessment: React.FC<TakeAssessmentProps> = ({
  assessment,
  onCancel,
  onComplete,
}) => {
  const { currentUser } = useAuth();
  const { submitAssessment } = useData();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [remainingSeconds, setRemainingSeconds] = useState(assessment.durationMinutes * 60);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [startTime] = useState(Date.now());

  const questions = assessment.questions;
  const currentQuestion: AssessmentQuestion = questions[currentQuestionIndex] || questions[0];

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleToggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleFinalSubmit = () => {
    const timeTaken = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    let correctCount = 0;

    const userAnswersList = questions.map((q) => {
      const selected = selectedAnswers[q.id];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount += 1;

      return {
        questionId: q.id,
        selectedIndex: selected !== undefined ? selected : -1,
        isCorrect,
      };
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercent >= assessment.passingScore;

    let feedback = '';
    if (scorePercent === 100) {
      feedback = `Flawless perfection! You demonstrated master-level understanding of ${assessment.moduleTitle}.`;
    } else if (passed) {
      feedback = `Great technical execution! You passed the threshold (${assessment.passingScore}%) with strong domain accuracy.`;
    } else {
      feedback = `Passing score is ${assessment.passingScore}%. Please review the recommended modules and take another attempt.`;
    }

    const { attempt, xpEarned } = submitAssessment({
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      moduleId: assessment.moduleId,
      developerId: currentUser?.id || 'user-aarav',
      developerName: currentUser?.name || 'Aarav Sharma',
      score: scorePercent,
      passed,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeTakenSeconds: timeTaken,
      feedback,
      userAnswers: userAnswersList,
    });

    onComplete(attempt, passed, xpEarned);
  };

  const handleAutoSubmit = () => {
    handleFinalSubmit();
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isTimeLow = remainingSeconds < 120; // less than 2 mins

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Assessment Header Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
            {assessment.moduleTitle}
          </span>
          <h2 className="text-lg sm:text-xl font-bold font-display mt-1 text-white">
            {assessment.title}
          </h2>
          <p className="text-xs text-slate-400">
            Passing requirement: {assessment.passingScore}% • {questions.length} questions
          </p>
        </div>

        {/* Live Countdown Timer */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono font-bold text-sm ${
              isTimeLow
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-slate-800 text-emerald-400 border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={() => setIsSubmitConfirmOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* Question Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Palette Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card h-fit space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Question Palette
            </h3>
            <span className="text-xs font-semibold text-blue-600">
              {answeredCount}/{questions.length} Answered
            </span>
          </div>

          {/* Question Number Buttons */}
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentQuestionIndex;
              const isFlagged = flaggedQuestions.has(q.id);

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{idx + 1}</span>
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-1 ring-white" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 inline-block" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300 inline-block" />
              <span>Unanswered ({questions.length - answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>Flagged for review ({flaggedQuestions.size})</span>
            </div>
          </div>
        </div>

        {/* Question & Options Main Area */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col justify-between min-h-[460px]">
          <div>
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Category: {currentQuestion.category}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleFlag(currentQuestion.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                  flaggedQuestions.has(currentQuestion.id)
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'text-slate-500 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flaggedQuestions.has(currentQuestion.id) ? 'Flagged' : 'Flag for Review'}</span>
              </button>
            </div>

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed font-display">
              {currentQuestion.question}
            </h3>

            {/* Code Snippet if present */}
            {currentQuestion.codeSnippet && (
              <pre className="my-4 p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
                <code>{currentQuestion.codeSnippet}</code>
              </pre>
            )}

            {/* Multiple Choice Options */}
            <div className="space-y-3 mt-6">
              {currentQuestion.options.map((optionText, optIdx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === optIdx;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold ring-1 ring-blue-600 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{optionText}</span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Stepper Navigation */}
          <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-100">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <span>Finish & Submit</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isSubmitConfirmOpen}
        title="Submit Assessment?"
        message={`You have answered ${answeredCount} of ${questions.length} questions. You cannot change your answers once submitted.`}
        confirmLabel="Yes, Submit Now"
        cancelLabel="Keep Reviewing"
        onConfirm={handleFinalSubmit}
        onCancel={() => setIsSubmitConfirmOpen(false)}
      />
    </div>
  );
};
