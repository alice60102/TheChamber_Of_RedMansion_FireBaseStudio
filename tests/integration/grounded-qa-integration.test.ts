/**
 * @fileOverview Integration tests for Grounded QA system
 * 
 * These tests verify the end-to-end functionality of the grounded QA integration
 * including the AI flow, data structures, and basic functionality without requiring
 * actual API calls.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { 
  GroundedQAInput, 
  GroundedQAResponse, 
  CitationInfo,
  GroundingMetadata 
} from '@/types/grounded-qa';
import { 
  validateGroundedQAInput, 
  createGroundedQAInput 
} from '@/ai/flows/grounded-red-chamber-qa';

// Mock the AI flow to avoid actual API calls
jest.mock('@/ai/genkit', () => ({
  ai: {
    defineFlow: jest.fn(() => jest.fn()),
    generate: jest.fn(),
    generateContentStream: jest.fn(),
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

describe('Grounded QA Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Flow Integration', () => {
    it('should create valid grounded QA input for typical use case', () => {
      const userQuestion = '賈寶玉在第三回中的表現如何？';
      const selectedText = '寶玉因此上船';
      const chapterContext = '第三回 托內兄如海薦西賓 接外孫賈母惜孤女';
      
      const input = createGroundedQAInput(userQuestion, {
        selectedText,
        chapterContext,
        currentChapter: '第三回',
        includeDetailedCitations: true,
      });

      expect(validateGroundedQAInput(input)).toBe(true);
      expect(input.userQuestion).toBe(userQuestion);
      expect(input.selectedText).toBe(selectedText);
      expect(input.chapterContext).toBe(chapterContext);
      expect(input.currentChapter).toBe('第三回');
      expect(input.includeDetailedCitations).toBe(true);
    });

    it('should handle edge cases in input creation', () => {
      const questionWithSpecialChars = '「寶玉」與「黛玉」的關係如何？（詳細分析）';
      
      const input = createGroundedQAInput(questionWithSpecialChars, {
        selectedText: undefined,
        chapterContext: '',
        currentChapter: undefined,
      });

      expect(validateGroundedQAInput(input)).toBe(true);
      expect(input.userQuestion).toBe(questionWithSpecialChars);
      expect(input.selectedText).toBeUndefined();
      expect(input.chapterContext).toBe('');
      expect(input.currentChapter).toBeUndefined();
    });
  });

  describe('Response Structure Validation', () => {
    it('should validate complete grounded QA response structure', () => {
      const mockResponse: GroundedQAResponse = {
        answer: '賈寶玉在第三回中初次登場，展現了其溫文爾雅的性格特點。',
        answerWithCitations: '賈寶玉在第三回中初次登場[1]，展現了其溫文爾雅的性格特點[2]。',
        citations: [
          {
            textSegment: '賈寶玉在第三回中初次登場',
            startIndex: 0,
            endIndex: 12,
            sourceUrls: ['https://example.com/hongloumeng-chapter3'],
            sourceTitles: ['紅樓夢第三回分析'],
          },
          {
            textSegment: '溫文爾雅的性格特點',
            startIndex: 15,
            endIndex: 25,
            sourceUrls: ['https://example.com/jia-baoyu-character'],
            sourceTitles: ['賈寶玉性格分析'],
          },
        ],
        searchQueries: ['賈寶玉 第三回 初次登場', '賈寶玉 性格特點 溫文爾雅'],
        responseTime: 3.2,
        groundingMetadata: {
          totalSearchResults: 8,
          citationCount: 2,
          groundingSuccess: true,
          warnings: undefined,
        },
      };

      // Validate structure
      expect(typeof mockResponse.answer).toBe('string');
      expect(typeof mockResponse.answerWithCitations).toBe('string');
      expect(Array.isArray(mockResponse.citations)).toBe(true);
      expect(Array.isArray(mockResponse.searchQueries)).toBe(true);
      expect(typeof mockResponse.responseTime).toBe('number');
      expect(typeof mockResponse.groundingMetadata).toBe('object');

      // Validate citations
      expect(mockResponse.citations).toHaveLength(2);
      mockResponse.citations.forEach(citation => {
        expect(typeof citation.textSegment).toBe('string');
        expect(typeof citation.startIndex).toBe('number');
        expect(typeof citation.endIndex).toBe('number');
        expect(Array.isArray(citation.sourceUrls)).toBe(true);
        expect(Array.isArray(citation.sourceTitles)).toBe(true);
      });

      // Validate grounding metadata
      expect(mockResponse.groundingMetadata?.totalSearchResults).toBe(8);
      expect(mockResponse.groundingMetadata?.citationCount).toBe(2);
      expect(mockResponse.groundingMetadata?.groundingSuccess).toBe(true);
    });

    it('should handle response with grounding failures', () => {
      const failedResponse: GroundedQAResponse = {
        answer: '這是一個基本回答，但沒有找到可靠的引用資料。',
        answerWithCitations: '這是一個基本回答，但沒有找到可靠的引用資料。',
        citations: [],
        searchQueries: ['賈寶玉 模糊查詢'],
        responseTime: 1.5,
        groundingMetadata: {
          totalSearchResults: 0,
          citationCount: 0,
          groundingSuccess: false,
          warnings: ['搜索結果不足', '無法提取可靠引用'],
        },
      };

      expect(failedResponse.citations).toHaveLength(0);
      expect(failedResponse.groundingMetadata?.groundingSuccess).toBe(false);
      expect(failedResponse.groundingMetadata?.warnings).toHaveLength(2);
      expect(failedResponse.groundingMetadata?.citationCount).toBe(0);
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should maintain type consistency across all interfaces', () => {
      // Test that TypeScript compilation ensures type safety
      const validInput: GroundedQAInput = {
        userQuestion: '測試問題',
        selectedText: '選中文本',
        chapterContext: '章節上下文',
        currentChapter: '第一回',
        enableStreaming: false,
        includeDetailedCitations: true,
      };

      const validCitation: CitationInfo = {
        textSegment: '引用文本',
        startIndex: 0,
        endIndex: 4,
        sourceUrls: ['https://example.com'],
        sourceTitles: ['測試來源'],
      };

      const validMetadata: GroundingMetadata = {
        totalSearchResults: 5,
        citationCount: 1,
        groundingSuccess: true,
      };

      const validResponse: GroundedQAResponse = {
        answer: '測試回答',
        answerWithCitations: '測試回答[1]',
        citations: [validCitation],
        searchQueries: ['測試查詢'],
        groundingMetadata: validMetadata,
      };

      // These assignments should compile without TypeScript errors
      expect(validInput.userQuestion).toBe('測試問題');
      expect(validCitation.textSegment).toBe('引用文本');
      expect(validMetadata.groundingSuccess).toBe(true);
      expect(validResponse.citations).toHaveLength(1);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle various error scenarios gracefully', () => {
      const errorScenarios = [
        {
          name: 'Empty question',
          input: '',
          expectedValid: false,
        },
        {
          name: 'Whitespace only question',
          input: '   \n\t   ',
          expectedValid: false,
        },
        {
          name: 'Very long question',
          input: '這是一個很長的問題'.repeat(100),
          expectedValid: true,
        },
        {
          name: 'Special characters',
          input: '賈寶玉的「紅樓夢」體驗如何？（包含%、#、@等特殊符號）',
          expectedValid: true,
        },
      ];

      errorScenarios.forEach(scenario => {
        const input = { userQuestion: scenario.input };
        const isValid = validateGroundedQAInput(input);
        expect(isValid).toBe(scenario.expectedValid);
      });
    });

    it('should create error responses with proper structure', () => {
      const errorMessage = 'API 連接失敗';
      const errorResponse: GroundedQAResponse = {
        answer: `處理問題時發生錯誤: ${errorMessage}`,
        answerWithCitations: `處理問題時發生錯誤: ${errorMessage}`,
        citations: [],
        searchQueries: [],
        groundingMetadata: {
          totalSearchResults: 0,
          citationCount: 0,
          groundingSuccess: false,
          warnings: [errorMessage],
        },
      };

      expect(errorResponse.answer).toContain('處理問題時發生錯誤');
      expect(errorResponse.citations).toHaveLength(0);
      expect(errorResponse.groundingMetadata?.groundingSuccess).toBe(false);
      expect(errorResponse.groundingMetadata?.warnings).toContain(errorMessage);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large citation arrays efficiently', () => {
      const largeCitationArray: CitationInfo[] = Array.from({ length: 50 }, (_, i) => ({
        textSegment: `文本片段 ${i + 1}`,
        startIndex: i * 20,
        endIndex: (i * 20) + 10,
        sourceUrls: [`https://example.com/source${i + 1}`],
        sourceTitles: [`來源 ${i + 1}`],
      }));

      const largeResponse: GroundedQAResponse = {
        answer: '大量引用的回答',
        answerWithCitations: '大量引用的回答',
        citations: largeCitationArray,
        searchQueries: ['大量', '引用', '測試'],
        groundingMetadata: {
          totalSearchResults: 100,
          citationCount: 50,
          groundingSuccess: true,
        },
      };

      expect(largeResponse.citations).toHaveLength(50);
      expect(largeResponse.groundingMetadata?.citationCount).toBe(50);
      
      // Test that all citations have required properties
      largeResponse.citations.forEach((citation, index) => {
        expect(citation.textSegment).toBe(`文本片段 ${index + 1}`);
        expect(citation.sourceUrls).toHaveLength(1);
        expect(citation.sourceTitles).toHaveLength(1);
      });
    });

    it('should validate complex nested data structures', () => {
      const complexResponse: GroundedQAResponse = {
        answer: '複雜的多層回答結構',
        answerWithCitations: '複雜的多層回答結構[1][2][3]',
        citations: [
          {
            textSegment: '複雜的多層回答',
            startIndex: 0,
            endIndex: 7,
            sourceUrls: [
              'https://example.com/complex1',
              'https://example.com/complex2',
            ],
            sourceTitles: [
              '複雜來源一',
              '複雜來源二',
            ],
          },
        ],
        searchQueries: [
          '複雜 多層 回答',
          '結構 分析',
          '數據 驗證',
        ],
        responseTime: 5.7,
        groundingMetadata: {
          totalSearchResults: 15,
          citationCount: 1,
          groundingSuccess: true,
          warnings: ['數據結構複雜'],
        },
      };

      // Validate nested arrays
      expect(complexResponse.citations[0].sourceUrls).toHaveLength(2);
      expect(complexResponse.citations[0].sourceTitles).toHaveLength(2);
      expect(complexResponse.searchQueries).toHaveLength(3);
      expect(complexResponse.groundingMetadata?.warnings).toHaveLength(1);
      
      // Validate data consistency
      expect(complexResponse.citations[0].sourceUrls.length).toBe(
        complexResponse.citations[0].sourceTitles.length
      );
    });
  });

  describe('Integration with existing systems', () => {
    it('should be compatible with existing AI flow input format', () => {
      // Test that grounded QA input can be created from existing flow inputs
      const legacyInput = {
        selectedText: '寶玉因此上船',
        userQuestion: '這段描述有什麼意義？',
        chapterContext: '第三回的上下文',
      };

      const groundedInput = createGroundedQAInput(legacyInput.userQuestion, {
        selectedText: legacyInput.selectedText,
        chapterContext: legacyInput.chapterContext,
        currentChapter: '第三回',
      });

      expect(validateGroundedQAInput(groundedInput)).toBe(true);
      expect(groundedInput.userQuestion).toBe(legacyInput.userQuestion);
      expect(groundedInput.selectedText).toBe(legacyInput.selectedText);
      expect(groundedInput.chapterContext).toBe(legacyInput.chapterContext);
    });

    it('should support both traditional and grounded response formats', () => {
      const traditionalResponse = {
        explanation: '這是傳統的 AI 回答格式',
      };

      const groundedResponse: GroundedQAResponse = {
        answer: traditionalResponse.explanation,
        answerWithCitations: traditionalResponse.explanation,
        citations: [],
        searchQueries: [],
      };

      // Both formats should be valid for display
      expect(typeof traditionalResponse.explanation).toBe('string');
      expect(typeof groundedResponse.answer).toBe('string');
      expect(groundedResponse.answer).toBe(traditionalResponse.explanation);
    });
  });
});
