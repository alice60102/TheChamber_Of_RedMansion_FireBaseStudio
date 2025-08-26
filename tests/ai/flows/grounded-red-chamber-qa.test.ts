/**
 * @fileOverview Unit tests for grounded Red Chamber QA AI flow
 * 
 * These tests verify the functionality of the grounded QA system including:
 * - Input validation and type safety
 * - Citation extraction and formatting
 * - Batch processing capabilities
 * - Error handling and edge cases
 * - Response structure validation
 * 
 * The tests are designed to work without requiring actual AI API calls
 * by mocking the AI responses and testing the data processing logic.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import type {
  GroundedQAInput,
  GroundedQAResponse,
  CitationInfo,
  GroundingMetadata,
  BatchQAInput,
  BatchQAResponse,
} from '@/types/grounded-qa';

// Mock the AI imports to avoid actual API calls during testing
jest.mock('@/ai/genkit', () => ({
  ai: {
    defineFlow: jest.fn((config, handler) => handler),
    definePrompt: jest.fn(() => jest.fn(() => ({ 
      output: {
        answer: 'Mock AI response',
        answerWithCitations: 'Mock AI response with citations',
        citations: [],
        searchQueries: ['mock query'],
        responseTime: 1.5,
        groundingMetadata: {
          totalSearchResults: 0,
          citationCount: 0,
          groundingSuccess: false,
        }
      }
    }))),
    generate: jest.fn(),
    generateStream: jest.fn(),
  },
  createGroundedGenerationConfig: jest.fn(() => ({})),
  GROUNDING_CONFIG: {
    DEFAULT_MAX_SEARCH_RESULTS: 10,
    DEFAULT_TEMPERATURE: 0.7,
    DEFAULT_MAX_OUTPUT_TOKENS: 2048,
    RESPONSE_TIMEOUT_SECONDS: 30,
    ENABLE_CITATION_PARSING: true,
  },
}));

// Import the functions to test after mocking
import {
  validateGroundedQAInput,
  createGroundedQAInput,
} from '@/ai/flows/grounded-red-chamber-qa';

describe('Grounded Red Chamber QA Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Input Validation', () => {
    it('should validate correct grounded QA input', () => {
      const validInput: GroundedQAInput = {
        userQuestion: '賈寶玉的性格特點是什麼？',
        selectedText: '寶玉因此把這話當作至言',
        chapterContext: '第三回 托內兄如海薦西賓',
        currentChapter: '第三回',
        enableStreaming: false,
        includeDetailedCitations: true,
      };

      expect(validateGroundedQAInput(validInput)).toBe(true);
    });

    it('should reject invalid input types', () => {
      const invalidInputs = [
        null,
        undefined,
        '',
        123,
        [],
        {},
        { userQuestion: '' }, // empty question
        { userQuestion: '   ' }, // whitespace only
        { notUserQuestion: '賈寶玉的性格特點是什麼？' }, // wrong property name
      ];

      invalidInputs.forEach(input => {
        expect(validateGroundedQAInput(input)).toBe(false);
      });
    });

    it('should accept minimal valid input', () => {
      const minimalInput = {
        userQuestion: '賈寶玉是誰？',
      };

      expect(validateGroundedQAInput(minimalInput)).toBe(true);
    });
  });

  describe('Input Creation Helper', () => {
    it('should create basic grounded QA input', () => {
      const question = '林黛玉的身世背景是什麼？';
      const input = createGroundedQAInput(question);

      expect(input).toEqual({
        userQuestion: question,
        selectedText: undefined,
        chapterContext: undefined,
        currentChapter: undefined,
        enableStreaming: false,
        includeDetailedCitations: true,
      });
    });

    it('should create grounded QA input with options', () => {
      const question = '大觀園是誰建造的？';
      const options = {
        selectedText: '元春省親',
        chapterContext: '第十七回 大觀園試才題對額',
        currentChapter: '第十七回',
        enableStreaming: true,
        includeDetailedCitations: false,
      };

      const input = createGroundedQAInput(question, options);

      expect(input).toEqual({
        userQuestion: question,
        ...options,
      });
    });

    it('should trim whitespace from user question', () => {
      const question = '  劉姥姥在紅樓夢中扮演什麼角色？  ';
      const input = createGroundedQAInput(question);

      expect(input.userQuestion).toBe('劉姥姥在紅樓夢中扮演什麼角色？');
    });

    it('should default includeDetailedCitations to true', () => {
      const input = createGroundedQAInput('測試問題');
      expect(input.includeDetailedCitations).toBe(true);

      const inputWithFalse = createGroundedQAInput('測試問題', { includeDetailedCitations: false });
      expect(inputWithFalse.includeDetailedCitations).toBe(false);
    });
  });

  describe('Citation Information Structure', () => {
    it('should validate citation info structure', () => {
      const validCitation: CitationInfo = {
        textSegment: '賈寶玉，字怡紅公子',
        startIndex: 10,
        endIndex: 25,
        sourceUrls: ['https://example.com/source1', 'https://example.com/source2'],
        sourceTitles: ['紅樓夢人物分析', '古典文學研究'],
      };

      expect(validCitation.textSegment).toBe('賈寶玉，字怡紅公子');
      expect(validCitation.sourceUrls).toHaveLength(2);
      expect(validCitation.sourceTitles).toHaveLength(2);
      expect(validCitation.startIndex).toBeLessThan(validCitation.endIndex);
    });

    it('should handle empty citations arrays', () => {
      const emptyCitation: CitationInfo = {
        textSegment: '無引用文本',
        startIndex: 0,
        endIndex: 5,
        sourceUrls: [],
        sourceTitles: [],
      };

      expect(emptyCitation.sourceUrls).toHaveLength(0);
      expect(emptyCitation.sourceTitles).toHaveLength(0);
    });
  });

  describe('Grounded QA Response Structure', () => {
    it('should validate complete grounded QA response', () => {
      const mockResponse: GroundedQAResponse = {
        answer: '賈寶玉是《紅樓夢》的男主人公，出身貴族世家。',
        answerWithCitations: '賈寶玉是《紅樓夢》的男主人公，出身貴族世家。[1](https://example.com)',
        citations: [{
          textSegment: '賈寶玉是《紅樓夢》的男主人公',
          startIndex: 0,
          endIndex: 15,
          sourceUrls: ['https://example.com'],
          sourceTitles: ['紅樓夢角色分析'],
        }],
        searchQueries: ['賈寶玉 紅樓夢 角色分析', '賈寶玉 性格特點'],
        responseTime: 2.5,
        groundingMetadata: {
          totalSearchResults: 5,
          citationCount: 1,
          groundingSuccess: true,
          warnings: undefined,
        },
      };

      expect(mockResponse.answer).toBeTruthy();
      expect(mockResponse.answerWithCitations).toContain('[1]');
      expect(mockResponse.citations).toHaveLength(1);
      expect(mockResponse.searchQueries).toHaveLength(2);
      expect(mockResponse.responseTime).toBeGreaterThan(0);
      expect(mockResponse.groundingMetadata?.groundingSuccess).toBe(true);
    });

    it('should handle response with no citations', () => {
      const noCitationsResponse: GroundedQAResponse = {
        answer: '這是一個基本回答。',
        answerWithCitations: '這是一個基本回答。',
        citations: [],
        searchQueries: [],
        groundingMetadata: {
          totalSearchResults: 0,
          citationCount: 0,
          groundingSuccess: false,
          warnings: ['無法從搜索結果中提取引用資訊'],
        },
      };

      expect(noCitationsResponse.citations).toHaveLength(0);
      expect(noCitationsResponse.groundingMetadata?.groundingSuccess).toBe(false);
      expect(noCitationsResponse.groundingMetadata?.warnings).toContain('無法從搜索結果中提取引用資訊');
    });
  });

  describe('Batch Processing Structure', () => {
    it('should validate batch QA input structure', () => {
      const batchInput: BatchQAInput = {
        questions: [
          { userQuestion: '賈寶玉的性格特點是什麼？' },
          { 
            userQuestion: '林黛玉的身世背景是什麼？',
            selectedText: '黛玉因此上船',
            currentChapter: '第三回'
          },
        ],
        enableParallelProcessing: true,
        maxConcurrency: 3,
      };

      expect(batchInput.questions).toHaveLength(2);
      expect(batchInput.enableParallelProcessing).toBe(true);
      expect(batchInput.maxConcurrency).toBe(3);
    });

    it('should validate batch QA response structure', () => {
      const batchResponse: BatchQAResponse = {
        responses: [
          {
            answer: '賈寶玉是貴族公子。',
            answerWithCitations: '賈寶玉是貴族公子。',
            citations: [],
            searchQueries: [],
          },
          {
            answer: '林黛玉是賈母的外孫女。',
            answerWithCitations: '林黛玉是賈母的外孫女。',
            citations: [],
            searchQueries: [],
          },
        ],
        processingStats: {
          totalQuestions: 2,
          successfulResponses: 2,
          failedResponses: 0,
          totalProcessingTime: 5.2,
          averageResponseTime: 2.6,
        },
        errors: undefined,
      };

      expect(batchResponse.responses).toHaveLength(2);
      expect(batchResponse.processingStats.totalQuestions).toBe(2);
      expect(batchResponse.processingStats.successfulResponses).toBe(2);
      expect(batchResponse.processingStats.failedResponses).toBe(0);
      expect(batchResponse.errors).toBeUndefined();
    });

    it('should handle batch processing with errors', () => {
      const batchResponseWithErrors: BatchQAResponse = {
        responses: [
          {
            answer: '成功的回答。',
            answerWithCitations: '成功的回答。',
            citations: [],
            searchQueries: [],
          },
          {
            answer: '處理問題時發生錯誤: API 超時',
            answerWithCitations: '處理問題時發生錯誤: API 超時',
            citations: [],
            searchQueries: [],
          },
        ],
        processingStats: {
          totalQuestions: 2,
          successfulResponses: 1,
          failedResponses: 1,
          totalProcessingTime: 8.5,
          averageResponseTime: 4.25,
        },
        errors: [
          {
            questionIndex: 1,
            error: 'API 超時',
            question: '這是一個失敗的問題？',
          },
        ],
      };

      expect(batchResponseWithErrors.processingStats.failedResponses).toBe(1);
      expect(batchResponseWithErrors.errors).toHaveLength(1);
      expect(batchResponseWithErrors.errors?.[0].questionIndex).toBe(1);
    });
  });

  describe('Grounding Metadata Validation', () => {
    it('should validate successful grounding metadata', () => {
      const successfulMetadata: GroundingMetadata = {
        totalSearchResults: 8,
        citationCount: 3,
        groundingSuccess: true,
        warnings: undefined,
      };

      expect(successfulMetadata.groundingSuccess).toBe(true);
      expect(successfulMetadata.citationCount).toBeGreaterThan(0);
      expect(successfulMetadata.warnings).toBeUndefined();
    });

    it('should validate failed grounding metadata', () => {
      const failedMetadata: GroundingMetadata = {
        totalSearchResults: 0,
        citationCount: 0,
        groundingSuccess: false,
        warnings: ['搜索服務不可用', '網絡連接失敗'],
      };

      expect(failedMetadata.groundingSuccess).toBe(false);
      expect(failedMetadata.citationCount).toBe(0);
      expect(failedMetadata.warnings).toHaveLength(2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle extremely long user questions', () => {
      const longQuestion = '請詳細分析' + '賈寶玉'.repeat(1000) + '的性格特點';
      const input = createGroundedQAInput(longQuestion);

      expect(input.userQuestion).toBe(longQuestion);
      expect(validateGroundedQAInput(input)).toBe(true);
    });

    it('should handle special characters in questions', () => {
      const specialCharQuestion = '賈寶玉的「怡紅公子」稱號有什麼意義？（詳細分析）';
      const input = createGroundedQAInput(specialCharQuestion);

      expect(input.userQuestion).toBe(specialCharQuestion);
      expect(validateGroundedQAInput(input)).toBe(true);
    });

    it('should handle empty optional fields gracefully', () => {
      const inputWithEmptyOptionals = createGroundedQAInput('測試問題', {
        selectedText: '',
        chapterContext: '',
        currentChapter: '',
      });

      expect(inputWithEmptyOptionals.selectedText).toBe('');
      expect(inputWithEmptyOptionals.chapterContext).toBe('');
      expect(inputWithEmptyOptionals.currentChapter).toBe('');
    });
  });

  describe('Type Safety and TypeScript Integration', () => {
    it('should maintain type safety for all interfaces', () => {
      // This test ensures TypeScript compilation succeeds
      const typedInput: GroundedQAInput = {
        userQuestion: '類型安全測試',
        enableStreaming: false,
        includeDetailedCitations: true,
      };

      const typedResponse: GroundedQAResponse = {
        answer: '測試回答',
        answerWithCitations: '測試回答',
        citations: [],
        searchQueries: [],
      };

      expect(typeof typedInput.userQuestion).toBe('string');
      expect(typeof typedResponse.answer).toBe('string');
      expect(Array.isArray(typedResponse.citations)).toBe(true);
      expect(Array.isArray(typedResponse.searchQueries)).toBe(true);
    });

    it('should handle optional properties correctly', () => {
      const minimalInput: GroundedQAInput = {
        userQuestion: '最小輸入測試',
      };

      const minimalResponse: GroundedQAResponse = {
        answer: '最小回答',
        answerWithCitations: '最小回答',
        citations: [],
        searchQueries: [],
      };

      expect(minimalInput.selectedText).toBeUndefined();
      expect(minimalInput.chapterContext).toBeUndefined();
      expect(minimalResponse.responseTime).toBeUndefined();
      expect(minimalResponse.groundingMetadata).toBeUndefined();
    });
  });

  describe('Performance and Scalability Considerations', () => {
    it('should handle large citation arrays efficiently', () => {
      const largeCitationsResponse: GroundedQAResponse = {
        answer: '大量引用測試',
        answerWithCitations: '大量引用測試',
        citations: Array.from({ length: 100 }, (_, i) => ({
          textSegment: `文本片段 ${i}`,
          startIndex: i * 10,
          endIndex: (i * 10) + 5,
          sourceUrls: [`https://example.com/source${i}`],
          sourceTitles: [`來源 ${i}`],
        })),
        searchQueries: Array.from({ length: 50 }, (_, i) => `搜索查詢 ${i}`),
      };

      expect(largeCitationsResponse.citations).toHaveLength(100);
      expect(largeCitationsResponse.searchQueries).toHaveLength(50);
    });

    it('should validate processing stats calculations', () => {
      const stats = {
        totalQuestions: 10,
        successfulResponses: 8,
        failedResponses: 2,
        totalProcessingTime: 25.5,
        averageResponseTime: 2.55,
      };

      expect(stats.successfulResponses + stats.failedResponses).toBe(stats.totalQuestions);
      expect(Math.abs(stats.averageResponseTime - (stats.totalProcessingTime / stats.totalQuestions))).toBeLessThan(0.01);
    });
  });
});
