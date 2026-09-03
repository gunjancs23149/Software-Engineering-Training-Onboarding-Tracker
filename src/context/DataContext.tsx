import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User,
  Team,
  TrainingModule,
  Enrollment,
  Assessment,
  AssessmentAttempt,
  NotificationItem,
  Certificate,
  ActivityLog,
  ManagerComment,
  ChecklistCategory,
  Badge,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_TEAMS,
  INITIAL_MODULES,
  INITIAL_ENROLLMENTS,
  INITIAL_ASSESSMENTS,
  INITIAL_ATTEMPTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_CERTIFICATES,
  INITIAL_MANAGER_COMMENTS,
  INITIAL_CHECKLISTS,
  INITIAL_BADGES,
} from '../data/initialData';
import { calculateDeveloperMetrics, calculateLevelFromXP } from '../utils/calculations';
import { useToast } from './ToastContext';

interface DataContextType {
  users: User[];
  teams: Team[];
  modules: TrainingModule[];
  enrollments: Enrollment[];
  assessments: Assessment[];
  attempts: AssessmentAttempt[];
  notifications: NotificationItem[];
  activityLogs: ActivityLog[];
  certificates: Certificate[];
  managerComments: ManagerComment[];
  checklists: ChecklistCategory[];
  badges: Badge[];

  // Actions
  addDeveloper: (developerData: Omit<User, 'id' | 'overallProgress' | 'status' | 'completedModulesCount' | 'totalModulesCount' | 'assessmentAverage' | 'daysRemaining' | 'xp' | 'level' | 'levelTitle' | 'badges'>) => User;
  updateDeveloper: (id: string, updatedData: Partial<User>) => void;
  deleteDeveloper: (id: string) => void;
  assignModule: (developerId: string, moduleId: string, dueDate: string) => void;
  updateEnrollmentStatus: (enrollmentId: string, status: 'completed' | 'in_progress' | 'pending' | 'overdue', progress?: number) => void;
  completeSection: (developerId: string, moduleId: string, sectionId: string) => void;
  togglePracticalTask: (developerId: string, moduleId: string, taskId: string) => void;
  submitAssessment: (attempt: Omit<AssessmentAttempt, 'id' | 'submittedAt'>) => { attempt: AssessmentAttempt; passed: boolean; xpEarned: number };
  addManagerComment: (comment: Omit<ManagerComment, 'id' | 'createdAt'>) => void;
  toggleChecklistItem: (categoryId: string, itemId: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  sendDeveloperReminder: (developerId: string, moduleName?: string) => void;
  createModule: (moduleData: Omit<TrainingModule, 'id' | 'order' | 'completionRate' | 'learnersCount'>) => TrainingModule;
  updateModule: (id: string, moduleData: Partial<TrainingModule>) => void;
  archiveModule: (id: string) => void;
  resetToDemoData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'onboardpro_app_state_v1';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { success, info, warning } = useToast();

  // Load from localStorage or defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_teams`);
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [modules, setModules] = useState<TrainingModule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_modules`);
    return saved ? JSON.parse(saved) : INITIAL_MODULES;
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_enrollments`);
    return saved ? JSON.parse(saved) : INITIAL_ENROLLMENTS;
  });

  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_assessments`);
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENTS;
  });

  const [attempts, setAttempts] = useState<AssessmentAttempt[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attempts`);
    return saved ? JSON.parse(saved) : INITIAL_ATTEMPTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activityLogs`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_certificates`);
    return saved ? JSON.parse(saved) : INITIAL_CERTIFICATES;
  });

  const [managerComments, setManagerComments] = useState<ManagerComment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_comments`);
    return saved ? JSON.parse(saved) : INITIAL_MANAGER_COMMENTS;
  });

  const [checklists, setChecklists] = useState<ChecklistCategory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_checklists`);
    return saved ? JSON.parse(saved) : INITIAL_CHECKLISTS;
  });

  const [badges] = useState<Badge[]>(INITIAL_BADGES);

  // Sync state changes with calculations and localStorage
  const recalculateAndSaveUsers = useCallback(
    (currentUsers: User[], currentEnrollments: Enrollment[], currentModules: TrainingModule[]) => {
      const updated = currentUsers.map((dev) => {
        if (dev.role !== 'DEVELOPER') return dev;
        const metrics = calculateDeveloperMetrics(dev, currentEnrollments, currentModules);
        return {
          ...dev,
          overallProgress: metrics.overallProgress,
          status: metrics.status,
          completedModulesCount: metrics.completedCount,
          totalModulesCount: metrics.totalMandatoryCount,
          assessmentAverage: metrics.assessmentAverage || dev.assessmentAverage,
        };
      });

      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(updated));
      localStorage.setItem(`${STORAGE_KEY}_enrollments`, JSON.stringify(currentEnrollments));
      localStorage.setItem(`${STORAGE_KEY}_modules`, JSON.stringify(currentModules));
      return updated;
    },
    []
  );

  // Persist storage whenever lists change
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activityLogs`, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_certificates`, JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_comments`, JSON.stringify(managerComments));
  }, [managerComments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_checklists`, JSON.stringify(checklists));
  }, [checklists]);

  // Log activity helper
  const addLog = useCallback((type: ActivityLog['type'], message: string, developerId?: string, developerName?: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      message,
      developerId,
      developerName,
      timestamp: 'Just now',
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  }, []);

  // Add Notification helper
  const addNotification = useCallback((type: NotificationItem['type'], title: string, message: string, userId: string = 'all', linkTo?: string, targetId?: string) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      type,
      isRead: false,
      timestamp: 'Just now',
      linkTo,
      targetId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  // 1. Add Developer
  const addDeveloper = (devData: Omit<User, 'id' | 'overallProgress' | 'status' | 'completedModulesCount' | 'totalModulesCount' | 'assessmentAverage' | 'daysRemaining' | 'xp' | 'level' | 'levelTitle' | 'badges'>): User => {
    const id = devData.googleId ? `user-g-${devData.googleId.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}` : `user-${Date.now()}`;
    const avatarImg = devData.profileImage || devData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
    
    const newDev: User = {
      ...devData,
      id,
      avatar: avatarImg,
      profileImage: avatarImg,
      authProvider: devData.authProvider || 'local',
      developerRole: devData.developerRole || devData.title,
      team: devData.team || devData.teamName,
      createdAt: devData.createdAt || new Date().toISOString(),
      lastLogin: devData.lastLogin || new Date().toISOString(),
      overallProgress: 0,
      status: 'In Progress',
      completedModulesCount: 0,
      totalModulesCount: modules.filter((m) => m.mandatory).length,
      assessmentAverage: 0,
      daysRemaining: 30,
      xp: 150,
      level: 1,
      levelTitle: 'Junior Software Engineer – Level 1',
      badges: ['badge-git-master'],
    };

    // Auto enroll into first 4 mandatory modules
    const mandatoryMods = modules.filter((m) => m.mandatory).slice(0, 4);
    const newEnrollments: Enrollment[] = mandatoryMods.map((m, idx) => ({
      id: `enr-${id}-${m.id}`,
      developerId: id,
      moduleId: m.id,
      status: idx === 0 ? 'in_progress' : 'pending',
      progress: 0,
      score: null,
      dueDate: new Date(Date.now() + (idx + 1) * 7 * 86400000).toISOString().split('T')[0],
      enrolledDate: new Date().toISOString().split('T')[0],
      completedSectionIds: [],
      practicalTasksCompleted: [],
    }));

    setEnrollments((prev) => {
      const next = [...prev, ...newEnrollments];
      setUsers((prevUsers) => {
        const nextUsers = [...prevUsers, newDev];
        return recalculateAndSaveUsers(nextUsers, next, modules);
      });
      return next;
    });

    addLog('add_developer', `New developer ${newDev.name} onboarded to ${newDev.teamName}.`, id, newDev.name);
    addNotification('system', 'New Developer Onboarded', `${newDev.name} has joined ${newDev.teamName}. Initial onboarding modules assigned.`, 'all', '/developers', id);
    success('Developer Added Successfully', `${newDev.name} has been enrolled in the onboarding program.`);

    return newDev;
  };

  // 2. Update Developer
  const updateDeveloper = (id: string, updatedData: Partial<User>) => {
    setUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id === id) {
          const avatarImg = updatedData.profileImage || updatedData.avatar || u.profileImage || u.avatar;
          return {
            ...u,
            ...updatedData,
            avatar: avatarImg,
            profileImage: avatarImg,
          };
        }
        return u;
      });
      return recalculateAndSaveUsers(next, enrollments, modules);
    });
  };

  // 3. Delete Developer
  const deleteDeveloper = (id: string) => {
    const dev = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setEnrollments((prev) => prev.filter((e) => e.developerId !== id));
    if (dev) {
      addLog('add_developer', `Developer record for ${dev.name} removed.`);
      info('Developer Removed', `${dev.name} has been removed.`);
    }
  };

  // 4. Assign Module
  const assignModule = (developerId: string, moduleId: string, dueDate: string) => {
    const dev = users.find((u) => u.id === developerId);
    const mod = modules.find((m) => m.id === moduleId);
    if (!dev || !mod) return;

    const existingIndex = enrollments.findIndex((e) => e.developerId === developerId && e.moduleId === moduleId);

    if (existingIndex >= 0) {
      // Update due date
      setEnrollments((prev) => {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], dueDate };
        setUsers((prevUsers) => recalculateAndSaveUsers(prevUsers, next, modules));
        return next;
      });
      info('Module Updated', `${mod.title} due date updated to ${dueDate}.`);
    } else {
      const newEnr: Enrollment = {
        id: `enr-${developerId}-${moduleId}-${Date.now()}`,
        developerId,
        moduleId,
        status: 'pending',
        progress: 0,
        score: null,
        dueDate,
        enrolledDate: new Date().toISOString().split('T')[0],
        completedSectionIds: [],
        practicalTasksCompleted: [],
      };

      setEnrollments((prev) => {
        const next = [...prev, newEnr];
        setUsers((prevUsers) => recalculateAndSaveUsers(prevUsers, next, modules));
        return next;
      });

      addLog('assign_training', `Assigned "${mod.title}" to ${dev.name} (Due: ${dueDate}).`, dev.id, dev.name);
      addNotification('deadline_approaching', 'New Training Assigned', `You have been assigned "${mod.title}". Due on ${dueDate}.`, dev.id, `/modules/${mod.id}`, mod.id);
      success('Training Module Assigned', `Assigned "${mod.title}" to ${dev.name}.`);
    }
  };

  // 5. Update Enrollment Status & Progress
  const updateEnrollmentStatus = (enrollmentId: string, status: Enrollment['status'], progress?: number) => {
    setEnrollments((prev) => {
      const next = prev.map((e) => {
        if (e.id === enrollmentId) {
          const calcProg = progress !== undefined ? progress : status === 'completed' ? 100 : e.progress;
          return {
            ...e,
            status,
            progress: calcProg,
            completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : e.completedDate,
          };
        }
        return e;
      });

      setUsers((prevUsers) => recalculateAndSaveUsers(prevUsers, next, modules));
      return next;
    });
  };

  // 6. Complete Lesson Section
  const completeSection = (developerId: string, moduleId: string, sectionId: string) => {
    setEnrollments((prev) => {
      const next = prev.map((e) => {
        if (e.developerId === developerId && e.moduleId === moduleId) {
          const sectionIds = new Set(e.completedSectionIds || []);
          sectionIds.add(sectionId);
          const completedList = Array.from(sectionIds);
          // 7 sections total in standard curriculum
          const newProgress = Math.min(100, Math.round((completedList.length / 7) * 100));
          const isFinished = newProgress === 100;

          return {
            ...e,
            completedSectionIds: completedList,
            progress: newProgress,
            status: (isFinished ? 'completed' : 'in_progress') as Enrollment['status'],
            completedDate: isFinished ? new Date().toISOString().split('T')[0] : e.completedDate,
          };
        }
        return e;
      });

      setUsers((prevUsers) => recalculateAndSaveUsers(prevUsers, next, modules));
      return next;
    });
  };

  // 7. Toggle Practical Task
  const togglePracticalTask = (developerId: string, moduleId: string, taskId: string) => {
    setEnrollments((prev) => {
      const next = prev.map((e) => {
        if (e.developerId === developerId && e.moduleId === moduleId) {
          const tasks = new Set(e.practicalTasksCompleted || []);
          if (tasks.has(taskId)) {
            tasks.delete(taskId);
          } else {
            tasks.add(taskId);
          }
          return {
            ...e,
            practicalTasksCompleted: Array.from(tasks),
          };
        }
        return e;
      });
      return next;
    });
  };

  // 8. Submit Assessment
  const submitAssessment = (attemptData: Omit<AssessmentAttempt, 'id' | 'submittedAt'>) => {
    const id = `att-${Date.now()}`;
    const newAttempt: AssessmentAttempt = {
      ...attemptData,
      id,
      submittedAt: new Date().toLocaleString(),
    };

    setAttempts((prev) => [newAttempt, ...prev]);

    const xpEarned = newAttempt.passed ? Math.round((newAttempt.score / 100) * 200) : 50;

    // Update developer XP, level & enrollments
    setUsers((prevUsers) => {
      const updated = prevUsers.map((dev) => {
        if (dev.id === attemptData.developerId) {
          const newXP = dev.xp + xpEarned;
          const levelInfo = calculateLevelFromXP(newXP);

          // Add badge if passed
          const currentBadges = new Set(dev.badges || []);
          if (newAttempt.passed) {
            if (attemptData.moduleId === 'mod-git') currentBadges.add('badge-git-master');
            if (attemptData.moduleId === 'mod-testing') currentBadges.add('badge-testing-pro');
            if (attemptData.moduleId === 'mod-docker') currentBadges.add('badge-docker-pioneer');
            if (attemptData.moduleId === 'mod-security') currentBadges.add('badge-security-aware');
          }

          return {
            ...dev,
            xp: newXP,
            level: levelInfo.level,
            levelTitle: levelInfo.levelTitle,
            badges: Array.from(currentBadges),
          };
        }
        return dev;
      });

      return recalculateAndSaveUsers(updated, enrollments, modules);
    });

    // Update enrollment score and mark as completed if passed
    if (newAttempt.passed) {
      setEnrollments((prev) => {
        const next = prev.map((e) => {
          if (e.developerId === attemptData.developerId && e.moduleId === attemptData.moduleId) {
            return {
              ...e,
              status: 'completed' as const,
              progress: 100,
              score: attemptData.score,
              completedDate: new Date().toISOString().split('T')[0],
            };
          }
          return e;
        });
        return next;
      });

      addLog('pass_assessment', `${attemptData.developerName} passed "${attemptData.assessmentTitle}" with ${attemptData.score}%.`, attemptData.developerId, attemptData.developerName);
      addNotification('assessment_passed', 'Assessment Passed! 🎉', `Congratulations! You scored ${attemptData.score}% on ${attemptData.assessmentTitle}. +${xpEarned} XP earned!`, attemptData.developerId, '/assessments', newAttempt.assessmentId);
    } else {
      addNotification('system', 'Assessment Attempt', `You scored ${attemptData.score}% on ${attemptData.assessmentTitle}. Passing score is 70%. Review learning resources and retry.`, attemptData.developerId, '/assessments', newAttempt.assessmentId);
    }

    return { attempt: newAttempt, passed: newAttempt.passed, xpEarned };
  };

  // 9. Add Manager Comment
  const addManagerComment = (commentData: Omit<ManagerComment, 'id' | 'createdAt'>) => {
    const newComment: ManagerComment = {
      ...commentData,
      id: `cmt-${Date.now()}`,
      createdAt: new Date().toLocaleString(),
    };
    setManagerComments((prev) => [newComment, ...prev]);
    addLog('add_comment', `Feedback added for developer by ${commentData.authorName}.`, commentData.developerId);
    success('Comment Posted', 'Feedback added to developer onboarding timeline.');
  };

  // 10. Toggle Checklist Item
  const toggleChecklistItem = (categoryId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map((item) => {
              if (item.id === itemId) {
                const isNowCompleted = !item.isCompleted;
                return {
                  ...item,
                  isCompleted: isNowCompleted,
                  completedAt: isNowCompleted ? 'Just now' : undefined,
                };
              }
              return item;
            }),
          };
        }
        return cat;
      })
    );
  };

  // 11. Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    info('All Marked Read', 'All notifications marked as read.');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // 12. Send Developer Reminder
  const sendDeveloperReminder = (developerId: string, moduleName?: string) => {
    const dev = users.find((u) => u.id === developerId);
    if (!dev) return;

    addNotification(
      'reminder',
      'Training Reminder ⏰',
      moduleName
        ? `Reminder from manager: Please complete "${moduleName}" to stay on track with your onboarding plan.`
        : `Reminder: Please review and complete your pending mandatory onboarding modules.`,
      developerId,
      '/developer-dashboard'
    );
    success('Reminder Sent', `Notification alert sent to ${dev.name}.`);
  };

  // 13. Create & Manage Custom Modules
  const createModule = (modData: Omit<TrainingModule, 'id' | 'order' | 'completionRate' | 'learnersCount'>): TrainingModule => {
    const id = `mod-${Date.now()}`;
    const newMod: TrainingModule = {
      ...modData,
      id,
      order: modules.length + 1,
      completionRate: 0,
      learnersCount: 0,
    };
    setModules((prev) => {
      const next = [...prev, newMod];
      localStorage.setItem(`${STORAGE_KEY}_modules`, JSON.stringify(next));
      return next;
    });
    addLog('assign_training', `New training module "${newMod.title}" published.`);
    success('Module Created', `"${newMod.title}" has been added to the training catalog.`);
    return newMod;
  };

  const updateModule = (id: string, modData: Partial<TrainingModule>) => {
    setModules((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...modData } : m));
      localStorage.setItem(`${STORAGE_KEY}_modules`, JSON.stringify(next));
      return next;
    });
    success('Module Updated', 'Module details updated successfully.');
  };

  const archiveModule = (id: string) => {
    setModules((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, archived: true } : m));
      localStorage.setItem(`${STORAGE_KEY}_modules`, JSON.stringify(next));
      return next;
    });
    warning('Module Archived', 'Module has been archived from mandatory curriculum.');
  };

  // 14. Demo Data Reset & JSON Export/Import
  const resetToDemoData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setTeams(INITIAL_TEAMS);
    setModules(INITIAL_MODULES);
    setEnrollments(INITIAL_ENROLLMENTS);
    setAssessments(INITIAL_ASSESSMENTS);
    setAttempts(INITIAL_ATTEMPTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setCertificates(INITIAL_CERTIFICATES);
    setManagerComments(INITIAL_MANAGER_COMMENTS);
    setChecklists(INITIAL_CHECKLISTS);
    success('Database Reset', 'Sample demo data restored successfully.');
  };

  const exportDatabaseJSON = (): string => {
    const fullDump = {
      users,
      teams,
      modules,
      enrollments,
      assessments,
      attempts,
      notifications,
      activityLogs,
      certificates,
      managerComments,
      checklists,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(fullDump, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.users && parsed.modules && parsed.enrollments) {
        setUsers(parsed.users);
        setTeams(parsed.teams || INITIAL_TEAMS);
        setModules(parsed.modules);
        setEnrollments(parsed.enrollments);
        if (parsed.assessments) setAssessments(parsed.assessments);
        if (parsed.attempts) setAttempts(parsed.attempts);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
        if (parsed.certificates) setCertificates(parsed.certificates);
        if (parsed.managerComments) setManagerComments(parsed.managerComments);
        if (parsed.checklists) setChecklists(parsed.checklists);
        success('Database Imported', 'Application database state loaded successfully.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        users,
        teams,
        modules,
        enrollments,
        assessments,
        attempts,
        notifications,
        activityLogs,
        certificates,
        managerComments,
        checklists,
        badges,
        addDeveloper,
        updateDeveloper,
        deleteDeveloper,
        assignModule,
        updateEnrollmentStatus,
        completeSection,
        togglePracticalTask,
        submitAssessment,
        addManagerComment,
        toggleChecklistItem,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        sendDeveloperReminder,
        createModule,
        updateModule,
        archiveModule,
        resetToDemoData,
        exportDatabaseJSON,
        importDatabaseJSON,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
