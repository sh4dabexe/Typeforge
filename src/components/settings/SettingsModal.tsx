import React from 'react';
import {
  Palette,
  Volume2,
  Sliders,
  Type,
  Eye,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useTheme } from '../../context/ThemeContext';
import {
  ThemeId,
  CaretStyle,
  SoundProfile,
} from '../../types';
import { soundManager } from '../../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences } = useTheme();

  const themes: { id: ThemeId; name: string; bg: string; accent: string }[] = [
    { id: 'charcoal', name: 'Charcoal (Default)', bg: '#121316', accent: '#f59e0b' },
    { id: 'cyber', name: 'Cyber Neon', bg: '#0a0e14', accent: '#10b981' },
    { id: 'serene', name: 'Serene Midnight', bg: '#0c1322', accent: '#38bdf8' },
    { id: 'nord', name: 'Nord Frost', bg: '#242933', accent: '#88c0d0' },
    { id: 'sunset', name: 'Sunset Rose', bg: '#18131e', accent: '#f43f5e' },
    { id: 'monochrome', name: 'Monochrome', bg: '#050505', accent: '#ffffff' },
    { id: 'porcelain', name: 'Porcelain Daylight', bg: '#f8fafc', accent: '#4f46e5' },
  ];

  const soundProfiles: { id: SoundProfile; name: string; desc: string }[] = [
    { id: 'off', name: 'Mute', desc: 'No sound effects' },
    { id: 'thock', name: 'Lubed Thock', desc: 'Deep mechanical switches' },
    { id: 'clicky', name: 'Tactile Click', desc: 'Crisp tactile blue click' },
    { id: 'typewriter', name: 'Typewriter', desc: 'Vintage mechanical clack' },
    { id: 'bubble', name: 'Bubble Pop', desc: 'Gentle marimba tone' },
    { id: 'digital', name: 'Digital Beep', desc: 'Cyber sci-fi tick' },
  ];

  const caretStyles: { id: CaretStyle; name: string }[] = [
    { id: 'line', name: 'Line' },
    { id: 'block', name: 'Block' },
    { id: 'underline', name: 'Underline' },
    { id: 'box', name: 'Box' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Preferences & Settings" maxWidth="lg">
      <div className="space-y-6 text-sm">
        {/* Appearance & Themes */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Colors</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => updatePreferences({ theme: t.id })}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                  preferences.theme === t.id
                    ? 'border-[var(--accent)] bg-[var(--bg-surface-hover)] shadow-sm'
                    : 'border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)]/60'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: t.accent }}
                />
                <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Effects */}
        <div className="pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Keystroke Audio</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {soundProfiles.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  updatePreferences({ soundProfile: s.id });
                  if (s.id !== 'off') {
                    soundManager.playKeySound(s.id, preferences.soundVolume);
                  }
                }}
                className={`p-2.5 rounded-xl border flex flex-col text-left transition-all cursor-pointer ${
                  preferences.soundProfile === s.id
                    ? 'border-[var(--accent)] bg-[var(--bg-surface-hover)]'
                    : 'border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)]/60'
                }`}
              >
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  {s.name}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  {s.desc}
                </span>
              </button>
            ))}
          </div>

          {preferences.soundProfile !== 'off' && (
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] bg-[var(--bg-surface-hover)]/50 p-2.5 rounded-xl">
              <span>Volume</span>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={preferences.soundVolume}
                onChange={(e) => updatePreferences({ soundVolume: parseFloat(e.target.value) })}
                className="w-32 accent-[var(--accent)]"
              />
            </div>
          )}
        </div>

        {/* Typography & Caret */}
        <div className="pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            <Type className="w-3.5 h-3.5" />
            <span>Typography & Caret</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Font Size */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1.5">
                Typing Font Size
              </label>
              <div className="flex items-center gap-1 bg-[var(--bg-surface-hover)] p-1 rounded-lg">
                {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updatePreferences({ fontSize: size })}
                    className={`flex-1 py-1 text-xs uppercase font-medium rounded transition-colors cursor-pointer ${
                      preferences.fontSize === size
                        ? 'bg-[var(--accent-glow)] text-[var(--accent)] font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Caret Style */}
            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-1.5">
                Caret Style
              </label>
              <div className="flex items-center gap-1 bg-[var(--bg-surface-hover)] p-1 rounded-lg">
                {caretStyles.map((cs) => (
                  <button
                    key={cs.id}
                    onClick={() => updatePreferences({ caretStyle: cs.id })}
                    className={`flex-1 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                      preferences.caretStyle === cs.id
                        ? 'bg-[var(--accent-glow)] text-[var(--accent)] font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {cs.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Behavior Toggles */}
        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Typing Behavior & HUD</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Live WPM */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface-hover)]/40 hover:bg-[var(--bg-surface-hover)] cursor-pointer">
              <span>Show Live WPM in HUD</span>
              <input
                type="checkbox"
                checked={preferences.liveWpm}
                onChange={(e) => updatePreferences({ liveWpm: e.target.checked })}
                className="w-4 h-4 accent-[var(--accent)]"
              />
            </label>

            {/* Live Accuracy */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface-hover)]/40 hover:bg-[var(--bg-surface-hover)] cursor-pointer">
              <span>Show Live Accuracy in HUD</span>
              <input
                type="checkbox"
                checked={preferences.liveAccuracy}
                onChange={(e) => updatePreferences({ liveAccuracy: e.target.checked })}
                className="w-4 h-4 accent-[var(--accent)]"
              />
            </label>

            {/* Smooth Caret */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface-hover)]/40 hover:bg-[var(--bg-surface-hover)] cursor-pointer">
              <span>Smooth Caret Animation</span>
              <input
                type="checkbox"
                checked={preferences.smoothCaret}
                onChange={(e) => updatePreferences({ smoothCaret: e.target.checked })}
                className="w-4 h-4 accent-[var(--accent)]"
              />
            </label>

            {/* Confidence Mode */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface-hover)]/40 hover:bg-[var(--bg-surface-hover)] cursor-pointer">
              <span>Confidence Mode (No backspacing)</span>
              <input
                type="checkbox"
                checked={preferences.confidenceMode}
                onChange={(e) => updatePreferences({ confidenceMode: e.target.checked })}
                className="w-4 h-4 accent-[var(--accent)]"
              />
            </label>

            {/* Stop on Error */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface-hover)]/40 hover:bg-[var(--bg-surface-hover)] cursor-pointer">
              <span>Stop on Error</span>
              <input
                type="checkbox"
                checked={preferences.stopOnError}
                onChange={(e) => updatePreferences({ stopOnError: e.target.checked })}
                className="w-4 h-4 accent-[var(--accent)]"
              />
            </label>

            {/* Show Virtual Keyboard */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface-hover)]/40 hover:bg-[var(--bg-surface-hover)] cursor-pointer">
              <span>Show Reactive Keyboard</span>
              <input
                type="checkbox"
                checked={preferences.showKeyboard}
                onChange={(e) => updatePreferences({ showKeyboard: e.target.checked })}
                className="w-4 h-4 accent-[var(--accent)]"
              />
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
};
