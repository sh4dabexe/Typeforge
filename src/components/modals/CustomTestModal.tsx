import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TestConfig } from '../../types';

interface CustomTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TestConfig;
  onApply: (customConfig: Partial<TestConfig>) => void;
}

export const CustomTestModal: React.FC<CustomTestModalProps> = ({
  isOpen,
  onClose,
  config,
  onApply,
}) => {
  const [customType, setCustomType] = useState<'time' | 'words' | 'text'>('time');
  const [customSeconds, setCustomSeconds] = useState<number>(config.customTime || 45);
  const [customWords, setCustomWords] = useState<number>(config.customWordCount || 40);
  const [customText, setCustomText] = useState<string>(config.customText || '');

  const handleStart = () => {
    if (customType === 'time') {
      onApply({
        mode: 'time',
        customTime: Math.max(5, Math.min(600, customSeconds)),
      });
    } else if (customType === 'words') {
      onApply({
        mode: 'words',
        customWordCount: Math.max(5, Math.min(1000, customWords)),
      });
    } else {
      if (!customText.trim()) return;
      onApply({
        mode: 'custom',
        customText: customText.trim(),
      });
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Custom Test Configuration" maxWidth="md">
      <div className="space-y-5 text-sm">
        {/* Custom Type Selector */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface-hover)] p-1 rounded-xl">
          <button
            onClick={() => setCustomType('time')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              customType === 'time'
                ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            Custom Time
          </button>
          <button
            onClick={() => setCustomType('words')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              customType === 'words'
                ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            Custom Words
          </button>
          <button
            onClick={() => setCustomType('text')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              customType === 'text'
                ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            Custom Text
          </button>
        </div>

        {/* Input based on type */}
        {customType === 'time' && (
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1.5">
              Duration (Seconds: 5 to 600)
            </label>
            <input
              type="number"
              min="5"
              max="600"
              value={customSeconds}
              onChange={(e) => setCustomSeconds(parseInt(e.target.value) || 30)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] font-typing font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        )}

        {customType === 'words' && (
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1.5">
              Word Count (5 to 1000)
            </label>
            <input
              type="number"
              min="5"
              max="1000"
              value={customWords}
              onChange={(e) => setCustomWords(parseInt(e.target.value) || 25)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] font-typing font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        )}

        {customType === 'text' && (
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1.5">
              Paste your own text snippet
            </label>
            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste custom paragraphs, code snippets, or literature to practice typing..."
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] font-typing text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleStart}>
            Start Custom Test
          </Button>
        </div>
      </div>
    </Modal>
  );
};
