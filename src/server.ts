import express from 'express';
import type { Request, Response } from 'express';
import { processContentFlaggingRequest } from './content-flagging.js';
import type { ContentFlaggingRequest } from './types.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Main content flagging endpoint
app.post('/api/flag-content', (req: Request, res: Response) => {
  try {
    const { content, context } = req.body;

    // Validate required fields
    if (!content) {
      return res.status(400).json({
        error: 'Missing required field: content',
        code: 'MISSING_CONTENT',
      });
    }

    if (!content.id || !content.userId || !content.type) {
      return res.status(400).json({
        error: 'Content must include id, userId, and type fields',
        code: 'INVALID_CONTENT_FORMAT',
      });
    }

    // Validate content type
    const validTypes = ['text', 'image', 'video', 'link'];
    if (!validTypes.includes(content.type)) {
      return res.status(400).json({
        error: `Invalid content type. Must be one of: ${validTypes.join(', ')}`,
        code: 'INVALID_CONTENT_TYPE',
      });
    }

    // Validate that content has either text or url
    if (!content.text && !content.url) {
      return res.status(400).json({
        error: 'Content must include either text or url field',
        code: 'MISSING_CONTENT_DATA',
      });
    }

    // Create the request object
    const flaggingRequest: ContentFlaggingRequest = {
      content: {
        id: content.id,
        userId: content.userId,
        type: content.type,
        ...(content.text && { text: content.text }),
        ...(content.url && { url: content.url }),
        ...(content.metadata && { metadata: content.metadata }),
      },
      ...(context && {
        context: {
          ...(context.platform && { platform: context.platform }),
          ...(context.audience && { audience: context.audience }),
          ...(context.previousFlags !== undefined && {
            previousFlags: context.previousFlags,
          }),
        },
      }),
    };

    // Process the request
    const response = processContentFlaggingRequest(flaggingRequest);

    // Return the response
    return res.json(response);
  } catch (error) {
    console.error('Error processing content flagging request:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Batch content flagging endpoint
app.post('/api/flag-content/batch', (req: Request, res: Response) => {
  try {
    const { requests } = req.body;

    if (!Array.isArray(requests)) {
      return res.status(400).json({
        error: 'Requests must be an array',
        code: 'INVALID_BATCH_FORMAT',
      });
    }

    if (requests.length === 0) {
      return res.status(400).json({
        error: 'Requests array cannot be empty',
        code: 'EMPTY_BATCH',
      });
    }

    if (requests.length > 100) {
      return res.status(400).json({
        error: 'Batch size cannot exceed 100 requests',
        code: 'BATCH_SIZE_EXCEEDED',
      });
    }

    const responses = requests.map(
      (requestItem: ContentFlaggingRequest, index: number) => {
        try {
          const { content, context } = requestItem;

          if (!content) {
            throw new Error(
              `Request ${index}: Missing required field: content`
            );
          }

          if (!content.id || !content.userId || !content.type) {
            throw new Error(
              `Request ${index}: Content must include id, userId, and type fields`
            );
          }

          const validTypes = ['text', 'image', 'video', 'link'];
          if (!validTypes.includes(content.type)) {
            throw new Error(`Request ${index}: Invalid content type`);
          }

          if (!content.text && !content.url) {
            throw new Error(
              `Request ${index}: Content must include either text or url field`
            );
          }

          const flaggingRequest: ContentFlaggingRequest = {
            content: {
              id: content.id,
              userId: content.userId,
              type: content.type,
              ...(content.text && { text: content.text }),
              ...(content.url && { url: content.url }),
              ...(content.metadata && { metadata: content.metadata }),
            },
            ...(context && {
              context: {
                ...(context.platform && { platform: context.platform }),
                ...(context.audience && { audience: context.audience }),
                ...(context.previousFlags !== undefined && {
                  previousFlags: context.previousFlags,
                }),
              },
            }),
          };

          return processContentFlaggingRequest(flaggingRequest);
        } catch (error) {
          return {
            requestId: `error_${index}_${Date.now()}`,
            error: error instanceof Error ? error.message : 'Unknown error',
            result: null,
            processingTimeMs: 0,
            timestamp: new Date(),
          };
        }
      }
    );

    return res.json({
      batchId: `batch_${Date.now()}`,
      totalRequests: requests.length,
      successfulRequests: responses.filter((r) => !('error' in r)).length,
      failedRequests: responses.filter((r) => 'error' in r).length,
      responses,
    });
  } catch (error) {
    console.error('Error processing batch content flagging request:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get supported flag reasons
app.get('/api/flag-reasons', (_req: Request, res: Response) => {
  const flagReasons = [
    'spam',
    'hate_speech',
    'harassment',
    'violence',
    'adult_content',
    'misinformation',
    'copyright_violation',
    'phishing',
    'malware',
    'inappropriate_language',
    'personal_information',
  ];

  res.json({
    supportedReasons: flagReasons,
    description: 'List of all supported content flagging reasons',
  });
});

// Get API documentation
app.get('/api/docs', (_req: Request, res: Response) => {
  res.json({
    title: 'Content Flagging API',
    version: '1.0.0',
    description:
      'API for flagging problematic content before posting to social media',
    endpoints: [
      {
        method: 'POST',
        path: '/api/flag-content',
        description: 'Flag a single piece of content',
        body: {
          content: {
            id: 'string (required)',
            userId: 'string (required)',
            type: 'text|image|video|link (required)',
            text: 'string (optional)',
            url: 'string (optional)',
            metadata: 'object (optional)',
          },
          context: {
            platform: 'string (optional)',
            audience: 'string (optional)',
            previousFlags: 'number (optional)',
          },
        },
      },
      {
        method: 'POST',
        path: '/api/flag-content/batch',
        description: 'Flag multiple pieces of content in a single request',
        body: {
          requests: 'array of flag-content requests (max 100)',
        },
      },
      {
        method: 'GET',
        path: '/api/flag-reasons',
        description: 'Get list of supported flag reasons',
      },
      {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint',
      },
    ],
  });
});

// Error handling middleware
app.use((error: Error, _req: Request, res: Response) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    message: error.message,
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.originalUrl,
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Content flagging server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API docs: http://localhost:${PORT}/api/docs`);
  });
}

export default app;
