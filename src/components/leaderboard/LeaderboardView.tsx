import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Clock,
  ShieldCheck,
  Globe,
  User,
} from 'lucide-react';
import { LeaderboardEntry, TestMode } from '../../types';
import { fetchGlobalLeaderboard } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

export const LeaderboardView: React.FC = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<TestMode>('time');
  const [duration, setDuration] = useState<number>(30);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      const data = await fetchGlobalLeaderboard(mode, duration, 30);
      setEntries(data);
      setLoading(false);
    }
    loadLeaderboard();
  }, [mode, duration]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[var(--accent)]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Global Leaderboards
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Top verified typing performances across the community.
          </p>
        </div>

        {/* Duration filters */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-subtle)]">
          {[15, 30, 60, 120].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-3 py-1 text-xs font-typing font-medium rounded-md transition-colors cursor-pointer ${
                duration === d
                  ? 'bg-[var(--bg-surface-hover)] text-[var(--accent)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {d}s
            </button>
          ))}
        </div>
      </div>

      {/* Anti-cheat disclaimer */}
      <div className="w-full mb-6 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Anti-cheat verification active: Character timestamps and duration validated.</span>
        </div>
        <Badge variant="accent" className="hidden sm:inline-flex">
          Verified Runs
        </Badge>
      </div>

      {/* Leaderboard Table */}
      <div className="w-full rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[var(--text-muted)]">
            Loading rankings...
          </div>
        ) : entries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-surface-hover)]/60 text-xs text-[var(--text-muted)] uppercase font-semibold border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4">Typist</th>
                  <th className="py-3.5 px-4">WPM</th>
                  <th className="py-3.5 px-4">Accuracy</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-typing">
                {entries.map((entry, idx) => {
                  const isCurrentUser = user && user.uid === entry.userId;
                  const rank = idx + 1;

                  let rankBadge = (
                    <span className="text-xs font-bold text-[var(--text-muted)]">
                      #{rank}
                    </span>
                  );
                  if (rank === 1) {
                    rankBadge = (
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 inline-flex items-center justify-center font-bold text-xs">
                        🥇
                      </span>
                    );
                  } else if (rank === 2) {
                    rankBadge = (
                      <span className="w-6 h-6 rounded-full bg-slate-300/20 text-slate-300 inline-flex items-center justify-center font-bold text-xs">
                        🥈
                      </span>
                    );
                  } else if (rank === 3) {
                    rankBadge = (
                      <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 inline-flex items-center justify-center font-bold text-xs">
                        🥉
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-[var(--bg-surface-hover)]/40 transition-colors ${
                        isCurrentUser ? 'bg-[var(--accent-glow)]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">{rankBadge}</td>
                      <td className="py-3.5 px-4 font-sans font-medium text-[var(--text-primary)] flex items-center gap-2.5">
                        {entry.photoURL ? (
                          <img
                            src={entry.photoURL}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center text-[10px] text-[var(--text-secondary)]">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span>{entry.displayName || 'Typist'}</span>
                        {isCurrentUser && (
                          <Badge variant="accent" className="text-[10px] py-0">
                            You
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-lg font-bold text-[var(--accent)]">
                        {entry.wpm}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                        {entry.accuracy}%
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="default" className="capitalize">
                          {entry.mode} {entry.duration}s
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs font-sans text-[var(--text-muted)]">
                        {entry.completedAt ? new Date(entry.completedAt).toLocaleDateString() : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center p-6">
            <Trophy className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              No entries yet for this category
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Be the first to complete a verified test and claim the #1 spot!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
