import { describe, expect, test } from 'vitest';
import { PATTERN_MAP } from './patterns.js';

describe('PATTERN_MAP', () => {
  test('contains patterns for all flag reasons', () => {
    const expectedReasons = [
      'spam',
      'hate_speech',
      'harassment',
      'violence',
      'adult_content',
      'misinformation',
      'phishing',
      'copyright_violation',
      'malware',
      'inappropriate_language',
      'personal_information',
    ];

    for (const reason of expectedReasons) {
      expect(PATTERN_MAP).toHaveProperty(reason);
      expect(
        Array.isArray(PATTERN_MAP[reason as keyof typeof PATTERN_MAP])
      ).toBe(true);
    }
  });

  test('spam patterns detect common spam phrases', () => {
    const spamPatterns = PATTERN_MAP.spam;
    const spamTexts = [
      'Click here for free money!',
      'Make money fast with this offer',
      'Limited time offer - act now!',
      'Get rich quick scheme',
      'Work from home opportunity',
    ];

    for (const text of spamTexts) {
      const hasMatch = spamPatterns.some((pattern) => pattern.test(text));
      expect(hasMatch).toBe(true);
    }
  });

  test('spam patterns detect excessive repetition', () => {
    const spamPatterns = PATTERN_MAP.spam;
    const repetitiveText = 'aaaaaaaaaa'; // 10+ repeated characters

    const hasMatch = spamPatterns.some((pattern) =>
      pattern.test(repetitiveText)
    );
    expect(hasMatch).toBe(true);
  });

  test('spam patterns detect excessive caps', () => {
    const spamPatterns = PATTERN_MAP.spam;
    const capsText = 'THIS IS ALL CAPS TEXT';

    const hasMatch = spamPatterns.some((pattern) => pattern.test(capsText));
    expect(hasMatch).toBe(true);
  });

  test('hate speech patterns detect discriminatory language', () => {
    const hatePatterns = PATTERN_MAP.hate_speech;
    const hateTexts = ['All people are stupid', 'I hate everyone'];

    for (const text of hateTexts) {
      const hasMatch = hatePatterns.some((pattern) => pattern.test(text));
      expect(hasMatch).toBe(true);
    }
  });

  test('harassment patterns detect threats', () => {
    const harassmentPatterns = PATTERN_MAP.harassment;
    const threatTexts = [
      'You should kill yourself',
      'I will hurt you',
      'Watch your back',
    ];

    for (const text of threatTexts) {
      const hasMatch = harassmentPatterns.some((pattern) => pattern.test(text));
      expect(hasMatch).toBe(true);
    }
  });

  test('violence patterns detect explicit violence', () => {
    const violencePatterns = PATTERN_MAP.violence;
    const violenceTexts = ['I will kill you', 'Beat them up', 'Use a gun'];

    for (const text of violenceTexts) {
      const hasMatch = violencePatterns.some((pattern) => pattern.test(text));
      expect(hasMatch).toBe(true);
    }
  });

  test('adult content patterns detect explicit content', () => {
    const adultPatterns = PATTERN_MAP.adult_content;
    const adultTexts = ['Adult content here', 'Sex and porn'];

    for (const text of adultTexts) {
      const hasMatch = adultPatterns.some((pattern) => pattern.test(text));
      expect(hasMatch).toBe(true);
    }
  });

  test('misinformation patterns detect conspiracy theories', () => {
    const misinfoPatterns = PATTERN_MAP.misinformation;
    const misinfoTexts = [
      'Government conspiracy',
      'Fake news alert',
      'Miracle cure for everything',
    ];

    for (const text of misinfoTexts) {
      const hasMatch = misinfoPatterns.some((pattern) => pattern.test(text));
      expect(hasMatch).toBe(true);
    }
  });

  test('phishing patterns detect urgency tactics', () => {
    const phishingPatterns = PATTERN_MAP.phishing;
    const phishingTexts = [
      'Urgent action required',
      'Verify your account now',
      'Click to verify or be suspended',
    ];

    for (const text of phishingTexts) {
      const hasMatch = phishingPatterns.some((pattern) => pattern.test(text));
      expect(hasMatch).toBe(true);
    }
  });

  test('personal information patterns detect sensitive data', () => {
    const personalInfoPatterns = PATTERN_MAP.personal_information;
    const personalInfoTexts = [
      '123-45-6789', // SSN
      '555-123-4567', // Phone
      'test@example.com', // Email
      '1234 5678 9012 3456', // Credit card
    ];

    for (const text of personalInfoTexts) {
      const hasMatch = personalInfoPatterns.some((pattern) =>
        pattern.test(text)
      );
      expect(hasMatch).toBe(true);
    }
  });

  test('patterns are case insensitive', () => {
    const spamPatterns = PATTERN_MAP.spam;
    const testTexts = ['CLICK HERE', 'click here', 'Click Here', 'cLiCk HeRe'];

    for (const text of testTexts) {
      const hasMatch = spamPatterns.some((pattern) => pattern.test(text));
      expect(hasMatch).toBe(true);
    }
  });

  test('patterns do not match clean content', () => {
    const allPatterns = Object.values(PATTERN_MAP).flat();
    const cleanTexts = [
      'Hello, how are you today?',
      'This is a normal conversation',
      'I love programming and learning new things',
      'The weather is nice today',
      'Thank you for your help',
    ];

    for (const text of cleanTexts) {
      const hasMatch = allPatterns.some((pattern) => pattern.test(text));
      expect(hasMatch).toBe(false);
    }
  });
});
