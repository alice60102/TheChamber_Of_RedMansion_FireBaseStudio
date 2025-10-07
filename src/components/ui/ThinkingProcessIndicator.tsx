'use client';

/**
 * @fileOverview Thinking Process Indicator Component
 *
 * Professional visualization of AI thinking process with:
 * - "已深度思考" status badge with completion indicator
 * - Expandable/collapsible thinking content
 * - Real-time streaming visualization
 * - Progressive loading animation
 * - Visual differentiation (lighter color, italic, smaller font)
 *
 * Follows the UX design pattern specified in improvement report
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Brain, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Thinking process status types
 */
export type ThinkingStatus = 'thinking' | 'complete' | 'error' | 'idle';

/**
 * Component props interface
 */
export interface ThinkingProcessIndicatorProps {
  /** Current thinking status */
  status: ThinkingStatus;

  /** Thinking process content (markdown or plain text) */
  content: string;

  /** Whether the thinking content can be expanded/collapsed */
  isExpandable?: boolean;

  /** Initial expanded state */
  defaultExpanded?: boolean;

  /** Callback when expand/collapse is toggled */
  onToggleExpand?: (isExpanded: boolean) => void;

  /** Show progress percentage (0-100) */
  progress?: number;

  /** Additional CSS classes */
  className?: string;

  /** Whether to show the content inline (no expand/collapse) */
  alwaysVisible?: boolean;
}

/**
 * Get status configuration based on current state
 */
function getStatusConfig(status: ThinkingStatus) {
  switch (status) {
    case 'thinking':
      return {
        icon: Loader2,
        label: '深度思考中',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconClassName: 'animate-spin',
      };
    case 'complete':
      return {
        icon: CheckCircle2,
        label: '已深度思考',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950',
        borderColor: 'border-green-200 dark:border-green-800',
        iconClassName: '',
      };
    case 'error':
      return {
        icon: AlertCircle,
        label: '思考過程出錯',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950',
        borderColor: 'border-red-200 dark:border-red-800',
        iconClassName: '',
      };
    default:
      return {
        icon: Brain,
        label: '準備中',
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-950',
        borderColor: 'border-gray-200 dark:border-gray-800',
        iconClassName: '',
      };
  }
}

/**
 * Main Thinking Process Indicator Component
 */
export function ThinkingProcessIndicator({
  status,
  content,
  isExpandable = true,
  defaultExpanded = false,
  onToggleExpand,
  progress,
  className,
  alwaysVisible = false,
}: ThinkingProcessIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const handleToggle = () => {
    if (!isExpandable && !alwaysVisible) return;

    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggleExpand?.(newExpanded);
  };

  // Auto-expand when thinking starts
  React.useEffect(() => {
    if (status === 'thinking' && !isExpanded && !alwaysVisible) {
      setIsExpanded(true);
    }
  }, [status, isExpanded, alwaysVisible]);

  const hasContent = content && content.trim().length > 0;
  const showExpandButton = isExpandable && hasContent && !alwaysVisible;

  return (
    <div
      className={cn(
        'thinking-process-indicator rounded-lg border transition-all duration-300',
        config.borderColor,
        config.bgColor,
        className
      )}
    >
      {/* Header with status badge */}
      <div
        className={cn(
          'flex items-center gap-3 p-4',
          showExpandButton && 'cursor-pointer hover:bg-opacity-70 transition-colors'
        )}
        onClick={showExpandButton ? handleToggle : undefined}
      >
        {/* Status Icon */}
        <div className={cn('flex-shrink-0', config.color)}>
          <Icon className={cn('w-5 h-5', config.iconClassName)} />
        </div>

        {/* Status Label */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('font-medium text-sm', config.color)}>
              {config.label}
            </span>

            {/* Progress indicator */}
            {status === 'thinking' && progress !== undefined && (
              <span className="text-xs text-muted-foreground">
                ({progress}%)
              </span>
            )}
          </div>

          {/* Progress bar for streaming */}
          {status === 'thinking' && progress !== undefined && (
            <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Expand/Collapse Icon */}
        {showExpandButton && (
          <div className={cn('flex-shrink-0', config.color)}>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        )}
      </div>

      {/* Thinking Content */}
      {hasContent && (isExpanded || alwaysVisible) && (
        <div
          className={cn(
            'thinking-content px-4 pb-4 text-sm',
            'text-muted-foreground italic',
            'border-t border-current border-opacity-10 pt-4',
            'animate-in fade-in slide-in-from-top-2 duration-300'
          )}
        >
          <div className="whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        </div>
      )}

      {/* Empty state when no content yet */}
      {!hasContent && status === 'thinking' && (
        <div className="px-4 pb-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
            <span className="inline-block w-2 h-2 bg-current rounded-full animate-pulse" />
            <span>正在組織思路...</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for inline display
 */
export function ThinkingProcessBadge({
  status,
  progress,
  className,
}: Pick<ThinkingProcessIndicatorProps, 'status' | 'progress' | 'className'>) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
        config.bgColor,
        config.color,
        config.borderColor,
        'border',
        className
      )}
    >
      <Icon className={cn('w-4 h-4', config.iconClassName)} />
      <span>{config.label}</span>
      {status === 'thinking' && progress !== undefined && (
        <span className="text-xs opacity-70">({progress}%)</span>
      )}
    </div>
  );
}
