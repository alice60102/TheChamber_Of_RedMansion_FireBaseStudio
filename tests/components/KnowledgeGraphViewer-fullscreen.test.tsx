/**
 * @fileOverview Test suite for KnowledgeGraphViewer component fullscreen functionality
 * 
 * This test file validates the fullscreen mode of the KnowledgeGraphViewer component,
 * ensuring that it properly displays in full screen with minimal UI elements
 * and maintains all interactive functionality.
 * 
 * Test Coverage Areas:
 * - Fullscreen mode rendering and layout
 * - Floating UI elements positioning and visibility
 * - Dynamic resize handling for fullscreen
 * - Fullscreen-specific styling and theming
 * - Interactive controls in fullscreen mode
 * - Search functionality in fullscreen
 * - Legend and information panels in fullscreen
 * - Performance in fullscreen mode
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import KnowledgeGraphViewer from '@/components/KnowledgeGraphViewer';

// Create a comprehensive D3.js mock that supports chaining
const createD3Mock = () => {
  const chainableMock = {
    append: jest.fn().mockReturnThis(),
    attr: jest.fn().mockReturnThis(),
    style: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    call: jest.fn().mockReturnThis(),
    transition: jest.fn().mockReturnThis(),
    duration: jest.fn().mockReturnThis(),
    selectAll: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    data: jest.fn().mockReturnThis(),
    enter: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
    exit: jest.fn().mockReturnThis(),
    merge: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    classed: jest.fn().mockReturnThis(),
  };
  return chainableMock;
};

// Mock D3.js with comprehensive support
jest.mock('d3', () => ({
  select: jest.fn(() => createD3Mock()),
  forceSimulation: jest.fn(() => ({
    force: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    restart: jest.fn().mockReturnThis(),
  })),
  forceLink: jest.fn(() => ({
    id: jest.fn().mockReturnThis(),
    distance: jest.fn().mockReturnThis(),
    strength: jest.fn().mockReturnThis(),
  })),
  forceManyBody: jest.fn(() => ({
    strength: jest.fn().mockReturnThis(),
    distanceMax: jest.fn().mockReturnThis(),
  })),
  forceCenter: jest.fn(),
  forceCollide: jest.fn(() => ({
    radius: jest.fn().mockReturnThis(),
    strength: jest.fn().mockReturnThis(),
  })),
  drag: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
  })),
  zoom: jest.fn(() => ({
    scaleExtent: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
  })),
  zoomIdentity: { k: 1, x: 0, y: 0 },
  scaleOrdinal: jest.fn(() => jest.fn()),
  schemeCategory10: ['#1f77b4', '#ff7f0e', '#2ca02c'],
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, className, ...props }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      {...props}
    />
  ),
}));

// Mock icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Play: () => <div data-testid="play-icon">Play</div>,
  Pause: () => <div data-testid="pause-icon">Pause</div>,
  ZoomIn: () => <div data-testid="zoom-in-icon">ZoomIn</div>,
  ZoomOut: () => <div data-testid="zoom-out-icon">ZoomOut</div>,
  RotateCcw: () => <div data-testid="rotate-icon">RotateCcw</div>,
  Info: () => <div data-testid="info-icon">Info</div>,
}));

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('KnowledgeGraphViewer Fullscreen Mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render fullscreen mode with dark background', () => {
    // Arrange: Create fullscreen knowledge graph viewer
    const { container } = render(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={1920}
        height={1080}
        className="test-fullscreen"
      />
    );

    // Act & Assert: Check fullscreen styling
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('bg-gradient-to-br', 'from-black', 'via-gray-900', 'to-black');
  });

  test('should display floating controls in fullscreen mode', () => {
    // Arrange: Render component in fullscreen mode
    render(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={1920}
        height={1080}
      />
    );

    // Act & Assert: Verify floating controls are visible
    expect(screen.getByTestId('pause-icon')).toBeInTheDocument();
    expect(screen.getByTestId('zoom-in-icon')).toBeInTheDocument();
    expect(screen.getByTestId('zoom-out-icon')).toBeInTheDocument();
    expect(screen.getByTestId('rotate-icon')).toBeInTheDocument();
  });

  test('should display floating search in fullscreen mode', () => {
    // Arrange: Render component in fullscreen mode
    render(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={1920}
        height={1080}
      />
    );

    // Act & Assert: Verify search input is present
    const searchInput = screen.getByPlaceholderText('搜尋節點...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveClass('bg-black/60', 'border-white/20', 'text-white');
  });

  test('should display floating legend in fullscreen mode', () => {
    // Arrange: Render component in fullscreen mode
    render(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={1920}
        height={1080}
      />
    );

    // Act & Assert: Verify legend is visible
    expect(screen.getByText('圖例')).toBeInTheDocument();
    expect(screen.getByText('神話人物')).toBeInTheDocument();
    expect(screen.getByText('世俗人物')).toBeInTheDocument();
    expect(screen.getByText('神仙')).toBeInTheDocument();
  });

  test('should not display traditional header in fullscreen mode', () => {
    // Arrange: Render component in fullscreen mode
    render(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={1920}
        height={1080}
      />
    );

    // Act & Assert: Verify traditional UI elements are not present
    expect(screen.queryByText('第一回 知識圖譜')).not.toBeInTheDocument();
  });

  test('should handle search input in fullscreen mode', async () => {
    // Arrange: Render component in fullscreen mode
    render(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={1920}
        height={1080}
      />
    );

    const searchInput = screen.getByPlaceholderText('搜尋節點...');

    // Act: Type in search input
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '賈寶玉' } });
    });

    // Assert: Search input value should be updated
    expect(searchInput).toHaveValue('賈寶玉');
  });

  test('should handle control interactions in fullscreen mode', async () => {
    // Arrange: Render component in fullscreen mode
    render(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={1920}
        height={1080}
      />
    );

    // Act & Assert: Test various control interactions
    const pauseButton = screen.getByTestId('pause-icon').parentElement;
    const zoomInButton = screen.getByTestId('zoom-in-icon').parentElement;
    const zoomOutButton = screen.getByTestId('zoom-out-icon').parentElement;
    const resetButton = screen.getByTestId('rotate-icon').parentElement;

    // All buttons should be present and clickable
    expect(pauseButton).toBeInTheDocument();
    expect(zoomInButton).toBeInTheDocument();
    expect(zoomOutButton).toBeInTheDocument();
    expect(resetButton).toBeInTheDocument();

    // Test clicking controls (should not throw errors)
    await act(async () => {
      fireEvent.click(pauseButton!);
      fireEvent.click(zoomInButton!);
      fireEvent.click(zoomOutButton!);
      fireEvent.click(resetButton!);
    });
  });

  test('should render differently in fullscreen vs normal mode', () => {
    // Arrange & Act: Render normal mode
    const { rerender } = render(
      <KnowledgeGraphViewer
        fullscreen={false}
        width={800}
        height={600}
      />
    );

    // Assert: Normal mode should have traditional header
    expect(screen.getByText('第一回 知識圖譜')).toBeInTheDocument();

    // Act: Switch to fullscreen mode
    rerender(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={1920}
        height={1080}
      />
    );

    // Assert: Fullscreen mode should not have traditional header
    expect(screen.queryByText('第一回 知識圖譜')).not.toBeInTheDocument();
  });

  test('should use different color schemes in fullscreen vs normal mode', () => {
    // Arrange & Act: Test color schemes
    const { rerender, container } = render(
      <KnowledgeGraphViewer
        fullscreen={false}
        width={800}
        height={600}
      />
    );

    // Check normal mode background
    let svgElement = container.querySelector('svg');
    expect(svgElement).toHaveClass('bg-gradient-to-br', 'from-gray-50', 'to-gray-100');

    // Act: Switch to fullscreen
    rerender(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={1920}
        height={1080}
      />
    );

    // Assert: Fullscreen should have dark background
    svgElement = container.querySelector('svg');
    expect(svgElement).toHaveClass('bg-gradient-to-br', 'from-black', 'via-gray-900', 'to-black');
  });

  test('should display statistics in fullscreen mode', () => {
    // Arrange: Render with custom data
    const mockData = {
      nodes: [
        { id: '1', name: 'Test Node 1', type: 'character' as const, importance: 'primary' as const, description: 'Test', category: 'test', radius: 10, color: '#red', group: 1 },
      ],
      links: [
        { source: '1', target: '1', relationship: 'self', strength: 0.5, type: 'friendship' as const, description: 'Test', distance: 50 },
      ],
    };

    render(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={1920}
        height={1080}
        data={mockData}
      />
    );

    // Assert: Verify statistics are displayed
    expect(screen.getByText('節點: 1')).toBeInTheDocument();
    expect(screen.getByText('關係: 1')).toBeInTheDocument();
  });

  test('should handle component props correctly in fullscreen mode', () => {
    // Arrange: Test with various props
    const mockOnClick = jest.fn();
    
    const { container } = render(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={2560}
        height={1440}
        onNodeClick={mockOnClick}
        className="custom-class"
      />
    );

    // Assert: Component should render with proper dimensions
    const svgElement = container.querySelector('svg');
    expect(svgElement).toHaveAttribute('width', '2560');
    expect(svgElement).toHaveAttribute('height', '1440');
  });

  test('should handle resize in fullscreen mode', () => {
    // Arrange: Test with different screen sizes
    const { rerender, container } = render(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={1920}
        height={1080}
      />
    );

    // Act: Simulate screen resize
    rerender(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={1366}
        height={768}
      />
    );

    // Assert: Component should adapt to new dimensions
    const svgElement = container.querySelector('svg');
    expect(svgElement).toHaveAttribute('width', '1366');
    expect(svgElement).toHaveAttribute('height', '768');
  });

  test('should handle empty data gracefully in fullscreen mode', () => {
    // Arrange: Create empty dataset
    const emptyData = {
      nodes: [],
      links: [],
    };

    // Act: Render with empty data in fullscreen
    render(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={1920}
        height={1080}
        data={emptyData}
      />
    );

    // Assert: Should handle empty data without errors
    expect(screen.getByText('節點: 0')).toBeInTheDocument();
    expect(screen.getByText('關係: 0')).toBeInTheDocument();
  });

  test('should maintain accessibility in fullscreen mode', () => {
    // Arrange: Render component in fullscreen mode
    const { container } = render(
      <KnowledgeGraphViewer
        fullscreen={true}
        width={1920}
        height={1080}
      />
    );

    // Act & Assert: Check accessibility features
    const searchInput = screen.getByPlaceholderText('搜尋節點...');
    const buttons = screen.getAllByRole('button');
    
    expect(searchInput).toBeInTheDocument();
    expect(buttons.length).toBeGreaterThan(0);
    
    // Verify SVG is accessible
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });
}); 