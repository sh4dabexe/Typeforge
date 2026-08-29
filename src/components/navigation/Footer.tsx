import React from 'react';
import { Keyboard, Shield, FileText, Command } from 'lucide-react';

interface FooterProps {
  openShortcuts: () => void;
  openPrivacy: () => void;
  openTerms: () => void;
  isTypingActive: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  openShortcuts,
  openPrivacy,
  openTerms,
  isTypingActive,
}) => {
  return (
    <footer
      className={`w-full max-w-5xl mx-auto px-4 py-6 mt-auto transition-opacity duration-300 ${
        isTypingActive ? 'opacity-0 pointer-events-none' : 'opacity-80 hover:opacity-100'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-4">
        {/* Shortcuts Hints */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-typing text-[10px] text-[var(--text-secondary)]">
              tab
            </kbd>
            <span>restart test</span>
          </div>

          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-typing text-[10px] text-[var(--text-secondary)]">
              esc
            </kbd>
            <span>settings</span>
          </div>

          <button
            onClick={openShortcuts}
            className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline-offset-2 hover:underline cursor-pointer ml-1"
          >
            <Command className="w-3 h-3" />
            <span>all shortcuts</span>
          </button>
        </div>

        {/* Legal & Branding */}
        <div className="flex items-center gap-4">
          <button
            onClick={openPrivacy}
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
          >
            <Shield className="w-3 h-3" />
            <span>Privacy</span>
          </button>
          <button
            onClick={openTerms}
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            <span>Terms</span>
          </button>
          <span>•</span>
          <span className="font-typing">TypeForge v1.0</span>
        </div>
      </div>
    </footer>
  );
};
