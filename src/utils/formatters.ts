import { OnboardingStatus } from '../types';

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatTimeSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadgeClasses(status: OnboardingStatus | 'completed' | 'in_progress' | 'pending' | 'overdue'): {
  badge: string;
  dot: string;
  border: string;
  bg: string;
  text: string;
} {
  const norm = String(status).toLowerCase().replace(/\s+/g, '_');
  
  if (norm === 'completed') {
    return {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
      dot: 'bg-emerald-500',
      border: 'border-emerald-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    };
  }
  
  if (norm === 'on_track') {
    return {
      badge: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20',
      dot: 'bg-blue-500',
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
    };
  }
  
  if (norm === 'in_progress') {
    return {
      badge: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-600/20',
      dot: 'bg-sky-500',
      border: 'border-sky-500',
      bg: 'bg-sky-50',
      text: 'text-sky-700',
    };
  }
  
  if (norm === 'at_risk' || norm === 'pending') {
    return {
      badge: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
      dot: 'bg-amber-500',
      border: 'border-amber-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    };
  }
  
  if (norm === 'overdue' || norm === 'failed') {
    return {
      badge: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
      dot: 'bg-rose-500',
      border: 'border-rose-500',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
    };
  }

  return {
    badge: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20',
    dot: 'bg-slate-400',
    border: 'border-slate-300',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
  };
}
