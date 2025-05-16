// src/ai/flows/learning-analysis.ts
'use server';

/**
 * @fileOverview Provides learning analysis for teachers to visualize student understanding and comprehension deviations.
 *
 * - analyzeLearningData - A function that analyzes learning data and provides insights.
 * - LearningAnalysisInput - The input type for the analyzeLearningData function.
 * - LearningAnalysisOutput - The return type for the analyzeLearningData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningAnalysisInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  learningData: z.string().describe('A string containing the learning data, including completed chapters, time spent, quiz scores, and notes.'),
});
export type LearningAnalysisInput = z.infer<typeof LearningAnalysisInputSchema>;

const LearningAnalysisOutputSchema = z.object({
  cognitiveHeatmap: z.string().describe('A description of a cognitive heatmap visualizing the student’s understanding of different content areas.'),
  comprehensionDeviations: z.string().describe('An analysis of potential comprehension deviations or misunderstandings based on the learning data.'),
  recommendations: z.string().describe('Recommendations for adjusting the difficulty and format of recommended content based on the analysis.'),
});
export type LearningAnalysisOutput = z.infer<typeof LearningAnalysisOutputSchema>;

export async function analyzeLearningData(input: LearningAnalysisInput): Promise<LearningAnalysisOutput> {
  return analyzeLearningDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learningAnalysisPrompt',
  input: {schema: LearningAnalysisInputSchema},
  output: {schema: LearningAnalysisOutputSchema},
  prompt: `You are an AI learning analyst providing insights to teachers about their students' learning progress.

  Analyze the following learning data for student ID {{{studentId}}} and generate:
  1. A description of a cognitive heatmap visualizing the student’s understanding of different content areas. 
  2. An analysis of potential comprehension deviations or misunderstandings based on the learning data.
  3. Recommendations for adjusting the difficulty and format of recommended content based on the analysis.

  Learning Data: {{{learningData}}}
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
    return output!;
  }
);
