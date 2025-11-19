import React, { useState } from 'react';
import { Achievement, getAchievementStats } from '../../lib/achievements';
import { Modal, Button, Badge, ProgressBar, EmptyState } from '../ui';
import { getRarityColorClass } from '../../lib/uiUtils';

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

  const filterButtons = [
    { id: 'all', label: 'All', variant: 'secondary' as const },
    { id: 'unlocked', label: `Unlocked (${stats.unlocked})`, variant: 'success' as const },
    { id: 'locked', label: `Locked (${stats.total - stats.unlocked})`, variant: 'secondary' as const },
  ];

  const categoryButtons = [
    { id: 'all', label: 'All' },
    { id: 'gameplay', label: 'Gameplay' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'progression', label: 'Progression' },
    { id: 'special', label: 'Special' },
  ];

  return (
    <Modal isOpen={true} onClose={onClose} title="Achievements" size="large">
      <div className="space-y-6">
        {/* Progress Summary */}
        <div>
          <p className="text-sm text-gray-400 mb-3">
            {stats.unlocked} of {stats.total} unlocked ({stats.percentage}%)
          </p>
          <ProgressBar value={stats.percentage} max={100} variant="gradient" />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => (
              <Button
                key={btn.id}
                onClick={() => setFilter(btn.id as typeof filter)}
                variant={filter === btn.id ? 'primary' : btn.variant}
                size="sm"
              >
                {btn.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryButtons.map((btn) => (
              <Button
                key={btn.id}
                onClick={() => setCategoryFilter(btn.id)}
                variant={categoryFilter === btn.id ? 'secondary' : 'ghost'}
                size="sm"
              >
                {btn.label.charAt(0).toUpperCase() + btn.label.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Achievement List */}
        <div className="max-h-[500px] overflow-y-auto">
          {filteredAchievements.length === 0 ? (
            <EmptyState
              icon="🏆"
              title="No achievements found"
              description="No achievements match your current filters."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  getRarityBg={getRarityBg}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} variant="primary">
          Close
        </Button>
      </div>
    </Modal>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  getRarityBg: (rarity: string) => string;
}

const AchievementCard = React.memo(({ achievement, getRarityBg }: AchievementCardProps) => {
  return (
    <div
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
            <Badge color={getRarityColorClass(achievement.rarity)}>
              {achievement.rarity.toUpperCase()}
            </Badge>
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
  );
});

AchievementCard.displayName = 'AchievementCard';
