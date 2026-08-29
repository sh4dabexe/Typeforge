import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  TypingResult,
  UserProfile,
  DailyActivityStat,
  LeaderboardEntry,
  TestMode,
} from '../types';
import { DEFAULT_PREFERENCES } from '../utils/storage';
import { calculateUpdatedStreak, getLocalTodayDateString } from '../utils/streak';
import { evaluateAchievements } from '../utils/achievements';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db || !db.type) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching user profile from Firestore:', err);
    return null;
  }
}

export async function createOrUpdateUserProfile(
  uid: string,
  data: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  }
): Promise<UserProfile> {
  const existing = await getUserProfile(uid);
  const nowIso = new Date().toISOString();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const todayStr = getLocalTodayDateString();

  if (existing) {
    const updated: Partial<UserProfile> = {
      displayName: data.displayName || existing.displayName || 'Typist',
      photoURL: data.photoURL || existing.photoURL || '',
      lastActiveAt: nowIso,
      timezone: timezone,
    };
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updated);
      return { ...existing, ...updated };
    } catch (err) {
      console.warn('Could not update profile fields:', err);
      return existing;
    }
  }

  // Create initial profile
  const newProfile: UserProfile = {
    uid,
    displayName: data.displayName || 'Typist',
    email: data.email || '',
    photoURL: data.photoURL || '',
    createdAt: nowIso,
    lastActiveAt: nowIso,
    timezone: timezone,
    currentStreak: 0,
    longestStreak: 0,
    totalTests: 0,
    totalTypingTime: 0,
    averageWpm: 0,
    averageAccuracy: 0,
    bestWpm: 0,
    bestRawWpm: 0,
    activeDaysCount: 0,
    lastActivityDate: '',
    preferences: DEFAULT_PREFERENCES,
    achievements: [],
  };

  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, newProfile);
  } catch (err) {
    console.warn('Error creating user profile in Firestore:', err);
  }

  return newProfile;
}

export async function saveTestResultToFirestore(
  uid: string,
  result: TypingResult,
  currentProfile: UserProfile
): Promise<{ updatedProfile: UserProfile; isNewStreakDay: boolean }> {
  const nowIso = new Date().toISOString();
  const todayStr = result.activityDate || getLocalTodayDateString();

  // 1. Calculate updated streak
  const streakCalc = calculateUpdatedStreak(
    currentProfile.currentStreak,
    currentProfile.longestStreak,
    currentProfile.lastActivityDate,
    currentProfile.activeDaysCount,
    todayStr
  );

  // 2. Aggregate statistics
  const prevTotalTests = currentProfile.totalTests || 0;
  const newTotalTests = prevTotalTests + 1;
  const newTotalTypingTime = (currentProfile.totalTypingTime || 0) + Math.round(result.duration);

  // Incremental averages
  const prevAvgWpm = currentProfile.averageWpm || 0;
  const newAvgWpm = Math.round((prevAvgWpm * prevTotalTests + result.wpm) / newTotalTests);

  const prevAvgAcc = currentProfile.averageAccuracy || 0;
  const newAvgAcc = parseFloat(
    ((prevAvgAcc * prevTotalTests + result.accuracy) / newTotalTests).toFixed(1)
  );

  const newBestWpm = Math.max(currentProfile.bestWpm || 0, result.wpm);
  const newBestRawWpm = Math.max(currentProfile.bestRawWpm || 0, result.rawWpm);

  // 3. Evaluate achievements
  const tempProfile: Partial<UserProfile> = {
    ...currentProfile,
    totalTests: newTotalTests,
    bestWpm: newBestWpm,
    currentStreak: streakCalc.currentStreak,
    longestStreak: streakCalc.longestStreak,
  };
  const { allEvaluated } = evaluateAchievements(
    tempProfile,
    result,
    currentProfile.achievements
  );
  const unlockedAchievementIds = allEvaluated
    .filter((a) => a.isUnlocked)
    .map((a) => a.id);

  const updatedProfile: UserProfile = {
    ...currentProfile,
    totalTests: newTotalTests,
    totalTypingTime: newTotalTypingTime,
    averageWpm: newAvgWpm,
    averageAccuracy: newAvgAcc,
    bestWpm: newBestWpm,
    bestRawWpm: newBestRawWpm,
    currentStreak: streakCalc.currentStreak,
    longestStreak: streakCalc.longestStreak,
    activeDaysCount: streakCalc.activeDaysCount,
    lastActivityDate: todayStr,
    lastActiveAt: nowIso,
    achievements: unlockedAchievementIds,
  };

  try {
    if (db && db.type) {
      // Save test document
      const testRef = doc(db, 'users', uid, 'tests', result.id);
      await setDoc(testRef, {
        ...result,
        userId: uid,
      });

      // Update user doc
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        totalTests: newTotalTests,
        totalTypingTime: newTotalTypingTime,
        averageWpm: newAvgWpm,
        averageAccuracy: newAvgAcc,
        bestWpm: newBestWpm,
        bestRawWpm: newBestRawWpm,
        currentStreak: streakCalc.currentStreak,
        longestStreak: streakCalc.longestStreak,
        activeDaysCount: streakCalc.activeDaysCount,
        lastActivityDate: todayStr,
        lastActiveAt: nowIso,
        achievements: unlockedAchievementIds,
      });

      // Update dailyStats document
      const dailyRef = doc(db, 'users', uid, 'dailyStats', todayStr);
      const dailySnap = await getDoc(dailyRef);
      if (dailySnap.exists()) {
        const dData = dailySnap.data() as DailyActivityStat;
        const count = (dData.testsCompleted || 0) + 1;
        await updateDoc(dailyRef, {
          testsCompleted: count,
          totalTypingTime: (dData.totalTypingTime || 0) + Math.round(result.duration),
          bestWpm: Math.max(dData.bestWpm || 0, result.wpm),
          averageWpm: Math.round(((dData.averageWpm || 0) * (count - 1) + result.wpm) / count),
          averageAccuracy: parseFloat(
            (((dData.averageAccuracy || 0) * (count - 1) + result.accuracy) / count).toFixed(1)
          ),
        });
      } else {
        await setDoc(dailyRef, {
          date: todayStr,
          testsCompleted: 1,
          totalTypingTime: Math.round(result.duration),
          bestWpm: result.wpm,
          averageWpm: result.wpm,
          averageAccuracy: result.accuracy,
        });
      }

      // Public Leaderboard submission if realistic and reasonable
      if (result.wpm >= 40 && result.wpm <= 300 && result.accuracy >= 80) {
        const lbRef = doc(db, 'leaderboard', `${uid}_${result.mode}_${result.duration}`);
        const lbSnap = await getDoc(lbRef);
        if (!lbSnap.exists() || (lbSnap.data().wpm || 0) < result.wpm) {
          await setDoc(lbRef, {
            userId: uid,
            displayName: currentProfile.displayName || 'Typist',
            photoURL: currentProfile.photoURL || '',
            wpm: result.wpm,
            rawWpm: result.rawWpm,
            accuracy: result.accuracy,
            mode: result.mode,
            duration: result.duration,
            completedAt: result.completedAt,
            activityDate: todayStr,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Firestore write error (cached locally):', err);
  }

  return {
    updatedProfile,
    isNewStreakDay: streakCalc.isNewStreakDay,
  };
}

export async function fetchUserTestHistory(uid: string, count: number = 50): Promise<TypingResult[]> {
  if (!db || !db.type) return [];
  try {
    const testsRef = collection(db, 'users', uid, 'tests');
    const q = query(testsRef, orderBy('completedAt', 'desc'), limit(count));
    const snap = await getDocs(q);
    const results: TypingResult[] = [];
    snap.forEach((doc) => {
      results.push(doc.data() as TypingResult);
    });
    return results;
  } catch (err) {
    console.warn('Error fetching test history:', err);
    return [];
  }
}

export async function fetchUserDailyStats(uid: string): Promise<DailyActivityStat[]> {
  if (!db || !db.type) return [];
  try {
    const dailyRef = collection(db, 'users', uid, 'dailyStats');
    const q = query(dailyRef, orderBy('date', 'desc'), limit(365));
    const snap = await getDocs(q);
    const stats: DailyActivityStat[] = [];
    snap.forEach((doc) => {
      stats.push(doc.data() as DailyActivityStat);
    });
    return stats;
  } catch (err) {
    console.warn('Error fetching daily activity stats:', err);
    return [];
  }
}

export async function fetchGlobalLeaderboard(
  mode: TestMode = 'time',
  durationSec: number = 30,
  maxRecords: number = 25
): Promise<LeaderboardEntry[]> {
  if (!db || !db.type) return [];
  try {
    const lbRef = collection(db, 'leaderboard');
    const q = query(
      lbRef,
      where('mode', '==', mode),
      orderBy('wpm', 'desc'),
      limit(maxRecords)
    );
    const snap = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    snap.forEach((doc) => {
      entries.push({ id: doc.id, ...(doc.data() as Omit<LeaderboardEntry, 'id'>) });
    });
    return entries;
  } catch (err) {
    console.warn('Error fetching leaderboard (or index building):', err);
    // Fallback: general query without compound constraint if index building
    try {
      const lbRef = collection(db, 'leaderboard');
      const q = query(lbRef, orderBy('wpm', 'desc'), limit(maxRecords));
      const snap = await getDocs(q);
      const fallbackEntries: LeaderboardEntry[] = [];
      snap.forEach((doc) => {
        fallbackEntries.push({ id: doc.id, ...(doc.data() as Omit<LeaderboardEntry, 'id'>) });
      });
      return fallbackEntries;
    } catch {
      return [];
    }
  }
}

export async function updateUserPreferencesInDb(uid: string, preferences: any): Promise<void> {
  if (!db || !db.type) return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { preferences });
  } catch (err) {
    console.warn('Error updating preferences in Firestore:', err);
  }
}

export async function deleteUserAccountData(uid: string): Promise<boolean> {
  if (!db || !db.type) return false;
  try {
    // Delete tests subcollection
    const testsRef = collection(db, 'users', uid, 'tests');
    const testSnap = await getDocs(testsRef);
    const batch = writeBatch(db);
    testSnap.forEach((d) => batch.delete(d.ref));

    // Delete dailyStats subcollection
    const dailyRef = collection(db, 'users', uid, 'dailyStats');
    const dailySnap = await getDocs(dailyRef);
    dailySnap.forEach((d) => batch.delete(d.ref));

    // Delete user doc
    const userRef = doc(db, 'users', uid);
    batch.delete(userRef);

    await batch.commit();
    return true;
  } catch (err) {
    console.error('Error deleting user account data:', err);
    return false;
  }
}
