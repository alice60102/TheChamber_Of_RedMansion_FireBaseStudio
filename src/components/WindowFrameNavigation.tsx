/**
 * @fileOverview WindowFrameNavigation Component
 *
 * This component implements geometric frame-based content discovery using CSS clip-path
 * and SVG masks, embodying the traditional Chinese aesthetic principle of "borrowed scenery"
 * (借景). It creates elegant window-like frames that provide sophisticated content navigation
 * with depth effects and cultural authenticity.
 *
 * Key Features:
 * - Geometric frame-based content discovery using CSS clip-path
 * - SVG mask implementations for complex frame shapes
 * - "Borrowed scenery" aesthetic with depth effects
 * - Traditional Chinese window frame styles (circular, hexagonal, quatrefoil)
 * - Interactive hover effects with subtle animations
 * - Responsive design maintaining frame proportions
 * - Accessibility-compliant navigation patterns
 *
 * Design Philosophy:
 * - Inspired by traditional Chinese garden architecture
 * - Implements "borrowed scenery" (借景) principles
 * - Creates visual depth through layered frame effects
 * - Maintains cultural authenticity while providing modern UX
 */

"use client";

import React, { useState, useRef, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Eye,
  Maximize2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export type WindowFrameShape =
  | 'circular'      // Traditional moon gate (月門)
  | 'hexagonal'     // Hexagonal window (六角窗)
  | 'quatrefoil'    // Four-leaf window (四葉窗)
  | 'octagonal'     // Octagonal window (八角窗)
  | 'rectangular'   // Rectangular frame (方窗)
  | 'diamond'       // Diamond window (菱形窗)
  | 'flower'        // Flower-shaped window (花窗)
  | 'custom';       // Custom SVG path

export interface WindowFrameItem {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  category?: string;
  tags?: string[];
  href?: string;
  onClick?: () => void;
  featured?: boolean;
  depth?: number; // Parallax depth (0 = foreground, higher = background)
}

export interface WindowFrameNavigationProps {
  items: WindowFrameItem[];
  shape?: WindowFrameShape;
  customClipPath?: string; // For custom shapes
  customSVGPath?: string; // For SVG mask shapes
  columns?: number;
  spacing?: number;
  frameSize?: 'small' | 'medium' | 'large';
  enableParallax?: boolean;
  enableRotation?: boolean;
  seasonalEffects?: boolean;
  className?: string;
  onItemClick?: (item: WindowFrameItem) => void;
}

/**
 * WindowFrameNavigation Component
 *
 * Creates an elegant geometric frame-based navigation system inspired by
 * traditional Chinese garden architecture and "borrowed scenery" principles.
 */
export const WindowFrameNavigation: React.FC<WindowFrameNavigationProps> = ({
  items,
  shape = 'circular',
  customClipPath,
  customSVGPath,
  columns = 3,
  spacing = 24,
  frameSize = 'medium',
  enableParallax = true,
  enableRotation = false,
  seasonalEffects = true,
  className = '',
  onItemClick,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring');
  const containerRef = useRef<HTMLDivElement>(null);

  const { t } = useLanguage();

  /**
   * Get CSS clip-path for different window shapes
   */
  const getClipPath = (frameShape: WindowFrameShape): string => {
    switch (frameShape) {
      case 'circular':
        return 'circle(40% at 50% 50%)';
      case 'hexagonal':
        return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
      case 'quatrefoil':
        return 'polygon(20% 0%, 0% 20%, 0% 80%, 20% 100%, 80% 100%, 100% 80%, 100% 20%, 80% 0%)';
      case 'octagonal':
        return 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)';
      case 'rectangular':
        return 'inset(10% 10% 10% 10%)';
      case 'diamond':
        return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
      case 'flower':
        return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
      case 'custom':
        return customClipPath || 'circle(40% at 50% 50%)';
      default:
        return 'circle(40% at 50% 50%)';
    }
  };

  /**
   * Get SVG path for complex shapes
   */
  const getSVGPath = (frameShape: WindowFrameShape): string => {
    switch (frameShape) {
      case 'flower':
        return 'M50,0 L61,35 L98,35 L68,57 L79,91 L50,70 L21,91 L32,57 L2,35 L39,35 Z';
      case 'quatrefoil':
        return 'M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z';
      case 'custom':
        return customSVGPath || '';
      default:
        return '';
    }
  };

  /**
   * Get frame size dimensions
   */
  const getFrameSize = () => {
    switch (frameSize) {
      case 'small':
        return { width: 200, height: 200 };
      case 'medium':
        return { width: 280, height: 280 };
      case 'large':
        return { width: 360, height: 360 };
      default:
        return { width: 280, height: 280 };
    }
  };

  /**
   * Handle item interaction
   */
  const handleItemClick = (item: WindowFrameItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (onItemClick) {
      onItemClick(item);
    }
  };

  /**
   * Get seasonal filter effects
   */
  const getSeasonalEffect = () => {
    if (!seasonalEffects) return '';

    switch (currentSeason) {
      case 'spring':
        return 'hue-rotate(10deg) saturate(1.1) brightness(1.05)';
      case 'summer':
        return 'saturate(1.2) brightness(1.1) contrast(1.05)';
      case 'autumn':
        return 'hue-rotate(-15deg) saturate(1.15) sepia(0.1)';
      case 'winter':
        return 'saturate(0.9) brightness(0.95) contrast(1.1)';
      default:
        return '';
    }
  };

  /**
   * Update seasonal effects based on current time
   */
  useEffect(() => {
    const updateSeason = () => {
      const month = new Date().getMonth();
      if (month >= 2 && month <= 4) setCurrentSeason('spring');
      else if (month >= 5 && month <= 7) setCurrentSeason('summer');
      else if (month >= 8 && month <= 10) setCurrentSeason('autumn');
      else setCurrentSeason('winter');
    };

    updateSeason();
    const interval = setInterval(updateSeason, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  /**
   * Parallax effect on mouse move
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableParallax || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) / rect.width;
    const offsetY = (e.clientY - centerY) / rect.height;

    const frames = containerRef.current.querySelectorAll('[data-frame]');
    frames.forEach((frame, index) => {
      const depth = parseFloat((frame as HTMLElement).dataset.depth || '0');
      const translateX = offsetX * depth * 10;
      const translateY = offsetY * depth * 10;
      (frame as HTMLElement).style.transform =
        `translate(${translateX}px, ${translateY}px) ${enableRotation ? `rotate(${offsetX * 2}deg)` : ''}`;
    });
  };

  const { width, height } = getFrameSize();
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${spacing}px`,
  };

  return (
    <div
      ref={containerRef}
      className={`window-frame-navigation relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        // Reset transforms on mouse leave
        if (containerRef.current) {
          const frames = containerRef.current.querySelectorAll('[data-frame]');
          frames.forEach((frame) => {
            (frame as HTMLElement).style.transform = 'translate(0, 0) rotate(0deg)';
          });
        }
      }}
    >
      <div style={gridStyle} className="relative z-10">
        {items.map((item, index) => (
          <div
            key={item.id}
            data-frame
            data-depth={item.depth || 0}
            className="window-frame relative group cursor-pointer transition-all duration-700 ease-out"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              filter: getSeasonalEffect(),
            }}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => handleItemClick(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleItemClick(item);
              }
            }}
          >
            {/* Frame border effect */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-border/30 via-border/10 to-border/30 rounded-lg"
              style={{
                clipPath: getClipPath(shape),
                transform: hoveredItem === item.id ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />

            {/* Content area */}
            <div
              className="relative w-full h-full overflow-hidden rounded-lg shadow-2xl"
              style={{
                clipPath: getClipPath(shape),
                transform: hoveredItem === item.id ? 'scale(1.02)' : 'scale(1)',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <Image
                  src={item.image}
                  alt={item.imageAlt || item.title}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110"
                  sizes={`${width}px`}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
              </div>

              {/* Content overlay */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="space-y-2">
                  {/* Category badge */}
                  {item.category && (
                    <Badge
                      variant="secondary"
                      className="bg-accent/90 text-accent-foreground text-xs"
                    >
                      {item.category}
                    </Badge>
                  )}

                  {/* Title */}
                  <h3 className="font-artistic text-lg font-bold text-white leading-tight">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-white/80 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="text-xs text-white/70 bg-black/30 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Featured indicator */}
              {item.featured && (
                <div className="absolute top-4 right-4">
                  <div className="bg-accent/90 text-accent-foreground rounded-full p-2">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Hover overlay */}
              <div
                className={`absolute inset-0 bg-accent/20 transition-opacity duration-500 ${
                  hoveredItem === item.id ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Interactive icon */}
              <div
                className={`absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 transition-all duration-300 ${
                  hoveredItem === item.id
                    ? 'opacity-100 transform scale-110'
                    : 'opacity-70 transform scale-100'
                }`}
              >
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Depth shadow effect */}
            <div
              className="absolute inset-0 -z-10 bg-black/20 rounded-lg blur-md"
              style={{
                clipPath: getClipPath(shape),
                transform: `translate(${(item.depth || 0) * 4}px, ${(item.depth || 0) * 4}px)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-20 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
        <div className="absolute top-3/4 left-3/4 w-20 h-20 bg-secondary/10 rounded-full blur-xl" />
      </div>

      {/* Season indicator */}
      {seasonalEffects && (
        <div className="absolute top-4 right-4 bg-museum-panel px-3 py-1 rounded-full border border-border/30">
          <span className="text-xs text-muted-foreground capitalize">
            {currentSeason} • {t(`seasons.${currentSeason}`) || currentSeason}
          </span>
        </div>
      )}
    </div>
  );
};

export default WindowFrameNavigation;