
// use server'
'use server';

/**
 * @fileOverview Provides context-aware word sense analysis and interactive character relationship graphs.
 *
 * - analyzeContext - A function that performs context analysis and generates character relationship graphs.
 * - ContextAnalysisInput - The input type for the analyzeContext function.
 * - ContextAnalysisOutput - The return type for the analyzeContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextAnalysisInputSchema = z.object({
  text: z.string().describe('The current text being read by the student.'),
  chapter: z.string().describe('The current chapter of the book.'),
});

export type ContextAnalysisInput = z.infer<typeof ContextAnalysisInputSchema>;

const ContextAnalysisOutputSchema = z.object({
  wordSenseAnalysis: z.string().describe('Analysis of difficult words or phrases in the current context. 請使用 Markdown 格式化您的回答，例如使用標題（例如：## 標題）、列表（例如：- 項目）、粗體（例如：**重要文字**）、斜體（例如：*強調文字*）等。'),
  characterRelationships: z
    .string()
    .describe('An interactive graph or description of character relationships relevant to the current text. 請使用 Markdown 格式化您的回答，例如使用標題（例如：## 標題）、列表（例如：- 項目）、粗體（例如：**重要文字**）、斜體（例如：*強調文字*）等。'),
});

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
