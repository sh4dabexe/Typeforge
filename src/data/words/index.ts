import {
  englishEasyWords,
  englishNormalWords,
  englishHardWords,
  programmingKeywords,
  famousQuotes,
} from './english';
import { spanishWords, frenchWords, germanWords, hindiWords } from './otherLanguages';
import { TestConfig } from '../../types';

export function getRandomWordList(config: TestConfig): string[] {
  if (config.mode === 'code') {
    return programmingKeywords;
  }

  switch (config.language) {
    case 'spanish':
      return spanishWords;
    case 'french':
      return frenchWords;
    case 'german':
      return germanWords;
    case 'hindi':
      return hindiWords;
    case 'english':
    default:
      if (config.difficulty === 'easy') return englishEasyWords;
      if (config.difficulty === 'hard') return englishHardWords;
      return englishNormalWords;
  }
}

export function generateTestText(config: TestConfig, countNeeded: number = 80): string[] {
  if (config.mode === 'custom' && config.customText && config.customText.trim().length > 0) {
    return config.customText.trim().split(/\s+/);
  }

  if (config.mode === 'quote') {
    const quote = famousQuotes[Math.floor(Math.random() * famousQuotes.length)];
    return quote.text.split(' ');
  }

  const pool = getRandomWordList(config);
  const result: string[] = [];

  let lastWord = '';
  for (let i = 0; i < countNeeded; i++) {
    let word = pool[Math.floor(Math.random() * pool.length)];
    // Avoid immediate duplicate word
    while (word === lastWord && pool.length > 1) {
      word = pool[Math.floor(Math.random() * pool.length)];
    }
    lastWord = word;

    // Apply numbers if enabled (approx 10% chance on random spots)
    if (config.numbers && i > 0 && Math.random() < 0.12) {
      const num = Math.floor(Math.random() * 999) + 1;
      result.push(num.toString());
    }

    // Apply punctuation if enabled (approx 15% chance)
    if (config.punctuation && Math.random() < 0.18) {
      const puncTypes = ['.', ',', ';', '!', '?', '-', '"', "'"];
      const chosen = puncTypes[Math.floor(Math.random() * puncTypes.length)];
      if (chosen === '"' || chosen === "'") {
        word = `${chosen}${word}${chosen}`;
      } else {
        word = `${word}${chosen}`;
      }
      // Capitalize next word if period/question/exclamation
      if (['.', '!', '?'].includes(chosen) && i < countNeeded - 1) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
    }

    result.push(word);
  }

  return result;
}
