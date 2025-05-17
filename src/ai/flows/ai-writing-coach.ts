
'use server';

/**
 * @fileOverview An AI writing coach for students, providing feedback on structure, bias, completeness, and expression.
 *
 * - aiWritingCoach - A function that provides writing coaching.
 * - AiWritingCoachInput - The input type for the aiWritingCoach function.
 * - AiWritingCoachOutput - The return type for the aiWritingCoach function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiWritingCoachInputSchema = z.object({
  text: z.string().describe('The text to be reviewed by the AI writing coach.'),
});
export type AiWritingCoachInput = z.infer<typeof AiWritingCoachInputSchema>;

const AiWritingCoachOutputSchema = z.object({
  structureSuggestions: z.string().describe('Suggestions for improving the structure of the text.'),
  biasDetection: z.string().describe('Identified biases in the text.'),
  completenessCheck: z.string().describe('An analysis of the completeness of the arguments in the text.'),
  expressionOptimizations: z.string().describe('Suggestions for optimizing the expression in the text.'),
});
export type AiWritingCoachOutput = z.infer<typeof AiWritingCoachOutputSchema>;

export async function aiWritingCoach(input: AiWritingCoachInput): Promise<AiWritingCoachOutput> {
  return aiWritingCoachFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiWritingCoachPrompt',
  input: {schema: AiWritingCoachInputSchema},
  output: {schema: AiWritingCoachOutputSchema},
  prompt: `You are an AI writing coach that provides feedback to students on their writing.

You will receive a text and provide feedback on the following aspects:

- Structure Suggestions: Provide suggestions for improving the structure of the text.
- Bias Detection: Identify any biases in the text.
- Completeness Check: Analyze the completeness of the arguments in the text.
- Expression Optimizations: Provide suggestions for optimizing the expression in the text.

Text: {{{text}}}

請以繁體中文回答。`,
});

const aiWritingCoachFlow = ai.defineFlow(
  {
    name: 'aiWritingCoachFlow',
    inputSchema: AiWritingCoachInputSchema,
    outputSchema: AiWritingCoachOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
