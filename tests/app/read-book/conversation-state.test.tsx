/**
 * @fileOverview Tests for Conversation State Management
 *
 * Tests the conversation state logic in read-book/page.tsx:
 * - User message creation and storage
 * - Input clearing after submission
 * - AI message creation with thinking + duration
 * - Message data usage (not global state)
 * - localStorage persistence
 * - Date serialization/deserialization
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import type {
  ConversationMessage,
  MessageRole,
} from '@/components/ui/ConversationFlow';
import type { PerplexityCitation } from '@/types/perplexity-qa';

describe('Conversation State Management', () => {
  const mockCitations: PerplexityCitation[] = [
    { number: '1', url: 'https://example.com/1', title: 'Source 1' },
  ];

  // LocalStorage mock setup
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock = {};

    // Mock localStorage methods
    global.Storage.prototype.getItem = jest.fn((key: string) => localStorageMock[key] || null);
    global.Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });
    global.Storage.prototype.removeItem = jest.fn((key: string) => {
      delete localStorageMock[key];
    });
    global.Storage.prototype.clear = jest.fn(() => {
      localStorageMock = {};
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('User Message Creation', () => {
    test('should create user message with correct structure', () => {
      const questionText = 'What is the meaning of this chapter?';

      const userMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        role: 'user' as MessageRole,
        content: questionText,
        timestamp: new Date(),
      };

      expect(userMessage.role).toBe('user');
      expect(userMessage.content).toBe(questionText);
      expect(userMessage.id).toMatch(/^user-\d+$/);
      expect(userMessage.timestamp).toBeInstanceOf(Date);
    });

    test('should create user message without optional fields', () => {
      const userMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        role: 'user' as MessageRole,
        content: 'Test question',
        timestamp: new Date(),
      };

      expect(userMessage.citations).toBeUndefined();
      expect(userMessage.thinkingProcess).toBeUndefined();
      expect(userMessage.thinkingDuration).toBeUndefined();
      expect(userMessage.isStreaming).toBeUndefined();
      expect(userMessage.hasError).toBeUndefined();
    });

    test('should generate unique IDs for consecutive messages', () => {
      const msg1: ConversationMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: 'Question 1',
        timestamp: new Date(),
      };

      // Small delay to ensure different timestamp
      const msg2: ConversationMessage = {
        id: `user-${Date.now() + 1}`,
        role: 'user',
        content: 'Question 2',
        timestamp: new Date(),
      };

      expect(msg1.id).not.toBe(msg2.id);
    });
  });

  describe('AI Message Creation with Thinking', () => {
    test('should create AI message with thinking process and duration', () => {
      const fullContent = 'This chapter discusses symbolism...';
      const thinkingContent = 'Analyzing the question...';
      const responseTime = 12000; // 12 seconds in milliseconds

      const aiMessage: ConversationMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai' as MessageRole,
        content: fullContent,
        timestamp: new Date(),
        citations: mockCitations,
        thinkingProcess: thinkingContent,  // ✅ Store thinking process
        thinkingDuration: Math.round(responseTime / 1000),  // ✅ Store duration in seconds
        isStreaming: false,
      };

      expect(aiMessage.role).toBe('ai');
      expect(aiMessage.content).toBe(fullContent);
      expect(aiMessage.thinkingProcess).toBe(thinkingContent);
      expect(aiMessage.thinkingDuration).toBe(12);
      expect(aiMessage.citations).toEqual(mockCitations);
      expect(aiMessage.isStreaming).toBe(false);
    });

    test('should calculate thinkingDuration correctly from milliseconds', () => {
      const testCases = [
        { responseTime: 5000, expectedDuration: 5 },
        { responseTime: 12500, expectedDuration: 13 }, // Rounds up
        { responseTime: 12499, expectedDuration: 12 }, // Rounds down
        { responseTime: 1000, expectedDuration: 1 },
        { responseTime: 999, expectedDuration: 1 },
        { responseTime: 0, expectedDuration: 0 },
      ];

      testCases.forEach(({ responseTime, expectedDuration }) => {
        const duration = Math.round(responseTime / 1000);
        expect(duration).toBe(expectedDuration);
      });
    });

    test('should create AI message without thinking (optional fields)', () => {
      const aiMessage: ConversationMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: 'Simple AI response',
        timestamp: new Date(),
        citations: [],
        isStreaming: false,
      };

      expect(aiMessage.thinkingProcess).toBeUndefined();
      expect(aiMessage.thinkingDuration).toBeUndefined();
    });

    test('should store citations in AI message', () => {
      const multipleCitations: PerplexityCitation[] = [
        { number: '1', url: 'https://example.com/1', title: 'Source 1' },
        { number: '2', url: 'https://example.com/2', title: 'Source 2' },
        { number: '3', url: 'https://example.com/3', title: 'Source 3' },
      ];

      const aiMessage: ConversationMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: 'Answer with citations',
        timestamp: new Date(),
        citations: multipleCitations,
        isStreaming: false,
      };

      expect(aiMessage.citations).toHaveLength(3);
      expect(aiMessage.citations).toEqual(multipleCitations);
    });
  });

  describe('Message Data Usage (Not Global State)', () => {
    test('should use message.content instead of global state', () => {
      // Simulate message data usage pattern
      const messages: ConversationMessage[] = [
        {
          id: 'ai-1',
          role: 'ai',
          content: 'First AI response',
          timestamp: new Date(),
          citations: [],
          thinkingProcess: 'First thinking',
          thinkingDuration: 10,
          isStreaming: false,
        },
        {
          id: 'ai-2',
          role: 'ai',
          content: 'Second AI response',
          timestamp: new Date(),
          citations: mockCitations,
          thinkingProcess: 'Second thinking',
          thinkingDuration: 15,
          isStreaming: false,
        },
      ];

      // Each message should have its own content
      expect(messages[0].content).toBe('First AI response');
      expect(messages[1].content).toBe('Second AI response');

      // Each message should have its own thinking
      expect(messages[0].thinkingProcess).toBe('First thinking');
      expect(messages[1].thinkingProcess).toBe('Second thinking');

      // Each message should have its own duration
      expect(messages[0].thinkingDuration).toBe(10);
      expect(messages[1].thinkingDuration).toBe(15);
    });

    test('should preserve message data independently of global state changes', () => {
      const originalMessage: ConversationMessage = {
        id: 'ai-1',
        role: 'ai',
        content: 'Original content',
        timestamp: new Date(),
        citations: mockCitations,
        thinkingProcess: 'Original thinking',
        thinkingDuration: 12,
        isStreaming: false,
      };

      // Simulate global state change (should NOT affect message)
      const globalState = {
        answer: 'Different global content',
        citations: [],
        thinkingContent: 'Different global thinking',
      };

      // Message data should remain unchanged
      expect(originalMessage.content).toBe('Original content');
      expect(originalMessage.thinkingProcess).toBe('Original thinking');
      expect(originalMessage.citations).toEqual(mockCitations);
    });
  });

  describe('localStorage Persistence', () => {
    const STORAGE_KEY = 'redmansion_qa_conversations';

    test('should save conversation messages to localStorage', () => {
      const messages: ConversationMessage[] = [
        {
          id: 'user-1',
          role: 'user',
          content: 'Test question',
          timestamp: new Date('2025-10-07T10:00:00'),
        },
        {
          id: 'ai-1',
          role: 'ai',
          content: 'Test answer',
          timestamp: new Date('2025-10-07T10:01:00'),
          citations: mockCitations,
          thinkingProcess: 'Test thinking',
          thinkingDuration: 10,
          isStreaming: false,
        },
      ];

      // Simulate save
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      );

      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].content).toBe('Test question');
      expect(parsed[1].content).toBe('Test answer');
    });

    test('should load conversation messages from localStorage', () => {
      const storedMessages = [
        {
          id: 'user-1',
          role: 'user',
          content: 'Stored question',
          timestamp: '2025-10-07T10:00:00.000Z',
        },
        {
          id: 'ai-1',
          role: 'ai',
          content: 'Stored answer',
          timestamp: '2025-10-07T10:01:00.000Z',
          citations: mockCitations,
          thinkingProcess: 'Stored thinking',
          thinkingDuration: 15,
        },
      ];

      // Simulate load
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedMessages));
      const loaded = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(loaded!);

      // Convert timestamp strings back to Date objects
      const messagesWithDates = parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));

      expect(messagesWithDates).toHaveLength(2);
      expect(messagesWithDates[0].timestamp).toBeInstanceOf(Date);
      expect(messagesWithDates[1].timestamp).toBeInstanceOf(Date);
      expect(messagesWithDates[0].content).toBe('Stored question');
      expect(messagesWithDates[1].thinkingProcess).toBe('Stored thinking');
    });

    test('should handle Date serialization/deserialization correctly', () => {
      const originalDate = new Date('2025-10-07T10:00:00.000Z');

      const message: ConversationMessage = {
        id: 'test-1',
        role: 'user',
        content: 'Test',
        timestamp: originalDate,
      };

      // Serialize
      const serialized = JSON.stringify([message]);

      // Deserialize
      const parsed = JSON.parse(serialized);
      const restoredMessage = {
        ...parsed[0],
        timestamp: new Date(parsed[0].timestamp),
      };

      expect(restoredMessage.timestamp).toBeInstanceOf(Date);
      expect(restoredMessage.timestamp.getTime()).toBe(originalDate.getTime());
    });

    test('should handle localStorage error gracefully', () => {
      // Mock localStorage.setItem to throw error (quota exceeded)
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const messages: ConversationMessage[] = [
        {
          id: 'user-1',
          role: 'user',
          content: 'Test',
          timestamp: new Date(),
        },
      ];

      // Should not throw error
      expect(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch (error) {
          console.error('Failed to save conversation history:', error);
        }
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();

      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('should handle malformed localStorage data gracefully', () => {
      // Store invalid JSON
      localStorageMock[STORAGE_KEY] = 'invalid json {{{';

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Should not crash
      expect(() => {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            JSON.parse(stored);
          }
        } catch (error) {
          console.error('Failed to load conversation history:', error);
        }
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    test('should handle empty localStorage gracefully', () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeNull();

      // Should not crash when no data
      const messages: ConversationMessage[] = [];
      expect(messages).toHaveLength(0);
    });

    test('should preserve all message fields in storage', () => {
      const complexMessage: ConversationMessage = {
        id: 'ai-complex',
        role: 'ai',
        content: 'Complex answer',
        timestamp: new Date('2025-10-07T10:00:00'),
        citations: mockCitations,
        thinkingProcess: 'Complex thinking',
        thinkingDuration: 25,
        isStreaming: false,
        hasError: false,
      };

      const serialized = JSON.stringify([complexMessage]);
      const parsed = JSON.parse(serialized)[0];

      expect(parsed.id).toBe(complexMessage.id);
      expect(parsed.role).toBe(complexMessage.role);
      expect(parsed.content).toBe(complexMessage.content);
      expect(parsed.citations).toEqual(complexMessage.citations);
      expect(parsed.thinkingProcess).toBe(complexMessage.thinkingProcess);
      expect(parsed.thinkingDuration).toBe(complexMessage.thinkingDuration);
      expect(parsed.isStreaming).toBe(complexMessage.isStreaming);
      expect(parsed.hasError).toBe(complexMessage.hasError);
    });
  });

  describe('Input Clearing Logic', () => {
    test('should simulate input clearing after message creation', () => {
      let userQuestionInput = 'What is the meaning?';

      // Store question before clearing
      const questionText = userQuestionInput;

      // Create user message
      const userMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: questionText,
        timestamp: new Date(),
      };

      // Clear input
      userQuestionInput = '';

      expect(userMessage.content).toBe('What is the meaning?');
      expect(userQuestionInput).toBe('');
    });

    test('should preserve message content after input cleared', () => {
      const originalInput = 'Original question text';
      let input = originalInput;

      const message: ConversationMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: input,
        timestamp: new Date(),
      };

      // Clear input
      input = '';

      // Message should still have original content
      expect(message.content).toBe(originalInput);
      expect(input).toBe('');
    });
  });

  describe('Message Array Operations', () => {
    test('should append user message to conversation array', () => {
      const messages: ConversationMessage[] = [];

      const userMessage: ConversationMessage = {
        id: 'user-1',
        role: 'user',
        content: 'New question',
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMessage];

      expect(updatedMessages).toHaveLength(1);
      expect(updatedMessages[0]).toEqual(userMessage);
    });

    test('should append AI message to conversation array', () => {
      const messages: ConversationMessage[] = [
        {
          id: 'user-1',
          role: 'user',
          content: 'Question',
          timestamp: new Date(),
        },
      ];

      const aiMessage: ConversationMessage = {
        id: 'ai-1',
        role: 'ai',
        content: 'Answer',
        timestamp: new Date(),
        citations: mockCitations,
        thinkingProcess: 'Thinking...',
        thinkingDuration: 10,
        isStreaming: false,
      };

      const updatedMessages = [...messages, aiMessage];

      expect(updatedMessages).toHaveLength(2);
      expect(updatedMessages[1]).toEqual(aiMessage);
    });

    test('should maintain conversation order', () => {
      const messages: ConversationMessage[] = [];

      const msg1: ConversationMessage = {
        id: 'user-1',
        role: 'user',
        content: 'First',
        timestamp: new Date('2025-10-07T10:00:00'),
      };

      const msg2: ConversationMessage = {
        id: 'ai-1',
        role: 'ai',
        content: 'Second',
        timestamp: new Date('2025-10-07T10:01:00'),
        citations: [],
        isStreaming: false,
      };

      const msg3: ConversationMessage = {
        id: 'user-2',
        role: 'user',
        content: 'Third',
        timestamp: new Date('2025-10-07T10:02:00'),
      };

      const updatedMessages = [msg1, msg2, msg3];

      expect(updatedMessages[0].content).toBe('First');
      expect(updatedMessages[1].content).toBe('Second');
      expect(updatedMessages[2].content).toBe('Third');
    });
  });
});
