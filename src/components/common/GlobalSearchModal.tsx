import React, { useState, useEffect, useRef } from 'react';
import { Search, User as UserIcon, BookOpen, CheckSquare, FileText, ArrowRight, X, Command } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, targetId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { users, modules, assessments } = useData();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open search
          const event = new CustomEvent('open-global-search');
          window.dispatchEvent(event);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const filteredDevelopers = users
    .filter((u) => u.role === 'DEVELOPER')
    .filter((u) => u.name.toLowerCase().includes(cleanQuery) || u.teamName.toLowerCase().includes(cleanQuery) || u.email.toLowerCase().includes(cleanQuery))
    .slice(0, 4);

  const filteredModules = modules
    .filter((m) => m.title.toLowerCase().includes(cleanQuery) || m.category.toLowerCase().includes(cleanQuery) || m.code.toLowerCase().includes(cleanQuery))
    .slice(0, 4);

  const filteredAssessments = assessments
    .filter((a) => a.title.toLowerCase().includes(cleanQuery) || a.moduleTitle.toLowerCase().includes(cleanQuery))
    .slice(0, 3);

  const totalResults = filteredDevelopers.length + filteredModules.length + filteredAssessments.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search developers, training modules, assessments, reports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-slate-800 placeholder-slate-400 text-base focus:outline-none focus:ring-0 font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {cleanQuery && totalResults === 0 && (
            <div className="text-center py-10">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No results found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by developer name, module code, or topic.</p>
            </div>
          )}

          {/* Quick Navigation suggestions if query is empty */}
          {!cleanQuery && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Quick Navigation</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Command className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Admin Dashboard</p>
                    <p className="text-[11px] text-slate-500">KPIs & Progress Overview</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onNavigate('developers');
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Developer Directory</p>
                    <p className="text-[11px] text-slate-500">Manage all onboarding engineers</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onNavigate('modules');
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Training Modules</p>
                    <p className="text-[11px] text-slate-500">12 Technical Curriculum Modules</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onNavigate('reports');
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Analytics & Reports</p>
                    <p className="text-[11px] text-slate-500">Export CSV / PDF summaries</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Developers Section */}
          {filteredDevelopers.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center justify-between">
                <span>Developers</span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-normal">{filteredDevelopers.length}</span>
              </p>
              <div className="space-y-1">
                {filteredDevelopers.map((dev) => (
                  <button
                    key={dev.id}
                    onClick={() => {
                      onNavigate('developers', dev.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={dev.avatar} alt={dev.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">{dev.name}</p>
                        <p className="text-xs text-slate-500">{dev.title} • {dev.teamName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800">
                        {dev.overallProgress}% Completed
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modules Section */}
          {filteredModules.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center justify-between">
                <span>Training Modules</span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-normal">{filteredModules.length}</span>
              </p>
              <div className="space-y-1">
                {filteredModules.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      onNavigate('modules', mod.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">{mod.title}</p>
                        <p className="text-xs text-slate-500">{mod.code} • {mod.category} • {mod.durationLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {mod.difficulty}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assessments Section */}
          {filteredAssessments.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center justify-between">
                <span>Assessments</span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-normal">{filteredAssessments.length}</span>
              </p>
              <div className="space-y-1">
                {filteredAssessments.map((asm) => (
                  <button
                    key={asm.id}
                    onClick={() => {
                      onNavigate('assessments', asm.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">{asm.title}</p>
                        <p className="text-xs text-slate-500">{asm.moduleTitle} • Passing: {asm.passingScore}%</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-slate-700">↵</kbd> to select</span>
            <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-slate-700">ESC</kbd> to exit</span>
          </div>
          <span className="font-medium text-slate-400">OnboardPro Omnibox</span>
        </div>
      </div>
    </div>
  );
};
