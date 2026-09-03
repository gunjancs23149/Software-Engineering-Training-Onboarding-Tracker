import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole, ExperienceLevel, AuthProviderType } from '../types';
import { useData } from './DataContext';
import { useToast } from './ToastContext';

interface GoogleAuthProfile {
  googleId: string;
  email: string;
  name: string;
  profileImage: string;
}

interface CompleteOnboardingData {
  employeeId: string;
  teamId: string;
  teamName: string;
  developerRole: string;
  experienceLevel: ExperienceLevel;
}

interface LoginResult {
  success: boolean;
  user: User;
  isNew: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  authProvider: AuthProviderType | null;
  pendingGoogleUser: Partial<User> | null;
  login: (email: string, password?: string, forceRole?: UserRole) => LoginResult;
  loginWithGoogle: (googleProfile: GoogleAuthProfile) => { isNewUser: boolean; user?: User };
  completeGoogleOnboarding: (data: CompleteOnboardingData) => User;
  setPendingGoogleUser: (user: Partial<User> | null) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (updatedFields: Partial<User>) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'onboardpro_current_user_id';
const AUTH_STORAGE_USER_KEY = 'onboardpro_current_user_data';
const PENDING_GOOGLE_USER_KEY = 'onboardpro_pending_google_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { users, addDeveloper, updateDeveloper } = useData();
  const { success, error, warning, info } = useToast();

  const [isLoading, setIsLoading] = useState(true);

  // Synchronously initialize currentUser from stored JSON so state is immediately available
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUserData = localStorage.getItem(AUTH_STORAGE_USER_KEY);
      if (savedUserData) {
        return JSON.parse(savedUserData);
      }
    } catch {
      // Ignore parse error
    }
    return null;
  });

  const [pendingGoogleUser, setPendingGoogleUserState] = useState<Partial<User> | null>(() => {
    try {
      const saved = localStorage.getItem(PENDING_GOOGLE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setPendingGoogleUser = useCallback((user: Partial<User> | null) => {
    setPendingGoogleUserState(user);
    if (user) {
      localStorage.setItem(PENDING_GOOGLE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(PENDING_GOOGLE_USER_KEY);
    }
  }, []);

  // Synchronous session helper
  const persistSession = useCallback((user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, user.id);
      localStorage.setItem(AUTH_STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_USER_KEY);
    }
  }, []);

  // Initialize session once on mount (NEVER depend on [users] to prevent race-condition reset)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Check for URL parameters from server OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const authError = urlParams.get('auth_error');
        const authNotice = urlParams.get('auth_notice');
        const googleSuccess = urlParams.get('google_auth_success');
        const userParam = urlParams.get('user');

        if (authError) {
          error('Authentication Failed', decodeURIComponent(authError));
          window.history.replaceState({}, '', window.location.pathname);
        } else if (authNotice === 'no_oauth_credentials') {
          info('Google OAuth Setup Notice', 'Google Client ID not configured in .env. Interactive account selector available.');
          window.history.replaceState({}, '', window.location.pathname);
        } else if (googleSuccess && userParam) {
          try {
            const parsed = JSON.parse(decodeURIComponent(userParam));
            window.history.replaceState({}, '', window.location.pathname);

            // Process Google Login from server callback
            handleGoogleLoginCallback({
              googleId: parsed.googleId || `google-${Date.now()}`,
              email: parsed.email,
              name: parsed.name,
              profileImage: parsed.profileImage || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
            });
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('Failed to parse Google OAuth user param', e);
          }
        }

        // 2. Check if we already have a validated currentUser from localStorage initializer
        const savedUserData = localStorage.getItem(AUTH_STORAGE_USER_KEY);
        if (savedUserData) {
          try {
            const parsedUser = JSON.parse(savedUserData);
            if (parsedUser && parsedUser.id) {
              setCurrentUser(parsedUser);
              setIsLoading(false);
              return;
            }
          } catch {}
        }

        // 3. Check /api/auth/me backend endpoint
        try {
          const meRes = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
          }).then((r) => (r.ok ? r.json() : null));

          if (meRes && meRes.authenticated && meRes.user) {
            const foundInState = users.find(
              (u) => u.email.toLowerCase().trim() === meRes.user.email.toLowerCase().trim()
            );

            const serverUser: User = foundInState || {
              id: meRes.user.id || `user-${Date.now()}`,
              name: meRes.user.name || 'Developer User',
              email: meRes.user.email,
              role: meRes.user.role || 'DEVELOPER',
              title: meRes.user.role === 'ADMIN' ? 'Training Director' : 'Software Engineer',
              developerRole: meRes.user.role === 'ADMIN' ? 'Training Director' : 'Software Engineer',
              team: 'Frontend Core Squad',
              teamId: 'team-frontend',
              teamName: 'Frontend Core Squad',
              employeeId: 'EMP-1001',
              manager: 'Alex Morgan',
              authProvider: meRes.user.authProvider || 'google',
              avatar: meRes.user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              profileImage: meRes.user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              experienceLevel: 'Associate',
              joinDate: new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              xp: 150,
              level: 1,
              levelTitle: 'Associate Engineer',
              badges: [],
              overallProgress: 0,
              status: 'In Progress',
              completedModulesCount: 0,
              totalModulesCount: 3,
              assessmentAverage: 0,
              daysRemaining: 30,
            };
            persistSession(serverUser);
            setIsLoading(false);
            return;
          }
        } catch {
          // Ignore network errors for local offline mode
        }

        // 4. Check saved user ID
        const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
        if (savedId) {
          const found = users.find((u) => u.id === savedId);
          if (found) {
            persistSession(found);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []); // Run ONLY once on mount

  // Internal helper to process Google user data
  const handleGoogleLoginCallback = (profile: GoogleAuthProfile): { isNewUser: boolean; user?: User } => {
    const normalizedEmail = profile.email.toLowerCase().trim();

    // Look for existing user by email or googleId
    const existingUser = users.find(
      (u) =>
        u.email.toLowerCase().trim() === normalizedEmail ||
        (u.googleId && u.googleId === profile.googleId)
    );

    if (existingUser) {
      // Update lastLogin, googleId and profile image if needed
      const updatedFields: Partial<User> = {
        lastLogin: new Date().toISOString(),
        googleId: profile.googleId || existingUser.googleId,
        profileImage: profile.profileImage || existingUser.profileImage,
        avatar: profile.profileImage || existingUser.avatar,
        authProvider: 'google',
      };
      updateDeveloper(existingUser.id, updatedFields);
      const fullUser = { ...existingUser, ...updatedFields };
      persistSession(fullUser);
      setPendingGoogleUser(null);
      success('Welcome Back!', `Signed in as ${fullUser.name} via Google.`);
      return { isNewUser: false, user: fullUser };
    }

    // New User -> Prepare pending Google profile for onboarding screen
    const newPending: Partial<User> = {
      googleId: profile.googleId,
      name: profile.name,
      email: profile.email,
      profileImage: profile.profileImage,
      avatar: profile.profileImage,
      authProvider: 'google',
      role: 'DEVELOPER', // Always DEVELOPER by default for security
      employeeId: `EMP-${Math.floor(1050 + Math.random() * 900)}`,
    };

    setPendingGoogleUser(newPending);
    return { isNewUser: true, user: undefined };
  };

  const loginWithGoogle = (googleProfile: GoogleAuthProfile): { isNewUser: boolean; user?: User } => {
    return handleGoogleLoginCallback(googleProfile);
  };

  const completeGoogleOnboarding = (formData: CompleteOnboardingData): User => {
    if (!pendingGoogleUser || !pendingGoogleUser.email) {
      throw new Error('No pending Google profile found to complete onboarding.');
    }

    const defaultAvatar =
      pendingGoogleUser.profileImage ||
      pendingGoogleUser.avatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const newUserData = {
      name: pendingGoogleUser.name || 'New Developer',
      email: pendingGoogleUser.email,
      googleId: pendingGoogleUser.googleId,
      avatar: defaultAvatar,
      profileImage: defaultAvatar,
      authProvider: 'google' as AuthProviderType,
      role: 'DEVELOPER' as UserRole,
      title: formData.developerRole || 'Software Engineer',
      developerRole: formData.developerRole || 'Software Engineer',
      team: formData.teamName,
      teamId: formData.teamId,
      teamName: formData.teamName,
      employeeId: formData.employeeId || `EMP-${Math.floor(1050 + Math.random() * 900)}`,
      manager: 'Alex Morgan',
      experienceLevel: formData.experienceLevel || 'Associate',
      joinDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const created = addDeveloper(newUserData);
    persistSession(created);
    setPendingGoogleUser(null);
    return created;
  };

  const login = (email: string, _password?: string, forceRole?: UserRole): LoginResult => {
    const normalizedEmail = email.toLowerCase().trim();
    let found = users.find((u) => u.email.toLowerCase().trim() === normalizedEmail);

    if (!found && forceRole) {
      found = users.find((u) => u.role === forceRole);
    }

    if (found) {
      updateDeveloper(found.id, { lastLogin: new Date().toISOString() });
      const fullUser = { ...found, lastLogin: new Date().toISOString() };
      persistSession(fullUser);
      return { success: true, user: fullUser, isNew: false };
    }

    // Check if email indicates admin role
    const isAdmin =
      normalizedEmail.startsWith('admin@') ||
      normalizedEmail.includes('alex.morgan') ||
      normalizedEmail.includes('manager@');

    // Auto-create new account for this email
    const nameParts = normalizedEmail
      .split('@')[0]
      .split(/[._-]/)
      .filter(Boolean);
    const formattedName =
      nameParts.length > 0
        ? nameParts.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
        : 'Developer User';

    const newUserData = {
      name: formattedName,
      email: normalizedEmail,
      role: (isAdmin ? 'ADMIN' : 'DEVELOPER') as UserRole,
      title: isAdmin ? 'Training Director' : 'Software Engineer',
      developerRole: isAdmin ? 'Training Director' : 'Software Engineer',
      team: isAdmin ? 'Engineering Leadership' : 'Frontend Core Squad',
      teamId: isAdmin ? 'team-platform' : 'team-frontend',
      teamName: isAdmin ? 'Engineering Leadership' : 'Frontend Core Squad',
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      manager: 'Alex Morgan',
      authProvider: 'local' as AuthProviderType,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      experienceLevel: 'Associate' as ExperienceLevel,
      joinDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const created = addDeveloper(newUserData);
    persistSession(created);
    return { success: true, user: created, isNew: true };
  };

  const logout = () => {
    try {
      fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch {}
    persistSession(null);
    setPendingGoogleUser(null);
    info('Signed Out', 'You have been safely logged out of OnboardPro.');
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'ADMIN') {
      const admin = users.find((u) => u.role === 'ADMIN') || users[0];
      persistSession(admin);
    } else {
      const dev =
        users.find((u) => u.id === 'user-aarav') ||
        users.find((u) => u.role === 'DEVELOPER') ||
        users[0];
      if (dev) persistSession(dev);
    }
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      persistSession(target);
    }
  };

  const updateCurrentUserProfile = (updatedFields: Partial<User>) => {
    if (!currentUser) return;
    updateDeveloper(currentUser.id, updatedFields);
    const updated = { ...currentUser, ...updatedFields };
    persistSession(updated);
  };

  const refreshUser = () => {
    if (currentUser) {
      const fresh = users.find((u) => u.id === currentUser.id);
      if (fresh) {
        persistSession(fresh);
      }
    }
  };

  const isAuthenticated = currentUser !== null;
  const role: UserRole = currentUser?.role || 'DEVELOPER';
  const authProvider: AuthProviderType | null = currentUser?.authProvider || (currentUser ? 'local' : null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated,
        isLoading,
        authProvider,
        pendingGoogleUser,
        login,
        loginWithGoogle,
        completeGoogleOnboarding,
        setPendingGoogleUser,
        logout,
        switchRole,
        switchUser,
        updateCurrentUserProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
