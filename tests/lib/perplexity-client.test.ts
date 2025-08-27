/**
 * @fileOverview Unit tests for Perplexity Client
 * 測試 Perplexity 客戶端的單元測試
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { PerplexityClient, getDefaultPerplexityClient, resetDefaultClient } from '@/lib/perplexity-client';
import type { PerplexityQAInput } from '@/types/perplexity-qa';

// Mock axios
const mockAxiosInstance = {
  post: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
} as any;

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  default: {
    create: jest.fn(() => mockAxiosInstance),
  },
}));

// Get the mocked axios to access create method in tests
const mockedAxios = jest.mocked(axios);

// Mock environment variables
const originalEnv = process.env;

describe('PerplexityClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetDefaultClient();
    process.env = {
      ...originalEnv,
      PERPLEXITYAI_API_KEY: 'test-api-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Constructor', () => {
    test('should create client with provided API key', () => {
      const client = new PerplexityClient('custom-api-key');
      expect(client).toBeInstanceOf(PerplexityClient);
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.perplexity.ai',
          timeout: 60000,
          headers: expect.objectContaining({
            'Authorization': 'Bearer custom-api-key',
            'Content-Type': 'application/json',
            'User-Agent': 'RedMansion-Learning-Platform/1.0',
          }),
        })
      );
    });

    test('should create client with environment API key', () => {
      const client = new PerplexityClient();
      expect(client).toBeInstanceOf(PerplexityClient);
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );
    });

    test('should throw error when no API key is available', () => {
      delete process.env.PERPLEXITYAI_API_KEY;
      
      expect(() => new PerplexityClient()).toThrow(
        'Perplexity API key is required. Please set PERPLEXITYAI_API_KEY environment variable.'
      );
    });
  });

  describe('Citation Extraction', () => {
    test('should extract citations from text and API response', async () => {
      const client = new PerplexityClient('test-key');
      const mockResponse = {
        data: {
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'sonar-reasoning-pro',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '根據相關資料 [1] 和研究 [2]，林黛玉是一個複杂的角色。',
              },
              finish_reason: 'stop',
            },
          ],
          citations: [
            'https://zh.wikipedia.org/wiki/紅樓夢',
            'https://www.guoxue.com/hongloumeng/',
          ],
          web_search_queries: ['林黛玉', '紅樓夢人物'],
        },
      };

      (mockAxiosInstance.post as any).mockResolvedValue(mockResponse);

      const input: PerplexityQAInput = {
        userQuestion: '林黛玉的性格特點？',
        enableStreaming: false,
      };

      const result = await client.completionRequest(input);

      expect(result.success).toBe(true);
      expect(result.citations).toHaveLength(2);
      expect(result.citations[0]).toMatchObject({
        number: '1',
        title: '維基百科 (中文)',
        url: 'https://zh.wikipedia.org/wiki/紅樓夢',
        type: 'web_citation',
        domain: 'zh.wikipedia.org',
      });
    });

    test('should provide fallback citations when none are available', async () => {
      const client = new PerplexityClient('test-key');
      const mockResponse = {
        data: {
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'sonar-pro',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '這是一個沒有引用的回答。',
              },
              finish_reason: 'stop',
            },
          ],
        },
      };

      (mockAxiosInstance.post as any).mockResolvedValue(mockResponse);

      const input: PerplexityQAInput = {
        userQuestion: '測試問題',
        enableStreaming: false,
      };

      const result = await client.completionRequest(input);

      expect(result.success).toBe(true);
      expect(result.citations).toHaveLength(2); // Should have default fallback citations
      expect(result.citations[0].type).toBe('default');
    });
  });

  describe('HTML Cleaning', () => {
    test('should clean HTML tags from response', async () => {
      const client = new PerplexityClient('test-key');
      const mockResponse = {
        data: {
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'sonar-reasoning-pro',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '<think>這是思考過程</think><p>這是主要回答</p><strong>重要內容</strong>',
              },
              finish_reason: 'stop',
            },
          ],
        },
      };

      (mockAxiosInstance.post as any).mockResolvedValue(mockResponse);

      const input: PerplexityQAInput = {
        userQuestion: '測試問題',
        showThinkingProcess: true,
        enableStreaming: false,
      };

      const result = await client.completionRequest(input);

      expect(result.answer).toContain('💭 思考過程：');
      expect(result.answer).toContain('這是思考過程');
      expect(result.answer).toContain('這是主要回答');
      expect(result.answer).not.toContain('<think>');
      expect(result.answer).not.toContain('<p>');
    });

    test('should remove thinking process when disabled', async () => {
      const client = new PerplexityClient('test-key');
      const mockResponse = {
        data: {
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'sonar-reasoning-pro',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '<think>這是思考過程</think>這是主要回答',
              },
              finish_reason: 'stop',
            },
          ],
        },
      };

      (mockAxiosInstance.post as any).mockResolvedValue(mockResponse);

      const input: PerplexityQAInput = {
        userQuestion: '測試問題',
        showThinkingProcess: false,
        enableStreaming: false,
      };

      const result = await client.completionRequest(input);

      expect(result.answer).not.toContain('思考過程');
      expect(result.answer).toBe('這是主要回答');
    });
  });

  describe('Prompt Building', () => {
    test('should build specialized prompts based on context', async () => {
      const client = new PerplexityClient('test-key');
      const mockResponse = {
        data: {
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'sonar-pro',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '測試回答',
              },
              finish_reason: 'stop',
            },
          ],
        },
      };

      (mockAxiosInstance.post as any).mockResolvedValue(mockResponse);

      const input: PerplexityQAInput = {
        userQuestion: '林黛玉的性格？',
        selectedText: '黛玉聽了，便放下釣竿',
        chapterContext: '第三回的背景...',
        currentChapter: '第三回',
        questionContext: 'character',
        enableStreaming: false,
      };

      await client.completionRequest(input);

      const callArgs = (mockAxiosInstance.post as any).mock.calls[0];
      const requestData = callArgs[1] as any;
      const prompt = requestData.messages[0].content;

      expect(prompt).toContain('請特別關注人物性格分析、人物關係和角色發展');
      expect(prompt).toContain('當前章回上下文：');
      expect(prompt).toContain('第三回的背景...');
      expect(prompt).toContain('使用者選取的文字：');
      expect(prompt).toContain('黛玉聽了，便放下釣竿');
      expect(prompt).toContain('目前閱讀章回：第三回');
      expect(prompt).toContain(input.userQuestion);
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      const client = new PerplexityClient('test-key');
      const error = new Error('Network error');
      (mockAxiosInstance.post as any).mockRejectedValue(error);

      const input: PerplexityQAInput = {
        userQuestion: '測試問題',
        enableStreaming: false,
      };

      const result = await client.completionRequest(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
      expect(result.answer).toContain('處理問題時發生錯誤');
    });

    test('should handle invalid API responses', async () => {
      const client = new PerplexityClient('test-key');
      const mockResponse = {
        data: {
          id: 'test-id',
          choices: [], // Empty choices array
        },
      };

      (mockAxiosInstance.post as any).mockResolvedValue(mockResponse);

      const input: PerplexityQAInput = {
        userQuestion: '測試問題',
        enableStreaming: false,
      };

      const result = await client.completionRequest(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid response from Perplexity API');
    });
  });

  describe('Connection Testing', () => {
    test('should test connection successfully', async () => {
      const client = new PerplexityClient('test-key');
      const mockResponse = {
        data: {
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'sonar-pro',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '連線測試成功',
              },
              finish_reason: 'stop',
            },
          ],
        },
      };

      (mockAxiosInstance.post as any).mockResolvedValue(mockResponse);

      const result = await client.testConnection();

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should handle connection test failure', async () => {
      const client = new PerplexityClient('test-key');
      const error = new Error('Connection failed');
      (mockAxiosInstance.post as any).mockReset();
      (mockAxiosInstance.post as any).mockRejectedValue(error);

      const result = await client.testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection failed');
    });
  });

  describe('Default Client Management', () => {
    test('should create and reuse default client', () => {
      const client1 = getDefaultPerplexityClient();
      const client2 = getDefaultPerplexityClient();

      expect(client1).toBe(client2); // Should be the same instance
    });

    test('should reset default client', () => {
      const client1 = getDefaultPerplexityClient();
      resetDefaultClient();
      const client2 = getDefaultPerplexityClient();

      expect(client1).not.toBe(client2); // Should be different instances
    });
  });

  describe('Static Methods', () => {
    test('should check if Perplexity is configured', () => {
      process.env.PERPLEXITYAI_API_KEY = 'test-key';
      expect(PerplexityClient.isConfigured()).toBe(true);

      delete process.env.PERPLEXITYAI_API_KEY;
      expect(PerplexityClient.isConfigured()).toBe(false);
    });
  });

  describe('Streaming Error Handling', () => {
    test('should handle streaming generator errors gracefully', async () => {
      const client = new PerplexityClient('test-key');
      
      // Mock axios to throw error during streaming
      (mockAxiosInstance.post as any).mockRejectedValue(new Error('Network error during streaming'));

      const input: PerplexityQAInput = {
        userQuestion: '測試流式錯誤',
        enableStreaming: true,
      };

      const chunks: any[] = [];
      
      // The streamingCompletionRequest method handles errors internally and yields error chunks
      // instead of throwing exceptions, so we should check for error chunks
      for await (const chunk of client.streamingCompletionRequest(input)) {
        chunks.push(chunk);
        if (chunk.isComplete) break;
      }

      // Should have received at least one chunk with error information
      expect(chunks.length).toBeGreaterThan(0);
      const lastChunk = chunks[chunks.length - 1];
      expect(lastChunk.isComplete).toBe(true);
      expect(lastChunk.error).toBeDefined();
      expect(lastChunk.error).toContain('Network error during streaming');
    });

    test('should validate async generator return type', async () => {
      const client = new PerplexityClient('test-key');
      
      const input: PerplexityQAInput = {
        userQuestion: '測試生成器類型',
        enableStreaming: true,
      };

      const generator = client.streamingCompletionRequest(input);
      
      // Check that it returns an async generator
      expect(typeof generator).toBe('object');
      expect(typeof generator[Symbol.asyncIterator]).toBe('function');
      // In JavaScript/TypeScript, async generators return objects with constructor.name "Object"
      // The key is that they have the Symbol.asyncIterator method
      expect(generator.constructor.name).toBe('Object');
      expect(generator[Symbol.asyncIterator]).toBeDefined();
    });

    test('should handle malformed streaming response', async () => {
      const client = new PerplexityClient('test-key');
      
      // Mock a response that returns invalid streaming data
      const mockInvalidStream = {
        on: jest.fn((event: string, callback: (data?: any) => void) => {
          if (event === 'data') {
            // Simulate malformed SSE data
            callback('invalid data without proper format\n');
          }
          if (event === 'end') {
            callback();
          }
        }),
        removeAllListeners: jest.fn(),
      };

      (mockAxiosInstance.post as any).mockResolvedValue({
        data: mockInvalidStream,
      });

      const input: PerplexityQAInput = {
        userQuestion: '測試格式錯誤',
        enableStreaming: true,
      };

      const chunks: any[] = [];
      
      for await (const chunk of client.streamingCompletionRequest(input)) {
        chunks.push(chunk);
        if (chunk.isComplete) break;
      }

      // Should complete with error handling
      expect(chunks.length).toBeGreaterThan(0);
      const lastChunk = chunks[chunks.length - 1];
      expect(lastChunk.isComplete).toBe(true);
    });
  });

  describe('URL Processing', () => {
    test('should extract friendly titles from various domains', async () => {
      const client = new PerplexityClient('test-key');
      const mockResponse = {
        data: {
          id: 'test-id',
          object: 'chat.completion',
          created: Date.now(),
          model: 'sonar-pro',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: '根據資料 [1] [2] [3]',
              },
              finish_reason: 'stop',
            },
          ],
          citations: [
            'https://zh.wikipedia.org/wiki/紅樓夢',
            'https://www.zhihu.com/question/12345',
            'https://unknown-domain.com/article',
          ],
        },
      };

      (mockAxiosInstance.post as any).mockResolvedValue(mockResponse);

      const input: PerplexityQAInput = {
        userQuestion: '測試問題',
        enableStreaming: false,
      };

      const result = await client.completionRequest(input);

      expect(result.citations[0].title).toBe('維基百科 (中文)');
      expect(result.citations[1].title).toBe('知乎');
      expect(result.citations[2].title).toBe('unknown-domain');
    });
  });
});
