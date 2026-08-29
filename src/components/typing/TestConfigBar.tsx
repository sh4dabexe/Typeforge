import React from 'react';
import {
  Clock,
  Type,
  Quote,
  Code2,
  Sliders,
  Hash,
  Sparkles,
  Globe,
} from 'lucide-react';
import {
  TestConfig,
  TestMode,
  TimeDuration,
  WordCount,
  WordDifficulty,
  SupportedLanguage,
} from '../../types';

interface TestConfigBarProps {
  config: TestConfig;
  onChange: (newConfig: Partial<TestConfig>) => void;
  openCustomModal: () => void;
  disabled?: boolean;
}

export const TestConfigBar: React.FC<TestConfigBarProps> = ({
  config,
  onChange,
  openCustomModal,
  disabled = false,
}) => {
  const modes: { id: TestMode; label: string; icon: React.ReactNode }[] = [
    { id: 'time', label: 'time', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'words', label: 'words', icon: <Type className="w-3.5 h-3.5" /> },
    { id: 'quote', label: 'quote', icon: <Quote className="w-3.5 h-3.5" /> },
    { id: 'code', label: 'code', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'custom', label: 'custom', icon: <Sliders className="w-3.5 h-3.5" /> },
  ];

  const timeOptions: TimeDuration[] = [15, 30, 60, 120];
  const wordOptions: WordCount[] = [10, 25, 50, 100, 200];
  const difficulties: WordDifficulty[] = ['easy', 'normal', 'hard'];
  const languages: { id: SupportedLanguage; label: string }[] = [
    { id: 'english', label: 'EN' },
    { id: 'spanish', label: 'ES' },
    { id: 'french', label: 'FR' },
    { id: 'german', label: 'DE' },
    { id: 'hindi', label: 'HI' },
  ];

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] transition-all ${
        disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Mode Selector */}
      <div className="flex items-center gap-1 pr-2 border-r border-[var(--border-subtle)]">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              if (m.id === 'custom') {
                openCustomModal();
              } else {
                onChange({ mode: m.id });
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              config.mode === m.id
                ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
          >
            {m.icon}
            <span className="capitalize">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Sub-options for Time mode */}
      {config.mode === 'time' && (
        <div className="flex items-center gap-1 pr-2 border-r border-[var(--border-subtle)]">
          {timeOptions.map((t) => (
            <button
              key={t}
              onClick={() => onChange({ timeDuration: t })}
              className={`px-2 py-1 text-xs font-typing font-medium rounded-md transition-colors cursor-pointer ${
                config.timeDuration === t
                  ? 'text-[var(--accent)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t}s
            </button>
          ))}
        </div>
      )}

      {/* Sub-options for Words mode */}
      {config.mode === 'words' && (
        <div className="flex items-center gap-1 pr-2 border-r border-[var(--border-subtle)]">
          {wordOptions.map((w) => (
            <button
              key={w}
              onClick={() => onChange({ wordCount: w })}
              className={`px-2 py-1 text-xs font-typing font-medium rounded-md transition-colors cursor-pointer ${
                config.wordCount === w
                  ? 'text-[var(--accent)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {/* Difficulty for standard text modes */}
      {(config.mode === 'time' || config.mode === 'words') && (
        <div className="flex items-center gap-1 pr-2 border-r border-[var(--border-subtle)]">
          <Sparkles className="w-3 h-3 text-[var(--text-muted)] ml-1" />
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => onChange({ difficulty: d })}
              className={`px-2 py-1 text-xs capitalize rounded-md transition-colors cursor-pointer ${
                config.difficulty === d
                  ? 'text-[var(--accent)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* Language Selector (non-code modes) */}
      {config.mode !== 'code' && (
        <div className="flex items-center gap-1 pr-2 border-r border-[var(--border-subtle)]">
          <Globe className="w-3 h-3 text-[var(--text-muted)] ml-1" />
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => onChange({ language: lang.id })}
              className={`px-1.5 py-0.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                config.language === lang.id
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}

      {/* Toggles: Punctuation & Numbers */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange({ punctuation: !config.punctuation })}
          title="Toggle punctuation"
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors cursor-pointer ${
            config.punctuation
              ? 'bg-[var(--accent-glow)] text-[var(--accent)] font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <span>@</span>
          <span>punc</span>
        </button>

        <button
          onClick={() => onChange({ numbers: !config.numbers })}
          title="Toggle numbers"
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors cursor-pointer ${
            config.numbers
              ? 'bg-[var(--accent-glow)] text-[var(--accent)] font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <Hash className="w-3 h-3" />
          <span>nums</span>
        </button>
      </div>
    </div>
  );
};
