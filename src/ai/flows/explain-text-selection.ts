
'use server';
/**
 * @fileOverview Explains a selected text snippet from "Dream of the Red Chamber" by answering a user's question using AI.
 *
 * - explainTextSelection - A function that provides an explanation for a selected text snippet based on a user's question.
 * - ExplainTextSelectionInput - The input type for the explainTextSelection function.
 * - ExplainTextSelectionOutput - The return type for the explainTextSelection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainTextSelectionInputSchema = z.object({
  selectedText: z.string().describe('The text snippet selected by the user.'),
  chapterContext: z.string().describe('A snippet of the current chapter content to provide context to the selected text.'),
  userQuestion: z.string().describe('The user\'s specific question about the selected text. 請以繁體中文提出問題。'),
});
export type ExplainTextSelectionInput = z.infer<typeof ExplainTextSelectionInputSchema>;

const ExplainTextSelectionOutputSchema = z.object({
  explanation: z.string().describe('The AI-generated answer to the user\'s question about the selected text snippet. 請使用 Markdown 格式化您的回答，例如使用標題、列表、粗體、斜體等。請以繁體中文提供解釋。'),
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
  prompt: `你是《紅樓夢》的文學專家。使用者正在閱讀小說，並選取了一段文字，同時針對這段文字提出了一個具體問題，希望得到解答。

當前章回的上下文片段（協助理解背景）：
---
{{{chapterContext}}}
---

使用者選取的文字是：
"{{{selectedText}}}"

使用者提出的問題是：
"{{{userQuestion}}}"

請針對使用者提出的「問題」，並緊密結合他們「選取的文字」以及「上下文」，在《紅樓夢》的整體背景下，提供簡明扼要、有針對性的回答。
請使用 Markdown 格式化您的回答，例如使用標題、列表、粗體、斜體等。請以繁體中文提供解釋。`,
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
