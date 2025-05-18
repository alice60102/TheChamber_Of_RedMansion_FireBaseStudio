
'use server';

/**
 * @fileOverview Generates a special topic research framework based on student's reading data and selected topic.
 *
 * - generateSpecialTopicFramework - A function that generates the research framework.
 * - GenerateSpecialTopicFrameworkInput - The input type for the generateSpecialTopicFramework function.
 * - GenerateSpecialTopicFrameworkOutput - The return type for the generateSpecialTopicFramework function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpecialTopicFrameworkInputSchema = z.object({
  readingData: z
    .string()
    .describe(
      'The student reading data including reading progress, notes, and interests.'
    ),
  selectedTopic: z.string().describe('The special topic selected by the student.'),
});

export type GenerateSpecialTopicFrameworkInput = z.infer<
  typeof GenerateSpecialTopicFrameworkInputSchema
>;

const GenerateSpecialTopicFrameworkOutputSchema = z.object({
  researchFramework: z.string().describe('The generated research framework. 請使用 Markdown 格式化此內容。'),
  relatedMaterials: z.string().describe('The related materials for the topic. 請使用 Markdown 格式化此內容。'),
  analysisTools: z.string().describe('The analysis tools for the research. 請使用 Markdown 格式化此內容。'),
});

export type GenerateSpecialTopicFrameworkOutput = z.infer<
  typeof GenerateSpecialTopicFrameworkOutputSchema
>;

export async function generateSpecialTopicFramework(
  input: GenerateSpecialTopicFrameworkInput
): Promise<GenerateSpecialTopicFrameworkOutput> {
  return generateSpecialTopicFrameworkFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpecialTopicFrameworkPrompt',
  input: {schema: GenerateSpecialTopicFrameworkInputSchema},
  output: {schema: GenerateSpecialTopicFrameworkOutputSchema},
  prompt: `You are an AI research assistant helping students to explore 《Dream of the Red Chamber》.

  Based on the student's reading data and selected topic, you will generate a special research framework, provide related materials, and analysis tools for the research.

  Reading Data: {{{readingData}}}
  Selected Topic: {{{selectedTopic}}}

  Here is the format you must follow, include ALL of the requested information. 
  Please use Markdown formatting for the content of 'Research Framework', 'Related Materials', and 'Analysis Tools'.
  請以繁體中文提供所有信息。

  Research Framework: [The research framework for the selected topic. Use Markdown.]

  Related Materials: [The related materials for the selected topic. Use Markdown.]

  Analysis Tools: [The analysis tools for the research. Use Markdown.]`,
});

const generateSpecialTopicFrameworkFlow = ai.defineFlow(
  {
    name: 'generateSpecialTopicFrameworkFlow',
    inputSchema: GenerateSpecialTopicFrameworkInputSchema,
    outputSchema: GenerateSpecialTopicFrameworkOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.researchFramework || !output.relatedMaterials || !output.analysisTools) {
      console.error("AI flow 'generateSpecialTopicFrameworkFlow' did not produce an output for input:", input);
      throw new Error('AI模型未能生成有效的專題研究框架。');
    }
    return output;
  }
);
