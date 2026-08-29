import React from 'react';
import { Modal } from '../ui/Modal';
import { Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const shortcuts = [
    { key: 'Tab', desc: 'Restart test instantly with fresh text' },
    { key: 'Esc', desc: 'Open / close settings & preferences modal' },
    { key: 'Ctrl + Backspace', desc: 'Delete entire current word attempt' },
    { key: 'Enter', desc: 'Start next test on result screen' },
    { key: 'Space', desc: 'Advance to next word' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" maxWidth="md">
      <div className="space-y-4">
        <p className="text-xs text-[var(--text-secondary)]">
          TypeForge is optimized for keyboard-first navigation so you never have to leave home row.
        </p>

        <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-[var(--bg-surface-hover)]/30 text-xs"
            >
              <span className="text-[var(--text-secondary)]">{s.desc}</span>
              <kbd className="px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-typing font-bold text-[var(--text-primary)]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
