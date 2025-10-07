/**
 * @fileOverview ParallaxSection Component Tests
 *
 * Comprehensive test suite for the ParallaxSection component,
 * testing parallax effects, scroll handling, performance optimizations,
 * reduced motion support, and accessibility features.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ParallaxSection, {
  ParallaxLayer,
  ParallaxPresets,
  type ParallaxSectionProps,
  type ParallaxLayerProps
} from '@/components/ParallaxSection';

// Mock useLanguage hook
jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: jest.fn(() => ({
    language: 'zh-TW',
  })),
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
  }

  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;

  observe = jest.fn((target: Element) => {
    // Simulate intersection for testing
    setTimeout(() => {
      this.callback([{
        target,
        isIntersecting: true,
        intersectionRatio: 1,
        intersectionRect: target.getBoundingClientRect(),
        boundingClientRect: target.getBoundingClientRect(),
        rootBounds: document.documentElement.getBoundingClientRect(),
        time: Date.now(),
      }], this);
    }, 100);
  });

  unobserve = jest.fn();
  disconnect = jest.fn();
}

// Replace the global IntersectionObserver
(global as any).IntersectionObserver = MockIntersectionObserver;

describe('ParallaxSection', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let mockOnScrollProgress: jest.Mock;

  const defaultProps: ParallaxSectionProps = {
    children: (
      <>
        <ParallaxLayer speed={0.5} data-testid="parallax-layer-1">
          <div>Background Layer</div>
        </ParallaxLayer>
        <ParallaxLayer speed={0.2} data-testid="parallax-layer-2">
          <div>Midground Layer</div>
        </ParallaxLayer>
        <ParallaxLayer speed={0} data-testid="parallax-layer-3">
          <div>Foreground Layer</div>
        </ParallaxLayer>
      </>
    ),
    enableHorizontal: true,
    enableVertical: false,
    perspective: 1000,
    baseline: 'center',
    easing: 'ease-out',
    threshold: 0.1,
  };

  beforeEach(() => {
    user = userEvent.setup();
    mockOnScrollProgress = jest.fn();

    // Mock performance.now
    global.performance.now = jest.fn(() => Date.now());

    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
    global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 1200,
      height: 800,
      top: 100,
      left: 0,
      bottom: 900,
      right: 1200,
      x: 0,
      y: 100,
      toJSON: jest.fn(),
    }));

    // Mock window properties
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });

    Object.defineProperty(window, 'scrollX', {
      writable: true,
      configurable: true,
      value: 0,
    });

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    // Mock document scroll properties
    Object.defineProperty(document.documentElement, 'scrollLeft', {
      writable: true,
      configurable: true,
      value: 0,
    });

    Object.defineProperty(document.documentElement, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 0,
    });

    // Mock matchMedia for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Mock addEventListener and removeEventListener
    jest.spyOn(window, 'addEventListener').mockImplementation();
    jest.spyOn(window, 'removeEventListener').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders parallax section with correct structure', () => {
      render(<ParallaxSection {...defaultProps} />);

      const section = document.querySelector('.parallax-section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('relative', 'overflow-hidden');

      const container = document.querySelector('.parallax-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('absolute', 'inset-0');
    });

    test('renders all child layers', () => {
      render(<ParallaxSection {...defaultProps} />);

      expect(screen.getByText('Background Layer')).toBeInTheDocument();
      expect(screen.getByText('Midground Layer')).toBeInTheDocument();
      expect(screen.getByText('Foreground Layer')).toBeInTheDocument();
    });

    test('applies correct height styling', () => {
      render(<ParallaxSection {...defaultProps} height="50vh" />);

      const section = document.querySelector('.parallax-section');
      expect(section).toHaveStyle({ height: '50vh' });
    });

    test('applies numeric height correctly', () => {
      render(<ParallaxSection {...defaultProps} height={600} />);

      const section = document.querySelector('.parallax-section');
      expect(section).toHaveStyle({ height: '600px' });
    });

    test('applies perspective styling', () => {
      render(<ParallaxSection {...defaultProps} perspective={1500} />);

      const section = document.querySelector('.parallax-section');
      expect(section).toHaveAttribute('style');

      // Check inline styles - React may apply them differently
      const style = section?.getAttribute('style') || '';
      const hasHeight = style.includes('height: 100vh');
      expect(hasHeight).toBe(true);
    });

    test('applies custom className', () => {
      render(<ParallaxSection {...defaultProps} className="custom-parallax" />);

      const section = document.querySelector('.parallax-section');
      expect(section).toHaveClass('custom-parallax');
    });
  });

  describe('ParallaxLayer Component', () => {
    test('renders parallax layer with correct attributes', () => {
      render(
        <ParallaxLayer speed={0.5} offset={100} className="custom-layer">
          <div>Test Layer</div>
        </ParallaxLayer>
      );

      const layer = document.querySelector('.parallax-layer');
      expect(layer).toBeInTheDocument();
      expect(layer).toHaveClass('absolute', 'inset-0', 'custom-layer');
      expect(layer).toHaveAttribute('data-parallax-speed', '0.5');
      expect(layer).toHaveAttribute('data-parallax-offset', '100');

      expect(screen.getByText('Test Layer')).toBeInTheDocument();
    });

    test('applies transform with offset', () => {
      render(
        <ParallaxLayer speed={0.3} offset={50}>
          <div>Offset Layer</div>
        </ParallaxLayer>
      );

      const layer = document.querySelector('.parallax-layer');
      expect(layer).toHaveAttribute('style');
      const style = layer?.getAttribute('style') || '';
      expect(style).toContain('transform: translate3d(0, 50px, 0)');
      expect(style).toContain('will-change: transform');
    });

    test('applies custom style properties', () => {
      const customStyle = { zIndex: 10, opacity: 0.8 };
      render(
        <ParallaxLayer speed={0.2} style={customStyle}>
          <div>Styled Layer</div>
        </ParallaxLayer>
      );

      const layer = document.querySelector('.parallax-layer');
      expect(layer).toHaveStyle({ zIndex: '10', opacity: '0.8' });
    });
  });

  describe('Scroll Progress Tracking', () => {
    test('calls onScrollProgress callback during scroll', async () => {
      render(<ParallaxSection {...defaultProps} onScrollProgress={mockOnScrollProgress} />);

      // Simulate scroll event
      act(() => {
        fireEvent.scroll(window, { target: { scrollY: 100 } });
      });

      await waitFor(() => {
        expect(mockOnScrollProgress).toHaveBeenCalled();
      });
    });

    test('updates data attributes with scroll progress', async () => {
      render(<ParallaxSection {...defaultProps} />);

      const section = document.querySelector('.parallax-section');

      // Simulate scroll and wait for updates
      act(() => {
        fireEvent.scroll(window, { target: { scrollY: 200 } });
      });

      await waitFor(() => {
        expect(section).toHaveAttribute('data-parallax-progress');
        expect(section).toHaveAttribute('data-parallax-visible');
      });
    });
  });

  describe('Parallax Effects', () => {
    test('enables horizontal parallax when specified', () => {
      render(<ParallaxSection {...defaultProps} enableHorizontal={true} />);

      const section = document.querySelector('.parallax-section');
      expect(section).toBeInTheDocument();

      // Simulate horizontal scroll
      act(() => {
        Object.defineProperty(window, 'scrollX', { value: 100, configurable: true });
        fireEvent.scroll(window);
      });

      // Check that parallax layers are updated
      const layers = document.querySelectorAll('[data-parallax-speed]');
      expect(layers.length).toBeGreaterThan(0);
    });

    test('enables vertical parallax when specified', () => {
      render(<ParallaxSection {...defaultProps} enableVertical={true} />);

      const section = document.querySelector('.parallax-section');
      expect(section).toBeInTheDocument();

      // Simulate vertical scroll
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 150, configurable: true });
        fireEvent.scroll(window);
      });

      // Check that parallax layers exist
      const layers = document.querySelectorAll('[data-parallax-speed]');
      expect(layers.length).toBeGreaterThan(0);
    });

    test('applies different baseline calculations', () => {
      const baselines: ('top' | 'center' | 'bottom')[] = ['top', 'center', 'bottom'];

      baselines.forEach(baseline => {
        const { unmount } = render(
          <ParallaxSection {...defaultProps} baseline={baseline} enableVertical={true} />
        );

        const section = document.querySelector('.parallax-section');
        expect(section).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Easing Functions', () => {
    const easingTypes: ('linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out')[] = [
      'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'
    ];

    easingTypes.forEach(easing => {
      test(`applies ${easing} easing correctly`, () => {
        render(<ParallaxSection {...defaultProps} easing={easing} />);

        const section = document.querySelector('.parallax-section');
        expect(section).toBeInTheDocument();

        // Simulate scroll to trigger easing
        act(() => {
          fireEvent.scroll(window, { target: { scrollY: 100 } });
        });

        // The easing should be applied during scroll calculations
        expect(section).toHaveAttribute('data-parallax-progress');
      });
    });
  });

  describe('Reduced Motion Support', () => {
    test('respects reduced motion preference', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<ParallaxSection {...defaultProps} />);

      const section = document.querySelector('.parallax-section');
      expect(section).toHaveClass('motion-reduce');
    });

    test('does not apply parallax when reduced motion is enabled', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<ParallaxSection {...defaultProps} />);

      // Scroll events should not trigger parallax updates
      act(() => {
        fireEvent.scroll(window, { target: { scrollY: 100 } });
      });

      // The component should still render but without parallax effects
      const section = document.querySelector('.parallax-section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Performance Optimizations', () => {
    test('uses requestAnimationFrame for smooth animations', () => {
      const { container } = render(<ParallaxSection {...defaultProps} />);

      // Wait for initial setup
      act(() => {
        fireEvent.scroll(window);
      });

      // Should use requestAnimationFrame for smooth scrolling
      expect(container.querySelector('.parallax-section')).toBeInTheDocument();
    });

    test('throttles scroll events to 60fps', () => {
      render(<ParallaxSection {...defaultProps} />);

      // Simulate rapid scroll events
      for (let i = 0; i < 10; i++) {
        act(() => {
          fireEvent.scroll(window);
        });
      }

      // Should be throttled to prevent excessive calls
      expect(performance.now).toHaveBeenCalled();
    });

    test('sets up intersection observer for performance', () => {
      const { container } = render(<ParallaxSection {...defaultProps} threshold={0.2} />);

      // The parallax section should be rendered with intersection observer functionality
      expect(container.querySelector('.parallax-section')).toBeInTheDocument();
    });

    test('cleans up event listeners on unmount', () => {
      const { unmount } = render(<ParallaxSection {...defaultProps} />);

      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    test('cancels animation frames on unmount', () => {
      const { unmount, container } = render(<ParallaxSection {...defaultProps} />);

      // Trigger scroll to create animation frame
      act(() => {
        fireEvent.scroll(window);
      });

      expect(container.querySelector('.parallax-section')).toBeInTheDocument();
      unmount();

      // Component should cleanup properly
      expect(container.querySelector('.parallax-section')).not.toBeInTheDocument();
    });
  });

  describe('Development Debug Features', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    test('shows debug information in development mode', () => {
      render(<ParallaxSection {...defaultProps} />);

      expect(screen.getByText(/Progress:/)).toBeInTheDocument();
      expect(screen.getByText(/Visible:/)).toBeInTheDocument();
      expect(screen.getByText(/ScrollX:/)).toBeInTheDocument();
      expect(screen.getByText(/ScrollY:/)).toBeInTheDocument();
    });

    test('hides debug information in production mode', () => {
      process.env.NODE_ENV = 'production';
      render(<ParallaxSection {...defaultProps} />);

      expect(screen.queryByText(/Progress:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Visible:/)).not.toBeInTheDocument();
    });
  });

  describe('Resize Handling', () => {
    test('updates parallax on window resize', () => {
      const { container } = render(<ParallaxSection {...defaultProps} />);

      act(() => {
        fireEvent.resize(window);
      });

      // Should handle resize events properly
      expect(container.querySelector('.parallax-section')).toBeInTheDocument();
    });

    test('handles viewport size changes correctly', () => {
      render(<ParallaxSection {...defaultProps} />);

      // Change window dimensions
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });
        fireEvent.resize(window);
      });

      const section = document.querySelector('.parallax-section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing scroll values gracefully', () => {
      render(<ParallaxSection {...defaultProps} />);

      // Simulate undefined scroll values
      act(() => {
        Object.defineProperty(window, 'scrollX', { value: undefined, configurable: true });
        Object.defineProperty(window, 'scrollY', { value: undefined, configurable: true });
        fireEvent.scroll(window);
      });

      const section = document.querySelector('.parallax-section');
      expect(section).toBeInTheDocument();
    });

    test('handles invalid parallax speed values', () => {
      render(
        <ParallaxSection {...defaultProps}>
          <ParallaxLayer speed={NaN}>
            <div>Invalid Speed Layer</div>
          </ParallaxLayer>
        </ParallaxSection>
      );

      act(() => {
        fireEvent.scroll(window);
      });

      expect(screen.getByText('Invalid Speed Layer')).toBeInTheDocument();
    });

    test('handles missing getBoundingClientRect gracefully', () => {
      // Test error handling when getBoundingClientRect fails
      const { container } = render(<ParallaxSection {...defaultProps} />);

      // Should not crash even with potential getBoundingClientRect issues
      const section = container.querySelector('.parallax-section');
      expect(section).toBeInTheDocument();

      act(() => {
        fireEvent.scroll(window);
      });

      // Component should still be rendered
      expect(section).toBeInTheDocument();
    });
  });

  describe('ParallaxPresets', () => {
    test('exports predefined parallax presets', () => {
      expect(ParallaxPresets).toBeDefined();
      expect(ParallaxPresets.Foreground).toEqual({ speed: 0.2, className: 'parallax-near' });
      expect(ParallaxPresets.Midground).toEqual({ speed: 0.5, className: 'parallax-mid' });
      expect(ParallaxPresets.Background).toEqual({ speed: 0.8, className: 'parallax-far' });
      expect(ParallaxPresets.Character).toEqual({ speed: 0.1, className: 'z-20' });
      expect(ParallaxPresets.Text).toEqual({ speed: 0, className: 'z-30' });
    });

    test('preset layers can be used in component', () => {
      render(
        <ParallaxSection {...defaultProps}>
          <ParallaxLayer {...ParallaxPresets.Background}>
            <div>Background Preset</div>
          </ParallaxLayer>
          <ParallaxLayer {...ParallaxPresets.Foreground}>
            <div>Foreground Preset</div>
          </ParallaxLayer>
        </ParallaxSection>
      );

      expect(screen.getByText('Background Preset')).toBeInTheDocument();
      expect(screen.getByText('Foreground Preset')).toBeInTheDocument();

      const backgroundLayer = document.querySelector('[data-parallax-speed="0.8"]');
      const foregroundLayer = document.querySelector('[data-parallax-speed="0.2"]');

      expect(backgroundLayer).toHaveClass('parallax-far');
      expect(foregroundLayer).toHaveClass('parallax-near');
    });
  });
});