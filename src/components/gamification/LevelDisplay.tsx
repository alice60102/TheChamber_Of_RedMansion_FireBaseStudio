/**
 * @fileOverview Level Display Component
 *
 * A comprehensive card component that displays complete user level information
 * including current level, XP progress, permissions, unlocked content, and rewards.
 *
 * Key Features:
 * - Complete level information display
 * - Integrated LevelBadge and LevelProgressBar components
 * - Visual rewards showcase (avatar frame, badges, title color)
 * - Permissions list with icons
 * - Unlocked content display
 * - Virtual residence information
 * - Next level preview
 * - Multi-language support
 * - Graceful handling when userProfile is unavailable
 * - Responsive design for all screen sizes
 *
 * Design Philosophy:
 * - Comprehensive yet scannable layout
 * - Visual hierarchy guides user attention
 * - Motivational elements encourage progression
 * - Traditional Chinese aesthetics aligned with Red Mansion theme
 *
 * Usage Examples:
 * ```tsx
 * // Detailed display with all information
 * <LevelDisplay variant="detailed" />
 *
 * // Summary display for dashboard
 * <LevelDisplay variant="summary" />
 *
 * // With next level preview
 * <LevelDisplay showNextLevel />
 * ```
 */

"use client"; // Required for client-side state and hooks

// React imports
import React from 'react';

// UI component imports
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Icon imports
import {
  Lock,
  Unlock,
  Home,
  Award,
  ChevronRight,
  BookOpen,
  Users,
  MessageSquare,
  FileText,
  Sparkles,
} from 'lucide-react';

// Custom hooks
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

// Gamification components
import { LevelBadge } from './LevelBadge';
import { LevelProgressBar } from './LevelProgressBar';

// Level configuration
import { getLevelConfig, getAllPermissionsForLevel } from '@/lib/config/levels-config';
import { LevelPermission } from '@/lib/types/user-level';

// Utility for className merging
import { cn } from '@/lib/utils';

/**
 * Props interface for LevelDisplay component
 */
interface LevelDisplayProps {
  /**
   * Display variant controlling detail level
   * - 'detailed': Full information display with all sections
   * - 'summary': Condensed version for dashboard/overview
   */
  variant?: 'detailed' | 'summary';

  /**
   * Whether to show next level information
   * Displays a preview of what will be unlocked at the next level
   */
  showNextLevel?: boolean;

  /**
   * Additional CSS classes for styling
   */
  className?: string;
}

/**
 * Get icon for permission type
 *
 * Maps permission types to appropriate Lucide icons for visual clarity
 *
 * @param permission - Permission type from LevelPermission enum
 * @returns Lucide icon component
 */
function getPermissionIcon(permission: LevelPermission) {
  const iconMap: Record<string, React.ElementType> = {
    [LevelPermission.BASIC_READING]: BookOpen,
    [LevelPermission.SIMPLE_AI_QA]: MessageSquare,
    [LevelPermission.DAILY_TASKS]: FileText,
    [LevelPermission.ADVANCED_AI_QA]: MessageSquare,
    [LevelPermission.NOTE_SHARING]: Users,
    [LevelPermission.EXPERT_READINGS_PREVIEW]: BookOpen,
    [LevelPermission.COMMUNITY_POST]: Users,
    [LevelPermission.POETRY_COMPETITION]: Award,
    [LevelPermission.EXPERT_READINGS_FULL]: BookOpen,
    [LevelPermission.CHARACTER_DEEP_DIVE]: Users,
    [LevelPermission.STUDY_GROUPS]: Users,
    [LevelPermission.MENTOR_ACCESS]: Users,
    [LevelPermission.ADVANCED_ANALYTICS]: Sparkles,
    [LevelPermission.CONTENT_CREATION]: FileText,
    [LevelPermission.BETA_FEATURES]: Sparkles,
    [LevelPermission.EXCLUSIVE_EVENTS]: Award,
  };

  return iconMap[permission] || Unlock;
}

/**
 * Format permission name for display
 *
 * Converts snake_case permission names to readable format
 *
 * @param permission - Permission type
 * @returns Formatted permission name
 */
function formatPermissionName(permission: LevelPermission): string {
  return permission
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Level Display Component
 *
 * Displays comprehensive level information including current status,
 * progress, permissions, and rewards. Integrates multiple sub-components
 * for a cohesive user experience.
 *
 * @param variant - Display style variant
 * @param showNextLevel - Whether to show next level preview
 * @param className - Additional CSS classes
 */
export function LevelDisplay({
  variant = 'detailed',
  showNextLevel = false,
  className = '',
}: LevelDisplayProps) {
  const { userProfile, isLoading } = useAuth();
  const { t } = useLanguage();

  // Get current and next level configurations (with NaN protection)
  const rawLevel = userProfile?.currentLevel;
  const currentLevel = (typeof rawLevel === 'number' && !isNaN(rawLevel) && isFinite(rawLevel)) ? rawLevel : 0;
  const currentLevelConfig = getLevelConfig(currentLevel);
  const nextLevelConfig = getLevelConfig(currentLevel + 1);

  // Get all permissions for current level
  const currentPermissions = getAllPermissionsForLevel(currentLevel);

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-20 bg-muted rounded" />
          <div className="h-16 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  // No user profile available
  if (!userProfile || !currentLevelConfig) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Lock className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{t('user.notLoggedIn')}</p>
        </CardContent>
      </Card>
    );
  }

  // Summary variant - condensed display
  if (variant === 'summary') {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{currentLevelConfig.title}</CardTitle>
              <CardDescription>{currentLevelConfig.titleEn}</CardDescription>
            </div>
            <LevelBadge variant="full" showTitle={false} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* XP Progress */}
          <LevelProgressBar showLabels />

          {/* Virtual Residence */}
          {currentLevelConfig.virtualResidence && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <span>{t('level.virtualResidence')}: </span>
              <span className="font-medium text-foreground">
                {currentLevelConfig.virtualResidence}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Detailed variant - full information display
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-3">
              {currentLevelConfig.title}
              <LevelBadge variant="compact" />
            </CardTitle>
            <CardDescription className="text-base">
              {currentLevelConfig.titleEn} • {currentLevelConfig.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* XP Progress Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {t('level.progress')}
          </h3>
          <LevelProgressBar showLabels animated />
        </div>

        <Separator />

        {/* Virtual Residence */}
        {currentLevelConfig.virtualResidence && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              {t('level.virtualResidence')}
            </h3>
            <p className="text-sm text-muted-foreground pl-6">
              {currentLevelConfig.virtualResidence}
            </p>
          </div>
        )}

        {/* Permissions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Unlock className="h-4 w-4 text-primary" />
            {t('level.permissions')} ({currentPermissions.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
            {currentPermissions.map((permission) => {
              const PermissionIcon = getPermissionIcon(permission);
              return (
                <div
                  key={permission}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <PermissionIcon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{formatPermissionName(permission)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unlocked Content */}
        {currentLevelConfig.exclusiveContent && currentLevelConfig.exclusiveContent.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              {t('level.unlockedContent')}
            </h3>
            <div className="flex flex-wrap gap-2 pl-6">
              {currentLevelConfig.exclusiveContent.map((content, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {content}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Exclusive Rewards */}
        {currentLevelConfig.visualRewards && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t('level.exclusiveRewards')}
            </h3>
            <div className="flex flex-wrap gap-2 pl-6">
              {currentLevelConfig.visualRewards.avatarFrame && (
                <Badge variant="outline" className="text-xs">
                  {currentLevelConfig.visualRewards.avatarFrame}
                </Badge>
              )}
              {currentLevelConfig.visualRewards.exclusiveBadges?.map((badge, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Next Level Preview */}
        {showNextLevel && nextLevelConfig && (
          <>
            <Separator />
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                {t('level.nextLevel')}: {nextLevelConfig.title}
              </h3>
              <p className="text-sm text-muted-foreground pl-6">
                {nextLevelConfig.description}
              </p>
              {nextLevelConfig.permissions.length > currentPermissions.length && (
                <div className="pl-6 text-sm">
                  <span className="text-muted-foreground">{t('level.newPermissionsUnlocked')}: </span>
                  <span className="font-medium">
                    +{nextLevelConfig.permissions.length - currentPermissions.length}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
