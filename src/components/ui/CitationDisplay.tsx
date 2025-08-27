/**
 * @fileOverview Citation Display Component for Grounded QA Responses
 * 
 * This component provides a clean, accessible display for citation information
 * from Google Search Grounding. It formats source URLs, titles, and text segments
 * in a user-friendly manner while maintaining academic citation standards.
 * 
 * Features:
 * - Responsive design that works on all screen sizes
 * - Accessible keyboard navigation and screen reader support
 * - Integration with the existing design system
 * - Traditional Chinese text optimization
 * - External link safety and proper handling
 * - Hover effects and visual feedback
 */

import React, { useState } from 'react';
import { ExternalLink, Copy, Check, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Collapsible components - using custom implementation instead of external package
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CitationInfo } from '@/types/grounded-qa';
import type { PerplexityCitation } from '@/types/perplexity-qa';

/**
 * Props for the CitationDisplay component
 */
interface CitationDisplayProps {
  /** Array of citation information to display */
  citations: CitationInfo[] | PerplexityCitation[];
  
  /** Optional title for the citation section */
  title?: string;
  
  /** Whether to show the citations in an expanded state initially */
  defaultExpanded?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Whether to show numbered citations */
  showNumbers?: boolean;
  
  /** Maximum number of citations to show initially */
  maxInitialCitations?: number;
  
  /** Custom styling variant */
  variant?: 'default' | 'compact' | 'detailed';
  
  /** Callback when a citation link is clicked */
  onCitationClick?: (citation: CitationInfo, index: number) => void;
}

/**
 * Props for individual citation item component
 */
interface CitationItemProps {
  citation: CitationInfo;
  index: number;
  showNumber: boolean;
  variant: 'default' | 'compact' | 'detailed';
  onCitationClick?: (citation: CitationInfo, index: number) => void;
}

/**
 * Individual citation item component
 * 單個引用項目組件
 */
const CitationItem: React.FC<CitationItemProps> = ({
  citation,
  index,
  showNumber,
  variant,
  onCitationClick,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Type guard to check if citation is PerplexityCitation
  const isPerplexityCitation = (citation: CitationInfo | PerplexityCitation): citation is PerplexityCitation => {
    return 'domain' in citation && 'type' in citation;
  };

  // Normalize citation data to a common format
  const normalizeCitation = (citation: CitationInfo | PerplexityCitation) => {
    if (isPerplexityCitation(citation)) {
      // Perplexity format
      return {
        textSegment: citation.snippet || citation.title,
        sourceUrls: [citation.url],
        sourceTitles: [citation.title],
        number: citation.number,
        domain: citation.domain,
        type: citation.type,
        publishDate: citation.publishDate,
      };
    } else {
      // Gemini format (legacy)
      return {
        textSegment: citation.textSegment,
        sourceUrls: citation.sourceUrls,
        sourceTitles: citation.sourceTitles,
        number: citation.textSegment.slice(0, 10), // fallback
        domain: citation.sourceUrls[0] ? new URL(citation.sourceUrls[0]).hostname.replace('www.', '') : '',
        type: 'web_citation' as const,
      };
    }
  };

  // Get normalized citation data
  const normalizedCitation = normalizeCitation(citation);

  /**
   * Handle copying citation text to clipboard
   * 處理將引用文本複製到剪貼板
   */
  const handleCopy = async (text: string, itemIndex: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(itemIndex);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy citation:', error);
    }
  };

  /**
   * Handle citation link click with analytics
   * 處理引用鏈接點擊並進行分析
   */
  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    onCitationClick?.(citation, index);
    // Open in new tab for safety
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  /**
   * Format URL for display (remove protocol and truncate if needed)
   * 格式化 URL 以供顯示（移除協議並在需要時截斷）
   */
  const formatUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const path = urlObj.pathname.length > 30 
        ? urlObj.pathname.substring(0, 30) + '...' 
        : urlObj.pathname;
      return domain + path;
    } catch {
      return url.length > 50 ? url.substring(0, 50) + '...' : url;
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
        {showNumber && (
          <Badge variant="outline" className="text-xs font-mono">
            {index + 1}
          </Badge>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1">
            {normalizedCitation.sourceUrls.map((url, urlIndex) => (
              <TooltipProvider key={urlIndex}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                      onClick={(e) => handleLinkClick(e, url)}
                    >
                      {normalizedCitation.sourceTitles[urlIndex] || formatUrl(url)}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs break-all">{url}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      "transition-all duration-200",
      variant === 'detailed' && "border-l-4 border-l-primary/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {showNumber && (
              <Badge variant="secondary" className="font-mono">
                引用 {index + 1}
              </Badge>
            )}
            <CardTitle className="text-sm font-medium">
              {normalizedCitation.textSegment.length > 60 
                ? `${normalizedCitation.textSegment.substring(0, 60)}...`
                : normalizedCitation.textSegment
              }
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(normalizedCitation.textSegment, index)}
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copiedIndex === index ? '已複製' : '複製引用文本'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {variant === 'detailed' && normalizedCitation.textSegment.length > 60 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
        
        {variant === 'detailed' && isExpanded && (
          <CardDescription className="mt-2 p-3 rounded-md bg-muted/30 border text-sm leading-relaxed">
            {normalizedCitation.textSegment}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {normalizedCitation.sourceUrls.map((url, urlIndex) => {
            const title = normalizedCitation.sourceTitles[urlIndex] || '未命名來源';
            
            return (
              <div 
                key={urlIndex}
                className="flex items-center justify-between p-3 rounded-md border bg-background/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate mb-1">
                    {title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {formatUrl(url)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(url, urlIndex)}
                        >
                          {copiedIndex === urlIndex ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copiedIndex === urlIndex ? '已複製' : '複製鏈接'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleLinkClick(e, url)}
                    className="text-xs"
                  >
                    開啟
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Main citation display component
 * 主要引用顯示組件
 */
export const CitationDisplay: React.FC<CitationDisplayProps> = ({
  citations,
  title = '引用資料',
  defaultExpanded = false,
  className,
  showNumbers = true,
  maxInitialCitations = 5,
  variant = 'default',
  onCitationClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  if (!citations || citations.length === 0) {
    return (
      <Card className={cn("bg-muted/20", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="h-4 w-4" />
            <span className="text-sm">此回答暫無引用資料</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedCitations = showAll 
    ? citations 
    : citations.slice(0, maxInitialCitations);
  
  const hasMoreCitations = citations.length > maxInitialCitations;

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 p-0 h-auto"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h3 className="text-lg font-semibold">{title}</h3>
            <Badge variant="secondary" className="text-xs">
              {citations.length}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {citations.length > 1 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allText = citations
                        .map((c, i) => `${i + 1}. ${c.textSegment}\n來源: ${c.sourceUrls.join(', ')}`)
                        .join('\n\n');
                      navigator.clipboard.writeText(allText);
                    }}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    複製全部
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>複製所有引用資料</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-3 mt-3">
            <div className="space-y-3">
              {displayedCitations.map((citation, index) => (
                <CitationItem
                  key={index}
                  citation={citation}
                  index={index}
                  showNumber={showNumbers}
                  variant={variant}
                  onCitationClick={onCitationClick}
                />
              ))}
            </div>

            {hasMoreCitations && !showAll && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(true)}
                  className="text-sm"
                >
                  顯示更多引用 ({citations.length - maxInitialCitations} 個)
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}

            {hasMoreCitations && showAll && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(false)}
                  className="text-sm"
                >
                  收起部分引用
                  <ChevronUp className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitationDisplay;
