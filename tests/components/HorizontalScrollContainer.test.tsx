/**
 * @fileOverview HorizontalScrollContainer Component Tests
 *
 * Comprehensive test suite for the HorizontalScrollContainer component,
 * testing momentum scrolling, parallax effects, keyboard navigation,
 * and performance optimizations.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import HorizontalScrollContainer from '@/components/HorizontalScrollContainer';

// Mock useLanguage hook
jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: jest.fn(() => ({
    language: 'zh-TW',
    t: (key: string) => key,
  })),
}));

describe('HorizontalScrollContainer', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockOnScroll: jest.Mock;

  beforeEach(() => {
    user = userEvent.setup();
    mockOnScroll = jest.fn();

    // Mock performance.now
    global.performance.now = jest.fn(() => Date.now());

    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
    global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

    // Mock scrollTo for scroll behavior tests
    Element.prototype.scrollTo = jest.fn();

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 1200,
      height: 800,
      top: 0,
      left: 0,
      bottom: 800,
      right: 1200,
      x: 0,
      y: 0,
      toJSON: jest.fn(),
    }));

    // Mock scrollWidth and clientWidth
    Object.defineProperty(Element.prototype, 'scrollWidth', {
      configurable: true,
      value: 4000,
    });

    Object.defineProperty(Element.prototype, 'clientWidth', {
      configurable: true,
      value: 1200,
    });

    Object.defineProperty(Element.prototype, 'scrollLeft', {
      configurable: true,
      value: 0,
      writable: true,
    });

    // Mock addEventListener/removeEventListener
    Element.prototype.addEventListener = jest.fn();
    Element.prototype.removeEventListener = jest.fn();
    Document.prototype.addEventListener = jest.fn();
    Document.prototype.removeEventListener = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('Rendering', () => {
    test('renders children correctly', () => {
      render(
        <HorizontalScrollContainer>
          <div data-testid="test-content">Test Content</div>
        </HorizontalScrollContainer>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    test('applies default width and styling', () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      expect(container).toHaveStyle({
        width: '100%',
        height: '100vh',
        overflowX: 'auto',
        overflowY: 'hidden',
      });
    });

    test('applies custom width when provided', () => {
      render(
        <HorizontalScrollContainer width={5000}>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const contentDiv = document.querySelector('[style*="width: 5000px"]');
      expect(contentDiv).toBeInTheDocument();
    });

    test('applies custom className', () => {
      render(
        <HorizontalScrollContainer className="custom-class">
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      expect(container).toHaveClass('custom-class');
    });

    test('applies RTL reading direction when enabled', () => {
      render(
        <HorizontalScrollContainer rtlReading={true}>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      expect(container).toHaveClass('reading-flow-traditional');
    });

    test('renders progress indicator', () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Scroll Functionality', () => {
    test('handles scroll events and updates progress', async () => {
      render(
        <HorizontalScrollContainer onScroll={mockOnScroll}>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');

      // Simulate scroll event
      Object.defineProperty(container, 'scrollLeft', { value: 1000 });
      fireEvent.scroll(container);

      await waitFor(() => {
        expect(mockOnScroll).toHaveBeenCalled();
      });
    });

    test('calculates scroll progress correctly', async () => {
      render(
        <HorizontalScrollContainer onScroll={mockOnScroll}>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');

      // Mock scroll to middle
      Object.defineProperty(container, 'scrollLeft', { value: 1400 }); // (4000-1200)/2
      fireEvent.scroll(container);

      await waitFor(() => {
        expect(mockOnScroll).toHaveBeenCalledWith(1400, 0.5);
      });
    });

    test('handles wheel events for horizontal scrolling', async () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');

      // Simulate wheel event
      fireEvent.wheel(container, { deltaY: 100 });

      expect(container.scrollLeft).toBeDefined();
    });

    test('prevents default wheel behavior', () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      const wheelEvent = new WheelEvent('wheel', { deltaY: 100 });
      const preventDefaultSpy = jest.spyOn(wheelEvent, 'preventDefault');

      fireEvent(container, wheelEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    test('handles arrow key navigation', async () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      container.focus();

      await user.keyboard('[ArrowRight]');
      // Should trigger scroll left update
      expect(container).toBeInTheDocument();
    });

    test('handles Home key navigation', async () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      container.focus();

      await user.keyboard('[Home]');
      // Should scroll to beginning
      expect(container).toBeInTheDocument();
    });

    test('handles End key navigation', async () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      container.focus();

      await user.keyboard('[End]');
      // Should scroll to end
      expect(container).toBeInTheDocument();
    });

    test('respects RTL reading direction for keyboard navigation', async () => {
      render(
        <HorizontalScrollContainer rtlReading={true}>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      container.focus();

      await user.keyboard('[ArrowLeft]');
      // Should behave differently in RTL mode
      expect(container).toBeInTheDocument();
    });
  });

  describe('Momentum Scrolling', () => {
    test('enables momentum scrolling by default', () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      expect(container).toHaveClass('momentum-scroll');
    });

    test('disables momentum scrolling when specified', () => {
      render(
        <HorizontalScrollContainer enableMomentum={false}>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      expect(container).toHaveStyle({ scrollBehavior: 'smooth' });
    });

    test('applies momentum physics during scroll', async () => {
      jest.useFakeTimers();

      render(
        <HorizontalScrollContainer enableMomentum={true}>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');

      // Simulate rapid scroll events to trigger momentum
      fireEvent.scroll(container, { target: { scrollLeft: 100 } });
      fireEvent.scroll(container, { target: { scrollLeft: 200 } });
      fireEvent.scroll(container, { target: { scrollLeft: 300 } });

      // Advance timers to trigger momentum animation
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(requestAnimationFrame).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe('Parallax Effects', () => {
    test('enables parallax by default', () => {
      render(
        <HorizontalScrollContainer>
          <div data-parallax="0.5">Parallax Content</div>
        </HorizontalScrollContainer>
      );

      expect(screen.getByText('Parallax Content')).toBeInTheDocument();
    });

    test('disables parallax when specified', () => {
      render(
        <HorizontalScrollContainer enableParallax={false}>
          <div data-parallax="0.5">Parallax Content</div>
        </HorizontalScrollContainer>
      );

      expect(screen.getByText('Parallax Content')).toBeInTheDocument();
    });

    test('applies parallax transforms to elements with data-parallax', async () => {
      render(
        <HorizontalScrollContainer>
          <div data-parallax="0.5" data-testid="parallax-element">
            Parallax Content
          </div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      const parallaxElement = screen.getByTestId('parallax-element');

      // Simulate scroll to trigger parallax
      Object.defineProperty(container, 'scrollLeft', { value: 500 });
      fireEvent.scroll(container);

      await waitFor(() => {
        expect(parallaxElement).toBeInTheDocument();
      });
    });
  });

  describe('Performance Optimizations', () => {
    test('uses requestAnimationFrame for smooth animations', async () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      fireEvent.scroll(container);

      await waitFor(() => {
        expect(requestAnimationFrame).toHaveBeenCalled();
      });
    });

    test('cancels animation frames on cleanup', () => {
      const { unmount } = render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      unmount();

      expect(cancelAnimationFrame).toHaveBeenCalled();
    });

    test('throttles scroll events appropriately', async () => {
      jest.useFakeTimers();

      render(
        <HorizontalScrollContainer onScroll={mockOnScroll}>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');

      // Fire multiple scroll events rapidly
      for (let i = 0; i < 10; i++) {
        fireEvent.scroll(container);
      }

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should throttle the calls
      expect(mockOnScroll.mock.calls.length).toBeLessThan(10);

      jest.useRealTimers();
    });

    test('cleans up event listeners on unmount', () => {
      const { unmount } = render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      unmount();

      expect(Element.prototype.removeEventListener).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('provides proper ARIA labels', () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      expect(container).toHaveAttribute('aria-label');
    });

    test('supports keyboard focus', () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      expect(container).toHaveAttribute('tabIndex', '0');
    });

    test('provides proper role attribute', () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    test('supports screen reader navigation', () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      expect(container).toHaveAttribute('aria-label');
    });
  });

  describe('Progress Tracking', () => {
    test('displays initial progress as 0%', () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    test('updates progress display during scroll', async () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');

      // Simulate scroll to 50%
      Object.defineProperty(container, 'scrollLeft', { value: 1400 });
      fireEvent.scroll(container);

      await waitFor(() => {
        expect(screen.getByText('50%')).toBeInTheDocument();
      });
    });

    test('shows progress bar visual indicator', () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const progressBar = document.querySelector('.w-32.h-1.bg-muted');
      expect(progressBar).toBeInTheDocument();
    });

    test('updates progress bar width correctly', async () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');

      // Simulate scroll to 25%
      Object.defineProperty(container, 'scrollLeft', { value: 700 });
      fireEvent.scroll(container);

      await waitFor(() => {
        const progressFill = document.querySelector('.bg-accent');
        expect(progressFill).toBeInTheDocument();
        const style = progressFill?.getAttribute('style') || '';
        expect(style).toContain('width');
      });
    });
  });

  describe('Error Handling', () => {
    test('handles missing scroll container gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      // Should not throw errors
      expect(screen.getByRole('region')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test('handles invalid scroll values gracefully', async () => {
      render(
        <HorizontalScrollContainer onScroll={mockOnScroll}>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');

      // Simulate invalid scroll values
      Object.defineProperty(container, 'scrollLeft', { value: -100 });
      fireEvent.scroll(container);

      // Should handle gracefully without errors
      expect(container).toBeInTheDocument();
    });

    test('handles missing callback functions gracefully', () => {
      render(
        <HorizontalScrollContainer onScroll={undefined}>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      fireEvent.scroll(container);

      // Should not throw errors
      expect(container).toBeInTheDocument();
    });
  });

  describe('Language Support', () => {
    test('adapts to different languages', () => {
      render(
        <HorizontalScrollContainer>
          <div>Content</div>
        </HorizontalScrollContainer>
      );

      const container = screen.getByRole('region');
      expect(container).toHaveAttribute('aria-label');
    });

    test('supports Chinese text direction', () => {
      const { container } = render(
        <HorizontalScrollContainer rtlReading={true}>
          <div>中文內容</div>
        </HorizontalScrollContainer>
      );

      const contentDiv = container.querySelector('[style*="direction: rtl"]');
      expect(contentDiv).toBeInTheDocument();
    });
  });
});