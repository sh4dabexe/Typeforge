import React, { useState, useEffect } from 'react';
import {
  Zap,
  Target,
  Flame,
  Clock,
  Award,
  Layers,
  Calendar as CalendarIcon,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TypingResult, DailyActivityStat } from '../../types';
import { getLocalHistory } from '../../utils/storage';
import { fetchUserTestHistory, fetchUserDailyStats } from '../../services/firestoreService';
import { StatCard } from '../ui/StatCard';

export const StatsDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [history, setHistory] = useState<TypingResult[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyActivityStat[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (user) {
        const [tests, daily] = await Promise.all([
          fetchUserTestHistory(user.uid, 100),
          fetchUserDailyStats(user.uid),
        ]);
        setHistory(tests);
        setDailyStats(daily);
      } else {
        const local = getLocalHistory();
        setHistory(local);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  // Filter history based on selected timeframe
  const filteredHistory = history.filter((test) => {
    if (timeframe === 'all') return true;
    const testDate = new Date(test.completedAt).getTime();
    const now = Date.now();
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    return now - testDate <= days * 24 * 60 * 60 * 1000;
  });

  const bestWpm = profile?.bestWpm || (history.length > 0 ? Math.max(...history.map((t) => t.wpm)) : 0);
  const avgWpm = profile?.averageWpm || (history.length > 0 ? Math.round(history.reduce((a, b) => a + b.wpm, 0) / history.length) : 0);
  const avgAcc = profile?.averageAccuracy || (history.length > 0 ? parseFloat((history.reduce((a, b) => a + b.accuracy, 0) / history.length).toFixed(1)) : 100);
  const totalTests = profile?.totalTests || history.length;
  const totalSeconds = profile?.totalTypingTime || history.reduce((a, b) => a + (b.duration || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  // Generate GitHub-style contribution calendar blocks for the past 20 weeks (140 days)
  const calendarDays = Array.from({ length: 140 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (139 - i));
    const dateStr = d.toISOString().split('T')[0];
    const stat = dailyStats.find((s) => s.date === dateStr);
    const count = stat ? stat.testsCompleted : history.filter((h) => h.activityDate === dateStr).length;
    return {
      date: dateStr,
      count,
      bestWpm: stat?.bestWpm || 0,
    };
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Track your typing speed evolution, accuracy consistency, and daily habits.
          </p>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-subtle)]">
          {(['7d', '30d', '90d', 'all'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-[var(--bg-surface-hover)] text-[var(--accent)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <StatCard
          label="Best WPM"
          value={bestWpm}
          icon={<Zap className="w-4 h-4 text-[var(--accent)]" />}
          color="accent"
        />
        <StatCard
          label="Avg WPM"
          value={avgWpm}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          label="Avg Accuracy"
          value={`${avgAcc}%`}
          icon={<Target className="w-4 h-4 text-emerald-400" />}
          color="success"
        />
        <StatCard
          label="Total Tests"
          value={totalTests}
          icon={<Layers className="w-4 h-4" />}
        />
        <StatCard
          label="Current Streak"
          value={`${profile?.currentStreak || 0}d`}
          subValue={`Best: ${profile?.longestStreak || 0}d`}
          icon={<Flame className="w-4 h-4 text-amber-500" />}
        />
        <StatCard
          label="Typing Time"
          value={`${totalMinutes}m`}
          subValue={`${totalSeconds}s`}
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Speed & Accuracy Over Time Chart */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              WPM History ({filteredHistory.length} tests)
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span>WPM</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Accuracy</span>
            </span>
          </div>
        </div>

        {filteredHistory.length > 1 ? (
          <div className="w-full h-48 relative">
            <svg
              viewBox="0 0 800 160"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Horizontal grid lines */}
              {[40, 80, 120].map((yVal) => (
                <line
                  key={yVal}
                  x1="0"
                  y1={yVal}
                  x2="800"
                  y2={yVal}
                  stroke="var(--border-subtle)"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Data points & line */}
              {(() => {
                const sorted = [...filteredHistory].reverse();
                const max = Math.max(...sorted.map((t) => t.wpm), 60);
                const pointsStr = sorted
                  .map((t, idx) => {
                    const x = (idx / (sorted.length - 1)) * 800;
                    const y = 150 - (t.wpm / max) * 130;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ');

                return (
                  <>
                    <path
                      d={pointsStr}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {sorted.map((t, idx) => {
                      const x = (idx / (sorted.length - 1)) * 800;
                      const y = 150 - (t.wpm / max) * 130;
                      return (
                        <circle
                          key={`wpm-dot-${idx}`}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="var(--accent)"
                          className="hover:r-6 transition-all cursor-pointer"
                        >
                          <title>{`${new Date(t.completedAt).toLocaleDateString()}: ${t.wpm} WPM (${t.accuracy}%)`}</title>
                        </circle>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        ) : (
          <div className="h-36 flex flex-col items-center justify-center text-[var(--text-secondary)] text-xs">
            <span>Complete more tests to generate speed trend analysis.</span>
          </div>
        )}
      </div>

      {/* Daily Activity Calendar Heatmap */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Activity Heatmap (Past 20 Weeks)
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)]">
            {profile?.activeDaysCount || (dailyStats.length > 0 ? dailyStats.length : 1)} Active Days
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="flex flex-wrap gap-1.5 justify-start">
          {calendarDays.map((cd) => {
            let bgClass = 'bg-[var(--bg-surface-hover)]';
            if (cd.count === 1) bgClass = 'bg-amber-500/30';
            else if (cd.count >= 2 && cd.count < 5) bgClass = 'bg-amber-500/60';
            else if (cd.count >= 5) bgClass = 'bg-amber-500';

            return (
              <div
                key={cd.date}
                className={`w-3.5 h-3.5 rounded-xs ${bgClass} transition-colors cursor-pointer hover:scale-125`}
                title={`${cd.date}: ${cd.count} tests completed${cd.bestWpm > 0 ? ` (Best: ${cd.bestWpm} WPM)` : ''}`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-4 text-[10px] text-[var(--text-muted)]">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-xs bg-[var(--bg-surface-hover)]" />
            <div className="w-3 h-3 rounded-xs bg-amber-500/30" />
            <div className="w-3 h-3 rounded-xs bg-amber-500/60" />
            <div className="w-3 h-3 rounded-xs bg-amber-500" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
