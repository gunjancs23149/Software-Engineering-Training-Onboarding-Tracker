import React, { useState } from 'react';
import { X, BookOpen, Calendar, CheckCircle2 } from 'lucide-react';
import { TrainingModule, User } from '../../types';
import { useData } from '../../context/DataContext';

interface AssignModuleModalProps {
  developer: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AssignModuleModal: React.FC<AssignModuleModalProps> = ({ developer, isOpen, onClose }) => {
  const { modules, assignModule } = useData();

  const [selectedModuleId, setSelectedModuleId] = useState(modules[0]?.id || '');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );

  if (!isOpen || !developer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId) return;

    assignModule(developer.id, selectedModuleId, dueDate);
    onClose();
  };

  const selectedModule = modules.find((m) => m.id === selectedModuleId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Assign Training Module
            </h2>
            <p className="text-xs text-slate-500">
              Assign new technical curriculum to <strong className="text-slate-800">{developer.name}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Training Module
            </label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
            >
              {modules.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  [{mod.code}] {mod.title} ({mod.category})
                </option>
              ))}
            </select>
          </div>

          {selectedModule && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{selectedModule.title}</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {selectedModule.difficulty}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">{selectedModule.description}</p>
              <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600 font-semibold">
                <span>⏱ Duration: {selectedModule.durationLabel}</span>
                <span>🎯 Passing Score: {selectedModule.passingScore}%</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Due Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              Confirm Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
