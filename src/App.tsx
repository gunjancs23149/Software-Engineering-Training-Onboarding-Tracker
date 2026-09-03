import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { LoginPage } from './components/auth/LoginPage';
import { OnboardingPage } from './components/auth/OnboardingPage';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { DeveloperDashboard } from './components/developer-view/DeveloperDashboard';
import { DeveloperList } from './components/developers/DeveloperList';
import { DeveloperProfile } from './components/developers/DeveloperProfile';
import { AddDeveloperModal } from './components/developers/AddDeveloperModal';
import { AssignModuleModal } from './components/developers/AssignModuleModal';
import { ModuleGrid } from './components/modules/ModuleGrid';
import { ModuleDetail } from './components/modules/ModuleDetail';
import { ProgressTracker } from './components/progress/ProgressTracker';
import { AssessmentList } from './components/assessments/AssessmentList';
import { TakeAssessment } from './components/assessments/TakeAssessment';
import { AssessmentResult } from './components/assessments/AssessmentResult';
import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { OnboardingChecklist } from './components/developer-view/OnboardingChecklist';
import { SettingsPage } from './components/settings/SettingsPage';
import { CertificateModal } from './components/common/CertificateModal';
import { User, TrainingModule, Assessment, AssessmentAttempt, Certificate } from './types';
import { Code2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading, role, currentUser, pendingGoogleUser } = useAuth();
  const { assessments, certificates } = useData();
  const { tab: routerTab, targetId: routerTargetId, navigateToTab, navigate } = useRouter();
  const { warning } = useToast();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>(
    role === 'ADMIN' ? 'dashboard' : 'developer-dashboard'
  );
  const [activeDeveloperId, setActiveDeveloperId] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [takingAssessmentId, setTakingAssessmentId] = useState<string | null>(null);
  const [assessmentResultData, setAssessmentResultData] = useState<{
    assessment: Assessment;
    attempt: AssessmentAttempt;
    xpEarned: number;
  } | null>(null);

  // UI Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // Modals State
  const [isAddDevModalOpen, setIsAddDevModalOpen] = useState(false);
  const [assigningDeveloper, setAssigningDeveloper] = useState<User | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);

  // Synchronize router state with local tab and entity IDs
  useEffect(() => {
    if (!isAuthenticated) return;

    if (routerTab) {
      // Role Guard: Prevent developers from accessing admin-only tabs
      const adminOnlyTabs = ['dashboard', 'developers', 'reports'];
      if (role === 'DEVELOPER' && adminOnlyTabs.includes(routerTab)) {
        warning('Access Restricted', 'Admin privileges are required for that section. Redirected to Developer Portal.');
        setCurrentTab('developer-dashboard');
        navigateToTab('developer-dashboard');
        return;
      }

      setCurrentTab(routerTab);

      if (routerTab === 'developers' && routerTargetId) {
        setActiveDeveloperId(routerTargetId);
      } else if (routerTab === 'developers') {
        setActiveDeveloperId(null);
      }

      if (routerTab === 'modules' && routerTargetId) {
        setActiveModuleId(routerTargetId);
      } else if (routerTab === 'modules') {
        setActiveModuleId(null);
      }

      if (routerTab === 'assessments' && routerTargetId) {
        setTakingAssessmentId(routerTargetId);
      }
    }
  }, [routerTab, routerTargetId, role, isAuthenticated, navigateToTab, warning]);

  // Update default tab on role switch
  useEffect(() => {
    if (role === 'ADMIN') {
      setCurrentTab('dashboard');
    } else {
      setCurrentTab('developer-dashboard');
    }
  }, [role]);

  // Global search listener
  useEffect(() => {
    const handleOpenSearch = () => setIsGlobalSearchOpen(true);
    window.addEventListener('open-global-search', handleOpenSearch);
    return () => window.removeEventListener('open-global-search', handleOpenSearch);
  }, []);

  // 1. Loading Authentication State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-4 animate-pulse">
          <Code2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white font-display">OnboardPro</h2>
        <p className="text-xs text-slate-400 mt-1">Verifying secure session...</p>
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
          <div className="w-full h-full bg-blue-500 rounded-full animate-indeterminate" />
        </div>
      </div>
    );
  }

  // 2. First-time Google signup onboarding screen
  if (pendingGoogleUser) {
    return <OnboardingPage />;
  }

  // 3. Unauthenticated -> Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Navigation Handler
  const handleNavigate = (tab: string, targetId?: string) => {
    // Role Guard Check
    const adminOnlyTabs = ['dashboard', 'developers', 'reports'];
    if (role === 'DEVELOPER' && adminOnlyTabs.includes(tab)) {
      warning('Access Restricted', 'Admin privileges are required for that section.');
      return;
    }

    setCurrentTab(tab);
    setTakingAssessmentId(null);
    setAssessmentResultData(null);

    if (tab === 'developers' && targetId) {
      setActiveDeveloperId(targetId);
    } else if (tab === 'developers') {
      setActiveDeveloperId(null);
    }

    if (tab === 'modules' && targetId) {
      setActiveModuleId(targetId);
    } else if (tab === 'modules') {
      setActiveModuleId(null);
    }

    if (tab === 'assessments' && targetId) {
      setTakingAssessmentId(targetId);
    }

    navigateToTab(tab, targetId);
  };

  // Get Page Title & Subtitle for Navbar
  const getPageInfo = () => {
    if (currentTab === 'dashboard') {
      return { title: 'Executive Overview', subtitle: 'Technical onboarding and developer readiness KPIs' };
    }
    if (currentTab === 'developer-dashboard') {
      return { title: 'Developer Portal', subtitle: `Welcome back, ${currentUser?.name} 👋` };
    }
    if (currentTab === 'developers') {
      return {
        title: activeDeveloperId ? 'Developer Profile & Timeline' : 'Developer Directory',
        subtitle: 'Manage onboarding progress, timeline milestones, and feedback',
      };
    }
    if (currentTab === 'modules') {
      return {
        title: activeModuleId ? 'Curriculum & Learning Portal' : 'Training Modules Catalog',
        subtitle: 'Mandatory technical curriculum & hands-on practical masterclasses',
      };
    }
    if (currentTab === 'progress') {
      return { title: 'Progress Tracker', subtitle: 'Cohort matrix view and onboarding funnel analytics' };
    }
    if (currentTab === 'assessments') {
      if (takingAssessmentId) return { title: 'Timed Technical Assessment', subtitle: 'Timed test in progress' };
      if (assessmentResultData) return { title: 'Assessment Results', subtitle: 'Performance summary & rationales' };
      return { title: 'Technical Assessments', subtitle: 'Passing scores, timed evaluations, and certificates' };
    }
    if (currentTab === 'reports') {
      return { title: 'Reporting & Analytics', subtitle: 'Audit summaries, team comparisons, and CSV exports' };
    }
    if (currentTab === 'notifications') {
      return { title: 'Notification Center', subtitle: 'System alerts, completion updates, and SLA reminders' };
    }
    if (currentTab === 'checklist') {
      return { title: 'Onboarding Checklist', subtitle: 'Hardware setup, mandatory training, and squad integration' };
    }
    if (currentTab === 'settings') {
      return { title: 'Settings & Data Management', subtitle: 'System preferences, role permissions, and database backup' };
    }
    return { title: 'OnboardPro', subtitle: 'Software Engineering Training & Onboarding Tracker' };
  };

  const pageInfo = getPageInfo();
  const currentAssessment = assessments.find((a) => a.id === takingAssessmentId);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 1. Dark Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Top Navbar */}
        <Navbar
          pageTitle={pageInfo.title}
          pageSubtitle={pageInfo.subtitle}
          onOpenSearch={() => setIsGlobalSearchOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigate={(tab, id) => handleNavigate(tab, id)}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {/* Phase 4: Admin Dashboard */}
          {currentTab === 'dashboard' && role === 'ADMIN' && (
            <AdminDashboard
              onNavigate={(tab, id) => handleNavigate(tab, id)}
              onAddDeveloper={() => setIsAddDevModalOpen(true)}
            />
          )}

          {/* Phase 13: Developer Dashboard */}
          {currentTab === 'developer-dashboard' && (
            <DeveloperDashboard
              onNavigateToModule={(modId) => {
                setActiveModuleId(modId);
                handleNavigate('modules', modId);
              }}
              onNavigate={(tab, id) => handleNavigate(tab, id)}
            />
          )}

          {/* Phase 5 & 6: Developers List / Profile (Admin) */}
          {currentTab === 'developers' && role === 'ADMIN' && (
            <>
              {activeDeveloperId ? (
                <DeveloperProfile
                  developerId={activeDeveloperId}
                  onBack={() => {
                    setActiveDeveloperId(null);
                    handleNavigate('developers');
                  }}
                  onNavigateToModule={(modId) => {
                    setActiveModuleId(modId);
                    handleNavigate('modules', modId);
                  }}
                  onAssignModule={(dev) => setAssigningDeveloper(dev)}
                />
              ) : (
                <DeveloperList
                  onViewProfile={(devId) => {
                    setActiveDeveloperId(devId);
                    handleNavigate('developers', devId);
                  }}
                  onAddDeveloper={() => setIsAddDevModalOpen(true)}
                  onAssignTraining={(dev) => setAssigningDeveloper(dev)}
                />
              )}
            </>
          )}

          {/* Phase 7 & 8: Training Modules / Module Detail */}
          {currentTab === 'modules' && (
            <>
              {activeModuleId ? (
                <ModuleDetail
                  moduleId={activeModuleId}
                  onBack={() => {
                    setActiveModuleId(null);
                    handleNavigate('modules');
                  }}
                  onTakeAssessment={(asmId) => {
                    setTakingAssessmentId(asmId);
                    handleNavigate('assessments', asmId);
                  }}
                />
              ) : (
                <ModuleGrid
                  onViewModule={(modId) => {
                    setActiveModuleId(modId);
                    handleNavigate('modules', modId);
                  }}
                />
              )}
            </>
          )}

          {/* Phase 9: Progress Tracker */}
          {currentTab === 'progress' && (
            <ProgressTracker
              onViewDeveloper={(devId) => {
                if (role === 'ADMIN') {
                  setActiveDeveloperId(devId);
                  handleNavigate('developers', devId);
                }
              }}
              onViewModule={(modId) => {
                setActiveModuleId(modId);
                handleNavigate('modules', modId);
              }}
            />
          )}

          {/* Phase 10: Assessments */}
          {currentTab === 'assessments' && (
            <>
              {takingAssessmentId && currentAssessment ? (
                <TakeAssessment
                  assessment={currentAssessment}
                  onCancel={() => {
                    setTakingAssessmentId(null);
                    handleNavigate('assessments');
                  }}
                  onComplete={(attempt, passed, xpEarned) => {
                    setTakingAssessmentId(null);
                    setAssessmentResultData({
                      assessment: currentAssessment,
                      attempt,
                      xpEarned,
                    });
                  }}
                />
              ) : assessmentResultData ? (
                <AssessmentResult
                  assessment={assessmentResultData.assessment}
                  attempt={assessmentResultData.attempt}
                  xpEarned={assessmentResultData.xpEarned}
                  onRetake={() => {
                    setTakingAssessmentId(assessmentResultData.assessment.id);
                    setAssessmentResultData(null);
                  }}
                  onReturnDashboard={() => {
                    setAssessmentResultData(null);
                    handleNavigate(role === 'ADMIN' ? 'dashboard' : 'developer-dashboard');
                  }}
                  onViewCertificates={() => {
                    const cert = certificates.find((c) => c.developerId === currentUser?.id);
                    if (cert) setViewingCertificate(cert);
                  }}
                />
              ) : (
                <AssessmentList
                  onStartAssessment={(asmId) => {
                    setTakingAssessmentId(asmId);
                    handleNavigate('assessments', asmId);
                  }}
                  onViewAttempt={(attempt) => {
                    const asm = assessments.find((a) => a.id === attempt.assessmentId);
                    if (asm) {
                      setAssessmentResultData({
                        assessment: asm,
                        attempt,
                        xpEarned: 150,
                      });
                    }
                  }}
                />
              )}
            </>
          )}

          {/* Phase 11: Reports (Admin) */}
          {currentTab === 'reports' && role === 'ADMIN' && <ReportsDashboard />}

          {/* Phase 12: Notifications */}
          {currentTab === 'notifications' && (
            <NotificationCenter onNavigate={(tab, id) => handleNavigate(tab, id)} />
          )}

          {/* Phase 15: Onboarding Checklist */}
          {currentTab === 'checklist' && <OnboardingChecklist />}

          {/* Phase 19: Settings */}
          {currentTab === 'settings' && <SettingsPage />}
        </main>

        {/* Global Responsive Footer */}
        <footer className="mt-auto py-5 px-4 sm:px-8 border-t border-slate-200/80 bg-white/60 text-xs text-slate-500 text-center">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>© 2026 OnboardPro System</span>
            <span className="text-slate-300">·</span>
            <span>Software Engineering Training &amp; Readiness Platform</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-700 font-medium">Developed by Gunjan Hedaoo</span>
          </p>
        </footer>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onNavigate={(tab, id) => handleNavigate(tab, id)}
      />

      <AddDeveloperModal
        isOpen={isAddDevModalOpen}
        onClose={() => setIsAddDevModalOpen(false)}
        onSuccess={(newDev) => {
          setActiveDeveloperId(newDev.id);
          handleNavigate('developers', newDev.id);
        }}
      />

      {assigningDeveloper && (
        <AssignModuleModal
          developer={assigningDeveloper}
          isOpen={assigningDeveloper !== null}
          onClose={() => setAssigningDeveloper(null)}
        />
      )}

      <CertificateModal
        certificate={viewingCertificate}
        isOpen={viewingCertificate !== null}
        onClose={() => setViewingCertificate(null)}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DataProvider>
          <AuthProvider>
            <RouterProvider>
              <MainAppContent />
            </RouterProvider>
          </AuthProvider>
        </DataProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
