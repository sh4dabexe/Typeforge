import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar, NavTab } from './components/navigation/Navbar';
import { Footer } from './components/navigation/Footer';
import { TestConfigBar } from './components/typing/TestConfigBar';
import { TypingArea } from './components/typing/TypingArea';
import { VirtualKeyboard } from './components/typing/VirtualKeyboard';
import { ResultView } from './components/results/ResultView';
import { StatsDashboard } from './components/stats/StatsDashboard';
import { HistoryView } from './components/history/HistoryView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsModal } from './components/settings/SettingsModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { DailyGoalModal } from './components/modals/DailyGoalModal';
import { CustomTestModal } from './components/modals/CustomTestModal';
import { PrivacyTermsModal } from './components/modals/PrivacyTermsModal';
import { useTypingEngine } from './hooks/useTypingEngine';
import { TestConfig, TypingResult } from './types';
import { saveLocalResult } from './utils/storage';
import { saveTestResultToFirestore, fetchUserDailyStats } from './services/firestoreService';
import { getLocalTodayDateString } from './utils/streak';
import { X, AlertCircle } from 'lucide-react';

const DEFAULT_CONFIG: TestConfig = {
  mode: 'time',
  timeDuration: 30,
  wordCount: 25,
  difficulty: 'normal',
  language: 'english',
  punctuation: false,
  numbers: false,
};

function TypeForgeApp() {
  const { user, profile, updateProfileState, authError, clearAuthError } = useAuth();
  const { preferences } = useTheme();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('test');

  // Test configuration
  const [config, setConfig] = useState<TestConfig>(DEFAULT_CONFIG);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDailyGoalOpen, setIsDailyGoalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [privacyModalMode, setPrivacyModalMode] = useState<'privacy' | 'terms' | null>(null);

  // Latest test result & streak indicator
  const [latestResult, setLatestResult] = useState<TypingResult | null>(null);
  const [isNewStreakDay, setIsNewStreakDay] = useState(false);
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);

  // Active key pressed for virtual keyboard
  const [activePressedKey, setActivePressedKey] = useState<string | null>(null);

  // Load today's completed count
  useEffect(() => {
    async function loadTodayCount() {
      const todayStr = getLocalTodayDateString();
      if (user) {
        const stats = await fetchUserDailyStats(user.uid);
        const todayStat = stats.find((s) => s.date === todayStr);
        setTodayCompletedCount(todayStat?.testsCompleted || 0);
      }
    }
    loadTodayCount();
  }, [user, latestResult]);

  // Handle completed test
  const handleTestComplete = useCallback(
    async (result: TypingResult) => {
      setLatestResult(result);
      setTodayCompletedCount((prev) => prev + 1);

      if (user && profile) {
        // Save to Firestore and calculate updated streak
        const { updatedProfile, isNewStreakDay: newDay } = await saveTestResultToFirestore(
          user.uid,
          result,
          profile
        );
        updateProfileState(updatedProfile);
        setIsNewStreakDay(newDay);
      } else {
        // Save locally for anonymous user
        saveLocalResult(result);
        setIsNewStreakDay(true);
      }
    },
    [profile, updateProfileState, user]
  );

  // Typing engine hook
  const {
    status,
    words,
    currentWordIndex,
    currentTypedWord,
    wordStates,
    timeRemaining,
    liveWpm,
    liveAccuracy,
    errorsCount,
    resetTest,
    handleKeyDown: engineKeyDown,
  } = useTypingEngine({
    config,
    preferences,
    onTestComplete: handleTestComplete,
  });

  const handleGlobalKeyDown = (e: React.KeyboardEvent | KeyboardEvent) => {
    // Escape opens / closes settings
    if (e.key === 'Escape' && status !== 'running') {
      setIsSettingsOpen((prev) => !prev);
      return;
    }

    setActivePressedKey(e.key);
    engineKeyDown(e);
  };

  const handleKeyUp = () => {
    setActivePressedKey(null);
  };

  useEffect(() => {
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, []);

  const handleRetryTest = () => {
    setLatestResult(null);
    resetTest();
  };

  const handleNewTest = () => {
    setLatestResult(null);
    resetTest();
  };

  const isTypingRunning = status === 'running';

  return (
    <div
      className="min-h-screen flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200"
      onKeyDown={handleGlobalKeyDown}
    >
      {/* Auth Error Banner if any */}
      {authError && (
        <div className="w-full bg-red-500/15 border-b border-red-500/30 px-4 py-2 flex items-center justify-between text-xs text-red-300">
          <div className="flex items-center gap-2 max-w-2xl mx-auto">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{authError}</span>
          </div>
          <button
            onClick={clearAuthError}
            className="p-1 text-red-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setLatestResult(null);
        }}
        openSettings={() => setIsSettingsOpen(true)}
        openDailyGoal={() => setIsDailyGoalOpen(true)}
        openShortcuts={() => setIsShortcutsOpen(true)}
        isTypingActive={isTypingRunning}
      />

      {/* Main Content View */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 my-auto">
        {activeTab === 'test' && (
          <>
            {latestResult ? (
              <ResultView
                result={latestResult}
                isNewStreakDay={isNewStreakDay}
                onRetry={handleRetryTest}
                onNewTest={handleNewTest}
                onViewStats={() => setActiveTab('stats')}
              />
            ) : (
              <div className="w-full max-w-4xl flex flex-col items-center gap-8 py-4">
                {/* Mode & Options Bar */}
                <TestConfigBar
                  config={config}
                  onChange={(newCfg) => {
                    setConfig((prev) => ({ ...prev, ...newCfg }));
                    setLatestResult(null);
                  }}
                  openCustomModal={() => setIsCustomModalOpen(true)}
                  disabled={isTypingRunning}
                />

                {/* Primary Typing Test Screen */}
                <TypingArea
                  status={status}
                  words={words}
                  currentWordIndex={currentWordIndex}
                  currentTypedWord={currentTypedWord}
                  wordStates={wordStates}
                  timeRemaining={timeRemaining}
                  liveWpm={liveWpm}
                  liveAccuracy={liveAccuracy}
                  errorsCount={errorsCount}
                  preferences={preferences}
                  config={config}
                  onKeyDown={handleGlobalKeyDown}
                  onReset={resetTest}
                />

                {/* Optional Reactive Keyboard */}
                {preferences.showKeyboard && (
                  <div className="w-full mt-2">
                    <VirtualKeyboard activeKey={activePressedKey} />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'stats' && <StatsDashboard />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Minimal Footer */}
      <Footer
        openShortcuts={() => setIsShortcutsOpen(true)}
        openPrivacy={() => setPrivacyModalMode('privacy')}
        openTerms={() => setPrivacyModalMode('terms')}
        isTypingActive={isTypingRunning}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Daily Goal Target Modal */}
      <DailyGoalModal
        isOpen={isDailyGoalOpen}
        onClose={() => setIsDailyGoalOpen(false)}
        todayCompletedCount={todayCompletedCount}
      />

      {/* Custom Test Configuration Modal */}
      <CustomTestModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        config={config}
        onApply={(newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }))}
      />

      {/* Privacy & Terms Modal */}
      {privacyModalMode && (
        <PrivacyTermsModal
          isOpen={true}
          onClose={() => setPrivacyModalMode(null)}
          mode={privacyModalMode}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TypeForgeApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
