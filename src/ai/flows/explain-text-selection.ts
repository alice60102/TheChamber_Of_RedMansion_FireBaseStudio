
'use server';
/**
 * @fileOverview Explains a selected text snippet from "Dream of the Red Chamber" using AI.
 *
 * - explainTextSelection - A function that provides an explanation for a selected text snippet.
 * - ExplainTextSelectionInput - The input type for the explainTextSelection function.
 * - ExplainTextSelectionOutput - The return type for the explainTextSelection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainTextSelectionInputSchema = z.object({
  selectedText: z.string().describe('The text snippet selected by the user for explanation.'),
  chapterContext: z.string().describe('A snippet of the current chapter content to provide context to the selected text.'),
});
export type ExplainTextSelectionInput = z.infer<typeof ExplainTextSelectionInputSchema>;

const ExplainTextSelectionOutputSchema = z.object({
  explanation: z.string().describe('The AI-generated explanation of the selected text snippet. 請以繁體中文提供解釋。'),
});
export type ExplainTextSelectionOutput = z.infer<typeof ExplainTextSelectionOutputSchema>;

export async function explainTextSelection(
  input: ExplainTextSelectionInput
): Promise<ExplainTextSelectionOutput> {
  return explainTextSelectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainTextSelectionPrompt',
  input: {schema: ExplainTextSelectionInputSchema},
  output: {schema: ExplainTextSelectionOutputSchema},
  prompt: `你是《紅樓夢》的文學專家。使用者正在閱讀小說，並選取了一段文字希望得到解釋。
當前章回的上下文片段如下：
---
{{{chapterContext}}}
---

使用者選取的文字是：
"{{{selectedText}}}"

請針對這段選取的文字，在《紅樓夢》的背景下提供簡明扼要的解釋，可能包括其字面意思、隱含意義、相關典故、人物關係或情節關聯等。

請以繁體中文提供解釋。`,
});

const explainTextSelectionFlow = ai.defineFlow(
  {
    name: 'explainTextSelectionFlow',
    inputSchema: ExplainTextSelectionInputSchema,
    outputSchema: ExplainTextSelectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.explanation) {
      console.error("AI flow 'explainTextSelectionFlow' did not produce a valid explanation for input:", input);
      throw new Error('AI模型未能生成有效的文本解釋。');
    }
    return output;
  }
);
