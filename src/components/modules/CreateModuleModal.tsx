import React, { useState } from 'react';
import { X, BookPlus, Sparkles } from 'lucide-react';
import { TrainingModule, ModuleCategory, DifficultyLevel } from '../../types';
import { useData } from '../../context/DataContext';

interface CreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingModule?: TrainingModule | null;
}

export const CreateModuleModal: React.FC<CreateModuleModalProps> = ({
  isOpen,
  onClose,
  editingModule,
}) => {
  const { createModule, updateModule } = useData();

  const categories: ModuleCategory[] = [
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

  const [formData, setFormData] = useState({
    code: editingModule?.code || 'ENG-101',
    title: editingModule?.title || '',
    category: (editingModule?.category || 'Development Environment') as ModuleCategory,
    description: editingModule?.description || '',
    durationHours: editingModule?.durationHours || 3.0,
    difficulty: (editingModule?.difficulty || 'Intermediate') as DifficultyLevel,
    mandatory: editingModule?.mandatory ?? true,
    passingScore: editingModule?.passingScore || 75,
    weekNumber: editingModule?.weekNumber || 1,
    learningObjectives: editingModule?.learningObjectives?.join('\n') || '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const objectivesList = formData.learningObjectives
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingModule) {
      updateModule(editingModule.id, {
        ...formData,
        durationLabel: `${formData.durationHours} hours`,
        learningObjectives: objectivesList.length > 0 ? objectivesList : ['Master core concepts and tools'],
      });
    } else {
      createModule({
        code: formData.code,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        durationHours: Number(formData.durationHours),
        durationLabel: `${formData.durationHours} hours`,
        difficulty: formData.difficulty,
        mandatory: formData.mandatory,
        passingScore: Number(formData.passingScore),
        weekNumber: Number(formData.weekNumber),
        learningObjectives: objectivesList.length > 0 ? objectivesList : ['Complete practical exercises', 'Pass technical quiz'],
        instructor: {
          name: 'Alex Morgan',
          role: 'Director of Engineering',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        },
        iconName: 'BookOpen',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
            <BookPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              {editingModule ? 'Edit Training Module' : 'Publish New Training Module'}
            </h2>
            <p className="text-xs text-slate-500">
              Configure curriculum specifications, passing score, and learning outcomes
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Module Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. GIT-102"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Module Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Git & GitHub Fundamentals"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ModuleCategory })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & Overview
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of technical competencies and real-world relevance..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Duration (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="40"
                value={formData.durationHours}
                onChange={(e) => setFormData({ ...formData, durationHours: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Onboarding Week (1-4)
              </label>
              <select
                value={formData.weekNumber}
                onChange={(e) => setFormData({ ...formData, weekNumber: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              >
                <option value="1">Week 1 (Foundations)</option>
                <option value="2">Week 2 (Code & Tests)</option>
                <option value="3">Week 3 (APIs & Containers)</option>
                <option value="4">Week 4 (Cloud & Security)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Learning Objectives (1 per line)
            </label>
            <textarea
              rows={3}
              value={formData.learningObjectives}
              onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
              placeholder="e.g. Master interactive rebasing and squash commits&#10;Resolve multi-file merge conflicts&#10;Submit verified Pull Requests"
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="mandatoryToggle"
              checked={formData.mandatory}
              onChange={(e) => setFormData({ ...formData, mandatory: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            <label htmlFor="mandatoryToggle" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Mandatory Module (Required for 100% completion badge & certificate)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {editingModule ? 'Save Changes' : 'Publish Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
