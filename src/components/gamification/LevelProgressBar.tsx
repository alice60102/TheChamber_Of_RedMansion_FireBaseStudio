/**
 * @fileOverview Level Progress Bar Component
 *
 * An animated progress bar visualization showing user's XP progression toward
 * the next level. Provides clear visual feedback and motivation.
 *
 * Key Features:
 * - Smooth animated transitions when XP changes
 * - Optional XP value labels (current/total)
 * - Percentage display option
 * - Color-coded progress based on completion
 * - Graceful handling when userProfile is unavailable
 * - Multi-language support for labels
 * - Responsive design adapting to container width
 *
 * Design Philosophy:
 * - Visual feedback encourages continued learning
 * - Clear progress indicators reduce uncertainty
 * - Smooth animations provide satisfying user experience
 * - Optional details allow flexibility in different contexts
 *
 * Usage Examples:
 * ```tsx
 * // Basic progress bar
 * <LevelProgressBar />
 *
 * // With XP labels
 * <LevelProgressBar showLabels />
 *
 * // Without animation (for static displays)
 * <LevelProgressBar animated={false} />
 *
 * // With custom XP values (for previews/testing)
 * <LevelProgressBar currentXP={150} nextLevelXP={300} />
 * ```
 */

"use client"; // Required for client-side animations and state

// React imports
import React from 'react';

// UI component imports
import { Progress } from '@/components/ui/progress';

// Custom hooks
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

// Utility for className merging
import { cn } from '@/lib/utils';

/**
 * Props interface for LevelProgressBar component
 */
interface LevelProgressBarProps {
  /**
   * Override current XP value
   * If not provided, uses user's actual currentXP from userProfile
   */
  currentXP?: number;

  /**
   * Override next level XP requirement
   * If not provided, uses user's actual nextLevelXP from userProfile
   */
  nextLevelXP?: number;

  /**
   * Whether to display XP value labels
   * Shows "currentXP / nextLevelXP" text
   */
  showLabels?: boolean;

  /**
   * Whether to animate progress changes
   * Set to false for static displays or initial renders
   */
  animated?: boolean;

  /**
   * Additional CSS classes for the container
   */
  className?: string;

  /**
   * Additional CSS classes for the progress indicator
   */
  indicatorClassName?: string;
}

/**
 * Calculate progress percentage
 *
 * @param current - Current XP value
 * @param total - Total XP required for next level
 * @returns Percentage value (0-100)
 */
function calculateProgressPercentage(current: number, total: number): number {
  if (total <= 0) return 100; // Max level reached
  const percentage = (current / total) * 100;
  return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100
}

/**
 * Format XP number with thousands separators
 *
 * @param xp - XP value to format
 * @returns Formatted string (e.g., "1,234")
 */
function formatXP(xp: number): string {
  return xp.toLocaleString();
}

/**
 * Get progress bar color based on completion percentage
 *
 * Returns appropriate color classes for visual feedback:
 * - Low progress (0-33%): Blue - just starting
 * - Medium progress (34-66%): Purple - making progress
 * - High progress (67-99%): Amber - almost there!
 * - Complete (100%): Green - level up ready!
 *
 * @param percentage - Progress percentage (0-100)
 * @returns Tailwind CSS class for progress indicator color
 */
function getProgressColor(percentage: number): string {
  if (percentage >= 100) {
    return 'bg-green-500 dark:bg-green-400'; // Complete - ready to level up!
  }
  if (percentage >= 67) {
    return 'bg-amber-500 dark:bg-amber-400'; // High progress - almost there!
  }
  if (percentage >= 34) {
    return 'bg-purple-500 dark:bg-purple-400'; // Medium progress - keep going!
  }
  return 'bg-blue-500 dark:bg-blue-400'; // Low progress - just starting
}

/**
 * Level Progress Bar Component
 *
 * Displays an animated progress bar showing the user's XP progression
 * toward their next level. Optionally includes XP labels and percentage
 * display. Handles missing user data gracefully with skeleton loading states.
 *
 * @param currentXP - Override current XP value
 * @param nextLevelXP - Override next level XP requirement
 * @param showLabels - Whether to display XP labels
 * @param animated - Whether to animate progress changes
 * @param className - Additional CSS classes for container
 * @param indicatorClassName - Additional CSS classes for progress indicator
 */
export function LevelProgressBar({
  currentXP: currentXPOverride,
  nextLevelXP: nextLevelXPOverride,
  showLabels = false,
  animated = true,
  className = '',
  indicatorClassName = '',
}: LevelProgressBarProps) {
  const { userProfile, isLoading } = useAuth();
  const { t } = useLanguage();

  // Determine actual XP values to display
  const currentXP = currentXPOverride ?? userProfile?.currentXP ?? 0;
  const nextLevelXP = nextLevelXPOverride ?? userProfile?.nextLevelXP ?? 100;

  // Calculate progress percentage
  const progressPercentage = calculateProgressPercentage(currentXP, nextLevelXP);

  // Get appropriate color for current progress
  const progressColor = getProgressColor(progressPercentage);

  // Loading state
  if (isLoading && currentXPOverride === undefined) {
    return (
      <div className={cn('space-y-2', className)}>
        {showLabels && (
          <div className="flex justify-between text-sm">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </div>
        )}
        <div className="h-4 w-full bg-muted animate-pulse rounded-full" />
      </div>
    );
  }

  // Calculate remaining XP needed
  const xpRemaining = Math.max(nextLevelXP - currentXP, 0);

  return (
    <div className={cn('space-y-2', className)}>
      {/* XP Labels (optional) */}
      {showLabels && (
        <div className="flex justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            {t('level.currentXP')}: <span className="text-foreground font-semibold">{formatXP(currentXP)}</span>
          </span>
          <span className="font-medium text-muted-foreground">
            {t('level.xpToNextLevel')}: <span className="text-foreground font-semibold">{formatXP(xpRemaining)}</span>
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <Progress
          value={progressPercentage}
          className={cn(
            'h-3',
            !animated && 'transition-none',
            className
          )}
          indicatorClassName={cn(
            progressColor,
            animated ? 'transition-all duration-500 ease-out' : 'transition-none',
            indicatorClassName
          )}
        />

        {/* Percentage Label (overlaid on progress bar) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-md mix-blend-difference">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* XP Progress Text (alternative to labels) */}
      {!showLabels && (
        <div className="flex justify-center">
          <span className="text-xs text-muted-foreground">
            {formatXP(currentXP)} / {formatXP(nextLevelXP)} {t('level.xpToGo')}
          </span>
        </div>
      )}
    </div>
  );
}
