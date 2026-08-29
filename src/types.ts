export type TestMode = 'time' | 'words' | 'quote' | 'code' | 'custom';
export type TimeDuration = 15 | 30 | 60 | 120;
export type WordCount = 10 | 25 | 50 | 100 | 200;
export type WordDifficulty = 'easy' | 'normal' | 'hard';
export type SupportedLanguage = 'english' | 'spanish' | 'french' | 'german' | 'hindi' | 'code';
export type CaretStyle = 'line' | 'block' | 'underline' | 'box';
export type SoundProfile = 'off' | 'thock' | 'clicky' | 'typewriter' | 'bubble' | 'digital';
export type ThemeId = 'charcoal' | 'cyber' | 'serene' | 'nord' | 'sunset' | 'monochrome' | 'porcelain';

export interface TestConfig {
  mode: TestMode;
  timeDuration: TimeDuration;
  wordCount: WordCount;
  difficulty: WordDifficulty;
  language: SupportedLanguage;
  punctuation: boolean;
  numbers: boolean;
  customTime?: number;
  customWordCount?: number;
  customText?: string;
}

export interface TypedCharState {
  char: string;
  typed: string | null;
  isCorrect: boolean | null;
  isExtra?: boolean;
}

export interface TypedWordState {
  targetWord: string;
  typedWord: string;
  isComplete: boolean;
  chars: TypedCharState[];
}

export interface WpmSample {
  timestamp: number;
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface TypingResult {
  id: string;
  userId?: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  duration: number; // in seconds
  targetDuration: number | null;
  wordCount: number;
  targetWordCount: number | null;
  mode: TestMode;
  language: SupportedLanguage;
  punctuation: boolean;
  numbers: boolean;
  errors: number;
  correctCharacters: number;
  incorrectCharacters: number;
  extraCharacters: number;
  totalCharacters: number;
  backspaces: number;
  completedAt: string; // ISO string
  activityDate: string; // YYYY-MM-DD
  timezone: string;
  wpmSamples: WpmSample[];
  keystrokeTimestamps?: number[];
}

export interface DailyActivityStat {
  date: string; // YYYY-MM-DD
  testsCompleted: number;
  totalTypingTime: number; // seconds
  bestWpm: number;
  averageWpm: number;
  averageAccuracy: number;
}

export interface UserPreferences {
  theme: ThemeId;
  font: 'JetBrains Mono' | 'Fira Code' | 'Space Mono' | 'Inter';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  caretStyle: CaretStyle;
  smoothCaret: boolean;
  soundProfile: SoundProfile;
  soundVolume: number; // 0 to 1
  liveWpm: boolean;
  liveAccuracy: boolean;
  liveTimer: boolean;
  showKeyboard: boolean;
  stopOnError: boolean;
  confidenceMode: boolean; // Cannot backspace mistakes
  quickRestart: 'tab' | 'enter' | 'esc';
  dailyGoalTests: number;
  animationsEnabled: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: string;
  lastActiveAt: string;
  timezone: string;
  currentStreak: number;
  longestStreak: number;
  totalTests: number;
  totalTypingTime: number; // seconds
  averageWpm: number;
  averageAccuracy: number;
  bestWpm: number;
  bestRawWpm: number;
  activeDaysCount: number;
  lastActivityDate: string; // YYYY-MM-DD
  preferences: UserPreferences;
  achievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'speed' | 'accuracy' | 'streak' | 'volume' | 'special';
  targetValue: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  photoURL: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  mode: TestMode;
  duration: number;
  completedAt: string;
  activityDate: string;
}
