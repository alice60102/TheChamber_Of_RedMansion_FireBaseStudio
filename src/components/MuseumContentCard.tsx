/**
 * @fileOverview MuseumContentCard Component
 *
 * This component implements the museum exhibition-style content cards for the Red Mansion
 * learning platform. It provides elegant floating content presentation with sophisticated
 * visual effects, interactive hover states, and cultural typography that maintains the
 * aesthetic integrity of classical Chinese design.
 *
 * Key Features:
 * - Museum exhibition-style presentation with floating effect
 * - Black panel design (#1A1A1A) with subtle shadows and rounded corners
 * - Perfect highlight pink (#D4A5A5-#E8B4AA) for interactive elements
 * - Sophisticated hover animations and visual feedback
 * - Support for various content types (text, images, character info, etc.)
 * - Responsive design maintaining cultural aesthetics
 * - Accessibility-compliant interaction patterns
 *
 * Design Philosophy:
 * - Inspired by museum exhibition displays
 * - Maintains classical Chinese aesthetic principles
 * - Provides clear content hierarchy with traditional typography
 * - Enhances user engagement through subtle animations
 */

"use client";

import React, { useState, useRef, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Heart,
  Share2,
  Bookmark,
  ArrowRight,
  Sparkles,
  Star,
  Eye
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export interface MuseumContentCardProps {
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  imageAlt?: string;
  category?: string;
  tags?: string[];
  size?: 'small' | 'medium' | 'large' | 'wide';
  variant?: 'character' | 'chapter' | 'analysis' | 'poem' | 'location' | 'default';
  featured?: boolean;
  interactive?: boolean;
  bookmarkable?: boolean;
  shareable?: boolean;
  onClick?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  className?: string;
  children?: ReactNode;
  metadata?: {
    readTime?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    views?: number;
    likes?: number;
    bookmarks?: number;
  };
}

/**
 * MuseumContentCard Component
 *
 * Creates an elegant exhibition-style content card with museum aesthetic,
 * supporting various content types and interactive features.
 */
export const MuseumContentCard: React.FC<MuseumContentCardProps> = ({
  title,
  subtitle,
  description,
  image,
  imageAlt = '',
  category,
  tags = [],
  size = 'medium',
  variant = 'default',
  featured = false,
  interactive = true,
  bookmarkable = true,
  shareable = true,
  onClick,
  onBookmark,
  onShare,
  className = '',
  children,
  metadata,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { t } = useLanguage();

  /**
   * Handle bookmark toggle
   */
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    if (onBookmark) {
      onBookmark();
    }
  };

  /**
   * Handle like toggle
   */
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  /**
   * Handle share action
   */
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare();
    }
  };

  /**
   * Get size-specific dimensions and styling
   */
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-64 h-80 text-sm';
      case 'medium':
        return 'w-80 h-96';
      case 'large':
        return 'w-96 h-112';
      case 'wide':
        return 'w-112 h-64';
      default:
        return 'w-80 h-96';
    }
  };

  /**
   * Get variant-specific styling and accent colors
   */
  const getVariantClasses = () => {
    switch (variant) {
      case 'character':
        return 'border-l-4 border-l-accent';
      case 'chapter':
        return 'border-l-4 border-l-primary';
      case 'analysis':
        return 'border-l-4 border-l-secondary';
      case 'poem':
        return 'border-l-4 border-l-accent-hover';
      case 'location':
        return 'border-l-4 border-l-muted-foreground';
      default:
        return '';
    }
  };

  /**
   * Get difficulty badge styling
   */
  const getDifficultyBadge = () => {
    if (!metadata?.difficulty) return null;

    const difficultyColors = {
      beginner: 'bg-green-500/20 text-green-300 border-green-500/30',
      intermediate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      advanced: 'bg-red-500/20 text-red-300 border-red-500/30',
    };

    return (
      <Badge
        variant="outline"
        className={`${difficultyColors[metadata.difficulty]} text-xs`}
      >
        {metadata.difficulty}
      </Badge>
    );
  };

  /**
   * Format view count for display
   */
  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  /**
   * Combined CSS classes for the card
   */
  const cardClasses = [
    'museum-card',
    'group',
    'cursor-pointer',
    'relative',
    'overflow-hidden',
    'transition-all',
    'duration-500',
    'ease-out',
    getSizeClasses(),
    getVariantClasses(),
    featured ? 'ring-2 ring-accent/30' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Card
      ref={cardRef}
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : 'article'}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Featured indicator */}
      {featured && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-accent/90 text-accent-foreground rounded-full p-1.5">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Category badge */}
      {category && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="secondary" className="text-xs font-medium">
            {category}
          </Badge>
        </div>
      )}

      {/* Image section */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
        </div>
      )}

      <CardHeader className="space-y-3">
        {/* Title and subtitle */}
        <div className="space-y-2">
          <CardTitle className="font-artistic text-xl text-foreground leading-tight line-clamp-2">
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Metadata row */}
        {metadata && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
              {metadata.readTime && (
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{metadata.readTime}</span>
                </div>
              )}
              {metadata.views && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatViews(metadata.views)}</span>
                </div>
              )}
            </div>
            {getDifficultyBadge()}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* Description */}
        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3 flex-1">
          {description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-muted/30 border-muted-foreground/30 hover:bg-accent/20 hover:border-accent/50 transition-colors"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs bg-muted/30 border-muted-foreground/30">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Custom children content */}
        {children && (
          <div className="border-t border-border/30 pt-4">
            {children}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex items-center space-x-2">
            {/* Like button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`accent-hover px-2 py-1 h-8 ${
                isLiked
                  ? 'text-accent bg-accent/10 border border-accent/30'
                  : 'text-muted-foreground hover:text-accent'
              }`}
            >
              <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
              {metadata?.likes && (
                <span className="ml-1 text-xs">
                  {metadata.likes + (isLiked ? 1 : 0)}
                </span>
              )}
            </Button>

            {/* Bookmark button */}
            {bookmarkable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={`accent-hover px-2 py-1 h-8 ${
                  isBookmarked
                    ? 'text-accent bg-accent/10 border border-accent/30'
                    : 'text-muted-foreground hover:text-accent'
                }`}
              >
                <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            )}

            {/* Share button */}
            {shareable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="accent-hover px-2 py-1 h-8 text-muted-foreground hover:text-accent"
              >
                <Share2 className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Read more / action button */}
          {interactive && (
            <Button
              variant="ghost"
              size="sm"
              className="accent-hover px-3 py-1 h-8 text-sm font-medium text-accent hover:text-accent-foreground hover:bg-accent"
            >
              {t('buttons.readMore') || 'Read More'}
              <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </CardContent>

      {/* Hover overlay effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 opacity-0 transition-opacity duration-500 pointer-events-none ${
          isHovered ? 'opacity-100' : ''
        }`}
      />
    </Card>
  );
};

export default MuseumContentCard;