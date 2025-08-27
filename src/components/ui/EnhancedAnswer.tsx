/**
 * @fileOverview Enhanced Answer Display Component for Multiple AI Providers
 * 
 * This component provides a unified display for AI-generated answers from both
 * Google Gemini Grounding and Perplexity Sonar API. It adapts to different
 * response formats while maintaining a consistent user experience.
 * 
 * Features:
 * - Support for both Gemini and Perplexity response formats
 * - Markdown rendering for formatted AI responses
 * - Integrated citation display with source verification
 * - Search query visualization for transparency
 * - Response time and grounding metadata display
 * - Streaming response support with real-time updates
 * - Accessibility features and keyboard navigation
 * - Mobile-responsive design
 * - AI provider identification and branding
 */

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Clock, Search, CheckCircle, AlertCircle, Copy, Share2, Bookmark, RotateCcw, Brain, Globe } from 'lucide-react';
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

// Import both response types
import type { GroundedQAResponse, StreamingChunk as GeminiStreamingChunk } from '@/types/grounded-qa';
import type { PerplexityQAResponse, PerplexityStreamingChunk } from '@/types/perplexity-qa';

/**
 * Union type for different AI providers
 */
type AIProvider = 'gemini' | 'perplexity';

/**
 * Union type for different response formats
 */
type UnifiedResponse = GroundedQAResponse | PerplexityQAResponse;

/**
 * Union type for streaming chunks
 */
type UnifiedStreamingChunk = GeminiStreamingChunk | PerplexityStreamingChunk;

/**
 * Props for the EnhancedAnswer component
 */
interface EnhancedAnswerProps {
  /** The AI response to display (from either provider) */
  response?: UnifiedResponse;
  
  /** The AI provider used */
  provider: AIProvider;
  
  /** Whether the response is currently loading */
  isLoading?: boolean;
  
  /** Streaming chunks for real-time display */
  streamingChunks?: UnifiedStreamingChunk[];
  
  /** Whether to show detailed metadata */
  showMetadata?: boolean;
  
  /** Whether to show search queries used */
  showSearchQueries?: boolean;
  
  /** Whether to show citations */
  showCitations?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Custom title for the response */
  title?: string;
  
  /** Whether to enable action buttons (copy, share, etc.) */
  enableActions?: boolean;
  
  /** Callback for regenerating the response */
  onRegenerate?: () => void;
  
  /** Callback for sharing the response */
  onShare?: (response: UnifiedResponse) => void;
  
  /** Callback for bookmarking the response */
  onBookmark?: (response: UnifiedResponse) => void;
  
  /** Callback for copying the response */
  onCopy?: (text: string) => void;
  
  /** Callback for citation clicks */
  onCitationClick?: (citation: any, index: number) => void;
}

/**
 * Type guards to differentiate between response types
 */
const isPerplexityResponse = (response: UnifiedResponse): response is PerplexityQAResponse => {
  return 'groundingMetadata' in response && 'modelKey' in response;
};

const isPerplexityStreamingChunk = (chunk: UnifiedStreamingChunk): chunk is PerplexityStreamingChunk => {
  return 'chunkIndex' in chunk && 'hasThinkingProcess' in chunk;
};

/**
 * Normalize response data to a common format
 */
const normalizeResponse = (response: UnifiedResponse, provider: AIProvider) => {
  if (provider === 'perplexity' && isPerplexityResponse(response)) {
    return {
      answer: response.answer,
      citations: response.citations,
      searchQueries: response.groundingMetadata.searchQueries,
      processingTime: response.processingTime,
      success: response.success,
      modelUsed: response.modelKey,
      timestamp: response.timestamp,
      metadata: {
        groundingSuccessful: response.groundingMetadata.groundingSuccessful,
        confidenceScore: response.groundingMetadata.confidenceScore,
        citationCount: response.citationCount,
        reasoning: response.reasoningEffort,
        context: response.questionContext,
        ...response.metadata,
      },
    };
  } else {
    // Gemini format
    const geminiResponse = response as GroundedQAResponse;
    return {
      answer: geminiResponse.answer,
      citations: geminiResponse.citations,
      searchQueries: geminiResponse.searchQueries,
      processingTime: geminiResponse.responseTime,
      success: geminiResponse.success,
      modelUsed: 'Gemini 2.5 Pro',
      timestamp: geminiResponse.timestamp,
      metadata: {
        groundingSuccessful: geminiResponse.success,
        confidenceScore: geminiResponse.citations ? Math.min(geminiResponse.citations.length / 5, 1) : 0,
        citationCount: geminiResponse.citations?.length || 0,
        ...geminiResponse.metadata,
      },
    };
  }
};

/**
 * Get provider-specific branding and styling
 */
const getProviderInfo = (provider: AIProvider) => {
  switch (provider) {
    case 'perplexity':
      return {
        name: 'Perplexity Sonar',
        icon: Brain,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
      };
    case 'gemini':
      return {
        name: 'Google Gemini',
        icon: Globe,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      };
    default:
      return {
        name: 'AI Assistant',
        icon: Brain,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
      };
  }
};

/**
 * Enhanced Answer Component
 */
export const EnhancedAnswer: React.FC<EnhancedAnswerProps> = ({
  response,
  provider,
  isLoading = false,
  streamingChunks = [],
  showMetadata = true,
  showSearchQueries = true,
  showCitations = true,
  className,
  title,
  enableActions = true,
  onRegenerate,
  onShare,
  onBookmark,
  onCopy,
  onCitationClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState(0);

  const providerInfo = getProviderInfo(provider);
  const ProviderIcon = providerInfo.icon;

  // Handle streaming progress
  useEffect(() => {
    if (streamingChunks.length > 0) {
      const lastChunk = streamingChunks[streamingChunks.length - 1];
      if ('isComplete' in lastChunk && lastChunk.isComplete) {
        setStreamingProgress(100);
      } else {
        // Estimate progress based on chunk count (rough approximation)
        setStreamingProgress(Math.min((streamingChunks.length / 20) * 100, 95));
      }
    }
  }, [streamingChunks]);

  // Copy response to clipboard
  const handleCopy = async () => {
    if (!response) return;
    
    const normalized = normalizeResponse(response, provider);
    const textToCopy = `問題：${response.question}\n\n回答：${normalized.answer}\n\n來源：${provider === 'perplexity' ? 'Perplexity Sonar' : 'Google Gemini'}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(textToCopy);
    } catch (error) {
      console.error('Failed to copy response:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ProviderIcon className={cn("h-5 w-5", providerInfo.color)} />
            <CardTitle className="text-lg">
              {title || `${providerInfo.name} 正在思考中...`}
            </CardTitle>
          </div>
          {streamingChunks.length > 0 && (
            <div className="space-y-2">
              <Progress value={streamingProgress} className="h-2" />
              <CardDescription>
                已接收 {streamingChunks.length} 個回應片段
              </CardDescription>
            </div>
          )}
        </CardHeader>
        
        {streamingChunks.length > 0 && (
          <CardContent>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {streamingChunks.map((chunk, index) => {
                  const content = 'content' in chunk ? chunk.content : '';
                  return (
                    <div key={index} className="text-sm text-muted-foreground">
                      {content}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    );
  }

  // No response state
  if (!response) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          尚未收到 AI 回應。請確保您的問題已正確提交。
        </AlertDescription>
      </Alert>
    );
  }

  const normalized = normalizeResponse(response, provider);

  // Error state
  if (!normalized.success) {
    return (
      <Card className={cn("w-full border-destructive", className)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg text-destructive">
              回應生成失敗
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {normalized.answer || '生成回應時發生未知錯誤。'}
            </AlertDescription>
          </Alert>
          {enableActions && onRegenerate && (
            <div className="mt-4">
              <Button onClick={onRegenerate} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                重新生成
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", providerInfo.borderColor, className)}>
      <CardHeader className={cn(providerInfo.bgColor)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <ProviderIcon className={cn("h-5 w-5", providerInfo.color)} />
            <div>
              <CardTitle className="text-lg">
                {title || `${providerInfo.name} 回答`}
              </CardTitle>
              <CardDescription className="mt-1">
                處理時間：{normalized.processingTime.toFixed(2)}秒 | 模型：{normalized.modelUsed}
              </CardDescription>
            </div>
          </div>
          
          {enableActions && (
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? '已複製' : '複製回答'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {onShare && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => onShare(response)}>
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
                      <Button variant="ghost" size="sm" onClick={() => onBookmark(response)}>
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
                      <Button variant="ghost" size="sm" onClick={onRegenerate}>
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
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Answer */}
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-xl font-bold mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-semibold mb-3">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-medium mb-2">{children}</h3>,
              p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="mb-3 pl-6 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="mb-3 pl-6 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              code: ({ children }) => (
                <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">{children}</code>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary/20 pl-4 my-4 italic">{children}</blockquote>
              ),
            }}
          >
            {normalized.answer}
          </ReactMarkdown>
        </div>

        {/* Search Queries */}
        {showSearchQueries && normalized.searchQueries && normalized.searchQueries.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">搜尋查詢</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {normalized.searchQueries.map((query, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {query}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Citations */}
        {showCitations && normalized.citations && normalized.citations.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <CitationDisplay
              citations={normalized.citations}
              title="參考來源"
              defaultExpanded={false}
              variant="default"
              showNumbers={true}
              onCitationClick={onCitationClick}
            />
          </div>
        )}

        {/* Metadata */}
        {showMetadata && (
          <div className="space-y-3">
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">接地狀態</div>
                <div className="flex items-center gap-1">
                  {normalized.metadata.groundingSuccessful ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-orange-600" />
                  )}
                  <span className="text-xs">
                    {normalized.metadata.groundingSuccessful ? '成功' : '部分'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-muted-foreground">信心分數</div>
                <div className="text-xs">
                  {((normalized.metadata.confidenceScore || 0) * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-muted-foreground">引用數量</div>
                <div className="text-xs">{normalized.metadata.citationCount || 0}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-muted-foreground">回應時間</div>
                <div className="text-xs">{normalized.timestamp}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedAnswer;
