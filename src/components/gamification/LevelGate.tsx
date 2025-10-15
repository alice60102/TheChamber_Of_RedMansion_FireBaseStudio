/**
 * @fileOverview Level Gate Component
 *
 * A permission-based wrapper component that conditionally renders content
 * based on user's level and permissions. Essential for implementing the
 * freemium model and progressive content unlock system.
 *
 * Key Features:
 * - Permission-based content gating
 * - Level-based content gating
 * - Customizable fallback UI for locked content
 * - Optional upgrade/level-up prompts
 * - Loading state handling
 * - Multi-language support
 * - Accessible design with clear feedback
 *
 * Design Philosophy:
 * - Clear communication of why content is locked
 * - Motivational messaging to encourage progression
 * - Non-intrusive for authorized users (zero overhead)
 * - Educational for unauthorized users (shows path to unlock)
 *
 * Usage Examples:
 * ```tsx
 * // Gate by permission
 * <LevelGate requiredPermission={LevelPermission.POETRY_COMPETITION}>
 *   <PoetryCompetitionFeature />
 * </LevelGate>
 *
 * // Gate by minimum level
 * <LevelGate requiredLevel={3}>
 *   <AdvancedContent />
 * </LevelGate>
 *
 * // Custom fallback UI
 * <LevelGate
 *   requiredLevel={5}
 *   fallback={<CustomUpgradePrompt />}
 * >
 *   <ExclusiveFeature />
 * </LevelGate>
 *
 * // Silent mode (just hide, no fallback)
 * <LevelGate requiredPermission={LevelPermission.BETA_FEATURES} silent>
 *   <BetaFeature />
 * </LevelGate>
 * ```
 */

"use client"; // Required for client-side state and hooks

// React imports
import React from 'react';

// UI component imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Icon imports
import { Lock, TrendingUp, Sparkles } from 'lucide-react';

// Custom hooks
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

// Gamification components
import { LevelBadge } from './LevelBadge';

// Level configuration
import { getLevelConfig } from '@/lib/config/levels-config';
import { LevelPermission } from '@/lib/types/user-level';

// User level service
import { userLevelService } from '@/lib/user-level-service';

// Utility for className merging
import { cn } from '@/lib/utils';

/**
 * Props interface for LevelGate component
 */
interface LevelGateProps {
  /**
   * Required permission to access the content
   * If specified, checks if user has this specific permission
   */
  requiredPermission?: LevelPermission;

  /**
   * Required minimum level to access the content
   * If specified, checks if user's level meets or exceeds this value
   */
  requiredLevel?: number;

  /**
   * Content to render when user has access
   */
  children: React.ReactNode;

  /**
   * Custom fallback UI to show when access is denied
   * If not provided, uses default locked content message
   */
  fallback?: React.ReactNode;

  /**
   * Silent mode - just hide content without showing fallback
   * Useful for optional features that shouldn't call attention when locked
   */
  silent?: boolean;

  /**
   * Optional callback when user clicks upgrade/level-up prompt
   * Typically used to navigate to achievements or upgrade page
   */
  onUpgradeClick?: () => void;

  /**
   * Additional CSS classes for the fallback container
   */
  className?: string;
}

/**
 * Default Locked Content Fallback
 *
 * Displays when user doesn't have required permissions or level.
 * Provides clear feedback and motivation to progress.
 */
function DefaultLockedFallback({
  requiredPermission,
  requiredLevel,
  currentLevel,
  onUpgradeClick,
  className,
}: {
  requiredPermission?: LevelPermission;
  requiredLevel?: number;
  currentLevel: number;
  onUpgradeClick?: () => void;
  className?: string;
}) {
  const { t } = useLanguage();
  const requiredLevelConfig = requiredLevel !== undefined ? getLevelConfig(requiredLevel) : null;

  // Calculate levels needed
  const levelsNeeded = requiredLevel !== undefined ? Math.max(0, requiredLevel - currentLevel) : 0;

  return (
    <Card className={cn('border-dashed border-2', className)}>
      <CardHeader className="text-center pb-3">
        <div className="flex justify-center mb-3">
          <div className="relative">
            <Lock className="h-12 w-12 text-muted-foreground opacity-50" />
            <Sparkles className="h-5 w-5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        <CardTitle className="text-lg text-muted-foreground">
          {t('level.permissions')} Required
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {/* Required level information */}
        {requiredLevel !== undefined && requiredLevelConfig && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('level.xpRequired')}:
            </p>
            <div className="flex justify-center">
              <LevelBadge level={requiredLevel} variant="full" showTitle />
            </div>
            <p className="text-xs text-muted-foreground italic">
              {requiredLevelConfig.title} • {requiredLevelConfig.titleEn}
            </p>
            {levelsNeeded > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  {levelsNeeded} {levelsNeeded === 1 ? 'level' : 'levels'} to go
                </span>
              </div>
            )}
          </div>
        )}

        {/* Required permission information */}
        {requiredPermission && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Required Permission:
            </p>
            <p className="text-xs font-mono bg-muted px-3 py-1 rounded inline-block">
              {requiredPermission}
            </p>
          </div>
        )}

        {/* Motivational message */}
        <p className="text-sm text-muted-foreground italic">
          {t('level.keepLearning')}
        </p>

        {/* Call to action */}
        {onUpgradeClick && (
          <Button onClick={onUpgradeClick} variant="default" size="sm" className="mt-4">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Progress
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Level Gate Component
 *
 * Wraps content that requires specific permissions or level requirements.
 * Automatically checks user's permissions and displays appropriate fallback
 * for unauthorized access.
 *
 * @param requiredPermission - Required permission to access content
 * @param requiredLevel - Required minimum level to access content
 * @param children - Content to render when access is granted
 * @param fallback - Custom fallback UI for denied access
 * @param silent - Hide content silently without fallback
 * @param onUpgradeClick - Callback for upgrade/level-up button
 * @param className - Additional CSS classes
 */
export function LevelGate({
  requiredPermission,
  requiredLevel,
  children,
  fallback,
  silent = false,
  onUpgradeClick,
  className = '',
}: LevelGateProps) {
  const { user, userProfile, isLoading } = useAuth();

  // Loading state - show nothing to prevent flash of wrong content
  if (isLoading) {
    return null;
  }

  // No user logged in - deny access
  if (!user || !userProfile) {
    if (silent) return null;

    return fallback || (
      <DefaultLockedFallback
        requiredPermission={requiredPermission}
        requiredLevel={requiredLevel}
        currentLevel={0}
        onUpgradeClick={onUpgradeClick}
        className={className}
      />
    );
  }

  // Check level requirement
  if (requiredLevel !== undefined) {
    if (userProfile.currentLevel < requiredLevel) {
      if (silent) return null;

      return fallback || (
        <DefaultLockedFallback
          requiredPermission={requiredPermission}
          requiredLevel={requiredLevel}
          currentLevel={userProfile.currentLevel}
          onUpgradeClick={onUpgradeClick}
          className={className}
        />
      );
    }
  }

  // Check permission requirement
  if (requiredPermission) {
    const hasPermission = userLevelService.checkPermissionSync(
      userProfile.currentLevel,
      requiredPermission
    );

    if (!hasPermission) {
      if (silent) return null;

      return fallback || (
        <DefaultLockedFallback
          requiredPermission={requiredPermission}
          requiredLevel={requiredLevel}
          currentLevel={userProfile.currentLevel}
          onUpgradeClick={onUpgradeClick}
          className={className}
        />
      );
    }
  }

  // User has access - render children
  return <>{children}</>;
}
