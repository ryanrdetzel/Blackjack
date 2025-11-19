import React, { useState } from 'react';
import { Achievement, getAchievementStats } from '../../lib/achievements';

interface AchievementsModalProps {
  achievements: Record<string, Achievement>;
  onClose: () => void;
}

export function AchievementsModal({ achievements, onClose }: AchievementsModalProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const stats = getAchievementStats(achievements);
  const allAchievements = Object.values(achievements);

  const filteredAchievements = allAchievements.filter((achievement) => {
    if (filter === 'unlocked' && !achievement.unlocked) return false;
    if (filter === 'locked' && achievement.unlocked) return false;
    if (categoryFilter !== 'all' && achievement.category !== categoryFilter) return false;
    return true;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 dark:text-gray-400';
      case 'uncommon': return 'text-green-600 dark:text-green-400';
      case 'rare': return 'text-blue-600 dark:text-blue-400';
      case 'epic': return 'text-purple-600 dark:text-purple-400';
      case 'legendary': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 dark:bg-gray-700';
      case 'uncommon': return 'bg-green-100 dark:bg-green-900/30';
      case 'rare': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'epic': return 'bg-purple-100 dark:bg-purple-900/30';
      case 'legendary': return 'bg-yellow-100 dark:bg-yellow-900/30';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Achievements
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.unlocked} of {stats.total} unlocked ({stats.percentage}%)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-3 py-1 text-sm rounded ${
                filter === 'unlocked'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Unlocked ({stats.unlocked})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-3 py-1 text-sm rounded ${
                filter === 'locked'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Locked ({stats.total - stats.unlocked})
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'gameplay', 'strategy', 'progression', 'special'].map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-3 py-1 text-sm rounded capitalize ${
                  categoryFilter === category
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`${getRarityBg(achievement.rarity)} rounded-lg p-4 border-2 ${
                  achievement.unlocked
                    ? 'border-green-400 dark:border-green-600'
                    : 'border-gray-300 dark:border-gray-600 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {achievement.name}
                      </h3>
                      {achievement.unlocked && (
                        <span className="text-green-500 text-xl">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-semibold uppercase ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {achievement.category}
                      </span>
                    </div>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No achievements found with the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
