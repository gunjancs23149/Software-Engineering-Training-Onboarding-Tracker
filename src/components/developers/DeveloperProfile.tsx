import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Building,
  Shield,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Sparkles,
  MessageSquare,
  Activity,
  ChevronRight,
  ExternalLink,
  FileCheck,
  Plus,
  Play,
  RotateCcw,
} from 'lucide-react';
import { User, TrainingModule, Enrollment, ManagerComment, Certificate, Badge } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getStatusBadgeClasses } from '../../utils/formatters';
import { CertificateModal } from '../common/CertificateModal';

interface DeveloperProfileProps {
  developerId: string;
  onBack: () => void;
  onNavigateToModule: (moduleId: string) => void;
  onAssignModule: (dev: User) => void;
}

export const DeveloperProfile: React.FC<DeveloperProfileProps> = ({
  developerId,
  onBack,
  onNavigateToModule,
  onAssignModule,
}) => {
  const {
    users,
    modules,
    enrollments,
    attempts,
    certificates,
    managerComments,
    activityLogs,
    badges,
    addManagerComment,
    sendDeveloperReminder,
    updateEnrollmentStatus,
  } = useData();

  const { currentUser, role } = useAuth();

  const [activeTab, setActiveTab] = useState<'modules' | 'assessments' | 'timeline' | 'feedback' | 'activity'>('modules');
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedTag, setSelectedTag] = useState('On Track');
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);

  const developer = users.find((u) => u.id === developerId) || users[1];
  const devEnrollments = enrollments.filter((e) => e.developerId === developer.id);
  const devAttempts = attempts.filter((a) => a.developerId === developer.id);
  const devCertificates = certificates.filter((c) => c.developerId === developer.id);
  const devComments = managerComments.filter((c) => c.developerId === developer.id);
  const devLogs = activityLogs.filter((l) => l.developerId === developer.id);

  const statusStyles = getStatusBadgeClasses(developer.status);

  // Stats calculation
  const completedCount = devEnrollments.filter((e) => e.status === 'completed' || e.progress === 100).length;
  const inProgressCount = devEnrollments.filter((e) => e.status === 'in_progress' && e.progress < 100).length;
  const pendingCount = devEnrollments.filter((e) => e.status === 'pending').length;
  const overdueCount = devEnrollments.filter((e) => e.status === 'overdue').length;

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    addManagerComment({
      developerId: developer.id,
      authorId: currentUser?.id || 'admin',
      authorName: currentUser?.name || 'Alex Morgan',
      authorAvatar: currentUser?.avatar || '',
      authorRole: currentUser?.role === 'ADMIN' ? 'Director of Engineering' : 'Peer Engineer',
      comment: newCommentText,
      tags: [selectedTag],
    });

    setNewCommentText('');
  };

  // 4-Week Timeline Modules grouping
  const weekTimeline = [
    {
      week: 'Week 1',
      title: 'Environment & Version Control',
      modules: modules.filter((m) => m.weekNumber === 1),
    },
    {
      week: 'Week 2',
      title: 'Standards, Testing & Databases',
      modules: modules.filter((m) => m.weekNumber === 2),
    },
    {
      week: 'Week 3',
      title: 'APIs, Containers & CI/CD',
      modules: modules.filter((m) => m.weekNumber === 3),
    },
    {
      week: 'Week 4',
      title: 'Cloud, Security & Code Reviews',
      modules: modules.filter((m) => m.weekNumber === 4),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => sendDeveloperReminder(developer.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200 transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            Send Reminder
          </button>
          <button
            onClick={() => onAssignModule(developer)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            Assign Training
          </button>
        </div>
      </div>

      {/* Developer Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative">
              <img
                src={developer.profileImage || developer.avatar}
                alt={developer.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-blue-50 shadow-md"
              />
              {developer.authProvider === 'google' && (
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center ring-2 ring-white shadow-xs"
                  title="Google OAuth Verified Profile"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 font-display">
                  {developer.name}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${statusStyles.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                  {developer.status}
                </span>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold font-mono">
                  {developer.employeeId}
                </span>
                {developer.authProvider === 'google' && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-[10px] font-bold flex items-center gap-1">
                    Google OAuth
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-700">
                {developer.title} • <span className="text-blue-600">{developer.teamName}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {developer.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined: {formatDate(developer.joinDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  Lead: {developer.manager}
                </span>
              </div>
            </div>
          </div>

          {/* Large Circular Progress Percentage */}
          <div className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 shrink-0">
            <div className="relative flex items-center justify-center w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  stroke="#e2e8f0"
                  fill="transparent"
                  strokeWidth={6}
                  r={26}
                  cx={32}
                  cy={32}
                />
                <circle
                  stroke="#2563eb"
                  fill="transparent"
                  strokeWidth={6}
                  strokeDasharray={163}
                  strokeDashoffset={163 - (developer.overallProgress / 100) * 163}
                  strokeLinecap="round"
                  r={26}
                  cx={32}
                  cy={32}
                />
              </svg>
              <span className="absolute text-sm font-extrabold text-slate-900 font-display">
                {developer.overallProgress}%
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Overall Progress</p>
              <p className="text-[11px] text-slate-500">
                {completedCount} of {developer.totalModulesCount} mandatory modules
              </p>
              <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                Avg. Score: {developer.assessmentAverage}%
              </p>
            </div>
          </div>
        </div>

        {/* 5 KPI Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Total Modules</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{devEnrollments.length || 11}</p>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <p className="text-[11px] font-bold text-emerald-700 uppercase">Completed</p>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">{completedCount}</p>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <p className="text-[11px] font-bold text-blue-700 uppercase">In Progress</p>
            <p className="text-lg font-bold text-blue-600 mt-0.5">{inProgressCount}</p>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <p className="text-[11px] font-bold text-amber-700 uppercase">Pending</p>
            <p className="text-lg font-bold text-amber-600 mt-0.5">{pendingCount}</p>
          </div>
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
            <p className="text-[11px] font-bold text-rose-700 uppercase">Overdue / Risk</p>
            <p className="text-lg font-bold text-rose-600 mt-0.5">{overdueCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('modules')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'modules'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Training Modules ({devEnrollments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>4-Week Roadmap</span>
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'assessments'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Assessments & Badges</span>
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'feedback'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Manager Feedback ({devComments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'activity'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Activity Log</span>
        </button>
      </div>

      {/* Tab 1: Modules Grid */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const enrollment = devEnrollments.find((e) => e.moduleId === mod.id);
            const isCompleted = enrollment?.status === 'completed' || enrollment?.progress === 100;
            const isInProgress = enrollment?.status === 'in_progress';
            const isOverdue = enrollment?.status === 'overdue';
            const progress = enrollment?.progress || 0;

            return (
              <div
                key={mod.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {mod.code}
                    </span>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                    {isInProgress && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <Clock className="w-3 h-3" /> In Progress
                      </span>
                    )}
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3 h-3" /> Overdue
                      </span>
                    )}
                    {!enrollment && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        Not Enrolled
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => onNavigateToModule(mod.id)}
                    className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-1"
                  >
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mod.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Progress: <strong>{progress}%</strong></span>
                    {enrollment?.score !== null && enrollment?.score !== undefined ? (
                      <span className="text-emerald-600 font-bold">Score: {enrollment.score}%</span>
                    ) : (
                      <span className="text-slate-400">Due: {formatDate(enrollment?.dueDate || '')}</span>
                    )}
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCompleted ? 'bg-emerald-500' : progress > 50 ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">{mod.durationLabel}</span>
                    <button
                      onClick={() => onNavigateToModule(mod.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      <span>{isCompleted ? 'Review' : 'Open Module'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: 4-Week Roadmap Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {weekTimeline.map((weekItem, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-card">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
                    {weekItem.week}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 font-display">
                    Phase {idx + 1}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-3">{weekItem.title}</h4>

                <div className="space-y-2.5">
                  {weekItem.modules.map((mod) => {
                    const enr = devEnrollments.find((e) => e.moduleId === mod.id);
                    const done = enr?.status === 'completed' || enr?.progress === 100;
                    return (
                      <div
                        key={mod.id}
                        onClick={() => onNavigateToModule(mod.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          done
                            ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/60'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 truncate">{mod.title}</p>
                          <p className="text-[10px] text-slate-500">{mod.code} • {mod.durationLabel}</p>
                        </div>
                        {done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                            {enr?.progress || 0}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Assessments & Badges */}
      {activeTab === 'assessments' && (
        <div className="space-y-6">
          {/* Badges Earned */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 font-display mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Earned Badges & Credentials
            </h3>
            <p className="text-xs text-slate-500 mb-4">Milestones unlocked through verified assessment scores</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {badges.map((b) => {
                const isEarned = developer.badges?.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                      isEarned
                        ? 'bg-amber-50/50 border-amber-200/80 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200/50 opacity-40'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${isEarned ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{b.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{b.description}</p>
                      <span className="text-[10px] font-bold text-amber-700 mt-1 block">+{b.xpReward} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 font-display mb-4 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              Verified Completion Certificates
            </h3>
            {devCertificates.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No certificates issued yet. Complete all onboarding modules to unlock.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devCertificates.map((cert) => (
                  <div key={cert.id} className="p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-900">{cert.programName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Issued: {cert.issueDate} • Grade: {cert.grade}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">ID: {cert.certificateNumber}</p>
                    </div>
                    <button
                      onClick={() => setViewingCertificate(cert)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      View Certificate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Manager Comments & Feedback */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {/* Add Feedback Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 font-display mb-3">
              Add Manager Feedback / 1-on-1 Notes
            </h3>
            <form onSubmit={handlePostComment} className="space-y-3">
              <textarea
                rows={3}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Share technical guidance, highlight sprint achievements, or note unblocking actions..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Tag:</span>
                  {['On Track', 'Fast Learner', 'Mentorship Needed', 'High Potential'].map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                        selectedTag === tag
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post Feedback
                </button>
              </div>
            </form>
          </div>

          {/* Feedback Timeline */}
          <div className="space-y-3">
            {devComments.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No manager notes recorded yet.</p>
            ) : (
              devComments.map((cmt) => (
                <div key={cmt.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-start gap-3.5">
                  <img src={cmt.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt={cmt.authorName} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{cmt.authorName}</span>
                        <span className="text-[11px] text-slate-500 ml-2 font-medium">{cmt.authorRole}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{cmt.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{cmt.comment}</p>
                    {cmt.tags && cmt.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {cmt.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Activity Log */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card">
          <h3 className="text-sm font-bold text-slate-900 font-display mb-4">
            Developer Event Trail
          </h3>
          <div className="space-y-3">
            {devLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No logged events for this developer.</p>
            ) : (
              devLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs py-2 border-b border-slate-100 last:border-none">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium">{log.message}</p>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* View Certificate Modal */}
      <CertificateModal
        certificate={viewingCertificate}
        isOpen={viewingCertificate !== null}
        onClose={() => setViewingCertificate(null)}
      />
    </div>
  );
};
