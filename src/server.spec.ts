import { describe, expect, test, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from './server.js';

describe('Content Flagging API', () => {
  test('health check endpoint returns healthy status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'healthy',
      timestamp: expect.any(String),
      version: '1.0.0',
    });
  });

  test('flag-reasons endpoint returns supported reasons', async () => {
    const response = await request(app)
      .get('/api/flag-reasons')
      .expect(200);

    expect(response.body).toMatchObject({
      supportedReasons: expect.arrayContaining([
        'spam',
        'hate_speech',
        'harassment',
        'violence',
        'adult_content',
        'misinformation',
        'phishing',
        'malware',
        'inappropriate_language',
        'personal_information',
      ]),
      description: expect.any(String),
    });
  });

  test('api docs endpoint returns documentation', async () => {
    const response = await request(app)
      .get('/api/docs')
      .expect(200);

    expect(response.body).toMatchObject({
      title: 'Content Flagging API',
      version: '1.0.0',
      description: expect.any(String),
      endpoints: expect.arrayContaining([
        expect.objectContaining({
          method: 'POST',
          path: '/api/flag-content',
        }),
        expect.objectContaining({
          method: 'GET',
          path: '/health',
        }),
      ]),
    });
  });

  describe('POST /api/flag-content', () => {
    test('flags spam content successfully', async () => {
      const requestBody = {
        content: {
          id: 'content_1',
          userId: 'user_1',
          type: 'text',
          text: 'CLICK HERE FOR FREE MONEY!!!',
        },
      };

      const response = await request(app)
        .post('/api/flag-content')
        .send(requestBody)
        .expect(200);

      expect(response.body).toMatchObject({
        requestId: expect.stringMatching(/^req_\d+_[a-z0-9]+$/),
        result: {
          isFlagged: true,
          severity: expect.any(String),
          reasons: expect.arrayContaining(['spam']),
          confidence: expect.any(Number),
        },
        processingTimeMs: expect.any(Number),
        timestamp: expect.any(String),
      });
    });

    test('flags hate speech content successfully', async () => {
      const requestBody = {
        content: {
          id: 'content_2',
          userId: 'user_2',
          type: 'text',
          text: 'All people are stupid and I hate them',
        },
      };

      const response = await request(app)
        .post('/api/flag-content')
        .send(requestBody)
        .expect(200);

      expect(response.body.result.isFlagged).toBe(true);
      expect(response.body.result.reasons).toContain('hate_speech');
      expect(response.body.result.severity).toBe('high');
    });

    test('flags violence content successfully', async () => {
      const requestBody = {
        content: {
          id: 'content_3',
          userId: 'user_3',
          type: 'text',
          text: 'I will kill you with my gun',
        },
      };

      const response = await request(app)
        .post('/api/flag-content')
        .send(requestBody)
        .expect(200);

      expect(response.body.result.isFlagged).toBe(true);
      expect(response.body.result.reasons).toContain('violence');
      expect(response.body.result.severity).toBe('critical');
    });

    test('flags personal information successfully', async () => {
      const requestBody = {
        content: {
          id: 'content_4',
          userId: 'user_4',
          type: 'text',
          text: 'My SSN is 123-45-6789',
        },
      };

      const response = await request(app)
        .post('/api/flag-content')
        .send(requestBody)
        .expect(200);

      expect(response.body.result.isFlagged).toBe(true);
      expect(response.body.result.reasons).toContain('personal_information');
      expect(response.body.result.severity).toBe('high');
    });

    test('handles clean content successfully', async () => {
      const requestBody = {
        content: {
          id: 'content_5',
          userId: 'user_5',
          type: 'text',
          text: 'Hello, how are you today? This is a normal conversation.',
        },
      };

      const response = await request(app)
        .post('/api/flag-content')
        .send(requestBody)
        .expect(200);

      expect(response.body.result.isFlagged).toBe(false);
      expect(response.body.result.reasons).toHaveLength(0);
      expect(response.body.result.confidence).toBe(0);
    });

    test('handles URL content successfully', async () => {
      const requestBody = {
        content: {
          id: 'content_6',
          userId: 'user_6',
          type: 'link',
          url: 'https://bit.ly/suspicious-link',
        },
      };

      const response = await request(app)
        .post('/api/flag-content')
        .send(requestBody)
        .expect(200);

      expect(response.body.result.isFlagged).toBe(true);
      expect(response.body.result.reasons).toContain('spam');
    });

    test('handles context information', async () => {
      const requestBody = {
        content: {
          id: 'content_7',
          userId: 'user_7',
          type: 'text',
          text: 'This is borderline content',
        },
        context: {
          platform: 'twitter',
          audience: 'children',
          previousFlags: 3,
        },
      };

      const response = await request(app)
        .post('/api/flag-content')
        .send(requestBody)
        .expect(200);

      expect(response.body.result).toBeDefined();
      expect(response.body.result.confidence).toBeGreaterThan(0);
    });

    test('returns 400 for missing content', async () => {
      const response = await request(app)
        .post('/api/flag-content')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Missing required field: content',
        code: 'MISSING_CONTENT',
      });
    });

    test('returns 400 for invalid content format', async () => {
      const requestBody = {
        content: {
          id: 'content_8',
          // Missing userId and type
        },
      };

      const response = await request(app)
        .post('/api/flag-content')
        .send(requestBody)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Content must include id, userId, and type fields',
        code: 'INVALID_CONTENT_FORMAT',
      });
    });

    test('returns 400 for invalid content type', async () => {
      const requestBody = {
        content: {
          id: 'content_9',
          userId: 'user_9',
          type: 'invalid_type',
          text: 'Some text',
        },
      };

      const response = await request(app)
        .post('/api/flag-content')
        .send(requestBody)
        .expect(400);

      expect(response.body).toMatchObject({
        error: expect.stringContaining('Invalid content type'),
        code: 'INVALID_CONTENT_TYPE',
      });
    });

    test('returns 400 for missing content data', async () => {
      const requestBody = {
        content: {
          id: 'content_10',
          userId: 'user_10',
          type: 'text',
          // Missing both text and url
        },
      };

      const response = await request(app)
        .post('/api/flag-content')
        .send(requestBody)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Content must include either text or url field',
        code: 'MISSING_CONTENT_DATA',
      });
    });
  });

  describe('POST /api/flag-content/batch', () => {
    test('processes batch requests successfully', async () => {
      const requestBody = {
        requests: [
          {
            content: {
              id: 'content_1',
              userId: 'user_1',
              type: 'text',
              text: 'Clean content',
            },
          },
          {
            content: {
              id: 'content_2',
              userId: 'user_2',
              type: 'text',
              text: 'CLICK HERE FOR FREE MONEY!!!',
            },
          },
        ],
      };

      const response = await request(app)
        .post('/api/flag-content/batch')
        .send(requestBody)
        .expect(200);

      expect(response.body).toMatchObject({
        batchId: expect.stringMatching(/^batch_\d+$/),
        totalRequests: 2,
        successfulRequests: 2,
        failedRequests: 0,
        responses: expect.arrayContaining([
          expect.objectContaining({
            requestId: expect.any(String),
            result: expect.any(Object),
            processingTimeMs: expect.any(Number),
            timestamp: expect.any(String),
          }),
        ]),
      });
    });

    test('handles batch with mixed results', async () => {
      const requestBody = {
        requests: [
          {
            content: {
              id: 'content_1',
              userId: 'user_1',
              type: 'text',
              text: 'Clean content',
            },
          },
          {
            content: {
              id: 'content_2',
              userId: 'user_2',
              type: 'text',
              text: 'CLICK HERE FOR FREE MONEY!!!',
            },
          },
          {
            content: {
              id: 'content_3',
              userId: 'user_3',
              type: 'text',
              text: 'I will kill you',
            },
          },
        ],
      };

      const response = await request(app)
        .post('/api/flag-content/batch')
        .send(requestBody)
        .expect(200);

      expect(response.body.totalRequests).toBe(3);
      expect(response.body.successfulRequests).toBe(3);
      expect(response.body.failedRequests).toBe(0);

      const results = response.body.responses;
      expect(results[0].result.isFlagged).toBe(false);
      expect(results[1].result.isFlagged).toBe(true);
      expect(results[2].result.isFlagged).toBe(true);
    });

    test('returns 400 for invalid batch format', async () => {
      const response = await request(app)
        .post('/api/flag-content/batch')
        .send({ requests: 'not an array' })
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Requests must be an array',
        code: 'INVALID_BATCH_FORMAT',
      });
    });

    test('returns 400 for empty batch', async () => {
      const response = await request(app)
        .post('/api/flag-content/batch')
        .send({ requests: [] })
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Requests array cannot be empty',
        code: 'EMPTY_BATCH',
      });
    });

    test('returns 400 for batch size exceeded', async () => {
      const requests = Array(101).fill({
        content: {
          id: 'content_1',
          userId: 'user_1',
          type: 'text',
          text: 'Test content',
        },
      });

      const response = await request(app)
        .post('/api/flag-content/batch')
        .send({ requests })
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Batch size cannot exceed 100 requests',
        code: 'BATCH_SIZE_EXCEEDED',
      });
    });
  });

  describe('Error handling', () => {
    test('returns 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Endpoint not found',
        code: 'NOT_FOUND',
        path: '/unknown-endpoint',
      });
    });
  });
});
