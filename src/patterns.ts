import type { FlagReason } from './types.js';

// Spam patterns
export const SPAM_PATTERNS = {
  // Common spam phrases
  phrases: [
    /click here/i,
    /free money/i,
    /make money fast/i,
    /guaranteed profit/i,
    /limited time offer/i,
    /act now/i,
    /no risk/i,
    /get rich quick/i,
    /work from home/i,
    /earn \$?\d+/i,
  ],

  // Excessive repetition
  repetition: /(.)\1{4,}/,

  // Excessive caps - detect high percentage of caps in text
  excessiveCaps: /\b[A-Z\s]{10,}\b/,

  // URL patterns that might be spam
  suspiciousUrls: [/bit\.ly/i, /tinyurl/i, /short\.link/i],
} as const;

// Hate speech patterns
export const HATE_SPEECH_PATTERNS = {
  slurs: [
    // Note: In a real system, this would be a comprehensive list
    // For interview purposes, using placeholder patterns
    /\b(hate|stupid|idiot|moron)\b/i,
  ],

  discriminatory: [/all \w+ are \w+/i, /\w+ people are \w+/i],
} as const;

// Harassment patterns
export const HARASSMENT_PATTERNS = {
  threats: [
    /i will \w+ you/i,
    /you should \w+ yourself/i,
    /kill yourself/i,
    /die/i,
  ],

  intimidation: [/watch your back/i, /you're dead/i, /i know where you live/i],
} as const;

// Violence patterns
export const VIOLENCE_PATTERNS = {
  explicit: [
    /kill (?!yourself)\w+/i,
    /murder \w+/i,
    /beat \w+ up/i,
    /punch \w+/i,
  ],

  weapons: [/\b(gun|knife|bomb|weapon)\b/i],
} as const;

// Adult content patterns
export const ADULT_CONTENT_PATTERNS = {
  explicit: [/\b(sex|porn|nude|naked)\b/i, /adult content/i],
} as const;

// Misinformation patterns
export const MISINFORMATION_PATTERNS = {
  conspiracy: [/conspiracy/i, /government cover/i, /fake news/i],

  medical: [/cure for \w+/i, /miracle drug/i, /doctors don't want/i],
} as const;

// Phishing patterns
export const PHISHING_PATTERNS = {
  urgency: [
    /urgent action required/i,
    /verify your account/i,
    /suspended account/i,
    /click to verify/i,
  ],

  suspicious: [
    /enter your password/i,
    /confirm your details/i,
    /update your information/i,
  ],
} as const;

// Personal information patterns
export const PERSONAL_INFO_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/,
  phone: /\b\d{3}-\d{3}-\d{4}\b/,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
} as const;

export const PATTERN_MAP: Record<FlagReason, readonly RegExp[]> = {
  spam: [
    ...SPAM_PATTERNS.phrases,
    SPAM_PATTERNS.repetition,
    SPAM_PATTERNS.excessiveCaps,
    ...SPAM_PATTERNS.suspiciousUrls,
  ],
  hate_speech: [
    ...HATE_SPEECH_PATTERNS.slurs,
    ...HATE_SPEECH_PATTERNS.discriminatory,
  ],
  harassment: [
    ...HARASSMENT_PATTERNS.threats,
    ...HARASSMENT_PATTERNS.intimidation,
  ],
  violence: [...VIOLENCE_PATTERNS.explicit, ...VIOLENCE_PATTERNS.weapons],
  adult_content: [...ADULT_CONTENT_PATTERNS.explicit],
  misinformation: [
    ...MISINFORMATION_PATTERNS.conspiracy,
    ...MISINFORMATION_PATTERNS.medical,
  ],
  phishing: [...PHISHING_PATTERNS.urgency, ...PHISHING_PATTERNS.suspicious],
  copyright_violation: [],
  malware: [],
  inappropriate_language: [...HATE_SPEECH_PATTERNS.slurs],
  personal_information: [
    PERSONAL_INFO_PATTERNS.ssn,
    PERSONAL_INFO_PATTERNS.phone,
    PERSONAL_INFO_PATTERNS.email,
    PERSONAL_INFO_PATTERNS.creditCard,
  ],
} as const;
