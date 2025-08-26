/**
 * @fileOverview TypeScript interfaces for Grounded QA functionality
 * 
 * This file defines the data structures used for Google Gemini Grounded QA
 * integration, mirroring the Python implementation while maintaining 
 * TypeScript type safety and consistency with the existing codebase.
 * 
 * Based on the successful GeminiRAG_ground implementation, these interfaces
 * ensure seamless integration of grounding capabilities into the GenKit-based
 * architecture of the Red Chamber learning platform.
 */

/**
 * Citation information for a specific text segment
 * 引用資訊，對應特定文本片段的來源資料
 * 
 * This interface mirrors the CitationInfo dataclass from the Python implementation,
 * providing structured storage for source attribution and verification.
 */
export interface CitationInfo {
  /** The specific text segment that is being cited */
  textSegment: string;
  
  /** Starting character position of the cited text in the response */
  startIndex: number;
  
  /** Ending character position of the cited text in the response */
  endIndex: number;
  
  /** Array of source URLs supporting this citation */
  sourceUrls: string[];
  
  /** Array of source titles corresponding to the URLs */
  sourceTitles: string[];
}

/**
 * Comprehensive response structure for grounded QA interactions
 * 接地問答互動的完整回應結構
 * 
 * This interface provides the complete structure for AI responses that include
 * both the generated content and the grounding information for verification.
 */
export interface GroundedQAResponse {
  /** The raw AI-generated answer without citations */
  answer: string;
  
  /** The answer with inline citations formatted for display */
  answerWithCitations: string;
  
  /** Array of citation information for source verification */
  citations: CitationInfo[];
  
  /** The search queries used by Google Search Grounding */
  searchQueries: string[];
  
  /** Optional confidence score for the response quality (0-1) */
  confidenceScore?: number;
  
  /** Response generation time in seconds */
  responseTime?: number;
  
  /** Additional metadata about the grounding process */
  groundingMetadata?: GroundingMetadata;
}

/**
 * Metadata about the grounding process
 * 接地過程的元數據資訊
 */
export interface GroundingMetadata {
  /** Number of search results used for grounding */
  totalSearchResults: number;
  
  /** Number of citations successfully generated */
  citationCount: number;
  
  /** Whether the grounding process completed successfully */
  groundingSuccess: boolean;
  
  /** Any warnings or notes about the grounding process */
  warnings?: string[];
}

/**
 * Input schema for grounded Red Chamber QA
 * 紅樓夢接地問答的輸入結構
 * 
 * This interface defines the required information for processing
 * a user question with grounding capabilities.
 */
export interface GroundedQAInput {
  /** The user's question about Dream of the Red Chamber */
  userQuestion: string;
  
  /** Optional selected text from the reading material */
  selectedText?: string;
  
  /** Current chapter context for better understanding */
  chapterContext?: string;
  
  /** Current chapter number or identifier */
  currentChapter?: string;
  
  /** Whether to enable streaming response */
  enableStreaming?: boolean;
  
  /** Whether to include detailed citations */
  includeDetailedCitations?: boolean;
}

/**
 * Streaming chunk for real-time response delivery
 * 實時回應傳遞的流式數據塊
 */
export interface StreamingChunk {
  /** The text content of this chunk */
  content: string;
  
  /** The full accumulated content so far */
  fullContent?: string;
  
  /** Whether this is the final chunk */
  isComplete: boolean;
  
  /** Chunk sequence number for ordering */
  sequenceNumber: number;
  
  /** Timestamp of this chunk */
  timestamp?: string;
  
  /** Complete citations (available in final chunk) */
  citations?: CitationInfo[];
  
  /** Search queries used (available in final chunk) */
  searchQueries?: string[];
  
  /** Grounding metadata (available in final chunk) */
  metadata?: GroundingMetadata;
  
  /** Response generation time (available in final chunk) */
  responseTime?: number;
  
  /** Error message if generation failed */
  error?: string;
}

/**
 * Batch processing input for multiple questions
 * 多問題批量處理的輸入結構
 */
export interface BatchQAInput {
  /** Array of questions to process */
  questions: GroundedQAInput[];
  
  /** Whether to process questions in parallel */
  enableParallelProcessing?: boolean;
  
  /** Maximum number of concurrent requests */
  maxConcurrency?: number;
}

/**
 * Batch processing response
 * 批量處理的回應結構
 */
export interface BatchQAResponse {
  /** Array of responses corresponding to input questions */
  responses: GroundedQAResponse[];
  
  /** Overall processing statistics */
  processingStats: {
    totalQuestions: number;
    successfulResponses: number;
    failedResponses: number;
    totalProcessingTime: number;
    averageResponseTime: number;
  };
  
  /** Any errors encountered during batch processing */
  errors?: Array<{
    questionIndex: number;
    error: string;
    question: string;
  }>;
}

/**
 * Configuration options for the grounded QA system
 * 接地問答系統的配置選項
 */
export interface GroundedQAConfig {
  /** The Gemini model to use for generation */
  model?: string;
  
  /** Temperature setting for response generation (0-1) */
  temperature?: number;
  
  /** Maximum number of output tokens */
  maxOutputTokens?: number;
  
  /** Whether to enable Google Search grounding */
  enableGrounding?: boolean;
  
  /** Maximum number of search results to consider */
  maxSearchResults?: number;
  
  /** Timeout for AI response generation (in seconds) */
  responseTimeout?: number;
  
  /** Whether to log detailed debugging information */
  enableDebugLogging?: boolean;
}

/**
 * Error types specific to grounded QA operations
 * 接地問答操作的特定錯誤類型
 */
export interface GroundedQAError {
  /** Error type classification */
  type: 'GROUNDING_FAILED' | 'AI_GENERATION_ERROR' | 'CITATION_PARSING_ERROR' | 'TIMEOUT_ERROR' | 'VALIDATION_ERROR';
  
  /** Human-readable error message */
  message: string;
  
  /** Original error details (if available) */
  originalError?: any;
  
  /** Context about when the error occurred */
  context?: {
    userQuestion?: string;
    selectedText?: string;
    timestamp: Date;
  };
}

/**
 * Type guards for runtime type checking
 * 運行時類型檢查的類型守衛
 */
export const isGroundedQAResponse = (obj: any): obj is GroundedQAResponse => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.answer === 'string' &&
    typeof obj.answerWithCitations === 'string' &&
    Array.isArray(obj.citations) &&
    Array.isArray(obj.searchQueries)
  );
};

export const isCitationInfo = (obj: any): obj is CitationInfo => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.textSegment === 'string' &&
    typeof obj.startIndex === 'number' &&
    typeof obj.endIndex === 'number' &&
    Array.isArray(obj.sourceUrls) &&
    Array.isArray(obj.sourceTitles)
  );
};

/**
 * Default configuration values
 * 默認配置值
 */
export const DEFAULT_GROUNDED_QA_CONFIG: GroundedQAConfig = {
  model: 'googleai/gemini-2.0-flash',
  temperature: 0.7,
  maxOutputTokens: 2048,
  enableGrounding: true,
  maxSearchResults: 10,
  responseTimeout: 30,
  enableDebugLogging: false,
};

/**
 * Utility types for common operations
 * 常用操作的實用類型
 */
export type QuestionType = 'character_analysis' | 'plot_summary' | 'literary_analysis' | 'historical_context' | 'general_inquiry';

export type ResponseQuality = 'excellent' | 'good' | 'adequate' | 'poor';

/**
 * Extended response with additional analysis
 * 包含額外分析的擴展回應
 */
export interface EnhancedGroundedQAResponse extends GroundedQAResponse {
  /** Detected question type for analytics */
  questionType?: QuestionType;
  
  /** Assessed response quality */
  responseQuality?: ResponseQuality;
  
  /** Suggested follow-up questions */
  followUpQuestions?: string[];
  
  /** Related characters mentioned in the response */
  relatedCharacters?: string[];
  
  /** Related chapters or sections */
  relatedChapters?: string[];
}
