import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface DailyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayCompletedCount: number;
}

export const DailyGoalModal: React.FC<DailyGoalModalProps> = ({
  isOpen,
  onClose,
  todayCompletedCount,
}) => {
  const { preferences, updatePreferences } = useTheme();
  const { profile } = useAuth();

  const goal = preferences.dailyGoalTests || 5;
  const progressPercent = Math.min(100, Math.round((todayCompletedCount / goal) * 100));
  const isGoalAchieved = todayCompletedCount >= goal;

  const goalOptions = [3, 5, 10, 15, 25];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Daily Practice Goal" maxWidth="md">
      <div className="space-y-6 text-sm">
        {/* Current Progress Ring / Bar */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface-hover)]/40 border border-[var(--border-subtle)] flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-glow)] text-[var(--accent)] flex items-center justify-center mb-3">
            {isGoalAchieved ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            ) : (
              <Target className="w-7 h-7" />
            )}
          </div>
          <div className="text-xl font-bold font-typing text-[var(--text-primary)]">
            {todayCompletedCount} / {goal} Tests Completed
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            {isGoalAchieved
              ? '🎉 Daily goal completed for today!'
              : `${goal - todayCompletedCount} more tests to reach today's milestone.`}
          </div>

          <div className="w-full bg-[var(--bg-surface)] h-2.5 rounded-full mt-4 overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Configure Target */}
        <div>
          <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
            Target Tests Per Day
          </label>
          <div className="grid grid-cols-5 gap-2">
            {goalOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => updatePreferences({ dailyGoalTests: opt })}
                className={`py-2 rounded-xl border font-typing font-bold text-sm transition-all cursor-pointer ${
                  goal === opt
                    ? 'border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)] shadow-sm'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
