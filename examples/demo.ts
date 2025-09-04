import { processContentFlaggingRequest } from '../src/content-flagging.js';
import type { ContentFlaggingRequest } from '../src/types.js';

// Example usage of the content flagging system
function demonstrateContentFlagging(): void {
  console.log('Content Flagging System Demo\n');

  const testCases: ContentFlaggingRequest[] = [
    {
      content: {
        id: 'demo_1' as any,
        userId: 'user_1' as any,
        type: 'text',
        text: 'Hello, how are you today? This is a normal conversation.',
      },
    },
    {
      content: {
        id: 'demo_2' as any,
        userId: 'user_2' as any,
        type: 'text',
        text: 'CLICK HERE FOR FREE MONEY!!! ACT NOW!!! LIMITED TIME OFFER!!!',
      },
    },
    {
      content: {
        id: 'demo_3' as any,
        userId: 'user_3' as any,
        type: 'text',
        text: 'All people are stupid and I hate them',
      },
    },
    {
      content: {
        id: 'demo_4' as any,
        userId: 'user_4' as any,
        type: 'text',
        text: 'You should kill yourself',
      },
    },
    {
      content: {
        id: 'demo_5' as any,
        userId: 'user_5' as any,
        type: 'text',
        text: 'I will kill you with my gun',
      },
    },
    {
      content: {
        id: 'demo_6' as any,
        userId: 'user_6' as any,
        type: 'text',
        text: 'My SSN is 123-45-6789 and my phone is 555-123-4567',
      },
    },
    {
      content: {
        id: 'demo_7' as any,
        userId: 'user_7' as any,
        type: 'text',
        text: 'Urgent action required! Verify your account now or it will be suspended!',
      },
    },
    {
      content: {
        id: 'demo_8' as any,
        userId: 'user_8' as any,
        type: 'link',
        url: 'https://bit.ly/suspicious-link',
      },
    },
    {
      content: {
        id: 'demo_9' as any,
        userId: 'user_9' as any,
        type: 'text',
        text: 'This conspiracy theory about government cover-up is real',
      },
    },
    {
      content: {
        id: 'demo_10' as any,
        userId: 'user_10' as any,
        type: 'text',
        text: 'Check out this adult content and porn',
      },
    },
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const response = processContentFlaggingRequest(testCase);
    
    console.log(`Test Case ${i + 1}:`);
    console.log(`Content: "${testCase.content.text || testCase.content.url}"`);
    console.log(`Flagged: ${response.result.isFlagged ? 'YES' : 'NO'}`);
    
    if (response.result.isFlagged) {
      console.log(`Severity: ${response.result.severity.toUpperCase()}`);
      console.log(`Reasons: ${response.result.reasons.join(', ')}`);
      console.log(`Confidence: ${Math.round(response.result.confidence * 100)}%`);
    }
    
    console.log(`Processing Time: ${response.processingTimeMs}ms`);
    console.log('');
  }

  console.log('Demo completed!');
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateContentFlagging();
}

export { demonstrateContentFlagging };
