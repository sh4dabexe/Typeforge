import React from 'react';

const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
  ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
  ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
  ['space'],
];

interface VirtualKeyboardProps {
  activeKey?: string | null;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ activeKey }) => {
  const isKeyActive = (k: string) => {
    if (!activeKey) return false;
    if (k === 'space' && activeKey === ' ') return true;
    return activeKey.toLowerCase() === k.toLowerCase();
  };

  const getKeyWidth = (k: string) => {
    switch (k) {
      case 'space':
        return 'w-64';
      case 'backspace':
      case 'tab':
      case 'caps':
      case 'enter':
        return 'w-16';
      case 'shift':
        return 'w-20';
      default:
        return 'w-9';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] select-none opacity-80 transition-opacity hover:opacity-100 hidden sm:block">
      <div className="flex flex-col items-center gap-1.5 font-typing text-[11px]">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={`row-${rIdx}`} className="flex items-center gap-1.5">
            {row.map((k, kIdx) => {
              const active = isKeyActive(k);
              return (
                <div
                  key={`key-${rIdx}-${kIdx}`}
                  className={`h-8 ${getKeyWidth(
                    k
                  )} flex items-center justify-center rounded-md border text-[var(--text-secondary)] uppercase transition-all duration-75 ${
                    active
                      ? 'bg-[var(--accent)] text-[#121316] font-bold border-[var(--accent)] scale-95 shadow-[var(--accent-glow)]'
                      : 'bg-[var(--bg-surface-hover)]/70 border-[var(--border-subtle)]'
                  }`}
                >
                  {k === 'space' ? '___' : k}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
