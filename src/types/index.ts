export type UserRole = 'ADMIN' | 'DEVELOPER';

export type OnboardingStatus = 'Completed' | 'On Track' | 'In Progress' | 'At Risk' | 'Overdue';

export type ExperienceLevel = 'Junior' | 'Associate' | 'Mid' | 'Senior' | 'Lead';

export type ModuleCategory =
  | 'Development Environment'
  | 'Git & Version Control'
  | 'Programming Standards'
  | 'Software Testing'
  | 'Database Fundamentals'
  | 'API Development'
  | 'Docker & Containers'
  | 'CI/CD'
  | 'Cloud Fundamentals'
  | 'Cybersecurity'
  | 'Agile & Scrum'
  | 'Code Review';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type AuthProviderType = 'google' | 'local';

export interface User {
  id: string;
  googleId?: string;
  name: string;
  email: string;
  profileImage?: string;
  avatar: string;
  authProvider: AuthProviderType;
  role: UserRole;
  title: string;
  developerRole?: string;
  team?: string;
  teamId: string;
  teamName: string;
  joinDate: string;
  createdAt?: string;
  lastLogin?: string;
  employeeId: string;
  manager: string;
  experienceLevel: ExperienceLevel;
  xp: number;
  level: number;
  levelTitle: string;
  badges: string[]; // Badge IDs
  overallProgress: number;
  status: OnboardingStatus;
  completedModulesCount: number;
  totalModulesCount: number;
  assessmentAverage: number;
  daysRemaining: number;
}

export interface Team {
  id: string;
  name: string;
  department: string;
  leadName: string;
  developerCount: number;
  averageProgress: number;
  averageAssessmentScore: number;
  completionRate: number;
  icon: string;
}

export interface TrainingModule {
  id: string;
  code: string;
  title: string;
  category: ModuleCategory;
  description: string;
  durationHours: number;
  durationLabel: string;
  difficulty: DifficultyLevel;
  mandatory: boolean;
  passingScore: number;
  weekNumber: number; // 1 to 4
  learningObjectives: string[];
  instructor: {
    name: string;
    role: string;
    avatar: string;
  };
  completionRate: number;
  learnersCount: number;
  iconName: string;
  order: number;
  archived?: boolean;
}

export interface PracticalTaskItem {
  id: string;
  title: string;
  description: string;
  codeSnippet?: string;
  isCompleted: boolean;
  hint?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonSection {
  id: string;
  title: string;
  type: 'intro' | 'objectives' | 'resource' | 'docs' | 'task' | 'quiz' | 'assessment';
  duration: string;
  content?: string;
  videoUrl?: string;
  videoTitle?: string;
  tasks?: PracticalTaskItem[];
  quizQuestions?: QuizQuestion[];
}

export interface ModuleCurriculum {
  moduleId: string;
  sections: LessonSection[];
}

export interface Enrollment {
  id: string;
  developerId: string;
  moduleId: string;
  status: 'completed' | 'in_progress' | 'pending' | 'overdue';
  progress: number; // 0 - 100
  score: number | null;
  dueDate: string;
  enrolledDate: string;
  completedDate?: string;
  completedSectionIds: string[];
  practicalTasksCompleted: string[];
  quizScore?: number;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
}

export interface Assessment {
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  description: string;
  questionCount: number;
  passingScore: number; // e.g. 70
  durationMinutes: number; // e.g. 20
  attemptsAllowed: number;
  averageScore: number;
  totalAttempts: number;
  status: 'active' | 'draft';
  questions: AssessmentQuestion[];
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  moduleId: string;
  developerId: string;
  developerName: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  timeTakenSeconds: number;
  submittedAt: string;
  feedback: string;
  userAnswers: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
  }[];
}

export interface NotificationItem {
  id: string;
  userId: string | 'all';
  title: string;
  message: string;
  type: 'training_completed' | 'deadline_approaching' | 'overdue' | 'assessment_passed' | 'system' | 'reminder';
  isRead: boolean;
  timestamp: string;
  linkTo?: string;
  targetId?: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  developerId: string;
  developerName: string;
  developerEmail: string;
  programName: string;
  issueDate: string;
  grade: string;
  verificationCode: string;
  managerSignature: string;
  skillsAcquired: string[];
}

export interface ActivityLog {
  id: string;
  type: 'complete_module' | 'pass_assessment' | 'start_module' | 'miss_deadline' | 'assign_training' | 'add_developer' | 'add_comment' | 'earn_badge';
  message: string;
  developerId?: string;
  developerName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ManagerComment {
  id: string;
  developerId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  comment: string;
  createdAt: string;
  tags?: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  isCompleted: boolean;
  categoryId: string;
  completedAt?: string;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  xpReward: number;
  category: string;
  unlockedAt?: string;
}

export interface DashboardKPIData {
  totalDevelopers: number;
  totalDevelopersChange: string;
  activeOnboarding: number;
  activeOnboardingChange: string;
  completedOnboarding: number;
  completedOnboardingChange: string;
  averageProgress: number;
  averageProgressChange: string;
  modulesCompleted: number;
  modulesCompletedChange: string;
  overdueTraining: number;
  overdueTrainingChange: string;
}
