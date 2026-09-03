import React from 'react';
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  Laptop,
  BookOpen,
  Users,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const OnboardingChecklist: React.FC = () => {
  const { checklists, toggleChecklistItem } = useData();

  // Calculate overall checklist percentage
  let totalItems = 0;
  let completedItems = 0;

  checklists.forEach((cat) => {
    cat.items.forEach((item) => {
      totalItems += 1;
      if (item.isCompleted) completedItems += 1;
    });
  });

  const overallPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Engineering Onboarding Roadmap
          </div>
          <h2 className="text-2xl font-bold font-display">
            Onboarding Checklist
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Track hardware configuration, development toolchains, squad pairing sessions, and mandatory technical milestones.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0 min-w-[170px]">
          <span className="text-[11px] font-bold text-blue-200 uppercase">Readiness Score</span>
          <p className="text-3xl font-extrabold text-white font-display mt-1">
            {overallPercent}%
          </p>
          <span className="text-xs text-blue-200 mt-0.5 block">
            {completedItems} of {totalItems} items completed
          </span>
        </div>
      </div>

      {/* Checklist Categories */}
      <div className="space-y-6">
        {checklists.map((category) => {
          const categoryCompleted = category.items.filter((i) => i.isCompleted).length;
          const categoryPercent = Math.round((categoryCompleted / category.items.length) * 100);

          return (
            <div
              key={category.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {category.title}
                  </h3>
                  <p className="text-xs text-slate-500">{category.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    {categoryCompleted} / {category.items.length} ({categoryPercent}%)
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(category.id, item.id)}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                      item.isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => {}} // Handled by parent container click
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 mt-1 cursor-pointer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs font-bold ${
                            item.isCompleted ? 'text-slate-900 line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {item.label}
                        </h4>
                        {item.completedAt && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                            {item.completedAt}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
