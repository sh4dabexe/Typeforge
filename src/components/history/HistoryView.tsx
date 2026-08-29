import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Clock,
  Filter,
  ArrowUpDown,
  Trash2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TypingResult, TestMode } from '../../types';
import { getLocalHistory, clearLocalHistory } from '../../utils/storage';
import { fetchUserTestHistory } from '../../services/firestoreService';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const HistoryView: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<TypingResult[]>([]);
  const [selectedMode, setSelectedMode] = useState<TestMode | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'wpm' | 'accuracy'>('date');
  const [selectedTest, setSelectedTest] = useState<TypingResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      if (user) {
        const remoteHistory = await fetchUserTestHistory(user.uid, 100);
        setHistory(remoteHistory);
      } else {
        const local = getLocalHistory();
        setHistory(local);
      }
      setLoading(false);
    }
    loadHistory();
  }, [user]);

  const handleClearHistory = () => {
    if (confirm('Clear local history records?')) {
      clearLocalHistory();
      setHistory([]);
    }
  };

  const filteredHistory = history
    .filter((test) => (selectedMode === 'all' ? true : test.mode === selectedMode))
    .sort((a, b) => {
      if (sortBy === 'wpm') return b.wpm - a.wpm;
      if (sortBy === 'accuracy') return b.accuracy - a.accuracy;
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Typing History
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Review detailed metrics and timestamps from previous sessions.
          </p>
        </div>

        {/* Filter & Sort controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode selector */}
          <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-subtle)] text-xs">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)] ml-1" />
            {(['all', 'time', 'words', 'quote', 'code'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMode(m)}
                className={`px-2 py-1 capitalize rounded-md transition-colors cursor-pointer ${
                  selectedMode === m
                    ? 'bg-[var(--bg-surface-hover)] text-[var(--accent)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-subtle)] text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)] ml-1" />
            {(['date', 'wpm', 'accuracy'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2 py-1 capitalize rounded-md transition-colors cursor-pointer ${
                  sortBy === s
                    ? 'bg-[var(--bg-surface-hover)] text-[var(--accent)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {!user && history.length > 0 && (
            <button
              onClick={handleClearHistory}
              title="Clear Local History"
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* History Table / List */}
      {filteredHistory.length > 0 ? (
        <div className="w-full rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-surface-hover)]/60 text-xs text-[var(--text-muted)] uppercase font-semibold border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="py-3.5 px-4">WPM</th>
                  <th className="py-3.5 px-4">Accuracy</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Errors</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-typing">
                {filteredHistory.map((test) => (
                  <tr
                    key={test.id}
                    onClick={() => setSelectedTest(test)}
                    className="hover:bg-[var(--bg-surface-hover)]/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-bold text-lg text-[var(--accent)]">
                      {test.wpm}
                      <span className="text-[10px] font-normal text-[var(--text-muted)] ml-1">
                        raw:{test.rawWpm}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                      {test.accuracy}%
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="default" className="capitalize">
                        {test.mode}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                      {test.duration}s
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                      {test.errors}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-sans text-[var(--text-muted)]">
                      {new Date(test.completedAt).toLocaleDateString()} {new Date(test.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="w-full py-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col items-center justify-center text-center p-6">
          <HistoryIcon className="w-10 h-10 text-[var(--text-muted)] mb-3" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            No typing history found
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mt-1">
            Completed typing tests will appear here with in-depth accuracy and error statistics.
          </p>
        </div>
      )}

      {/* Test Details Modal */}
      {selectedTest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTest(null)}
          title={`Test Result Details (${selectedTest.mode})`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]">
                <div className="text-xs text-[var(--text-muted)]">WPM</div>
                <div className="text-2xl font-bold font-typing text-[var(--accent)]">
                  {selectedTest.wpm}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]">
                <div className="text-xs text-[var(--text-muted)]">Accuracy</div>
                <div className="text-2xl font-bold font-typing text-emerald-400">
                  {selectedTest.accuracy}%
                </div>
              </div>
            </div>

            <div className="text-xs space-y-2 text-[var(--text-secondary)] bg-[var(--bg-surface-hover)]/40 p-4 rounded-xl">
              <div className="flex justify-between">
                <span>Raw WPM:</span>
                <span className="font-typing font-bold text-[var(--text-primary)]">{selectedTest.rawWpm}</span>
              </div>
              <div className="flex justify-between">
                <span>Consistency:</span>
                <span className="font-typing font-bold text-[var(--text-primary)]">{selectedTest.consistency}%</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-typing font-bold text-[var(--text-primary)]">{selectedTest.duration} seconds</span>
              </div>
              <div className="flex justify-between">
                <span>Characters:</span>
                <span className="font-typing font-bold text-[var(--text-primary)]">
                  {selectedTest.correctCharacters} correct / {selectedTest.incorrectCharacters} incorrect / {selectedTest.extraCharacters} extra
                </span>
              </div>
              <div className="flex justify-between">
                <span>Backspaces:</span>
                <span className="font-typing font-bold text-[var(--text-primary)]">{selectedTest.backspaces}</span>
              </div>
              <div className="flex justify-between">
                <span>Language:</span>
                <span className="capitalize text-[var(--text-primary)]">{selectedTest.language}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed At:</span>
                <span className="text-[var(--text-primary)]">{new Date(selectedTest.completedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedTest(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
