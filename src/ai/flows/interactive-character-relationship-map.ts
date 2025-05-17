
// use server'
'use server';
/**
 * @fileOverview Generates an interactive character relationship map based on the current text.
 *
 * - generateCharacterRelationshipMap - A function that generates the character relationship map.
 * - CharacterRelationshipMapInput - The input type for the generateCharacterRelationshipMap function.
 * - CharacterRelationshipMapOutput - The return type for the generateCharacterRelationshipMap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CharacterRelationshipMapInputSchema = z.object({
  text: z
    .string()
    .describe('The current text from which to extract character relationships.'),
});
export type CharacterRelationshipMapInput = z.infer<
  typeof CharacterRelationshipMapInputSchema
>;

const CharacterRelationshipMapOutputSchema = z.object({
  description: z
    .string()
    .describe(
      'A description of the character relationships in the text, suitable for rendering as an interactive graph.'
    ),
});
export type CharacterRelationshipMapOutput = z.infer<
  typeof CharacterRelationshipMapOutputSchema
>;

export async function generateCharacterRelationshipMap(
  input: CharacterRelationshipMapInput
): Promise<CharacterRelationshipMapOutput> {
  return characterRelationshipMapFlow(input);
}

const characterRelationshipMapPrompt = ai.definePrompt({
  name: 'characterRelationshipMapPrompt',
  input: {schema: CharacterRelationshipMapInputSchema},
  output: {schema: CharacterRelationshipMapOutputSchema},
  prompt: `Given the following text, extract and describe the relationships between the characters mentioned. The description should be structured in a way that can be easily parsed and rendered as an interactive graph, focusing on key connections and their nature (e.g., familial, romantic, adversarial). Be as comprehensive as possible. Be as verbose as possible. 請以繁體中文描述。

Text: {{{text}}}`,
});

const characterRelationshipMapFlow = ai.defineFlow(
  {
    name: 'characterRelationshipMapFlow',
    inputSchema: CharacterRelationshipMapInputSchema,
    outputSchema: CharacterRelationshipMapOutputSchema,
  },
  async input => {
    const {output} = await characterRelationshipMapPrompt(input);
    return output!;
  }
);
