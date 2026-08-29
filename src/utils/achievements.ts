import { Achievement, TypingResult, UserProfile } from '../types';

export const ALL_ACHIEVEMENTS: Omit<Achievement, 'isUnlocked' | 'progress' | 'unlockedAt'>[] = [
  {
    id: 'first_step',
    title: 'First Key Pressed',
    description: 'Complete your first typing test on TypeForge',
    iconName: 'Sparkles',
    category: 'volume',
    targetValue: 1,
  },
  {
    id: 'speed_50',
    title: 'Rapid Stride',
    description: 'Reach 50 WPM in any completed test',
    iconName: 'Zap',
    category: 'speed',
    targetValue: 50,
  },
  {
    id: 'speed_80',
    title: 'Speed Demon',
    description: 'Reach 80 WPM in any completed test',
    iconName: 'Flame',
    category: 'speed',
    targetValue: 80,
  },
  {
    id: 'speed_100',
    title: 'Century Club',
    description: 'Break the 100 WPM speed barrier',
    iconName: 'Trophy',
    category: 'speed',
    targetValue: 100,
  },
  {
    id: 'speed_120',
    title: 'Apex Typist',
    description: 'Reach 120 WPM with solid precision',
    iconName: 'Crown',
    category: 'speed',
    targetValue: 120,
  },
  {
    id: 'perfectionist',
    title: 'Flawless Flow',
    description: 'Finish a test with 100% accuracy (min 25 words)',
    iconName: 'Target',
    category: 'accuracy',
    targetValue: 100,
  },
  {
    id: 'streak_3',
    title: 'Getting Warm',
    description: 'Maintain a 3-day typing streak',
    iconName: 'Flame',
    category: 'streak',
    targetValue: 3,
  },
  {
    id: 'streak_7',
    title: 'Unstoppable Habit',
    description: 'Maintain a 7-day typing streak',
    iconName: 'CalendarCheck',
    category: 'streak',
    targetValue: 7,
  },
  {
    id: 'streak_30',
    title: 'Monthly Dedication',
    description: 'Maintain a 30-day typing streak',
    iconName: 'Award',
    category: 'streak',
    targetValue: 30,
  },
  {
    id: 'tests_25',
    title: 'Practice Routine',
    description: 'Complete 25 typing tests',
    iconName: 'Layers',
    category: 'volume',
    targetValue: 25,
  },
  {
    id: 'tests_100',
    title: 'Centurion',
    description: 'Complete 100 typing tests',
    iconName: 'ShieldCheck',
    category: 'volume',
    targetValue: 100,
  },
  {
    id: 'code_warrior',
    title: 'Syntax Master',
    description: 'Complete a typing test in Code mode',
    iconName: 'Code2',
    category: 'special',
    targetValue: 1,
  },
  {
    id: 'night_owl',
    title: 'Midnight Coder',
    description: 'Complete a typing test between 11 PM and 4 AM',
    iconName: 'Moon',
    category: 'special',
    targetValue: 1,
  }
];

export function evaluateAchievements(
  profile: Partial<UserProfile>,
  latestTest?: TypingResult,
  unlockedIds: string[] = []
): { newlyUnlocked: Achievement[]; allEvaluated: Achievement[] } {
  const currentUnlockedSet = new Set(unlockedIds || []);
  const newlyUnlocked: Achievement[] = [];
  const testHour = latestTest ? new Date(latestTest.completedAt).getHours() : new Date().getHours();

  const totalTests = (profile.totalTests || 0);
  const bestWpm = Math.max(profile.bestWpm || 0, latestTest?.wpm || 0);
  const currentStreak = Math.max(profile.currentStreak || 0, profile.longestStreak || 0);

  const allEvaluated: Achievement[] = ALL_ACHIEVEMENTS.map((item) => {
    let isUnlocked = currentUnlockedSet.has(item.id);
    let progress = 0;

    switch (item.id) {
      case 'first_step':
        progress = Math.min(100, (totalTests / 1) * 100);
        if (totalTests >= 1) isUnlocked = true;
        break;
      case 'speed_50':
        progress = Math.min(100, (bestWpm / 50) * 100);
        if (bestWpm >= 50) isUnlocked = true;
        break;
      case 'speed_80':
        progress = Math.min(100, (bestWpm / 80) * 100);
        if (bestWpm >= 80) isUnlocked = true;
        break;
      case 'speed_100':
        progress = Math.min(100, (bestWpm / 100) * 100);
        if (bestWpm >= 100) isUnlocked = true;
        break;
      case 'speed_120':
        progress = Math.min(100, (bestWpm / 120) * 100);
        if (bestWpm >= 120) isUnlocked = true;
        break;
      case 'perfectionist':
        if (latestTest && latestTest.accuracy === 100 && (latestTest.wordCount >= 20 || latestTest.duration >= 15)) {
          isUnlocked = true;
          progress = 100;
        } else {
          progress = isUnlocked ? 100 : 0;
        }
        break;
      case 'streak_3':
        progress = Math.min(100, (currentStreak / 3) * 100);
        if (currentStreak >= 3) isUnlocked = true;
        break;
      case 'streak_7':
        progress = Math.min(100, (currentStreak / 7) * 100);
        if (currentStreak >= 7) isUnlocked = true;
        break;
      case 'streak_30':
        progress = Math.min(100, (currentStreak / 30) * 100);
        if (currentStreak >= 30) isUnlocked = true;
        break;
      case 'tests_25':
        progress = Math.min(100, (totalTests / 25) * 100);
        if (totalTests >= 25) isUnlocked = true;
        break;
      case 'tests_100':
        progress = Math.min(100, (totalTests / 100) * 100);
        if (totalTests >= 100) isUnlocked = true;
        break;
      case 'code_warrior':
        if (latestTest && latestTest.mode === 'code') {
          isUnlocked = true;
          progress = 100;
        } else {
          progress = isUnlocked ? 100 : 0;
        }
        break;
      case 'night_owl':
        if (testHour >= 23 || testHour < 4) {
          isUnlocked = true;
          progress = 100;
        } else {
          progress = isUnlocked ? 100 : 0;
        }
        break;
    }

    const fullItem: Achievement = {
      ...item,
      isUnlocked,
      progress: Math.round(progress),
      unlockedAt: isUnlocked ? new Date().toISOString() : undefined,
    };

    if (isUnlocked && !currentUnlockedSet.has(item.id)) {
      newlyUnlocked.push(fullItem);
    }

    return fullItem;
  });

  return { newlyUnlocked, allEvaluated };
}
