
// src/ai/flows/learning-analysis.ts
'use server';

/**
 * @fileOverview Provides learning analysis to visualize understanding and comprehension deviations.
 *
 * - analyzeLearningData - A function that analyzes learning data and provides insights.
 * - LearningAnalysisInput - The input type for the analyzeLearningData function.
 * - LearningAnalysisOutput - The return type for the analyzeLearningData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningAnalysisInputSchema = z.object({
  learningData: z.string().describe('A string containing the learning data, including completed chapters, time spent, quiz scores, and notes.'),
});
export type LearningAnalysisInput = z.infer<typeof LearningAnalysisInputSchema>;

const LearningAnalysisOutputSchema = z.object({
  cognitiveHeatmap: z.string().describe('An analysis of text comprehension for different content areas. 請使用 Markdown 格式化您的回答，例如使用標題、列表、粗體、斜體等。'),
  comprehensionDeviations: z.string().describe('An analysis of potential comprehension deviations or misunderstandings based on the learning data. 請使用 Markdown 格式化您的回答，例如使用標題、列表、粗體、斜體等。'),
  recommendations: z.string().describe('Recommendations for adjusting the difficulty and format of recommended content based on the analysis. 請使用 Markdown 格式化您的回答，例如使用標題、列表、粗體、斜體等。'),
});
export type LearningAnalysisOutput = z.infer<typeof LearningAnalysisOutputSchema>;

export async function analyzeLearningData(input: LearningAnalysisInput): Promise<LearningAnalysisOutput> {
  return analyzeLearningDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learningAnalysisPrompt',
  input: {schema: LearningAnalysisInputSchema},
  output: {schema: LearningAnalysisOutputSchema},
  prompt: `You are an AI learning analyst providing insights about learning progress.

  Analyze the following learning data and generate:
  1. An analysis of text comprehension for different content areas (this is the 'cognitiveHeatmap' output field).
  2. An analysis of potential comprehension deviations or misunderstandings based on the learning data.
  3. Recommendations for adjusting the difficulty and format of recommended content based on the analysis.

  Learning Data: {{{learningData}}}
  
  請使用 Markdown 格式化您的回答（例如使用標題如 ## 標題, 列表如 - 項目, 粗體如 **文字**, 斜體如 *文字* 等）來組織內容。請以繁體中文生成所有內容。
  `,
});

const analyzeLearningDataFlow = ai.defineFlow(
  {
    name: 'analyzeLearningDataFlow',
    inputSchema: LearningAnalysisInputSchema,
    outputSchema: LearningAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.cognitiveHeatmap || !output.comprehensionDeviations || !output.recommendations) {
      console.error("AI flow 'analyzeLearningDataFlow' did not produce a complete output for input:", input);
      throw new Error('AI模型未能生成有效的學習分析數據。');
    }
    return output;
  }
);
