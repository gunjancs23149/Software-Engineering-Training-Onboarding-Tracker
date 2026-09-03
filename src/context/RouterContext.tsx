import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface RouteState {
  pathname: string;
  tab: string;
  rolePrefix: 'admin' | 'developer' | 'auth' | 'public';
  targetId?: string;
  searchParams: Record<string, string>;
}

interface RouterContextType {
  currentPath: string;
  tab: string;
  targetId?: string;
  searchParams: Record<string, string>;
  navigate: (path: string, options?: { replace?: boolean; targetId?: string }) => void;
  navigateToTab: (tab: string, targetId?: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function parsePath(pathname: string, search: string): { tab: string; rolePrefix: 'admin' | 'developer' | 'auth' | 'public'; targetId?: string; searchParams: Record<string, string> } {
  const params = new URLSearchParams(search);
  const searchParams: Record<string, string> = {};
  params.forEach((val, key) => {
    searchParams[key] = val;
  });

  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  if (cleanPath === '/login') {
    return { tab: 'login', rolePrefix: 'auth', searchParams };
  }
  if (cleanPath === '/onboarding') {
    return { tab: 'onboarding', rolePrefix: 'auth', searchParams };
  }
  if (cleanPath === '/auth/google' || cleanPath === '/auth/google/callback') {
    return { tab: 'auth-callback', rolePrefix: 'auth', searchParams };
  }
  if (cleanPath === '/' || cleanPath === '/dashboard') {
    return { tab: 'dashboard', rolePrefix: 'public', searchParams };
  }

  // Admin routes: /admin/*
  if (cleanPath.startsWith('/admin')) {
    const sub = cleanPath.replace('/admin', '').replace(/^\//, '') || 'dashboard';
    const parts = sub.split('/');
    const tabName = parts[0] || 'dashboard';
    const targetId = parts[1] || searchParams.id;
    return { tab: tabName, rolePrefix: 'admin', targetId, searchParams };
  }

  // Developer routes: /developer/*
  if (cleanPath.startsWith('/developer')) {
    const sub = cleanPath.replace('/developer', '').replace(/^\//, '') || 'dashboard';
    const parts = sub.split('/');
    const tabName = parts[0] === 'dashboard' ? 'developer-dashboard' : parts[0] || 'developer-dashboard';
    const targetId = parts[1] || searchParams.id;
    return { tab: tabName, rolePrefix: 'developer', targetId, searchParams };
  }

  // Default fallback
  const directTab = cleanPath.replace(/^\//, '');
  return { tab: directTab || 'dashboard', rolePrefix: 'public', searchParams };
}

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<RouteState>(() => {
    const parsed = parsePath(window.location.pathname, window.location.search);
    return {
      pathname: window.location.pathname,
      ...parsed,
    };
  });

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parsePath(window.location.pathname, window.location.search);
      setRoute({
        pathname: window.location.pathname,
        ...parsed,
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string, options?: { replace?: boolean; targetId?: string }) => {
    const url = new URL(path, window.location.origin);
    if (options?.replace) {
      window.history.replaceState({}, '', url.pathname + url.search);
    } else {
      window.history.pushState({}, '', url.pathname + url.search);
    }

    const parsed = parsePath(url.pathname, url.search);
    setRoute({
      pathname: url.pathname,
      ...parsed,
      targetId: options?.targetId || parsed.targetId,
    });
  }, []);

  const navigateToTab = useCallback((tab: string, targetId?: string) => {
    let targetPath = '/dashboard';
    if (tab === 'login') targetPath = '/login';
    else if (tab === 'onboarding') targetPath = '/onboarding';
    else if (tab === 'dashboard') targetPath = '/admin/dashboard';
    else if (tab === 'developer-dashboard') targetPath = '/developer/dashboard';
    else if (tab === 'developers') targetPath = targetId ? `/admin/developers/${targetId}` : '/admin/developers';
    else if (tab === 'modules') targetPath = targetId ? `/developer/modules/${targetId}` : '/developer/modules';
    else if (tab === 'progress') targetPath = '/developer/progress';
    else if (tab === 'assessments') targetPath = targetId ? `/developer/assessments/${targetId}` : '/developer/assessments';
    else if (tab === 'reports') targetPath = '/admin/reports';
    else if (tab === 'notifications') targetPath = '/developer/notifications';
    else if (tab === 'checklist') targetPath = '/developer/checklist';
    else if (tab === 'settings') targetPath = '/developer/settings';
    else targetPath = `/${tab}`;

    navigate(targetPath, { targetId });
  }, [navigate]);

  return (
    <RouterContext.Provider
      value={{
        currentPath: route.pathname,
        tab: route.tab,
        targetId: route.targetId,
        searchParams: route.searchParams,
        navigate,
        navigateToTab,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
