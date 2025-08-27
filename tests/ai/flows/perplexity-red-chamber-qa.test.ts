/**
 * @fileOverview Unit tests for Perplexity QA flow
 * 測試 Perplexity QA 流程的單元測試
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import {
  perplexityRedChamberQA,
  createPerplexityQAInputForFlow,
  getModelCapabilities,
  getSuggestedQuestions,
  formatPerplexityResponse,
  PerplexityQAInputSchema,
  PerplexityQAOutputSchema,
} from '@/ai/flows/perplexity-red-chamber-qa';
import type { PerplexityQAInput, PerplexityQAResponse } from '@/types/perplexity-qa';

// Mock the Perplexity client
jest.mock('@/lib/perplexity-client', () => ({
  getDefaultPerplexityClient: jest.fn(() => ({
    completionRequest: jest.fn(),
    streamingCompletionRequest: jest.fn(),
  })),
  PerplexityClient: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
  default: {
    create: jest.fn(() => ({
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })),
  },
}));

describe('Perplexity Red Chamber QA Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Schema Validation', () => {
    test('should validate valid input correctly', () => {
      const validInput: PerplexityQAInput = {
        userQuestion: '林黛玉的性格特點是什麼？',
        modelKey: 'sonar-reasoning-pro',
        reasoningEffort: 'high',
        enableStreaming: false,
        includeDetailedCitations: true,
        showThinkingProcess: true,
      };

      const result = PerplexityQAInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    test('should reject invalid input', () => {
      const invalidInput = {
        userQuestion: '', // Empty question should fail
        modelKey: 'invalid-model',
      };

      const result = PerplexityQAInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    test('should apply default values correctly', () => {
      const minimalInput = {
        userQuestion: '賈寶玉的人物形象如何？',
      };

      const result = PerplexityQAInputSchema.parse(minimalInput);
      expect(result.enableStreaming).toBe(true);
      expect(result.includeDetailedCitations).toBe(true);
      expect(result.showThinkingProcess).toBe(true);
    });
  });

  describe('Input Creation Helper', () => {
    test('should create properly formatted input', () => {
      const selectedTextInfo = {
        text: '黛玉聽了，便放下釣竿，走至亭中',
        position: { top: 100, left: 200 },
        range: null,
      };

      const input = createPerplexityQAInputForFlow(
        '這段文字描述了什麼？',
        selectedTextInfo,
        '第三回章節上下文...',
        '第三回',
        {
          modelKey: 'sonar-pro',
          questionContext: 'character',
        }
      );

      expect(input.userQuestion).toBe('這段文字描述了什麼？');
      expect(input.selectedText).toBe('黛玉聽了，便放下釣竿，走至亭中');
      expect(input.chapterContext).toBe('第三回章節上下文...');
      expect(input.currentChapter).toBe('第三回');
      expect(input.modelKey).toBe('sonar-pro');
      expect(input.questionContext).toBe('character');
    });

    test('should handle missing optional parameters', () => {
      const input = createPerplexityQAInputForFlow(
        '紅樓夢的主題是什麼？',
        null,
        undefined,
        undefined
      );

      expect(input.userQuestion).toBe('紅樓夢的主題是什麼？');
      expect(input.selectedText).toBeUndefined();
      expect(input.chapterContext).toBeUndefined();
      expect(input.currentChapter).toBeUndefined();
    });
  });

  describe('Model Capabilities', () => {
    test('should correctly identify model capabilities', () => {
      const sonarPro = getModelCapabilities('sonar-pro');
      expect(sonarPro.supportsReasoning).toBe(false);
      expect(sonarPro.supportsStreaming).toBe(true);
      expect(sonarPro.supportsCitations).toBe(true);

      const sonarReasoning = getModelCapabilities('sonar-reasoning-pro');
      expect(sonarReasoning.supportsReasoning).toBe(true);
      expect(sonarReasoning.supportsStreaming).toBe(true);
      expect(sonarReasoning.supportsCitations).toBe(true);
    });
  });

  describe('Suggested Questions', () => {
    test('should return categorized questions', () => {
      const questions = getSuggestedQuestions();
      
      expect(questions).toHaveProperty('character');
      expect(questions).toHaveProperty('plot');
      expect(questions).toHaveProperty('theme');
      expect(questions).toHaveProperty('general');

      expect(Array.isArray(questions.character)).toBe(true);
      expect(questions.character.length).toBeGreaterThan(0);
      expect(typeof questions.character[0]).toBe('string');
    });
  });

  describe('Response Formatting', () => {
    test('should format response correctly', () => {
      const mockResponse: PerplexityQAResponse = {
        question: '林黛玉的性格特點？',
        answer: '林黛玉是一個敏感、聰慧的女性角色...',
        citations: [
          {
            number: '1',
            title: '紅樓夢研究',
            url: 'https://example.com',
            type: 'web_citation',
          },
        ],
        groundingMetadata: {
          searchQueries: ['林黛玉 性格', '紅樓夢 人物分析'],
          webSources: [],
          groundingSuccessful: true,
        },
        modelUsed: 'sonar-reasoning-pro',
        modelKey: 'sonar-reasoning-pro',
        reasoningEffort: 'high',
        processingTime: 2.5,
        success: true,
        streaming: false,
        timestamp: '2024-01-01T00:00:00Z',
        answerLength: 100,
        questionLength: 20,
        citationCount: 1,
      };

      const formatted = formatPerplexityResponse(mockResponse);
      
      expect(formatted.formattedAnswer).toBe(mockResponse.answer);
      expect(formatted.citationSummary).toBe('找到 1 個引用來源');
      expect(formatted.processingInfo).toBe('處理時間: 2.50秒');
      expect(formatted.modelInfo).toBe('模型: sonar-reasoning-pro (推理強度: high)');
    });
  });

  describe('Perplexity QA Function', () => {
    test('should handle successful API response', async () => {
      const mockClient = {
        completionRequest: jest.fn().mockResolvedValue({
          question: '測試問題',
          answer: '測試回答',
          citations: [],
          groundingMetadata: {
            searchQueries: [],
            webSources: [],
            groundingSuccessful: true,
          },
          modelUsed: 'sonar-pro',
          modelKey: 'sonar-pro',
          processingTime: 1.0,
          success: true,
          streaming: false,
          timestamp: new Date().toISOString(),
          answerLength: 10,
          questionLength: 10,
          citationCount: 0,
        }),
      };

      // Mock the getDefaultPerplexityClient function
      const { getDefaultPerplexityClient } = require('@/lib/perplexity-client');
      (getDefaultPerplexityClient as jest.Mock).mockReturnValue(mockClient);

      const input: PerplexityQAInput = {
        userQuestion: '測試問題',
      };

      const result = await perplexityRedChamberQA(input);
      
      expect(result.success).toBe(true);
      expect(result.question).toBe('測試問題');
      expect(result.answer).toBe('測試回答');
      expect(mockClient.completionRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          userQuestion: '測試問題',
        })
      );
    });

    test('should handle API errors gracefully', async () => {
      const mockClient = {
        completionRequest: jest.fn().mockRejectedValue(new Error('API Error')),
      };

      const { getDefaultPerplexityClient } = require('@/lib/perplexity-client');
      (getDefaultPerplexityClient as jest.Mock).mockReturnValue(mockClient);

      const input: PerplexityQAInput = {
        userQuestion: '測試問題',
      };

      const result = await perplexityRedChamberQA(input);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('API Error');
      expect(result.answer).toContain('處理您的問題時發生錯誤');
    });

    test('should validate input before processing', async () => {
      const invalidInput = {
        userQuestion: '', // Empty question
      } as PerplexityQAInput;

      await expect(perplexityRedChamberQA(invalidInput)).rejects.toThrow('輸入驗證失敗');
    });
  });

  describe('Output Schema Validation', () => {
    test('should validate complete response structure', () => {
      const validOutput = {
        question: '測試問題',
        answer: '測試回答',
        citations: [
          {
            number: '1',
            title: '測試來源',
            url: 'https://example.com',
            type: 'web_citation',
          },
        ],
        groundingMetadata: {
          searchQueries: ['測試查詢'],
          webSources: [],
          groundingSuccessful: true,
        },
        modelUsed: 'sonar-pro',
        modelKey: 'sonar-pro',
        processingTime: 1.0,
        success: true,
        streaming: false,
        timestamp: '2024-01-01T00:00:00Z',
        answerLength: 10,
        questionLength: 10,
        citationCount: 1,
      };

      const result = PerplexityQAOutputSchema.safeParse(validOutput);
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long questions', () => {
      const longQuestion = 'A'.repeat(2000); // Very long question
      const input = createPerplexityQAInputForFlow(longQuestion);
      
      expect(input.userQuestion).toBe(longQuestion);
      expect(input.questionLength).toBeUndefined(); // This would be set by the actual function
    });

    test('should handle special characters in questions', () => {
      const specialQuestion = '什麼是《紅樓夢》中的"情"？包含引號、破折號——等特殊符號';
      const input = createPerplexityQAInputForFlow(specialQuestion);
      
      expect(input.userQuestion).toBe(specialQuestion);
    });

    test('should handle empty or undefined chapter context', () => {
      const input = createPerplexityQAInputForFlow(
        '測試問題',
        null,
        '',
        ''
      );
      
      expect(input.chapterContext).toBe('');
      expect(input.currentChapter).toBe('');
    });
  });
});

  describe('Async Generator Error Tests', () => {
    test('should handle streaming function generator errors', async () => {
      // Mock client to throw error during streaming
      const mockClient = {
        streamingCompletionRequest: jest.fn().mockImplementation(async function* () {
          yield {
            content: 'test',
            fullContent: 'test content',
            timestamp: new Date().toISOString(),
            citations: [],
            searchQueries: [],
            metadata: { searchQueries: [], webSources: [], groundingSuccessful: false },
            responseTime: 0.1,
            isComplete: false,
            chunkIndex: 1,
          };
          throw new Error('Streaming generator error');
        }),
      };

      jest.doMock('@/lib/perplexity-client', () => ({
        getDefaultPerplexityClient: () => mockClient,
      }));

      // Re-import to get mocked version
      const { perplexityRedChamberQAStreaming } = await import('@/ai/flows/perplexity-red-chamber-qa');

      const input: PerplexityQAInput = {
        userQuestion: '測試生成器錯誤',
        enableStreaming: true,
      };

      const chunks: any[] = [];
      let errorOccurred = false;

      try {
        for await (const chunk of perplexityRedChamberQAStreaming(input)) {
          chunks.push(chunk);
        }
      } catch (error) {
        errorOccurred = true;
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Streaming generator error');
      }

      expect(errorOccurred).toBe(true);
      expect(chunks.length).toBeGreaterThan(0); // Should get at least one chunk before error
    });

    test('should validate async generator function signature', async () => {
      const { perplexityRedChamberQAStreaming } = await import('@/ai/flows/perplexity-red-chamber-qa');

      const input: PerplexityQAInput = {
        userQuestion: '測試函數簽名',
        enableStreaming: true,
      };

      const generator = perplexityRedChamberQAStreaming(input);
      
      // Verify it returns an async generator
      expect(typeof generator).toBe('object');
      expect(typeof generator[Symbol.asyncIterator]).toBe('function');
      expect(generator.constructor.name).toBe('AsyncGenerator');
      
      // Clean up generator
      await generator.return();
    });

    test('should handle client function that returns non-async-iterable', async () => {
      // Mock client that returns a regular promise instead of async generator
      const mockClient = {
        streamingCompletionRequest: jest.fn().mockResolvedValue({
          // This should cause an error because it's not async iterable
          message: 'Not an async generator',
        }),
      };

      jest.doMock('@/lib/perplexity-client', () => ({
        getDefaultPerplexityClient: () => mockClient,
      }));

      const { perplexityRedChamberQAStreaming } = await import('@/ai/flows/perplexity-red-chamber-qa');

      const input: PerplexityQAInput = {
        userQuestion: '測試非生成器返回',
        enableStreaming: true,
      };

      let errorOccurred = false;

      try {
        for await (const chunk of perplexityRedChamberQAStreaming(input)) {
          // Should not reach here
        }
      } catch (error) {
        errorOccurred = true;
        expect(error).toBeInstanceOf(TypeError);
        expect((error as Error).message).toMatch(/not.*async.*iterable/i);
      }

      expect(errorOccurred).toBe(true);
    });

    test('should handle Server Actions async function validation', async () => {
      // Test async function exports for Server Actions compatibility
      const flowModule = await import('@/ai/flows/perplexity-red-chamber-qa');
      
      // Verify all exported functions are async
      expect(typeof flowModule.perplexityRedChamberQA).toBe('function');
      expect(flowModule.perplexityRedChamberQA.constructor.name).toBe('AsyncFunction');
      
      expect(typeof flowModule.perplexityRedChamberQAStreaming).toBe('function');
      expect(flowModule.perplexityRedChamberQAStreaming.constructor.name).toBe('AsyncGeneratorFunction');
      
      expect(typeof flowModule.createPerplexityQAInputForFlow).toBe('function');
      expect(flowModule.createPerplexityQAInputForFlow.constructor.name).toBe('AsyncFunction');
      
      expect(typeof flowModule.getModelCapabilities).toBe('function');
      expect(flowModule.getModelCapabilities.constructor.name).toBe('AsyncFunction');
      
      expect(typeof flowModule.getSuggestedQuestions).toBe('function');
      expect(flowModule.getSuggestedQuestions.constructor.name).toBe('AsyncFunction');
      
      expect(typeof flowModule.formatPerplexityResponse).toBe('function');
      expect(flowModule.formatPerplexityResponse.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('Type Safety Tests', () => {
    test('should enforce correct types for model keys', () => {
    // This test ensures TypeScript compilation catches type errors
    const validModelKeys: Array<'sonar-pro' | 'sonar-reasoning' | 'sonar-reasoning-pro'> = [
      'sonar-pro',
      'sonar-reasoning',
      'sonar-reasoning-pro',
    ];

    validModelKeys.forEach(key => {
      const input = createPerplexityQAInputForFlow('test', null, undefined, undefined, {
        modelKey: key,
      });
      expect(input.modelKey).toBe(key);
    });
  });

  test('should enforce correct reasoning effort values', () => {
    const validEfforts: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

    validEfforts.forEach(effort => {
      const input = createPerplexityQAInputForFlow('test', null, undefined, undefined, {
        reasoningEffort: effort,
      });
      expect(input.reasoningEffort).toBe(effort);
    });
  });
});
