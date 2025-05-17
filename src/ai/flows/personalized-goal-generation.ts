
// use server'

/**
 * @fileOverview A flow for generating personalized teaching goals based on user data and SOLO taxonomy.
 *
 * - generatePersonalizedGoals - A function that generates personalized teaching goals.
 * - PersonalizedGoalGenerationInput - The input type for the generatePersonalizedGoals function.
 * - PersonalizedGoalGenerationOutput - The return type for the generatePersonalizedGoals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SOLOLevels = ['Prestructural', 'Unistructural', 'Multistructural', 'Relational', 'Extended Abstract'];

const UserDataSchema = z.object({
  readingInterest: z.string().describe('The reading interests of the user.'),
  abilityLevel: z.string().describe('The academic ability level of the user.'),
  learningStyle: z.string().describe('The preferred learning style of the user.'),
});

const PersonalizedGoalGenerationInputSchema = z.object({
  userData: UserDataSchema.describe('User data including reading interests, ability level and learning style.'),
  classCharacteristics: z.string().describe('Characteristics of the class, like average reading level, diversity, etc.'),
  soloLevel: z.enum(SOLOLevels as [string, ...string[]]).describe('The SOLO taxonomy level to target.'),
});
export type PersonalizedGoalGenerationInput = z.infer<typeof PersonalizedGoalGenerationInputSchema>;

const TeachingGoalSchema = z.object({
  goal: z.string().describe('A specific teaching goal for the user, tailored to their needs and the SOLO level.'),
});

const PersonalizedGoalGenerationOutputSchema = z.object({
  teachingGoals: z.array(TeachingGoalSchema).describe('An array of teaching goals personalized for the user.'),
});
export type PersonalizedGoalGenerationOutput = z.infer<typeof PersonalizedGoalGenerationOutputSchema>;

export async function generatePersonalizedGoals(input: PersonalizedGoalGenerationInput): Promise<PersonalizedGoalGenerationOutput> {
  return personalizedGoalGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedGoalGenerationPrompt',
  input: {schema: PersonalizedGoalGenerationInputSchema},
  output: {schema: PersonalizedGoalGenerationOutputSchema},
  prompt: `You are an expert in personalized education, specializing in creating tiered teaching goals based on the SOLO taxonomy.

You will analyze the user data and class characteristics to generate teaching goals appropriate for the specified SOLO level.

User Data:
Reading Interests: {{{userData.readingInterest}}}
Ability Level: {{{userData.abilityLevel}}}
Learning Style: {{{userData.learningStyle}}}

Class Characteristics: {{{classCharacteristics}}}

SOLO Level: {{{soloLevel}}}

Based on this information, generate 3-5 teaching goals that are specific, measurable, achievable, relevant, and time-bound (SMART).

Format the output as a JSON array of teaching goals. 請以繁體中文生成教學目標。`,
});

const personalizedGoalGenerationFlow = ai.defineFlow(
  {
    name: 'personalizedGoalGenerationFlow',
    inputSchema: PersonalizedGoalGenerationInputSchema,
    outputSchema: PersonalizedGoalGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
