import React, { useState } from 'react';
import { Search, Filter, BookPlus, Sparkles, CheckCircle2 } from 'lucide-react';
import { TrainingModule, ModuleCategory } from '../../types';
import { ModuleCard } from './ModuleCard';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CreateModuleModal } from './CreateModuleModal';
import { AssignModuleModal } from '../developers/AssignModuleModal';

interface ModuleGridProps {
  onViewModule: (moduleId: string) => void;
}

export const ModuleGrid: React.FC<ModuleGridProps> = ({ onViewModule }) => {
  const { modules, archiveModule, users } = useData();
  const { role } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [mandatoryFilter, setMandatoryFilter] = useState<string>('ALL');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
  const [assigningModule, setAssigningModule] = useState<TrainingModule | null>(null);

  const categories: string[] = [
    'ALL',
    'Development Environment',
    'Git & Version Control',
    'Programming Standards',
    'Software Testing',
    'Database Fundamentals',
    'API Development',
    'Docker & Containers',
    'CI/CD',
    'Cloud Fundamentals',
    'Cybersecurity',
    'Agile & Scrum',
    'Code Review',
  ];

  const activeModules = modules.filter((m) => !m.archived);

  const filteredModules = activeModules.filter((mod) => {
    const matchSearch =
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCat = selectedCategory === 'ALL' || mod.category === selectedCategory;
    const matchDiff = difficultyFilter === 'ALL' || mod.difficulty === difficultyFilter;
    const matchMandatory =
      mandatoryFilter === 'ALL' ||
      (mandatoryFilter === 'MANDATORY' && mod.mandatory) ||
      (mandatoryFilter === 'OPTIONAL' && !mod.mandatory);

    return matchSearch && matchCat && matchDiff && matchMandatory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
              Training Modules
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              {activeModules.length} Modules Catalog
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mandatory core engineering curriculum & self-paced technical masterclasses.
          </p>
        </div>

        {role === 'ADMIN' && (
          <button
            onClick={() => {
              setEditingModule(null);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/25 cursor-pointer"
          >
            <BookPlus className="w-4 h-4" />
            Publish Module
          </button>
        )}
      </div>

      {/* 12 Categories Filter Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => {
          const count = cat === 'ALL' ? activeModules.length : activeModules.filter((m) => m.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span>{cat === 'ALL' ? 'All 12 Categories' : cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Search & Difficulty Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search module title, code, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <select
          value={mandatoryFilter}
          onChange={(e) => setMandatoryFilter(e.target.value)}
          className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Types</option>
          <option value="MANDATORY">Mandatory Only</option>
          <option value="OPTIONAL">Optional Tracks</option>
        </select>
      </div>

      {/* Grid of Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-sm font-bold text-slate-700">No training modules match this filter</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the category or search keywords.</p>
          </div>
        ) : (
          filteredModules.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              onView={onViewModule}
              onEdit={(m) => {
                setEditingModule(m);
                setIsCreateModalOpen(true);
              }}
              onAssign={(m) => setAssigningModule(m)}
              onArchive={(id) => archiveModule(id)}
              isAdmin={role === 'ADMIN'}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <CreateModuleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        editingModule={editingModule}
      />

      {assigningModule && (
        <AssignModuleModal
          developer={users.find((u) => u.role === 'DEVELOPER') || null}
          isOpen={assigningModule !== null}
          onClose={() => setAssigningModule(null)}
        />
      )}
    </div>
  );
};
