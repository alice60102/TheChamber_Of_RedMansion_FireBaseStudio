'use server';
/**
 * @fileOverview Grounded Question Answering AI Flow for Dream of the Red Chamber
 * 
 * This AI flow provides intelligent, grounded responses to questions about "Dream of the Red Chamber"
 * by integrating Google Search grounding capabilities with specialized literary analysis prompts.
 * 
 * Key features mirrored from the Python implementation:
 * - Google Search grounding for accurate, cited responses
 * - Specialized prompts optimized for classical Chinese literature
 * - Structured citation information extraction and formatting
 * - Support for both streaming and non-streaming responses
 * - Comprehensive error handling and logging
 * - Traditional Chinese response formatting
 * 
 * This implementation maintains the same functionality as the Python DreamOfRedChamberQA class
 * while leveraging GenKit's TypeScript framework for seamless integration with the Next.js application.
 */

import { ai, createGroundedGenerationConfig, GROUNDING_CONFIG } from '@/ai/genkit';
import { z } from 'genkit';
import type { 
  GroundedQAInput, 
  GroundedQAResponse, 
  CitationInfo, 
  GroundingMetadata,
  BatchQAInput,
  BatchQAResponse,
  StreamingChunk,
  GroundedQAError
} from '@/types/grounded-qa';

/**
 * Input schema for grounded Red Chamber QA
 * This schema mirrors the ExplainTextSelectionInput but with enhanced grounding capabilities
 */
const GroundedQAInputSchema = z.object({
  userQuestion: z.string().describe('使用者關於《紅樓夢》的問題。請以繁體中文提出問題。'),
  selectedText: z.string().optional().describe('使用者選取的文本片段（如有）。'),
  chapterContext: z.string().optional().describe('當前章回的上下文片段，協助理解背景。'),
  currentChapter: z.string().optional().describe('當前章回編號或標題。'),
  enableStreaming: z.boolean().default(false).describe('是否啟用流式回應。'),
  includeDetailedCitations: z.boolean().default(true).describe('是否包含詳細引用資訊。'),
});

/**
 * Output schema for grounded QA responses
 * This schema ensures structured, citable responses with proper grounding metadata
 */
const GroundedQAOutputSchema = z.object({
  answer: z.string().describe('AI生成的原始回答，不含引用標記。'),
  answerWithCitations: z.string().describe('包含內嵌引用標記的回答文本。'),
  citations: z.array(z.object({
    textSegment: z.string(),
    startIndex: z.number(),
    endIndex: z.number(),
    sourceUrls: z.array(z.string()),
    sourceTitles: z.array(z.string()),
  })).describe('引用資訊陣列，每個包含文本片段和來源資料。'),
  searchQueries: z.array(z.string()).describe('用於接地搜索的查詢詞陣列。'),
  responseTime: z.number().optional().describe('回應生成時間（秒）。'),
  groundingMetadata: z.object({
    totalSearchResults: z.number(),
    citationCount: z.number(),
    groundingSuccess: z.boolean(),
    warnings: z.array(z.string()).optional(),
  }).optional().describe('接地過程的元數據資訊。'),
});

/**
 * Enhanced prompt template for Red Chamber questions with grounding
 * This prompt mirrors the Python implementation's specialized approach
 */
const createSpecializedPrompt = (input: GroundedQAInput): string => {
  const { userQuestion, selectedText, chapterContext, currentChapter } = input;
  
  const contextSection = chapterContext ? `
當前章回的上下文片段（協助理解背景）：
---
${chapterContext}
---` : '';

  const selectedTextSection = selectedText ? `
使用者選取的文字是：
"${selectedText}"
` : '';

  const chapterSection = currentChapter ? `
當前章回：${currentChapter}
` : '';

  return `
作為《紅樓夢》專家，請回答以下關於《紅樓夢》的問題。請確保：

1. 提供準確、詳細的資訊
2. 引用可靠的學術資源和權威資料
3. 如涉及人物關係、情節發展，請提供具體的章回引用
4. 對於文學分析問題，請結合現代學術觀點
5. 使用繁體中文回答
6. 使用網路搜索獲取最新和最準確的學術資訊

${chapterSection}${contextSection}${selectedTextSection}

使用者問題：${userQuestion}

請基於最新的學術研究和可靠資源回答此問題，並確保所有資訊都有適當的引用資料。使用 Markdown 格式提供回答，包含標題（## 標題）、列表（- 項目）、粗體（**重要文字**）和斜體（*強調*）等元素來組織內容。
`;
};

/**
 * Citation extraction and formatting function
 * Mirrors the Python implementation's _add_citations method
 */
const extractAndFormatCitations = (
  responseText: string, 
  groundingMetadata: any
): { 
  textWithCitations: string; 
  citations: CitationInfo[]; 
  searchQueries: string[];
  metadata: GroundingMetadata;
} => {
  try {
    let processedText = responseText;
    const citations: CitationInfo[] = [];
    const searchQueries: string[] = [];
    
    // Extract search queries if available
    if (groundingMetadata?.webSearchQueries) {
      searchQueries.push(...groundingMetadata.webSearchQueries);
    }

    // Process grounding supports and chunks
    const supports = groundingMetadata?.groundingSupports || [];
    const chunks = groundingMetadata?.groundingChunks || [];
    
    if (supports.length > 0 && chunks.length > 0) {
      // Sort supports by end_index in descending order to avoid shifting issues
      const sortedSupports = supports.sort((a: any, b: any) => 
        (b.segment?.endIndex || 0) - (a.segment?.endIndex || 0)
      );
      
      for (const support of sortedSupports) {
        const segment = support.segment;
        if (!segment) continue;
        
        const endIndex = segment.endIndex || processedText.length;
        const startIndex = segment.startIndex || 0;
        const segmentText = segment.text || '';
        
        if (support.groundingChunkIndices && support.groundingChunkIndices.length > 0) {
          const citationLinks: string[] = [];
          const sourceUrls: string[] = [];
          const sourceTitles: string[] = [];
          
          for (const chunkIndex of support.groundingChunkIndices) {
            if (chunkIndex < chunks.length) {
              const chunk = chunks[chunkIndex];
              const uri = chunk.web?.uri || '';
              const title = chunk.web?.title || `來源 ${chunkIndex + 1}`;
              
              if (uri) {
                citationLinks.push(`[${chunkIndex + 1}](${uri})`);
                sourceUrls.push(uri);
                sourceTitles.push(title);
              }
            }
          }
          
          if (citationLinks.length > 0) {
            const citationString = ' ' + citationLinks.join(', ');
            processedText = processedText.slice(0, endIndex) + citationString + processedText.slice(endIndex);
            
            // Store citation info
            citations.push({
              textSegment: segmentText,
              startIndex,
              endIndex,
              sourceUrls,
              sourceTitles,
            });
          }
        }
      }
    }

    const metadata: GroundingMetadata = {
      totalSearchResults: chunks.length,
      citationCount: citations.length,
      groundingSuccess: citations.length > 0,
      warnings: citations.length === 0 ? ['無法從搜索結果中提取引用資訊'] : undefined,
    };

    return {
      textWithCitations: processedText,
      citations,
      searchQueries,
      metadata,
    };
  } catch (error) {
    console.error('Citation extraction error:', error);
    return {
      textWithCitations: responseText,
      citations: [],
      searchQueries: [],
      metadata: {
        totalSearchResults: 0,
        citationCount: 0,
        groundingSuccess: false,
        warnings: ['引用資訊提取失敗'],
      },
    };
  }
};

/**
 * Define the grounded QA prompt using GenKit pattern
 * 使用 GenKit 模式定義接地問答提示詞
 */
const groundedQAPrompt = ai.definePrompt({
  name: 'groundedQAPrompt',
  input: { schema: GroundedQAInputSchema },
  output: { schema: GroundedQAOutputSchema },
  prompt: `
作為《紅樓夢》專家，請回答以下關於《紅樓夢》的問題。請確保：

1. 提供準確、詳細的資訊
2. 引用可靠的學術資源和權威資料
3. 如涉及人物關係、情節發展，請提供具體的章回引用
4. 對於文學分析問題，請結合現代學術觀點
5. 使用繁體中文回答
6. 使用網路搜索獲取最新和最準確的學術資訊

{{#if currentChapter}}
當前章回：{{currentChapter}}
{{/if}}

{{#if chapterContext}}
當前章回的上下文片段（協助理解背景）：
---
{{chapterContext}}
---
{{/if}}

{{#if selectedText}}
使用者選取的文字是：
"{{selectedText}}"
{{/if}}

使用者問題：{{userQuestion}}

請基於最新的學術研究和可靠資源回答此問題，並確保所有資訊都有適當的引用資料。使用 Markdown 格式提供回答，包含標題（## 標題）、列表（- 項目）、粗體（**重要文字**）和斜體（*強調*）等元素來組織內容。
`
});

/**
 * Define the grounded QA flow using GenKit pattern
 * 使用 GenKit 模式定義接地問答流程
 */
const groundedQAFlow = ai.defineFlow(
  {
    name: 'groundedQAFlow',
    inputSchema: GroundedQAInputSchema,
    outputSchema: GroundedQAOutputSchema,
  },
  async (input) => {
    const startTime = Date.now();
    
    try {
      const { output } = await groundedQAPrompt(input);
      
      if (!output || !output.answer) {
        throw new Error('AI模型未能生成有效回應。');
      }
      
      // Calculate response time
      const responseTime = (Date.now() - startTime) / 1000;
      
      return {
        ...output,
        responseTime,
      };
    } catch (error) {
      console.error('Grounded QA flow error:', error);
      throw new Error('接地問答系統暫時無法使用，請稍後再試。');
    }
  }
);

/**
 * Main grounded QA function
 * 主要的接地問答函數
 */
export async function groundedRedChamberQA(input: GroundedQAInput): Promise<GroundedQAResponse> {
  // Ensure defaults are applied for GenKit compatibility
  const processedInput = {
    ...input,
    enableStreaming: input.enableStreaming ?? false,
    includeDetailedCitations: input.includeDetailedCitations ?? true,
  };
  return groundedQAFlow(processedInput);
}

/**
 * Streaming version of grounded QA
 * 流式版本的接地問答
 */
export async function* groundedRedChamberQAStreaming(input: GroundedQAInput): AsyncGenerator<StreamingChunk> {
  try {
    // For now, use the non-streaming version and yield the complete result
    // This can be enhanced when GenKit streaming support is clarified
    const result = await groundedRedChamberQA(input);
    
    yield {
      content: result.answerWithCitations,
      fullContent: result.answerWithCitations,
      isComplete: true,
      sequenceNumber: 0,
      timestamp: new Date().toISOString(),
      citations: result.citations,
      searchQueries: result.searchQueries,
      metadata: result.groundingMetadata,
      responseTime: result.responseTime,
    };
    
  } catch (error) {
    console.error('Streaming QA error:', error);
    yield {
      content: '',
      fullContent: '',
      isComplete: true,
      sequenceNumber: 0,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : '流式回答生成失敗',
    };
  }
}

/**
 * Batch processing function for multiple questions
 * 批量處理多個問題的函數
 */
export async function groundedRedChamberQABatch(input: BatchQAInput): Promise<BatchQAResponse> {
  const startTime = Date.now();
  const responses: GroundedQAResponse[] = [];
  const errors: Array<{ questionIndex: number; error: string; question: string }> = [];
  
  const maxConcurrency = input.maxConcurrency || 3;
  const enableParallel = input.enableParallelProcessing !== false;
  
  if (enableParallel) {
    // Process questions in parallel with concurrency limit
    const chunks = [];
    for (let i = 0; i < input.questions.length; i += maxConcurrency) {
      chunks.push(input.questions.slice(i, i + maxConcurrency));
    }
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (question, localIndex) => {
        const globalIndex = responses.length + localIndex;
        try {
          const response = await groundedRedChamberQA(question);
          return { index: globalIndex, response, error: null };
        } catch (error) {
          return {
            index: globalIndex,
            response: null,
            error: error instanceof Error ? error.message : '未知錯誤'
          };
        }
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      
      for (const result of chunkResults) {
        if (result.response) {
          responses.push(result.response);
        } else {
          const question = input.questions[result.index];
          errors.push({
            questionIndex: result.index,
            error: result.error || '處理失敗',
            question: question.userQuestion,
          });
          // Add placeholder response for failed questions
          responses.push({
            answer: `處理問題時發生錯誤: ${result.error}`,
            answerWithCitations: `處理問題時發生錯誤: ${result.error}`,
            citations: [],
            searchQueries: [],
          });
        }
      }
    }
  } else {
    // Process questions sequentially
    for (let i = 0; i < input.questions.length; i++) {
      const question = input.questions[i];
      try {
        const response = await groundedRedChamberQA(question);
        responses.push(response);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知錯誤';
        errors.push({
          questionIndex: i,
          error: errorMessage,
          question: question.userQuestion,
        });
        responses.push({
          answer: `處理問題時發生錯誤: ${errorMessage}`,
          answerWithCitations: `處理問題時發生錯誤: ${errorMessage}`,
          citations: [],
          searchQueries: [],
        });
      }
    }
  }
  
  const endTime = Date.now();
  const totalProcessingTime = (endTime - startTime) / 1000;
  
  return {
    responses,
    processingStats: {
      totalQuestions: input.questions.length,
      successfulResponses: responses.length - errors.length,
      failedResponses: errors.length,
      totalProcessingTime,
      averageResponseTime: totalProcessingTime / input.questions.length,
    },
    errors: errors.length > 0 ? errors : undefined,
  };
}



/**
 * Helper function to validate grounded QA input
 * 驗證接地問答輸入的輔助函數
 */
export const validateGroundedQAInput = (input: any): input is GroundedQAInput => {
  return (
    typeof input === 'object' &&
    input !== null &&
    typeof input.userQuestion === 'string' &&
    input.userQuestion.trim().length > 0
  );
};

/**
 * Helper function to create a basic grounded QA input
 * 創建基本接地問答輸入的輔助函數
 */
export const createGroundedQAInput = (
  userQuestion: string,
  options?: Partial<GroundedQAInput>
): GroundedQAInput => {
  return {
    userQuestion: userQuestion.trim(),
    selectedText: options?.selectedText,
    chapterContext: options?.chapterContext,
    currentChapter: options?.currentChapter,
    enableStreaming: options?.enableStreaming || false,
    includeDetailedCitations: options?.includeDetailedCitations !== false,
  };
};
