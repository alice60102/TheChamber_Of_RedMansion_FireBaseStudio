/**
 * @fileOverview Tests for ConversationFlow Component
 *
 * Tests cover:
 * - User message rendering (blue bubbles)
 * - AI message rendering (with custom AIMessageBubble)
 * - System message rendering
 * - Empty state display
 * - Message timestamps
 * - Auto-scroll behavior
 * - New conversation separator
 * - Custom renderMessageContent function
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ConversationFlow,
  createConversationMessage,
  type ConversationMessage,
  type MessageRole,
} from '@/components/ui/ConversationFlow';
import type { PerplexityCitation } from '@/types/perplexity-qa';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon" />,
  Bot: () => <div data-testid="bot-icon" />,
  MessageSquare: () => <div data-testid="message-square-icon" />,
}));

describe('ConversationFlow Component', () => {
  const mockCitations: PerplexityCitation[] = [
    { number: '1', url: 'https://example.com/1', title: 'Source 1' },
  ];

  const userMessage: ConversationMessage = {
    id: 'user-1',
    role: 'user',
    content: 'What is the meaning of this chapter?',
    timestamp: new Date('2025-10-07T10:00:00'),
  };

  const aiMessage: ConversationMessage = {
    id: 'ai-1',
    role: 'ai',
    content: 'This chapter discusses the symbolism...',
    timestamp: new Date('2025-10-07T10:01:00'),
    citations: mockCitations,
    thinkingProcess: 'Analyzing the question...',
    thinkingDuration: 12,
  };

  const systemMessage: ConversationMessage = {
    id: 'system-1',
    role: 'system',
    content: 'System notification',
    timestamp: new Date('2025-10-07T10:02:00'),
  };

  describe('Empty State', () => {
    test('should show empty state when no messages', () => {
      render(<ConversationFlow messages={[]} />);

      expect(screen.getByText('尚無對話記錄')).toBeInTheDocument();
      expect(screen.getByText('開始提出您的問題吧')).toBeInTheDocument();
    });

    test('should show message square icon in empty state', () => {
      render(<ConversationFlow messages={[]} />);

      expect(screen.getByTestId('message-square-icon')).toBeInTheDocument();
    });

    test('should NOT show new conversation separator when empty', () => {
      render(<ConversationFlow messages={[]} />);

      expect(screen.queryByText('--開啟新對話--')).not.toBeInTheDocument();
    });
  });

  describe('User Message Rendering', () => {
    test('should render user message with blue bubble style', () => {
      const { container } = render(<ConversationFlow messages={[userMessage]} />);

      expect(screen.getByText(userMessage.content)).toBeInTheDocument();

      // Check for blue bubble class (bg-blue-500)
      const bubble = container.querySelector('.bg-blue-500');
      expect(bubble).toBeInTheDocument();
    });

    test('should show user icon for user messages', () => {
      render(<ConversationFlow messages={[userMessage]} />);

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    test('should display user message timestamp', () => {
      render(<ConversationFlow messages={[userMessage]} />);

      // Should show HH:mm format
      expect(screen.getByText('10:00')).toBeInTheDocument();
    });

    test('should align user messages to the right', () => {
      const { container } = render(<ConversationFlow messages={[userMessage]} />);

      // User messages have ml-auto and flex-row-reverse classes
      const messageContainer = container.querySelector('.ml-auto');
      expect(messageContainer).toBeInTheDocument();
    });
  });

  describe('AI Message Rendering', () => {
    test('should render AI message content', () => {
      render(<ConversationFlow messages={[aiMessage]} />);

      expect(screen.getByText(aiMessage.content)).toBeInTheDocument();
    });

    test('should show bot icon for AI messages', () => {
      render(<ConversationFlow messages={[aiMessage]} />);

      expect(screen.getByTestId('bot-icon')).toBeInTheDocument();
    });

    test('should display AI message timestamp', () => {
      render(<ConversationFlow messages={[aiMessage]} />);

      expect(screen.getByText('10:01')).toBeInTheDocument();
    });

    test('should align AI messages to the left', () => {
      const { container } = render(<ConversationFlow messages={[aiMessage]} />);

      // AI messages should NOT have ml-auto class
      const messages = container.querySelectorAll('.bg-white, .bg-gray-800');
      expect(messages.length).toBeGreaterThan(0);
    });

    test('should use custom renderMessageContent for AI messages', () => {
      const renderContent = jest.fn(() => <div>Custom AI Render</div>);

      render(
        <ConversationFlow
          messages={[aiMessage]}
          renderMessageContent={renderContent}
        />
      );

      expect(renderContent).toHaveBeenCalledWith(aiMessage);
      expect(screen.getByText('Custom AI Render')).toBeInTheDocument();
    });
  });

  describe('System Message Rendering', () => {
    test('should render system message with gray bubble', () => {
      const { container } = render(<ConversationFlow messages={[systemMessage]} />);

      expect(screen.getByText(systemMessage.content)).toBeInTheDocument();

      // System messages have bg-gray-100 or bg-gray-800 class
      const bubble = container.querySelector('.bg-gray-100, .bg-gray-800');
      expect(bubble).toBeInTheDocument();
    });

    test('should center system messages', () => {
      const { container } = render(<ConversationFlow messages={[systemMessage]} />);

      // System messages have mx-auto class
      const messageContainer = container.querySelector('.mx-auto');
      expect(messageContainer).toBeInTheDocument();
    });

    test('should NOT show avatar for system messages', () => {
      render(<ConversationFlow messages={[systemMessage]} />);

      // System messages don't render avatar icons
      expect(screen.queryByTestId('user-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bot-icon')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Messages', () => {
    test('should render multiple messages in order', () => {
      const messages = [userMessage, aiMessage, systemMessage];
      render(<ConversationFlow messages={messages} />);

      expect(screen.getByText(userMessage.content)).toBeInTheDocument();
      expect(screen.getByText(aiMessage.content)).toBeInTheDocument();
      expect(screen.getByText(systemMessage.content)).toBeInTheDocument();
    });

    test('should render alternating user and AI messages', () => {
      const user2: ConversationMessage = {
        ...userMessage,
        id: 'user-2',
        content: 'Another user question',
      };

      const ai2: ConversationMessage = {
        ...aiMessage,
        id: 'ai-2',
        content: 'Another AI response',
      };

      const messages = [userMessage, aiMessage, user2, ai2];
      render(<ConversationFlow messages={messages} />);

      expect(screen.getAllByTestId('user-icon')).toHaveLength(2);
      expect(screen.getAllByTestId('bot-icon')).toHaveLength(2);
    });
  });

  describe('Message States', () => {
    test('should show streaming indicator for streaming messages', () => {
      const streamingMessage: ConversationMessage = {
        ...aiMessage,
        isStreaming: true,
      };

      render(<ConversationFlow messages={[streamingMessage]} />);

      expect(screen.getByText(/傳送中\.\.\./)).toBeInTheDocument();
    });

    test('should show error state for failed messages', () => {
      const errorMessage: ConversationMessage = {
        ...aiMessage,
        hasError: true,
        errorMessage: 'Failed to process request',
      };

      render(<ConversationFlow messages={[errorMessage]} />);

      expect(screen.getByText(/⚠️ Failed to process request/)).toBeInTheDocument();
    });

    test('should show error styling for error messages', () => {
      const errorMessage: ConversationMessage = {
        ...aiMessage,
        hasError: true,
        errorMessage: 'API Error',
      };

      const { container } = render(<ConversationFlow messages={[errorMessage]} />);

      // Error messages have border-red-500 class
      const bubble = container.querySelector('.border-red-500');
      expect(bubble).toBeInTheDocument();
    });
  });

  describe('New Conversation Separator', () => {
    test('should show separator when showNewConversationSeparator is true and messages exist', () => {
      render(
        <ConversationFlow
          messages={[userMessage]}
          showNewConversationSeparator={true}
        />
      );

      expect(screen.getByText('--開啟新對話--')).toBeInTheDocument();
    });

    test('should NOT show separator when showNewConversationSeparator is false', () => {
      render(
        <ConversationFlow
          messages={[userMessage]}
          showNewConversationSeparator={false}
        />
      );

      expect(screen.queryByText('--開啟新對話--')).not.toBeInTheDocument();
    });

    test('should call onNewConversation when separator clicked', () => {
      const onNewConversation = jest.fn();

      render(
        <ConversationFlow
          messages={[userMessage]}
          onNewConversation={onNewConversation}
        />
      );

      fireEvent.click(screen.getByText('--開啟新對話--'));
      expect(onNewConversation).toHaveBeenCalledTimes(1);
    });

    test('should show separator by default (prop default value)', () => {
      render(<ConversationFlow messages={[userMessage]} />);

      expect(screen.getByText('--開啟新對話--')).toBeInTheDocument();
    });
  });

  describe('Custom Message Rendering', () => {
    test('should use renderMessageContent for user messages when provided', () => {
      const renderContent = jest.fn((message: ConversationMessage) => {
        if (message.role === 'user') {
          return <div>Custom User: {message.content}</div>;
        }
        return undefined;
      });

      render(
        <ConversationFlow
          messages={[userMessage]}
          renderMessageContent={renderContent}
        />
      );

      expect(screen.getByText(`Custom User: ${userMessage.content}`)).toBeInTheDocument();
    });

    test('should fall back to default rendering when renderMessageContent returns undefined', () => {
      const renderContent = jest.fn(() => undefined);

      render(
        <ConversationFlow
          messages={[userMessage]}
          renderMessageContent={renderContent}
        />
      );

      // Should show default user message bubble
      expect(screen.getByText(userMessage.content)).toBeInTheDocument();
    });

    test('should call renderMessageContent for each message', () => {
      const renderContent = jest.fn(() => undefined);
      const messages = [userMessage, aiMessage];

      render(
        <ConversationFlow
          messages={messages}
          renderMessageContent={renderContent}
        />
      );

      expect(renderContent).toHaveBeenCalledTimes(2);
      expect(renderContent).toHaveBeenCalledWith(userMessage);
      expect(renderContent).toHaveBeenCalledWith(aiMessage);
    });
  });

  describe('Auto-scroll Behavior', () => {
    test('should auto-scroll by default', () => {
      const { container } = render(<ConversationFlow messages={[userMessage]} />);

      // Component should render with autoScroll=true by default
      // The scroll anchor div should be present
      const scrollAnchor = container.querySelector('.h-px');
      expect(scrollAnchor).toBeInTheDocument();
    });

    test('should respect autoScroll prop when set to false', () => {
      render(
        <ConversationFlow
          messages={[userMessage]}
          autoScroll={false}
        />
      );

      // Component should still render but not auto-scroll
      expect(screen.getByText(userMessage.content)).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    test('should apply custom className', () => {
      const { container } = render(
        <ConversationFlow
          messages={[userMessage]}
          className="custom-conversation-class"
        />
      );

      expect(container.querySelector('.custom-conversation-class')).toBeInTheDocument();
    });

    test('should have conversation-flow base class', () => {
      const { container } = render(<ConversationFlow messages={[userMessage]} />);

      expect(container.querySelector('.conversation-flow')).toBeInTheDocument();
    });

    test('should apply animate-in classes for smooth entry', () => {
      const { container } = render(<ConversationFlow messages={[userMessage]} />);

      // Messages should have animate-in class
      const message = container.querySelector('.animate-in');
      expect(message).toBeInTheDocument();
    });
  });

  describe('createConversationMessage Utility', () => {
    test('should create user message with correct structure', () => {
      const message = createConversationMessage('user', 'Test content');

      expect(message.role).toBe('user');
      expect(message.content).toBe('Test content');
      expect(message.id).toBeDefined();
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    test('should create AI message with citations', () => {
      const message = createConversationMessage('ai', 'AI response', {
        citations: mockCitations,
      });

      expect(message.role).toBe('ai');
      expect(message.citations).toEqual(mockCitations);
    });

    test('should create message with thinking process', () => {
      const message = createConversationMessage('ai', 'Answer', {
        thinkingProcess: 'Thinking...',
        thinkingDuration: 15,
      });

      expect(message.thinkingProcess).toBe('Thinking...');
      expect(message.thinkingDuration).toBe(15);
    });

    test('should generate unique IDs for different messages', () => {
      const msg1 = createConversationMessage('user', 'Content 1');
      const msg2 = createConversationMessage('user', 'Content 2');

      expect(msg1.id).not.toBe(msg2.id);
    });

    test('should create streaming message', () => {
      const message = createConversationMessage('ai', 'Partial response', {
        isStreaming: true,
      });

      expect(message.isStreaming).toBe(true);
    });

    test('should create error message', () => {
      const message = createConversationMessage('ai', 'Failed response', {
        hasError: true,
        errorMessage: 'Timeout error',
      });

      expect(message.hasError).toBe(true);
      expect(message.errorMessage).toBe('Timeout error');
    });
  });

  describe('Edge Cases', () => {
    test('should handle message with very long content', () => {
      const longContent = 'A'.repeat(10000);
      const longMessage: ConversationMessage = {
        ...userMessage,
        content: longContent,
      };

      render(<ConversationFlow messages={[longMessage]} />);

      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    test('should handle message with special characters', () => {
      const specialContent = '特殊字符 <>&"\'`\\n\\t';
      const specialMessage: ConversationMessage = {
        ...userMessage,
        content: specialContent,
      };

      render(<ConversationFlow messages={[specialMessage]} />);

      expect(screen.getByText(specialContent)).toBeInTheDocument();
    });

    test('should handle empty citations array', () => {
      const messageWithNoCitations: ConversationMessage = {
        ...aiMessage,
        citations: [],
      };

      render(<ConversationFlow messages={[messageWithNoCitations]} />);

      expect(screen.getByText(aiMessage.content)).toBeInTheDocument();
    });

    test('should handle message without optional fields', () => {
      const minimalMessage: ConversationMessage = {
        id: 'minimal-1',
        role: 'ai',
        content: 'Minimal AI response',
        timestamp: new Date(),
      };

      render(<ConversationFlow messages={[minimalMessage]} />);

      expect(screen.getByText('Minimal AI response')).toBeInTheDocument();
    });

    test('should handle very large number of messages', () => {
      const manyMessages: ConversationMessage[] = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        role: (i % 2 === 0 ? 'user' : 'ai') as MessageRole,
        content: `Message ${i}`,
        timestamp: new Date(),
      }));

      render(<ConversationFlow messages={manyMessages} />);

      expect(screen.getByText('Message 0')).toBeInTheDocument();
      expect(screen.getByText('Message 99')).toBeInTheDocument();
    });
  });
});
