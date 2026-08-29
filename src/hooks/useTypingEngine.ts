import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
  TestConfig,
  TypedWordState,
  TypingResult,
  WpmSample,
  UserPreferences,
} from '../types';
import { generateTestText } from '../data/words';
import {
  calculateWPM,
  calculateRawWPM,
  calculateAccuracy,
  calculateConsistency,
} from '../utils/metrics';
import { getLocalTodayDateString } from '../utils/streak';
import { soundManager } from '../utils/audio';

export type EngineStatus = 'idle' | 'running' | 'finished';

interface UseTypingEngineProps {
  config: TestConfig;
  preferences: UserPreferences;
  onTestComplete?: (result: TypingResult) => void;
}

export function useTypingEngine({
  config,
  preferences,
  onTestComplete,
}: UseTypingEngineProps) {
  const [status, setStatus] = useState<EngineStatus>('idle');
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentTypedWord, setCurrentTypedWord] = useState('');
  
  // History of completed word states
  const [wordStates, setWordStates] = useState<TypedWordState[]>([]);
  
  // Time and metrics
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    return config.mode === 'time' ? (config.customTime || config.timeDuration) : 0;
  });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveRawWpm, setLiveRawWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [errorsCount, setErrorsCount] = useState(0);
  const [backspacesCount, setBackspacesCount] = useState(0);
  
  // Samples for the result graph
  const [wpmSamples, setWpmSamples] = useState<WpmSample[]>([]);
  const keystrokeTimestampsRef = useRef<number[]>([]);
  
  // Metrics ref to prevent stale closures in timer interval
  const metricsRef = useRef({
    correctChars: 0,
    incorrectChars: 0,
    extraChars: 0,
    totalAttempted: 0,
    errorsCount: 0,
    backspaces: 0,
    elapsed: 0,
  });

  const timerIntervalRef = useRef<number | null>(null);
  const sampleIntervalRef = useRef<number | null>(null);
  const testStartTimeRef = useRef<number | null>(null);
  const isFinishedRef = useRef(false);

  // Initialize or reset test
  const resetTest = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (sampleIntervalRef.current) clearInterval(sampleIntervalRef.current);

    isFinishedRef.current = false;
    testStartTimeRef.current = null;
    keystrokeTimestampsRef.current = [];

    const targetWordsCount =
      config.mode === 'words'
        ? (config.customWordCount || config.wordCount)
        : config.mode === 'quote'
        ? 60
        : Math.max(100, (config.timeDuration || 30) * 4);

    const generated = generateTestText(config, targetWordsCount);
    setWords(generated);
    setCurrentWordIndex(0);
    setCurrentTypedWord('');
    setWordStates([]);

    const initialTime =
      config.mode === 'time' ? (config.customTime || config.timeDuration) : 0;
    setTimeRemaining(initialTime);
    setElapsedSeconds(0);
    setLiveWpm(0);
    setLiveRawWpm(0);
    setLiveAccuracy(100);
    setErrorsCount(0);
    setBackspacesCount(0);
    setWpmSamples([]);

    metricsRef.current = {
      correctChars: 0,
      incorrectChars: 0,
      extraChars: 0,
      totalAttempted: 0,
      errorsCount: 0,
      backspaces: 0,
      elapsed: 0,
    };

    setStatus('idle');
  }, [config]);

  useEffect(() => {
    resetTest();
  }, [resetTest]);

  // Finish test callback
  const completeTest = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setStatus('finished');

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (sampleIntervalRef.current) clearInterval(sampleIntervalRef.current);

    const m = metricsRef.current;
    const finalElapsed = Math.max(1, m.elapsed);
    const finalWpm = calculateWPM(m.correctChars, finalElapsed);
    const finalRawWpm = calculateRawWPM(m.totalAttempted, finalElapsed);
    const finalAcc = calculateAccuracy(m.correctChars, m.incorrectChars, m.extraChars);
    const finalConsistency = calculateConsistency(keystrokeTimestampsRef.current);

    // Play completion chime
    soundManager.playCompleteSound(preferences.soundVolume);

    const finalResult: TypingResult = {
      id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAcc,
      consistency: finalConsistency,
      duration: finalElapsed,
      targetDuration: config.mode === 'time' ? (config.customTime || config.timeDuration) : null,
      wordCount: currentWordIndex + 1,
      targetWordCount: config.mode === 'words' ? (config.customWordCount || config.wordCount) : null,
      mode: config.mode,
      language: config.language,
      punctuation: config.punctuation,
      numbers: config.numbers,
      errors: m.errorsCount,
      correctCharacters: m.correctChars,
      incorrectCharacters: m.incorrectChars,
      extraCharacters: m.extraChars,
      totalCharacters: m.totalAttempted,
      backspaces: m.backspaces,
      completedAt: new Date().toISOString(),
      activityDate: getLocalTodayDateString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      wpmSamples: wpmSamples.length > 0 ? wpmSamples : [
        {
          timestamp: Date.now(),
          second: finalElapsed,
          wpm: finalWpm,
          rawWpm: finalRawWpm,
          errors: m.errorsCount,
        }
      ],
      keystrokeTimestamps: keystrokeTimestampsRef.current,
    };

    if (onTestComplete) {
      onTestComplete(finalResult);
    }
  }, [
    config,
    currentWordIndex,
    onTestComplete,
    preferences.soundVolume,
    wpmSamples,
  ]);

  // Start test on first key press
  const startTest = useCallback(() => {
    setStatus('running');
    testStartTimeRef.current = Date.now();

    // Timer ticker
    timerIntervalRef.current = window.setInterval(() => {
      if (!testStartTimeRef.current || isFinishedRef.current) return;
      const secondsPassed = (Date.now() - testStartTimeRef.current) / 1000;
      metricsRef.current.elapsed = secondsPassed;
      setElapsedSeconds(Math.floor(secondsPassed));

      if (config.mode === 'time') {
        const totalDuration = config.customTime || config.timeDuration;
        const remain = Math.max(0, totalDuration - secondsPassed);
        setTimeRemaining(Math.ceil(remain));
        if (remain <= 0) {
          completeTest();
        }
      } else {
        setTimeRemaining(Math.floor(secondsPassed));
      }
    }, 200);

    // Sampler ticker for chart (every 1 second)
    sampleIntervalRef.current = window.setInterval(() => {
      if (!testStartTimeRef.current || isFinishedRef.current) return;
      const elapsed = Math.max(1, metricsRef.current.elapsed);
      const curWpm = calculateWPM(metricsRef.current.correctChars, elapsed);
      const curRaw = calculateRawWPM(metricsRef.current.totalAttempted, elapsed);
      const curAcc = calculateAccuracy(
        metricsRef.current.correctChars,
        metricsRef.current.incorrectChars,
        metricsRef.current.extraChars
      );

      setLiveWpm(curWpm);
      setLiveRawWpm(curRaw);
      setLiveAccuracy(curAcc);

      setWpmSamples((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          second: Math.round(elapsed),
          wpm: curWpm,
          rawWpm: curRaw,
          errors: metricsRef.current.errorsCount,
        },
      ]);
    }, 1000);
  }, [completeTest, config]);

  // Handle keystroke processing
  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent | KeyboardEvent) => {
      if (status === 'finished') return;

      const { key, ctrlKey, metaKey, altKey } = e;

      // Quick keyboard shortcuts
      if (key === 'Tab' || (key === 'Escape' && status === 'running')) {
        e.preventDefault();
        resetTest();
        return;
      }

      // Ignore modifier combinations (except Ctrl+Backspace)
      if ((ctrlKey || metaKey || altKey) && key !== 'Backspace') {
        return;
      }

      const targetWord = words[currentWordIndex] || '';

      // First valid key starts the test
      if (status === 'idle') {
        if (key.length === 1 || key === ' ') {
          startTest();
        } else {
          return;
        }
      }

      const nowTime = Date.now();
      keystrokeTimestampsRef.current.push(nowTime);

      // Handle Backspace
      if (key === 'Backspace') {
        e.preventDefault();
        if (preferences.confidenceMode) {
          // Cannot backspace in confidence mode
          return;
        }

        metricsRef.current.backspaces += 1;
        setBackspacesCount((prev) => prev + 1);

        if (ctrlKey || metaKey) {
          // Delete entire current word attempt
          setCurrentTypedWord('');
          soundManager.playKeySound(preferences.soundProfile, preferences.soundVolume);
          return;
        }

        if (currentTypedWord.length > 0) {
          setCurrentTypedWord((prev) => prev.slice(0, -1));
          soundManager.playKeySound(preferences.soundProfile, preferences.soundVolume);
        } else if (currentWordIndex > 0 && wordStates.length > 0) {
          // Move back to previous word if not completed correctly
          const prevWordState = wordStates[currentWordIndex - 1];
          if (prevWordState) {
            setCurrentWordIndex((prev) => prev - 1);
            setCurrentTypedWord(prevWordState.typedWord);
            setWordStates((prev) => prev.slice(0, -1));
          }
        }
        return;
      }

      // Handle Space (Advance word)
      if (key === ' ') {
        e.preventDefault();
        if (currentTypedWord.length === 0) return; // Ignore leading spaces

        // Validate completed word
        let wordCorrectChars = 0;
        let wordIncorrectChars = 0;
        let wordExtraChars = 0;
        const charStates = [];

        const maxLen = Math.max(targetWord.length, currentTypedWord.length);
        for (let i = 0; i < maxLen; i++) {
          const tChar = targetWord[i];
          const typedChar = currentTypedWord[i];

          if (typedChar === undefined) {
            charStates.push({ char: tChar, typed: null, isCorrect: null });
          } else if (tChar === undefined) {
            wordExtraChars += 1;
            charStates.push({ char: typedChar, typed: typedChar, isCorrect: false, isExtra: true });
          } else if (typedChar === tChar) {
            wordCorrectChars += 1;
            charStates.push({ char: tChar, typed: typedChar, isCorrect: true });
          } else {
            wordIncorrectChars += 1;
            charStates.push({ char: tChar, typed: typedChar, isCorrect: false });
          }
        }

        // Account for space key itself (+1 correct char if word was fully correct)
        const isWordFullyCorrect = currentTypedWord === targetWord;
        if (isWordFullyCorrect) {
          wordCorrectChars += 1; // space counts towards word length
        } else {
          wordIncorrectChars += 1;
          metricsRef.current.errorsCount += 1;
          setErrorsCount(metricsRef.current.errorsCount);
        }

        metricsRef.current.correctChars += wordCorrectChars;
        metricsRef.current.incorrectChars += wordIncorrectChars;
        metricsRef.current.extraChars += wordExtraChars;
        metricsRef.current.totalAttempted += (currentTypedWord.length + 1);

        setWordStates((prev) => [
          ...prev,
          {
            targetWord,
            typedWord: currentTypedWord,
            isComplete: true,
            chars: charStates,
          },
        ]);

        const nextIndex = currentWordIndex + 1;
        setCurrentWordIndex(nextIndex);
        setCurrentTypedWord('');

        soundManager.playKeySound(preferences.soundProfile, preferences.soundVolume);

        // Check if word mode test reached completion
        const targetWords = config.mode === 'words' ? (config.customWordCount || config.wordCount) : 0;
        if (config.mode === 'words' && nextIndex >= targetWords) {
          completeTest();
        } else if (config.mode === 'quote' && nextIndex >= words.length) {
          completeTest();
        }
        return;
      }

      // Handle standard character input
      if (key.length === 1) {
        e.preventDefault();

        // Check if stopOnError is enabled and user typed wrong char
        if (preferences.stopOnError) {
          const expectedChar = targetWord[currentTypedWord.length];
          if (expectedChar && key !== expectedChar) {
            soundManager.playKeySound(preferences.soundProfile, preferences.soundVolume, true);
            return;
          }
        }

        // Cap extra chars to 15 per word
        if (currentTypedWord.length > targetWord.length + 15) {
          return;
        }

        const charIdx = currentTypedWord.length;
        const expected = targetWord[charIdx];
        const isCharCorrect = expected === key;

        if (!isCharCorrect) {
          metricsRef.current.errorsCount += 1;
          setErrorsCount(metricsRef.current.errorsCount);
        }

        soundManager.playKeySound(
          preferences.soundProfile,
          preferences.soundVolume,
          !isCharCorrect
        );

        const newTyped = currentTypedWord + key;
        setCurrentTypedWord(newTyped);

        // For word-based mode, check if last word of quote/snippet completed without trailing space
        if (
          (config.mode === 'words' || config.mode === 'quote') &&
          currentWordIndex === words.length - 1 &&
          newTyped === targetWord
        ) {
          metricsRef.current.correctChars += targetWord.length;
          metricsRef.current.totalAttempted += targetWord.length;
          completeTest();
        }
      }
    },
    [
      completeTest,
      config,
      currentTypedWord,
      currentWordIndex,
      preferences,
      resetTest,
      startTest,
      status,
      wordStates,
      words,
    ]
  );

  return {
    status,
    words,
    currentWordIndex,
    currentTypedWord,
    wordStates,
    timeRemaining,
    elapsedSeconds,
    liveWpm,
    liveRawWpm,
    liveAccuracy,
    errorsCount,
    backspacesCount,
    wpmSamples,
    resetTest,
    handleKeyDown,
    startTest,
  };
}
