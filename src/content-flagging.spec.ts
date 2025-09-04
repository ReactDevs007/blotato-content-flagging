import { describe, expect, test } from 'vitest';
import { analyzeContent, processContentFlaggingRequest } from './content-flagging.js';
import type { ContentFlaggingRequest, ContentId, UserId } from './types.js';

describe('analyzeContent', () => {
  test('returns clean result for empty content', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_1' as ContentId,
        userId: 'user_1' as UserId,
        type: 'text',
        text: '',
      },
    };

    const result = analyzeContent(request);

    expect(result).toEqual({
      isFlagged: false,
      severity: 'low',
      reasons: [],
      confidence: 0,
    });
  });

  test('detects spam content', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_2' as ContentId,
        userId: 'user_2' as UserId,
        type: 'text',
        text: 'CLICK HERE FOR FREE MONEY!!! ACT NOW!!!',
      },
    };

    const result = analyzeContent(request);

    expect(result.isFlagged).toBe(true);
    expect(result.reasons).toContain('spam');
    expect(result.confidence).toBeGreaterThan(0.3);
  });

  test('detects hate speech', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_3' as ContentId,
        userId: 'user_3' as UserId,
        type: 'text',
        text: 'All people are stupid and I hate them',
      },
    };

    const result = analyzeContent(request);

    expect(result.isFlagged).toBe(true);
    expect(result.reasons).toContain('hate_speech');
    expect(result.severity).toBe('high');
  });

  test('detects harassment', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_4' as ContentId,
        userId: 'user_4' as UserId,
        type: 'text',
        text: 'You should kill yourself',
      },
    };

    const result = analyzeContent(request);

    expect(result.isFlagged).toBe(true);
    expect(result.reasons).toContain('harassment');
    expect(result.severity).toBe('high');
  });

  test('detects violence', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_5' as ContentId,
        userId: 'user_5' as UserId,
        type: 'text',
        text: 'I will kill you with my gun',
      },
    };

    const result = analyzeContent(request);

    expect(result.isFlagged).toBe(true);
    expect(result.reasons).toContain('violence');
    expect(result.severity).toBe('critical');
  });

  test('detects personal information', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_6' as ContentId,
        userId: 'user_6' as UserId,
        type: 'text',
        text: 'My SSN is 123-45-6789 and my phone is 555-123-4567',
      },
    };

    const result = analyzeContent(request);

    expect(result.isFlagged).toBe(true);
    expect(result.reasons).toContain('personal_information');
    expect(result.severity).toBe('high');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  test('detects phishing attempts', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_7' as ContentId,
        userId: 'user_7' as UserId,
        type: 'text',
        text: 'Urgent action required! Verify your account now or it will be suspended!',
      },
    };

    const result = analyzeContent(request);

    expect(result.isFlagged).toBe(true);
    expect(result.reasons).toContain('phishing');
    expect(result.severity).toBe('high');
  });

  test('detects adult content', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_8' as ContentId,
        userId: 'user_8' as UserId,
        type: 'text',
        text: 'Check out this adult content and porn',
      },
    };

    const result = analyzeContent(request);

    expect(result.isFlagged).toBe(true);
    expect(result.reasons).toContain('adult_content');
    expect(result.severity).toBe('medium');
  });

  test('detects misinformation', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_9' as ContentId,
        userId: 'user_9' as UserId,
        type: 'text',
        text: 'This conspiracy theory about government cover-up is real',
      },
    };

    const result = analyzeContent(request);

    expect(result.isFlagged).toBe(true);
    expect(result.reasons).toContain('misinformation');
    expect(result.severity).toBe('medium');
  });

  test('handles multiple flag reasons', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_10' as ContentId,
        userId: 'user_10' as UserId,
        type: 'text',
        text: 'CLICK HERE FOR FREE MONEY!!! You should kill yourself!!!',
      },
    };

    const result = analyzeContent(request);

    expect(result.isFlagged).toBe(true);
    expect(result.reasons).toContain('spam');
    expect(result.reasons).toContain('harassment');
    expect(result.reasons.length).toBeGreaterThan(1);
    expect(result.confidence).toBeGreaterThan(0.4);
  });

  test('applies context adjustments for repeat offenders', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_11' as ContentId,
        userId: 'user_11' as UserId,
        type: 'text',
        text: 'This is borderline spam content',
      },
      context: {
        previousFlags: 5,
      },
    };

    const result = analyzeContent(request);

    expect(result.confidence).toBeGreaterThan(0.3);
  });

  test('applies platform-specific adjustments', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_12' as ContentId,
        userId: 'user_12' as UserId,
        type: 'text',
        text: 'This is borderline content',
      },
      context: {
        platform: 'twitter',
      },
    };

    const result = analyzeContent(request);

    // Should have slightly higher confidence due to platform adjustment
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('applies audience-specific adjustments', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_13' as ContentId,
        userId: 'user_13' as UserId,
        type: 'text',
        text: 'This is borderline content',
      },
      context: {
        audience: 'children',
      },
    };

    const result = analyzeContent(request);

    // Should have higher confidence for children's content
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('handles URL content', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_14' as ContentId,
        userId: 'user_14' as UserId,
        type: 'link',
        url: 'https://bit.ly/suspicious-link',
      },
    };

    const result = analyzeContent(request);

    expect(result.isFlagged).toBe(true);
    expect(result.reasons).toContain('spam');
  });

  test('returns appropriate severity levels', () => {
    const testCases = [
      { text: 'spam content', expectedSeverity: 'low' },
      { text: 'hate speech content', expectedSeverity: 'high' },
      { text: 'violence with gun', expectedSeverity: 'critical' },
    ];

    for (const testCase of testCases) {
      const request: ContentFlaggingRequest = {
        content: {
          id: 'content_test' as ContentId,
          userId: 'user_test' as UserId,
          type: 'text',
          text: testCase.text,
        },
      };

      const result = analyzeContent(request);
      expect(result.severity).toBe(testCase.expectedSeverity);
    }
  });
});

describe('processContentFlaggingRequest', () => {
  test('returns complete response with metadata', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_15' as ContentId,
        userId: 'user_15' as UserId,
        type: 'text',
        text: 'Clean content that should pass',
      },
    };

    const response = processContentFlaggingRequest(request);

    expect(response).toMatchObject({
      requestId: expect.stringMatching(/^req_\d+_[a-z0-9]+$/),
      result: expect.objectContaining({
        isFlagged: false,
        severity: 'low',
        reasons: [],
        confidence: 0,
      }),
      processingTimeMs: expect.any(Number),
      timestamp: expect.any(Date),
    });

    expect(response.processingTimeMs).toBeGreaterThan(0);
    expect(response.processingTimeMs).toBeLessThan(1000); // Should be fast
  });

  test('generates unique request IDs', () => {
    const request: ContentFlaggingRequest = {
      content: {
        id: 'content_16' as ContentId,
        userId: 'user_16' as UserId,
        type: 'text',
        text: 'Test content',
      },
    };

    const response1 = processContentFlaggingRequest(request);
    const response2 = processContentFlaggingRequest(request);

    expect(response1.requestId).not.toBe(response2.requestId);
  });
});
