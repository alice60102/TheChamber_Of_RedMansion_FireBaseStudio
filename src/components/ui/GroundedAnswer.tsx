/**
 * @fileOverview Grounded Answer Display Component
 * 
 * This component provides a comprehensive display for AI-generated answers
 * with Google Search grounding capabilities. It combines the answer text
 * with citation information, search queries, and metadata in a cohesive,
 * user-friendly interface.
 * 
 * Features:
 * - Markdown rendering for formatted AI responses
 * - Integrated citation display with source verification
 * - Search query visualization for transparency
 * - Response time and grounding metadata display
 * - Streaming response support with real-time updates
 * - Accessibility features and keyboard navigation
 * - Mobile-responsive design
 * - Integration with existing design system
 */

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Clock, Search, CheckCircle, AlertCircle, Copy, Share2, Bookmark, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CitationDisplay } from './CitationDisplay';
import type { GroundedQAResponse, StreamingChunk, GroundingMetadata } from '@/types/grounded-qa';

/**
 * Props for the GroundedAnswer component
 */
interface GroundedAnswerProps {
  /** The grounded QA response to display */
  response?: GroundedQAResponse;
  
  /** Whether the response is currently loading */
  isLoading?: boolean;
  
  /** Streaming chunks for real-time display */
  streamingChunks?: StreamingChunk[];
  
  /** Whether to show detailed metadata */
  showMetadata?: boolean;
  
  /** Whether to show search queries */
  showSearchQueries?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Error message if response failed */
  error?: string;
  
  /** Callback when user wants to regenerate response */
  onRegenerate?: () => void;
  
  /** Callback when user shares the response */
  onShare?: (response: GroundedQAResponse) => void;
  
  /** Callback when user bookmarks the response */
  onBookmark?: (response: GroundedQAResponse) => void;
  
  /** Custom styling variant */
  variant?: 'default' | 'compact' | 'detailed';
}

/**
 * Component to display response metadata
 * 顯示回應元數據的組件
 */
interface MetadataDisplayProps {
  metadata?: GroundingMetadata;
  responseTime?: number;
  searchQueries?: string[];
  showSearchQueries?: boolean;
}

const MetadataDisplay: React.FC<MetadataDisplayProps> = ({
  metadata,
  responseTime,
  searchQueries,
  showSearchQueries,
}) => {
  if (!metadata && !responseTime && (!searchQueries || searchQueries.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Response Time and Grounding Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {responseTime && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{responseTime.toFixed(2)} 秒</span>
            </div>
          )}
          
          {metadata && (
            <div className="flex items-center gap-1">
              {metadata.groundingSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-700">已驗證</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-700">部分驗證</span>
                </>
              )}
            </div>
          )}
        </div>

        {metadata && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{metadata.totalSearchResults} 個搜索結果</span>
            <span>{metadata.citationCount} 個引用</span>
          </div>
        )}
      </div>

      {/* Search Queries */}
      {showSearchQueries && searchQueries && searchQueries.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Search className="h-4 w-4" />
            <span>搜索查詢</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchQueries.map((query, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {query}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {metadata?.warnings && metadata.warnings.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {metadata.warnings.map((warning, index) => (
                <div key={index} className="text-sm">
                  {warning}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

/**
 * Component to display streaming response
 * 顯示流式回應的組件
 */
interface StreamingDisplayProps {
  chunks: StreamingChunk[];
  isComplete: boolean;
}

const StreamingDisplay: React.FC<StreamingDisplayProps> = ({ chunks, isComplete }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);

  useEffect(() => {
    if (chunks.length === 0) return;

    const sortedChunks = chunks.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    const content = sortedChunks.map(chunk => chunk.content).join('');
    setDisplayedContent(content);
    setCurrentChunkIndex(sortedChunks.length - 1);
  }, [chunks]);

  return (
    <div className="space-y-2">
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          components={{
            // Custom components for better Traditional Chinese rendering
            p: ({ children }) => <p className="leading-relaxed mb-3">{children}</p>,
            h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-4">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-medium mb-2 mt-3">{children}</h3>,
            ul: ({ children }) => <ul className="list-disc ml-6 mb-3 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-6 mb-3 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
            code: ({ children }) => (
              <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">{children}</code>
            ),
          }}
        >
          {displayedContent}
        </ReactMarkdown>
      </div>

      {!isComplete && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>正在生成回答...</span>
        </div>
      )}
    </div>
  );
};

/**
 * Main grounded answer display component
 * 主要的接地答案顯示組件
 */
export const GroundedAnswer: React.FC<GroundedAnswerProps> = ({
  response,
  isLoading = false,
  streamingChunks = [],
  showMetadata = true,
  showSearchQueries = true,
  className,
  error,
  onRegenerate,
  onShare,
  onBookmark,
  variant = 'default',
}) => {
  const [copiedContent, setCopiedContent] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Handle progress for loading state
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [isLoading]);

  /**
   * Handle copying content to clipboard
   * 處理將內容複製到剪貼板
   */
  const handleCopy = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedContent(type);
      setTimeout(() => setCopiedContent(null), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  // Error state
  if (error) {
    return (
      <Card className={cn("border-destructive", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            回答生成失敗
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive mb-4">{error}</p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-1" />
              重新生成
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading && streamingChunks.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
            正在生成回答
          </CardTitle>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Streaming state
  if (streamingChunks.length > 0) {
    const isComplete = streamingChunks.some(chunk => chunk.isComplete);
    
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>AI 回答</CardTitle>
        </CardHeader>
        <CardContent>
          <StreamingDisplay chunks={streamingChunks} isComplete={isComplete} />
        </CardContent>
      </Card>
    );
  }

  // Complete response state
  if (!response) {
    return null;
  }

  const isCompact = variant === 'compact';

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">AI 回答</CardTitle>
              {response.groundingMetadata && (
                <CardDescription>
                  基於 {response.groundingMetadata.totalSearchResults} 個可靠來源
                </CardDescription>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(response.answer, 'answer')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copiedContent === 'answer' ? '已複製' : '複製回答'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {onShare && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onShare(response)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>分享回答</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {onBookmark && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onBookmark(response)}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>收藏回答</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {onRegenerate && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRegenerate}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>重新生成</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Main answer content */}
          <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="leading-relaxed mb-3">{children}</p>,
                h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-4">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-medium mb-2 mt-3">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc ml-6 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-6 mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">{children}</code>
                ),
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {response.answerWithCitations || response.answer}
            </ReactMarkdown>
          </div>

          {/* Metadata display */}
          {showMetadata && !isCompact && (
            <>
              <Separator className="my-4" />
              <MetadataDisplay
                metadata={response.groundingMetadata}
                responseTime={response.responseTime}
                searchQueries={response.searchQueries}
                showSearchQueries={showSearchQueries}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Citations display */}
      {response.citations && response.citations.length > 0 && (
        <CitationDisplay
          citations={response.citations}
          variant={isCompact ? 'compact' : 'default'}
          defaultExpanded={!isCompact}
          onCitationClick={(citation, index) => {
            // Analytics or tracking could be added here
            console.log('Citation clicked:', { citation, index });
          }}
        />
      )}
    </div>
  );
};

export default GroundedAnswer;
