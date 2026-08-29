/**
 * TypeForge Daily Streak Calculator
 * 
 * Accurately calculates streaks based on the user's local calendar date (YYYY-MM-DD).
 * Handles:
 * - Multiple tests on the same day (no duplicate streak increment)
 * - Tests on the consecutive day (increments current streak by 1)
 * - Missed days (resets streak to 1 on completion)
 * - Longest streak preservation
 * - Timezone changes and midnight transitions
 */

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
  activeDaysCount: number;
  isNewStreakDay: boolean;
}

/**
 * Returns the current local calendar date formatted as YYYY-MM-DD
 */
export function getLocalTodayDateString(dateObj: Date = new Date()): string {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns difference in calendar days between two YYYY-MM-DD strings
 */
export function getDaysDifference(prevDateStr: string, currentDateStr: string): number {
  if (!prevDateStr || !currentDateStr) return 999;
  if (prevDateStr === currentDateStr) return 0;

  const [y1, m1, d1] = prevDateStr.split('-').map(Number);
  const [y2, m2, d2] = currentDateStr.split('-').map(Number);

  const dPrev = new Date(y1, m1 - 1, d1);
  const dCurr = new Date(y2, m2 - 1, d2);

  const diffTime = dCurr.getTime() - dPrev.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculates updated streak state after completing a test
 */
export function calculateUpdatedStreak(
  currentStreak: number = 0,
  longestStreak: number = 0,
  lastActivityDate: string = '',
  activeDaysCount: number = 0,
  currentTestDate: string = getLocalTodayDateString()
): StreakState {
  // First ever test
  if (!lastActivityDate || lastActivityDate.trim() === '') {
    const newStreak = 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastActivityDate: currentTestDate,
      activeDaysCount: Math.max(1, activeDaysCount + 1),
      isNewStreakDay: true,
    };
  }

  const daysDiff = getDaysDifference(lastActivityDate, currentTestDate);

  if (daysDiff === 0) {
    // Already completed a test today — streak remains unchanged
    return {
      currentStreak: Math.max(1, currentStreak),
      longestStreak: Math.max(longestStreak, currentStreak, 1),
      lastActivityDate: currentTestDate,
      activeDaysCount: Math.max(1, activeDaysCount),
      isNewStreakDay: false,
    };
  } else if (daysDiff === 1) {
    // Next consecutive day — increment streak
    const newStreak = currentStreak + 1;
    const newLongest = Math.max(longestStreak, newStreak);
    return {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: currentTestDate,
      activeDaysCount: activeDaysCount + 1,
      isNewStreakDay: true,
    };
  } else if (daysDiff > 1) {
    // Missed at least one day — reset streak to 1
    const newStreak = 1;
    return {
      currentStreak: newStreak,
      longestStreak: longestStreak,
      lastActivityDate: currentTestDate,
      activeDaysCount: activeDaysCount + 1,
      isNewStreakDay: true,
    };
  } else {
    // Edge case (e.g. timezone shift backward)
    return {
      currentStreak: Math.max(1, currentStreak),
      longestStreak: Math.max(longestStreak, currentStreak),
      lastActivityDate: currentTestDate,
      activeDaysCount: activeDaysCount,
      isNewStreakDay: false,
    };
  }
}
