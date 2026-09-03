import React from 'react';
import { Award, Sparkles, TrendingUp, ShieldCheck, Zap, Star } from 'lucide-react';
import { User, Badge } from '../../types';
import { calculateLevelFromXP } from '../../utils/calculations';

interface GamificationWidgetProps {
  user: User;
  allUsers: User[];
  badges: Badge[];
}

export const GamificationWidget: React.FC<GamificationWidgetProps> = ({
  user,
  allUsers,
  badges,
}) => {
  const levelData = calculateLevelFromXP(user.xp);

  // Leaderboard sorted by XP and progress
  const developers = allUsers
    .filter((u) => u.role === 'DEVELOPER')
    .sort((a, b) => b.xp - a.xp || b.overallProgress - a.overallProgress);

  const userBadges = badges.filter((b) => user.badges?.includes(b.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Level & XP Progress Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Engineering Level
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
              Level {levelData.level}
            </span>
          </div>

          <h3 className="text-xl font-bold font-display mt-2 text-white">
            {levelData.levelTitle}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Earn XP by finishing training modules and passing technical assessments.
          </p>
        </div>

        <div className="my-6">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-300">{user.xp} XP Earned</span>
            <span className="text-blue-400">{levelData.nextLevelXP} XP (Level {levelData.level + 1})</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-700"
              style={{ width: `${levelData.progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1.5 block">
            {levelData.nextLevelXP - user.xp} XP remaining to unlock next title
          </span>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Badges: <strong>{userBadges.length} unlocked</strong></span>
          <span className="text-emerald-400 font-semibold">Active Contributor</span>
        </div>
      </div>

      {/* 2. Earned Badges Showcase */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Technical Badges
              </h3>
              <p className="text-xs text-slate-500">Milestones verified through assessments</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
              {userBadges.length} Earned
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {userBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex items-start gap-2.5"
              >
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{badge.name}</h4>
                  <span className="text-[10px] font-semibold text-amber-700">+{badge.xpReward} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-500 font-medium">
            Pass upcoming assessments to unlock more badges
          </span>
        </div>
      </div>

      {/* 3. Engineering Leaderboard */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Cohort Leaderboard
              </h3>
              <p className="text-xs text-slate-500">Ranked by velocity and mastery</p>
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Top Engineers</span>
          </div>

          <div className="space-y-2.5 mt-4">
            {developers.slice(0, 4).map((dev, rank) => {
              const isCurrentUser = dev.id === user.id;
              return (
                <div
                  key={dev.id}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                    isCurrentUser
                      ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-400'
                      : 'bg-slate-50/60 border-slate-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        rank === 0
                          ? 'bg-amber-400 text-slate-900'
                          : rank === 1
                          ? 'bg-slate-300 text-slate-800'
                          : rank === 2
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rank + 1}
                    </span>
                    <img
                      src={dev.avatar}
                      alt={dev.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">
                        {dev.name} {isCurrentUser && <span className="text-blue-600">(You)</span>}
                      </p>
                      <p className="text-[10px] text-slate-400">{dev.teamName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-blue-600">{dev.xp} XP</span>
                    <span className="text-[10px] text-slate-400 block">{dev.overallProgress}% Done</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-center">
          <span className="text-[11px] font-semibold text-blue-600">
            Your Rank: #{developers.findIndex((d) => d.id === user.id) + 1} of {developers.length}
          </span>
        </div>
      </div>
    </div>
  );
};
