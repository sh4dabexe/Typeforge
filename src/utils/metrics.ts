/**
 * Typing Metrics Calculations for TypeForge
 * 
 * Standard Typing Formula:
 * 1 Word = 5 characters (including spaces and punctuation)
 * Net WPM = (Correct Characters / 5) / Elapsed Minutes
 * Raw WPM = (Total Typed Characters / 5) / Elapsed Minutes
 * Accuracy % = (Correct Characters / Total Typed Characters) * 100
 */

export interface MetricCalculationInput {
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  elapsedSeconds: number;
  keystrokeTimestamps?: number[];
}

export function calculateWPM(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || correctChars <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const words = correctChars / 5;
  const wpm = words / minutes;
  return Math.round(wpm);
}

export function calculateRawWPM(totalTypedChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || totalTypedChars <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const words = totalTypedChars / 5;
  const rawWpm = words / minutes;
  return Math.round(rawWpm);
}

export function calculateAccuracy(
  correctChars: number,
  incorrectChars: number,
  extraChars: number
): number {
  const totalAttempted = correctChars + incorrectChars + extraChars;
  if (totalAttempted <= 0) return 100;
  const accuracy = (correctChars / totalAttempted) * 100;
  return Math.max(0, Math.min(100, parseFloat(accuracy.toFixed(1))));
}

/**
 * Calculates consistency as a percentage (100% being perfectly uniform typing cadence)
 * based on standard deviation of keystroke intervals.
 */
export function calculateConsistency(keystrokeTimestamps?: number[]): number {
  if (!keystrokeTimestamps || keystrokeTimestamps.length < 5) return 95;

  const intervals: number[] = [];
  for (let i = 1; i < keystrokeTimestamps.length; i++) {
    const diff = keystrokeTimestamps[i] - keystrokeTimestamps[i - 1];
    // Filter out huge pauses (e.g. paused tab > 2 sec)
    if (diff > 20 && diff < 2000) {
      intervals.push(diff);
    }
  }

  if (intervals.length < 4) return 92;

  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of variation
  const cv = mean > 0 ? stdDev / mean : 0;
  // Map cv (e.g., 0.2 to 0.8) to 100% - 50%
  const consistencyScore = Math.max(40, Math.min(99, Math.round(100 - cv * 60)));
  return consistencyScore;
}
