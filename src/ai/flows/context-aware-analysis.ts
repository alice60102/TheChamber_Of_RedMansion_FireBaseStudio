
/**
 * @fileOverview Context-aware analysis AI flow for classical Chinese literature comprehension.
 * 
 * This AI flow provides intelligent analysis of text passages from "Dream of the Red Chamber"
 * by combining word sense disambiguation with character relationship mapping. It helps students
 * understand difficult classical Chinese vocabulary and track complex character dynamics.
 * 
 * Key features:
 * - Word sense analysis for archaic and classical Chinese terms
 * - Context-sensitive explanations based on current chapter and surrounding text
 * - Character relationship analysis relevant to the current reading passage
 * - Markdown-formatted output for rich text display in the UI
 * - Traditional Chinese output for native speaker accessibility
 * 
 * Usage: Called when students need deeper understanding of complex passages
 * 
 * Functions:
 * - analyzeContext: Main function that performs comprehensive context analysis
 * - ContextAnalysisInput: Input schema defining required text and chapter information
 * - ContextAnalysisOutput: Output schema for word analysis and character relationships
 */

'use server'; // Required for server-side AI processing

// Import the configured AI instance from GenKit
import {ai} from '@/ai/genkit';
// Import Zod for schema validation and type inference
import {z} from 'genkit';

/**
 * Input schema for context analysis
 * 
 * Defines the required information for the AI to perform comprehensive
 * text analysis including word sense disambiguation and character mapping.
 */
const ContextAnalysisInputSchema = z.object({
  text: z.string().describe('The current text passage being read by the student. Should be a meaningful segment from the novel that contains enough context for analysis.'),
  chapter: z.string().describe('The current chapter number or title being read. Used to provide broader narrative context for the analysis.'),
});

/**
 * TypeScript type inferred from the input schema
 * Used throughout the application for type safety when calling this AI flow
 */
export type ContextAnalysisInput = z.infer<typeof ContextAnalysisInputSchema>;

/**
 * Output schema for context analysis results
 * 
 * Defines the structure of AI-generated analysis including word explanations
 * and character relationship insights. All outputs are formatted in Markdown
 * for rich text display in the user interface.
 */
const ContextAnalysisOutputSchema = z.object({
  wordSenseAnalysis: z.string().describe('Detailed analysis of difficult words, phrases, or literary devices in the current context. Includes classical Chinese terminology explanations, historical context, and literary significance. Uses Markdown formatting with headers (## Title), lists (- Item), bold (**Important**), italic (*Emphasis*), etc.'),
  characterRelationships: z
    .string()
    .describe('Analysis of character relationships and interactions relevant to the current text passage. Describes family connections, romantic relationships, social hierarchies, and conflicts. Formatted as Markdown with clear structure using headers (## Title), lists (- Item), bold (**Important**), italic (*Emphasis*), etc.'),
});

/**
 * TypeScript type inferred from the output schema
 * Used for type safety when processing AI analysis results
 */
export type ContextAnalysisOutput = z.infer<typeof ContextAnalysisOutputSchema>;

export async function analyzeContext(input: ContextAnalysisInput): Promise<ContextAnalysisOutput> {
  return analyzeContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextAnalysisPrompt',
  input: {schema: ContextAnalysisInputSchema},
  output: {schema: ContextAnalysisOutputSchema},
  prompt: `You are assisting a student reading "Dream of the Red Chamber".
  The student is currently reading chapter: {{{chapter}}}.
  The current text is:
  {{{
    text
  }}}

  Provide a word sense analysis for any difficult words or phrases in the current context.
  Also, generate a description of the character relationships that are relevant to the current text.
  Include a summary of the plot points or character interactions.
  請使用 Markdown 格式化您的回答，例如使用標題（例如：## 標題）、列表（例如：- 項目）、粗體（例如：**重要文字**）、斜體（例如：*強調文字*）等。請以繁體中文提供分析和描述。
  `,
});

const analyzeContextFlow = ai.defineFlow(
  {
    name: 'analyzeContextFlow',
    inputSchema: ContextAnalysisInputSchema,
    outputSchema: ContextAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.wordSenseAnalysis || !output.characterRelationships) {
      console.error("AI flow 'analyzeContextFlow' did not produce an output for input:", input);
      throw new Error('AI模型未能生成有效的文本脈絡分析。');
    }
    return output;
  }
);
