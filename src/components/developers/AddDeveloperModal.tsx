import React, { useState } from 'react';
import { X, UserPlus, Sparkles } from 'lucide-react';
import { User, ExperienceLevel } from '../../types';
import { useData } from '../../context/DataContext';

interface AddDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDev: User) => void;
}

export const AddDeveloperModal: React.FC<AddDeveloperModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { teams, addDeveloper } = useData();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    title: 'Software Engineer',
    teamId: teams[0]?.id || 'team-frontend',
    teamName: teams[0]?.name || 'Frontend Core',
    joinDate: new Date().toISOString().split('T')[0],
    manager: 'Alex Morgan',
    experienceLevel: 'Mid' as ExperienceLevel,
    avatar: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleTeamChange = (teamId: string) => {
    const selectedTeam = teams.find((t) => t.id === teamId);
    setFormData((prev) => ({
      ...prev,
      teamId,
      teamName: selectedTeam?.name || '',
      manager: selectedTeam?.leadName || 'Alex Morgan',
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid corporate email required';
    if (!formData.title.trim()) newErrors.title = 'Job Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const defaultAvatar = `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 90000000)}?w=150&auto=format&fit=crop&q=80`;
    const finalAvatar = formData.avatar.trim() || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;

    const newDev = addDeveloper({
      name: formData.name,
      email: formData.email,
      avatar: finalAvatar,
      profileImage: finalAvatar,
      authProvider: 'local',
      role: 'DEVELOPER',
      title: formData.title,
      developerRole: formData.title,
      team: formData.teamName,
      teamId: formData.teamId,
      teamName: formData.teamName,
      joinDate: formData.joinDate,
      employeeId: formData.employeeId,
      manager: formData.manager,
      experienceLevel: formData.experienceLevel,
    });

    onSuccess(newDev);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Add New Developer
            </h2>
            <p className="text-xs text-slate-500">
              Enroll engineer into mandatory onboarding program & default tracks
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Vikram Sharma"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Corporate Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@onboardpro.dev"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
              />
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Job Title & Role
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Frontend Engineer"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Engineering Squad / Team
              </label>
              <select
                value={formData.teamId}
                onChange={(e) => handleTeamChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Experience Level
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              >
                <option value="Junior">Junior (0-2 yrs)</option>
                <option value="Associate">Associate (2-3 yrs)</option>
                <option value="Mid">Mid (3-5 yrs)</option>
                <option value="Senior">Senior (5+ yrs)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-800">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                New developers are automatically enrolled into 4 mandatory foundational modules with a 30-day completion SLA.
              </span>
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
              Enroll Developer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
