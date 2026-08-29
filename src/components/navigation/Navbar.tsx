import React from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Settings as SettingsIcon,
  BarChart2,
  Trophy,
  History,
  Keyboard,
  Target,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';

export type NavTab = 'test' | 'stats' | 'leaderboard' | 'history' | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openSettings: () => void;
  openDailyGoal: () => void;
  openShortcuts: () => void;
  isTypingActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openSettings,
  openDailyGoal,
  openShortcuts,
  isTypingActive,
}) => {
  const { user, profile, signInWithGoogle, signOutUser } = useAuth();
  const { preferences, updatePreferences } = useTheme();

  const streakCount = profile?.currentStreak || 0;
  const isSoundOn = preferences.soundProfile !== 'off';

  const toggleSound = () => {
    updatePreferences({
      soundProfile: isSoundOn ? 'off' : 'thock',
    });
  };

  return (
    <header
      className={`w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between transition-opacity duration-300 ${
        isTypingActive ? 'opacity-20 hover:opacity-100' : 'opacity-100'
      }`}
    >
      {/* Brand & Main Nav */}
      <div className="flex items-center gap-6 sm:gap-8">
        {/* Wordmark */}
        <button
          onClick={() => setActiveTab('test')}
          className="flex items-center gap-2 text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-[#121316] flex items-center justify-center font-black text-lg tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
            TF
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Type<span className="text-[var(--accent)]">Forge</span>
            </span>
          </div>
        </button>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-subtle)]">
          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'test'
                ? 'bg-[var(--bg-surface-hover)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Test</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'stats'
                ? 'bg-[var(--bg-surface-hover)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-[var(--bg-surface-hover)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-[var(--bg-surface-hover)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Flame Badge */}
        <button
          onClick={() => setActiveTab('profile')}
          title={`Current Streak: ${streakCount} days`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] hover:border-amber-500/40 hover:bg-[var(--bg-surface-hover)] transition-all cursor-pointer"
        >
          <Flame
            className={`w-4 h-4 ${
              streakCount > 0
                ? 'text-amber-500 fill-amber-500 animate-pulse'
                : 'text-[var(--text-muted)]'
            }`}
          />
          <span className="font-typing font-semibold">{streakCount}</span>
        </button>

        {/* Daily Goal shortcut */}
        <button
          onClick={openDailyGoal}
          title="Daily Goal Target"
          className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors hidden sm:flex"
        >
          <Target className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={`Typing Sound: ${isSoundOn ? preferences.soundProfile : 'Off'}`}
          className={`p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] transition-colors ${
            isSoundOn
              ? 'text-[var(--accent)] hover:bg-[var(--bg-surface-hover)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
          }`}
        >
          {isSoundOn ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={openSettings}
          title="Settings (Esc)"
          className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        {/* User Profile / Google Sign-in */}
        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 p-1 pr-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-md object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-md bg-[var(--accent-glow)] text-[var(--accent)] flex items-center justify-center text-xs font-bold">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-xs font-medium text-[var(--text-primary)] hidden lg:inline max-w-[90px] truncate">
                {user.displayName || 'Typist'}
              </span>
            </button>
            <button
              onClick={signOutUser}
              title="Sign Out"
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Button
            variant="accent-subtle"
            size="sm"
            onClick={signInWithGoogle}
            icon={<LogIn className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Sign In</span>
          </Button>
        )}
      </div>
    </header>
  );
};
