import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Video,
  FileText,
  Terminal,
  CheckSquare,
  HelpCircle,
  Play,
  Save,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { TrainingModule, Enrollment, LessonSection } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MODULE_CURRICULA } from '../../data/moduleCurriculum';
import confetti from 'canvas-confetti';

interface ModuleDetailProps {
  moduleId: string;
  onBack: () => void;
  onTakeAssessment: (assessmentId: string) => void;
}

export const ModuleDetail: React.FC<ModuleDetailProps> = ({
  moduleId,
  onBack,
  onTakeAssessment,
}) => {
  const { modules, enrollments, completeSection, togglePracticalTask, assessments } = useData();
  const { currentUser } = useAuth();
  const { success, info } = useToast();

  const moduleItem = modules.find((m) => m.id === moduleId) || modules[0];
  const developerId = currentUser?.id || 'user-aarav';
  const enrollment = enrollments.find((e) => e.developerId === developerId && e.moduleId === moduleItem.id);

  // Curriculum configuration
  const curriculum = MODULE_CURRICULA[moduleItem.id] || MODULE_CURRICULA['mod-git'];
  const sections = curriculum.sections;

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const currentSection: LessonSection = sections[currentSectionIndex] || sections[0];
  const completedSectionIds = new Set(enrollment?.completedSectionIds || []);

  const handleNextSection = () => {
    // Complete current section
    completeSection(developerId, moduleItem.id, currentSection.id);
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
    } else {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      success('Module Curriculum Completed! 🎉', 'You have completed all lessons in this module.');
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  };

  const handleSaveProgress = () => {
    completeSection(developerId, moduleItem.id, currentSection.id);
    info('Progress Saved', `Section "${currentSection.title}" saved.`);
  };

  const handleSelectQuizAnswer = (qId: string, optIndex: number) => {
    if (quizSubmitted) return;
    setSelectedQuizAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    completeSection(developerId, moduleItem.id, currentSection.id);
    success('Quiz Checked!', 'Review correct answers and rationales below.');
  };

  // Associated Assessment
  const assessment = assessments.find((a) => a.moduleId === moduleItem.id) || assessments[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Modules Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveProgress}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            Save Progress
          </button>
          <button
            onClick={() => onTakeAssessment(assessment.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            Launch Assessment
          </button>
        </div>
      </div>

      {/* Module Overview Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-mono">
              {moduleItem.code}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {moduleItem.category}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {moduleItem.difficulty}
            </span>
            {moduleItem.mandatory && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Mandatory Track
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            {moduleItem.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {moduleItem.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
            <div className="flex items-center gap-2">
              <img
                src={moduleItem.instructor.avatar}
                alt={moduleItem.instructor.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
              />
              <span>Instructor: <strong>{moduleItem.instructor.name}</strong> ({moduleItem.instructor.role})</span>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {moduleItem.durationLabel}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-emerald-600">
              <Award className="w-3.5 h-3.5" />
              Passing: {moduleItem.passingScore}%
            </span>
          </div>
        </div>

        {/* Overall Module Progress Stepper Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shrink-0 min-w-[200px] text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Your Module Progress
          </span>
          <p className="text-3xl font-extrabold text-blue-600 font-display mt-1">
            {enrollment?.progress || 0}%
          </p>
          <div className="w-full bg-slate-200 rounded-full h-2 my-2 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${enrollment?.progress || 0}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {completedSectionIds.size} of {sections.length} sections finished
          </span>
        </div>
      </div>

      {/* Interactive 7-Section Top Stepper */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-card overflow-x-auto">
        <div className="flex items-center justify-between gap-2 min-w-[700px]">
          {sections.map((sec, index) => {
            const isCompleted = completedSectionIds.has(sec.id);
            const isCurrent = index === currentSectionIndex;

            return (
              <button
                key={sec.id}
                onClick={() => setCurrentSectionIndex(index)}
                className={`flex-1 p-2.5 rounded-xl text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-white text-blue-600'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                </div>
                <div className="truncate min-w-0">
                  <p className="truncate text-[11px] leading-tight">
                    {sec.title.split('. ')[1] || sec.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Section Content Viewer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card min-h-[420px] flex flex-col justify-between">
        <div>
          {/* Section Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Section {currentSectionIndex + 1} of {sections.length}
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
                {currentSection.title}
              </h2>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              ⏱ {currentSection.duration}
            </span>
          </div>

          {/* Section Type 1 & 2 & 4: Text Content / Docs / Objectives */}
          {currentSection.content && (
            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {currentSection.content}
            </div>
          )}

          {/* Section Type 3: Video Player */}
          {currentSection.type === 'resource' && (
            <div className="mt-4 space-y-4">
              <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video max-w-2xl mx-auto flex flex-col items-center justify-center text-white relative shadow-xl">
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center mx-auto shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold">{currentSection.videoTitle || 'Interactive Technical Walkthrough'}</h4>
                    <p className="text-xs text-slate-400 mt-1">Enterprise Masterclass • HD 1080p</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Type 5: Practical Tasks Checklist */}
          {currentSection.tasks && currentSection.tasks.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                Hands-on Terminal Tasks
              </h3>

              <div className="space-y-3">
                {currentSection.tasks.map((task) => {
                  const isTaskDone = enrollment?.practicalTasksCompleted?.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isTaskDone
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isTaskDone || false}
                          onChange={() => togglePracticalTask(developerId, moduleItem.id, task.id)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 mt-1 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-900">{task.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{task.description}</p>

                          {task.codeSnippet && (
                            <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto">
                              <code>{task.codeSnippet}</code>
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section Type 6: Interactive Quiz */}
          {currentSection.quizQuestions && currentSection.quizQuestions.length > 0 && (
            <div className="mt-6 space-y-6">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                Knowledge Check Quiz
              </h3>

              <div className="space-y-5">
                {currentSection.quizQuestions.map((q, qIndex) => {
                  const selected = selectedQuizAnswers[q.id];
                  const isAnswered = selected !== undefined;

                  return (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <p className="text-xs font-bold text-slate-900">
                        {qIndex + 1}. {q.question}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt, optIndex) => {
                          const isOptionSelected = selected === optIndex;
                          const isCorrect = optIndex === q.correctIndex;

                          let btnClasses = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';
                          if (isOptionSelected && !quizSubmitted) {
                            btnClasses = 'bg-blue-50 border-blue-500 text-blue-900 font-bold';
                          } else if (quizSubmitted) {
                            if (isCorrect) {
                              btnClasses = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                            } else if (isOptionSelected && !isCorrect) {
                              btnClasses = 'bg-rose-50 border-rose-500 text-rose-900 font-bold';
                            }
                          }

                          return (
                            <button
                              key={optIndex}
                              type="button"
                              onClick={() => handleSelectQuizAnswer(q.id, optIndex)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${btnClasses}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!quizSubmitted && (
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    Check Answers
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Section Type 7: Final Assessment Callout */}
          {currentSection.type === 'assessment' && (
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl border border-blue-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/25">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  Official {moduleItem.title} Assessment
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  10 questions • 15 minutes • Passing threshold: {moduleItem.passingScore}% • Awards badge and verifiable credential.
                </p>
              </div>

              <button
                onClick={() => onTakeAssessment(assessment.id)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/25 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Start Timed Assessment
              </button>
            </div>
          )}
        </div>

        {/* Bottom Navigation Controls */}
        <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-100">
          <button
            onClick={handlePrevSection}
            disabled={currentSectionIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleNextSection}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <span>{currentSectionIndex === sections.length - 1 ? 'Finish Module' : 'Complete & Continue'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
