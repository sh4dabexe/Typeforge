import React, { useEffect, useState } from 'react';
import {
  RotateCcw,
  Play,
  Share2,
  Check,
  Flame,
  BarChart2,
  LogIn,
  Award,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TypingResult } from '../../types';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface ResultViewProps {
  result: TypingResult;
  isNewStreakDay?: boolean;
  onRetry: () => void;
  onNewTest: () => void;
  onViewStats: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  isNewStreakDay,
  onRetry,
  onNewTest,
  onViewStats,
}) => {
  const { user, profile, signInWithGoogle } = useAuth();
  const [copied, setCopied] = useState(false);

  // Trigger subtle celebratory confetti if new streak day or milestone speed reached
  useEffect(() => {
    if (isNewStreakDay || result.wpm >= 90) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f59e0b', '#10b981', '#38bdf8', '#e2e4e9'],
          disableForReducedMotion: true,
        });
      } catch {}
    }
  }, [isNewStreakDay, result.wpm]);

  // Keyboard shortcut listener on result screen
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        onRetry();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onNewTest();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onNewTest, onRetry]);

  const handleShare = async () => {
    const text = `${result.wpm} WPM | ${result.accuracy}% Acc | ${result.mode} (${result.duration}s) — TypeForge`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Generate smooth SVG curve for WPM progression timeline
  const samples = result.wpmSamples || [];
  const maxWpm = Math.max(...samples.map((s) => s.rawWpm || s.wpm), result.wpm, 30);
  const minWpm = 0;
  const chartHeight = 120;
  const chartWidth = 500;

  const points = samples.map((s, idx) => {
    const x = samples.length > 1 ? (idx / (samples.length - 1)) * chartWidth : chartWidth / 2;
    const y = chartHeight - ((s.wpm - minWpm) / (maxWpm - minWpm || 1)) * (chartHeight - 20) - 10;
    return { x, y, sample: s };
  });

  const rawPoints = samples.map((s, idx) => {
    const x = samples.length > 1 ? (idx / (samples.length - 1)) * chartWidth : chartWidth / 2;
    const y = chartHeight - ((s.rawWpm - minWpm) / (maxWpm - minWpm || 1)) * (chartHeight - 20) - 10;
    return { x, y, sample: s };
  });

  const pathD = points.length > 1
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  const rawPathD = rawPoints.length > 1
    ? rawPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col items-center animate-fadeIn">
      {/* Streak Celebration Banner */}
      {isNewStreakDay && profile && profile.currentStreak > 0 && (
        <div className="w-full mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-between animate-slideDown">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Flame className="w-6 h-6 fill-amber-500 animate-bounce" />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--text-primary)]">
                Daily Streak Increased! 🔥 {profile.currentStreak} Day Streak
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                You’ve completed your typing goal for today. Keep the fire burning!
              </div>
            </div>
          </div>
          <Award className="w-5 h-5 text-amber-400 hidden sm:block" />
        </div>
      )}

      {/* Main Metric Cards Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {/* WPM */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col items-center justify-center">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            WPM
          </span>
          <span className="text-5xl sm:text-6xl font-black font-typing text-[var(--accent)] tracking-tight">
            {result.wpm}
          </span>
          <span className="text-xs text-[var(--text-secondary)] mt-1">
            Raw: {result.rawWpm}
          </span>
        </div>

        {/* Accuracy */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col items-center justify-center">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Accuracy
          </span>
          <span className="text-4xl sm:text-5xl font-bold font-typing text-emerald-400">
            {result.accuracy}%
          </span>
          <span className="text-xs text-[var(--text-secondary)] mt-1">
            Consistency: {result.consistency}%
          </span>
        </div>

        {/* Errors / Characters */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col items-center justify-center">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Characters
          </span>
          <div className="text-2xl font-bold font-typing text-[var(--text-primary)] flex items-center gap-1.5">
            <span className="text-emerald-400" title="Correct">
              {result.correctCharacters}
            </span>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-red-400" title="Incorrect">
              {result.incorrectCharacters}
            </span>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-muted)]" title="Extra">
              {result.extraCharacters}
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)] mt-1">
            Total: {result.totalCharacters}
          </span>
        </div>

        {/* Test Mode / Time */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col items-center justify-center">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Test Details
          </span>
          <span className="text-2xl font-bold font-typing text-[var(--text-primary)] capitalize">
            {result.mode} {result.duration}s
          </span>
          <span className="text-xs text-[var(--text-secondary)] mt-1">
            Lang: {result.language}
          </span>
        </div>
      </div>

      {/* Interactive Timeline Progression Chart */}
      {samples.length > 2 && (
        <div className="w-full p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] mb-8">
          <div className="flex items-center justify-between mb-3 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                <span>Net WPM</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--text-muted)]" />
                <span>Raw WPM</span>
              </span>
            </div>
            <span className="font-typing">{result.duration} seconds</span>
          </div>

          <div className="w-full h-32 relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Grid guide lines */}
              <line
                x1="0"
                y1={chartHeight / 2}
                x2={chartWidth}
                y2={chartHeight / 2}
                stroke="var(--border-subtle)"
                strokeDasharray="4 4"
              />
              <line
                x1="0"
                y1={chartHeight - 10}
                x2={chartWidth}
                y2={chartHeight - 10}
                stroke="var(--border-subtle)"
              />

              {/* Raw WPM path (muted) */}
              <path
                d={rawPathD}
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="1.5"
                strokeOpacity="0.5"
                strokeDasharray="2 2"
              />

              {/* Net WPM path (accent) */}
              <path
                d={pathD}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Net WPM Data points */}
              {points.map((p, i) => (
                <circle
                  key={`pt-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill="var(--accent)"
                  className="transition-all hover:r-5 cursor-pointer"
                >
                  <title>{`${p.sample.second}s: ${p.sample.wpm} WPM (Raw: ${p.sample.rawWpm})`}</title>
                </circle>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <Button
          variant="primary"
          size="lg"
          onClick={onRetry}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          <span>Retry</span>
          <kbd className="text-[10px] bg-black/20 px-1 py-0.5 rounded font-typing">
            tab
          </kbd>
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={onNewTest}
          icon={<Play className="w-4 h-4" />}
        >
          <span>Next Test</span>
          <kbd className="text-[10px] bg-[var(--bg-surface-hover)] px-1 py-0.5 rounded font-typing">
            enter
          </kbd>
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={handleShare}
          icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        >
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={onViewStats}
          icon={<BarChart2 className="w-4 h-4" />}
        >
          <span>View Stats</span>
        </Button>
      </div>

      {/* Anonymous Sign-in Encouragement Banner */}
      {!user && (
        <div className="w-full max-w-xl p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <span>Save your streak & stats</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Sign in with Google to maintain your daily streak and appear on the leaderboard.
            </p>
          </div>
          <Button
            variant="accent-subtle"
            size="sm"
            onClick={signInWithGoogle}
            icon={<LogIn className="w-3.5 h-3.5" />}
          >
            Sign In with Google
          </Button>
        </div>
      )}
    </div>
  );
};
