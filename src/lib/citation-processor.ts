/**
 * @fileOverview Citation Processing Utility
 *
 * Utilities for processing and integrating citations into text content:
 * - Parse markdown to extract citation markers
 * - Inject inline citations into content
 * - Generate reference sections
 * - Link citations to specific text segments
 * - Format citations for display
 *
 * Follows the UX design pattern specified in improvement report
 */

import type { PerplexityCitation } from '@/types/perplexity-qa';

/**
 * Citation integration result
 */
export interface CitationIntegrationResult {
  /** Processed content with citation markers */
  processedContent: string;

  /** Map of citation numbers to citation objects */
  citationMap: Map<number, PerplexityCitation>;

  /** Array of unique citation numbers used in order */
  citationNumbers: number[];

  /** Statistics about citation usage */
  stats: {
    totalCitations: number;
    uniqueCitations: number;
    citationsPerParagraph: number;
  };
}

/**
 * Citation position in text
 */
export interface CitationPosition {
  /** Citation number */
  number: number;

  /** Start index in text */
  startIndex: number;

  /** End index in text */
  endIndex: number;

  /** Text segment associated with citation */
  textSegment: string;
}

/**
 * Integrate inline citations into content
 *
 * Converts markdown content with citation references to formatted content
 * with properly integrated inline citation markers
 */
export function integrateInlineCitations(
  content: string,
  citations: PerplexityCitation[]
): CitationIntegrationResult {
  if (!content || !citations || citations.length === 0) {
    return {
      processedContent: content || '',
      citationMap: new Map(),
      citationNumbers: [],
      stats: {
        totalCitations: 0,
        uniqueCitations: 0,
        citationsPerParagraph: 0,
      },
    };
  }

  // Create citation map
  const citationMap = new Map<number, PerplexityCitation>();
  citations.forEach((citation) => {
    const citationNum = parseInt(citation.number, 10);
    if (!isNaN(citationNum)) {
      citationMap.set(citationNum, citation);
    }
  });

  // Find all citation markers in content [1], [2], etc.
  const citationRegex = /\[(\d+)\]/g;
  const matches = Array.from(content.matchAll(citationRegex));

  // Extract unique citation numbers used
  const citationNumbers = [...new Set(
    matches.map(match => parseInt(match[1], 10))
  )].sort((a, b) => a - b);

  // Calculate statistics
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  const stats = {
    totalCitations: matches.length,
    uniqueCitations: citationNumbers.length,
    citationsPerParagraph: paragraphs.length > 0
      ? Math.round((matches.length / paragraphs.length) * 10) / 10
      : 0,
  };

  return {
    processedContent: content,
    citationMap,
    citationNumbers,
    stats,
  };
}

/**
 * Extract citation positions from content
 *
 * Returns array of citation positions with context
 */
export function extractCitationPositions(
  content: string,
  contextLength: number = 50
): CitationPosition[] {
  const citationRegex = /\[(\d+)\]/g;
  const positions: CitationPosition[] = [];

  let match;
  while ((match = citationRegex.exec(content)) !== null) {
    const citationNum = parseInt(match[1], 10);
    const startIndex = match.index;
    const endIndex = match.index + match[0].length;

    // Extract text segment around citation
    const segmentStart = Math.max(0, startIndex - contextLength);
    const segmentEnd = Math.min(content.length, endIndex + contextLength);
    const textSegment = content.substring(segmentStart, segmentEnd).trim();

    positions.push({
      number: citationNum,
      startIndex,
      endIndex,
      textSegment,
    });
  }

  return positions;
}

/**
 * Generate reference section markdown
 *
 * Creates a formatted references section from citations
 */
export function generateReferencesSection(
  citations: PerplexityCitation[],
  options: {
    title?: string;
    numbered?: boolean;
    includeSnippets?: boolean;
    includeMetadata?: boolean;
  } = {}
): string {
  const {
    title = '## 參考來源',
    numbered = true,
    includeSnippets = true,
    includeMetadata = true,
  } = options;

  if (!citations || citations.length === 0) {
    return '';
  }

  const lines: string[] = [title, ''];

  citations.forEach((citation, index) => {
    const citationNum = numbered ? `[${citation.number || (index + 1)}]` : '';

    // Title and URL
    lines.push(`${citationNum} **[${citation.title}](${citation.url})**`);

    // Snippet
    if (includeSnippets && citation.snippet) {
      lines.push(`   > ${citation.snippet}`);
    }

    // Metadata
    if (includeMetadata) {
      const metadata: string[] = [];
      if (citation.domain) metadata.push(citation.domain);
      if (citation.publishDate) metadata.push(citation.publishDate);
      if (metadata.length > 0) {
        lines.push(`   *${metadata.join(' · ')}*`);
      }
    }

    lines.push(''); // Empty line between citations
  });

  return lines.join('\n');
}

/**
 * Validate citation numbers in content
 *
 * Checks if all citation numbers in content have corresponding citations
 */
export function validateCitationReferences(
  content: string,
  citations: PerplexityCitation[]
): {
  valid: boolean;
  missingCitations: number[];
  unusedCitations: number[];
} {
  const citationRegex = /\[(\d+)\]/g;
  const referencedNumbers = new Set<number>();

  let match;
  while ((match = citationRegex.exec(content)) !== null) {
    referencedNumbers.add(parseInt(match[1], 10));
  }

  const availableNumbers = new Set(
    citations.map(c => parseInt(c.number, 10)).filter(n => !isNaN(n))
  );

  const missingCitations = Array.from(referencedNumbers).filter(
    num => !availableNumbers.has(num)
  );

  const unusedCitations = Array.from(availableNumbers).filter(
    num => !referencedNumbers.has(num)
  );

  return {
    valid: missingCitations.length === 0,
    missingCitations,
    unusedCitations,
  };
}

/**
 * Format citation for inline display
 *
 * Creates a formatted citation tag for inline use
 */
export function formatInlineCitation(
  citationNumber: number,
  citation?: PerplexityCitation
): string {
  if (!citation) {
    return `[${citationNumber}]`;
  }

  return `[${citationNumber}](${citation.url} "${citation.title}")`;
}

/**
 * Group citations by type
 *
 * Organizes citations into categories (academic, news, web, etc.)
 */
export function groupCitationsByType(
  citations: PerplexityCitation[]
): Record<string, PerplexityCitation[]> {
  const groups: Record<string, PerplexityCitation[]> = {
    academic: [],
    news: [],
    web: [],
    default: [],
  };

  citations.forEach(citation => {
    const type = citation.type || 'default';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(citation);
  });

  return groups;
}

/**
 * Create citation summary text
 *
 * Generates human-readable summary of citation sources
 */
export function createCitationSummary(citations: PerplexityCitation[]): string {
  if (!citations || citations.length === 0) {
    return '無引用來源';
  }

  const grouped = groupCitationsByType(citations);
  const parts: string[] = [];

  if (grouped.academic.length > 0) {
    parts.push(`${grouped.academic.length} 個學術來源`);
  }
  if (grouped.news.length > 0) {
    parts.push(`${grouped.news.length} 個新聞來源`);
  }
  if (grouped.web.length > 0 || grouped.default.length > 0) {
    const webCount = grouped.web.length + grouped.default.length;
    parts.push(`${webCount} 個網頁來源`);
  }

  if (parts.length === 0) {
    return `共 ${citations.length} 個引用來源`;
  }

  return parts.join('、');
}

/**
 * Remove duplicate citations
 *
 * Filters out citations with duplicate URLs
 */
export function deduplicateCitations(
  citations: PerplexityCitation[]
): PerplexityCitation[] {
  const seen = new Set<string>();
  const unique: PerplexityCitation[] = [];

  citations.forEach(citation => {
    const key = citation.url.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(citation);
    }
  });

  return unique;
}

/**
 * Sort citations by relevance or order
 *
 * Sorts citations based on specified criteria
 */
export function sortCitations(
  citations: PerplexityCitation[],
  sortBy: 'number' | 'type' | 'date' = 'number'
): PerplexityCitation[] {
  const sorted = [...citations];

  switch (sortBy) {
    case 'number':
      return sorted.sort((a, b) => {
        const numA = parseInt(a.number, 10) || 0;
        const numB = parseInt(b.number, 10) || 0;
        return numA - numB;
      });

    case 'type':
      return sorted.sort((a, b) => {
        const typeOrder: Record<string, number> = {
          academic: 1,
          news: 2,
          web: 3,
          default: 4,
        };
        const orderA = typeOrder[a.type || 'default'] || 4;
        const orderB = typeOrder[b.type || 'default'] || 4;
        return orderA - orderB;
      });

    case 'date':
      return sorted.sort((a, b) => {
        if (!a.publishDate || !b.publishDate) return 0;
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      });

    default:
      return sorted;
  }
}
