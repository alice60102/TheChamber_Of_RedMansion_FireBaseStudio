'use server';
/**
 * @fileOverview Connects themes from Dream of the Red Chamber to modern contexts using AI.
 *
 * - connectThemesToModernContexts - A function that connects themes from the novel to modern contexts.
 * - ConnectThemesToModernContextsInput - The input type for the connectThemesToModernContexts function.
 * - ConnectThemesToModernContextsOutput - The return type for the connectThemesToModernContexts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConnectThemesToModernContextsInputSchema = z.object({
  chapterText: z.string().describe('The text of the chapter currently being read.'),
});
export type ConnectThemesToModernContextsInput = z.infer<typeof ConnectThemesToModernContextsInputSchema>;

const ConnectThemesToModernContextsOutputSchema = z.object({
  modernContextInsights: z.string().describe('Insights connecting themes of the chapter to modern contexts.'),
});
export type ConnectThemesToModernContextsOutput = z.infer<typeof ConnectThemesToModernContextsOutputSchema>;

export async function connectThemesToModernContexts(
  input: ConnectThemesToModernContextsInput
): Promise<ConnectThemesToModernContextsOutput> {
  return connectThemesToModernContextsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'connectThemesToModernContextsPrompt',
  input: {schema: ConnectThemesToModernContextsInputSchema},
  output: {schema: ConnectThemesToModernContextsOutputSchema},
  prompt: `You are an expert in Chinese literature, specializing in *Dream of the Red Chamber*. Your task is to connect the themes present in the provided chapter text to contemporary contexts, providing insights that help modern students understand the novel's relevance to their lives.\n\nChapter Text: {{{chapterText}}}\n\nProvide insights that connect the themes of this chapter to modern contexts.`,
});

const connectThemesToModernContextsFlow = ai.defineFlow(
  {
    name: 'connectThemesToModernContextsFlow',
    inputSchema: ConnectThemesToModernContextsInputSchema,
    outputSchema: ConnectThemesToModernContextsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
