import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { RotateCcw, AlertCircle } from 'lucide-react';
import {
  TestConfig,
  TypedWordState,
  UserPreferences,
} from '../../types';
import { EngineStatus } from '../../hooks/useTypingEngine';

interface TypingAreaProps {
  status: EngineStatus;
  words: string[];
  currentWordIndex: number;
  currentTypedWord: string;
  wordStates: TypedWordState[];
  timeRemaining: number;
  liveWpm: number;
  liveAccuracy: number;
  errorsCount: number;
  preferences: UserPreferences;
  config: TestConfig;
  onKeyDown: (e: React.KeyboardEvent | KeyboardEvent) => void;
  onReset: () => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  status,
  words,
  currentWordIndex,
  currentTypedWord,
  wordStates,
  timeRemaining,
  liveWpm,
  liveAccuracy,
  errorsCount,
  preferences,
  config,
  onKeyDown,
  onReset,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);
  const [caretPos, setCaretPos] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [isFocused, setIsFocused] = useState(true);

  // Focus hidden input on click and mount
  useEffect(() => {
    const focusInput = () => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
        setIsFocused(true);
      }
    };
    focusInput();
    window.addEventListener('click', focusInput);
    return () => window.removeEventListener('click', focusInput);
  }, []);

  // Update caret position whenever current word or typed word changes
  useLayoutEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const charRect = activeCharRef.current.getBoundingClientRect();

      setCaretPos({
        left: charRect.left - containerRect.left,
        top: charRect.top - containerRect.top,
        width: Math.max(2, charRect.width),
        height: charRect.height,
      });

      // Smooth scroll container to keep active word visible
      const wordEl = activeCharRef.current.closest('.word-token') as HTMLElement;
      if (wordEl) {
        const wordTop = wordEl.offsetTop;
        const containerScroll = containerRef.current.scrollTop;
        if (wordTop > containerScroll + 120) {
          containerRef.current.scrollTo({
            top: wordTop - 40,
            behavior: 'smooth',
          });
        } else if (wordTop < containerScroll) {
          containerRef.current.scrollTo({
            top: Math.max(0, wordTop - 40),
            behavior: 'smooth',
          });
        }
      }
    }
  }, [currentWordIndex, currentTypedWord, words]);

  const fontSizeClasses = {
    sm: 'text-lg leading-relaxed',
    md: 'text-xl leading-relaxed',
    lg: 'text-2xl sm:text-3xl leading-relaxed',
    xl: 'text-3xl sm:text-4xl leading-loose',
  };

  const getCaretStyles = () => {
    if (!caretPos) return { display: 'none' };
    const transition = preferences.smoothCaret
      ? 'all 75ms cubic-bezier(0.2, 0, 0, 1)'
      : 'none';

    switch (preferences.caretStyle) {
      case 'block':
        return {
          left: `${caretPos.left}px`,
          top: `${caretPos.top}px`,
          width: `${caretPos.width}px`,
          height: `${caretPos.height}px`,
          backgroundColor: 'var(--caret-color)',
          opacity: 0.35,
          transition,
        };
      case 'underline':
        return {
          left: `${caretPos.left}px`,
          top: `${caretPos.top + caretPos.height - 3}px`,
          width: `${caretPos.width}px`,
          height: '3px',
          backgroundColor: 'var(--caret-color)',
          transition,
        };
      case 'box':
        return {
          left: `${caretPos.left}px`,
          top: `${caretPos.top}px`,
          width: `${caretPos.width}px`,
          height: `${caretPos.height}px`,
          border: '2px solid var(--caret-color)',
          backgroundColor: 'transparent',
          transition,
        };
      case 'line':
      default:
        return {
          left: `${caretPos.left}px`,
          top: `${caretPos.top + 2}px`,
          width: '2.5px',
          height: `${caretPos.height - 4}px`,
          backgroundColor: 'var(--caret-color)',
          borderRadius: '1px',
          transition,
        };
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none outline-none">
      {/* Hidden input for capturing soft keyboards on mobile and keyboard events */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="absolute -top-9999px left-0 opacity-0 pointer-events-none"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => onKeyDown(e)}
        tabIndex={0}
      />

      {/* Live HUD (Timer, Live WPM, Live Accuracy) */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 px-2 text-sm font-typing">
        {/* Timer or Word count */}
        <div className="flex items-center gap-2">
          {config.mode === 'time' ? (
            <div className="text-3xl sm:text-4xl font-black text-[var(--accent)] transition-all">
              {timeRemaining}
              <span className="text-sm font-normal text-[var(--text-muted)] ml-1">s</span>
            </div>
          ) : config.mode === 'words' ? (
            <div className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">
              {currentWordIndex} / {config.customWordCount || config.wordCount}
              <span className="text-xs font-normal text-[var(--text-muted)] ml-1.5">words</span>
            </div>
          ) : (
            <div className="text-2xl font-bold text-[var(--accent)] capitalize">
              {config.mode}
            </div>
          )}
        </div>

        {/* Live WPM & Accuracy indicators */}
        <div className="flex items-center gap-6 text-[var(--text-secondary)]">
          {preferences.liveWpm && status === 'running' && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-[var(--text-muted)] uppercase">WPM</span>
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {liveWpm}
              </span>
            </div>
          )}

          {preferences.liveAccuracy && status === 'running' && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-[var(--text-muted)] uppercase">ACC</span>
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {liveAccuracy}%
              </span>
            </div>
          )}

          {errorsCount > 0 && status === 'running' && (
            <div className="flex items-center gap-1 text-red-400 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorsCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Typing Words Area */}
      <div
        ref={containerRef}
        onClick={() => hiddenInputRef.current?.focus()}
        className={`relative w-full max-w-4xl min-h-[160px] max-h-[220px] overflow-hidden py-2 px-1 cursor-text font-typing ${
          fontSizeClasses[preferences.fontSize]
        } tracking-wide transition-opacity ${
          isFocused ? 'opacity-100' : 'opacity-60'
        }`}
      >
        {/* Animated Caret */}
        {isFocused && (
          <div
            className={`absolute z-10 pointer-events-none ${
              status === 'idle' ? 'caret-pulse' : ''
            }`}
            style={getCaretStyles()}
          />
        )}

        {/* Word Stream */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          {words.map((targetWord, wordIdx) => {
            const isCompletedWord = wordIdx < currentWordIndex;
            const isCurrentWord = wordIdx === currentWordIndex;
            const isFutureWord = wordIdx > currentWordIndex;

            if (isCompletedWord) {
              const state = wordStates[wordIdx];
              return (
                <span
                  key={`word-${wordIdx}`}
                  className="word-token inline-flex items-baseline"
                >
                  {state?.chars.map((charObj, cIdx) => (
                    <span
                      key={`w-${wordIdx}-c-${cIdx}`}
                      className={
                        charObj.isExtra
                          ? 'text-[var(--char-extra)] bg-red-500/15 line-through'
                          : charObj.isCorrect
                          ? 'text-[var(--char-correct)]'
                          : 'text-[var(--char-incorrect)] underline decoration-red-500 decoration-2'
                      }
                    >
                      {charObj.char}
                    </span>
                  ))}
                </span>
              );
            }

            if (isCurrentWord) {
              const maxChars = Math.max(targetWord.length, currentTypedWord.length);
              const charsArray = [];

              for (let cIdx = 0; cIdx < maxChars; cIdx++) {
                const targetChar = targetWord[cIdx];
                const typedChar = currentTypedWord[cIdx];
                const isCaretHere = cIdx === currentTypedWord.length;

                let charClass = 'text-[var(--char-untyped)]';
                let displayChar = targetChar;

                if (typedChar !== undefined) {
                  if (targetChar === undefined) {
                    // Extra character typed by user
                    charClass = 'text-[var(--char-extra)] bg-red-500/20';
                    displayChar = typedChar;
                  } else if (typedChar === targetChar) {
                    charClass = 'text-[var(--char-correct)]';
                  } else {
                    charClass = 'text-[var(--char-incorrect)] underline decoration-red-500 decoration-2';
                  }
                }

                charsArray.push(
                  <span
                    key={`cur-c-${cIdx}`}
                    ref={isCaretHere ? activeCharRef : null}
                    className={`inline-block ${charClass}`}
                  >
                    {displayChar}
                  </span>
                );
              }

              // In case caret is at the very end of word + extra spaces
              if (currentTypedWord.length >= maxChars) {
                charsArray.push(
                  <span
                    key="cur-c-end"
                    ref={activeCharRef}
                    className="inline-block w-1"
                  >
                    &nbsp;
                  </span>
                );
              }

              return (
                <span
                  key={`word-${wordIdx}`}
                  className="word-token inline-flex items-baseline bg-[var(--bg-surface)]/60 px-1 py-0.5 rounded"
                >
                  {charsArray}
                </span>
              );
            }

            if (isFutureWord) {
              return (
                <span
                  key={`word-${wordIdx}`}
                  className="word-token inline-flex items-baseline text-[var(--char-untyped)]"
                >
                  {targetWord}
                </span>
              );
            }

            return null;
          })}
        </div>

        {/* Unfocused Click Prompt */}
        {!isFocused && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-lg">
            <div className="text-sm font-medium text-[var(--text-primary)] px-4 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg animate-pulse flex items-center gap-2">
              <span>Click or tap to focus</span>
            </div>
          </div>
        )}
      </div>

      {/* Restart Button */}
      <div className="mt-8 flex items-center justify-center">
        <button
          onClick={() => {
            onReset();
            hiddenInputRef.current?.focus();
          }}
          title="Restart Test (Tab)"
          className="p-2.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all cursor-pointer group"
        >
          <RotateCcw className="w-5 h-5 group-hover:rotate-[-45deg] transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
};
