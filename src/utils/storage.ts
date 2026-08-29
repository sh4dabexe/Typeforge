import { TypingResult, UserPreferences, UserProfile } from '../types';

const STORAGE_KEYS = {
  PREFERENCES: 'typeforge_preferences',
  ANON_HISTORY: 'typeforge_anon_history',
  ANON_STATS: 'typeforge_anon_stats',
  SYNC_QUEUE: 'typeforge_sync_queue',
  LAST_CONFIG: 'typeforge_last_config',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'charcoal',
  font: 'JetBrains Mono',
  fontSize: 'lg',
  caretStyle: 'line',
  smoothCaret: true,
  soundProfile: 'thock',
  soundVolume: 0.45,
  liveWpm: true,
  liveAccuracy: true,
  liveTimer: true,
  showKeyboard: false,
  stopOnError: false,
  confidenceMode: false,
  quickRestart: 'tab',
  dailyGoalTests: 5,
  animationsEnabled: true,
};

export function getLocalPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveLocalPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  try {
    const current = getLocalPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function getLocalHistory(): TypingResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANON_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalResult(result: TypingResult): TypingResult[] {
  try {
    const history = getLocalHistory();
    const updated = [result, ...history].slice(0, 100); // Keep last 100 local tests
    localStorage.setItem(STORAGE_KEYS.ANON_HISTORY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearLocalHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ANON_HISTORY);
  } catch {}
}

export function getSyncQueue(): TypingResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToSyncQueue(result: TypingResult) {
  try {
    const queue = getSyncQueue();
    queue.push(result);
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  } catch {}
}

export function clearSyncQueue() {
  try {
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
  } catch {}
}
