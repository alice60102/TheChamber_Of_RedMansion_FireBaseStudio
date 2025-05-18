
'use server';
/**
 * @fileOverview Provides AI-driven guidance for users on the learning goals page.
 *
 * - aiCompanionGuidance - A function that offers guidance based on user questions and learning context.
 * - AiCompanionGuidanceInput - The input type for the aiCompanionGuidance function.
 * - AiCompanionGuidanceOutput - The return type for the aiCompanionGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCompanionGuidanceInputSchema = z.object({
  userQuestion: z.string().describe('用戶在學習目標頁面提出的具體問題。'),
  userLearningSummary: z.string().optional().describe('用戶當前《紅樓夢》學習情況的簡要概述，用於提供上下文。'),
  userGoals: z.array(z.string()).optional().describe('用戶當前設定的學習目標列表，用於提供上下文。'),
});
export type AiCompanionGuidanceInput = z.infer<typeof AiCompanionGuidanceInputSchema>;

const AiCompanionGuidanceOutputSchema = z.object({
  guidance: z.string().describe('AI學伴針對用戶問題提供的指導性回答。請使用 Markdown 格式化您的回答，例如使用標題、列表、粗體、斜體等。請以繁體中文提供所有內容。'),
});
export type AiCompanionGuidanceOutput = z.infer<typeof AiCompanionGuidanceOutputSchema>;

export async function aiCompanionGuidance(
  input: AiCompanionGuidanceInput
): Promise<AiCompanionGuidanceOutput> {
  return aiCompanionGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCompanionGuidancePrompt',
  input: {schema: AiCompanionGuidanceInputSchema},
  output: {schema: AiCompanionGuidanceOutputSchema},
  prompt: `你是一位友善且博學的《紅樓夢》學習輔導AI學伴。用戶目前正在學習目標設定頁面，他們可能會針對《紅樓夢》的內容、學習方法、或如何達成他們的學習目標提出問題。

用戶的當前學習概況：
{{#if userLearningSummary}}
{{{userLearningSummary}}}
{{else}}
用戶尚未提供學習概況。
{{/if}}

用戶設定的學習目標：
{{#if userGoals}}
  {{#each userGoals}}
  - {{{this}}}
  {{/each}}
{{else}}
用戶尚未提供具體的學習目標。
{{/if}}

用戶提出的問題是：
"{{{userQuestion}}}"

請針對用戶提出的「問題」，結合他們提供的學習概況和目標（如果有的話），提供清晰、有幫助的指導和回答。
請使用 Markdown 格式提供您的回答，例如使用標題（例如：## 標題）、列表（例如：- 項目）、粗體（例如：**重要文字**）、斜體（例如：*強調文字*）等。請以繁體中文提供所有內容。`,
});

const aiCompanionGuidanceFlow = ai.defineFlow(
  {
    name: 'aiCompanionGuidanceFlow',
    inputSchema: AiCompanionGuidanceInputSchema,
    outputSchema: AiCompanionGuidanceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.guidance) {
      console.error("AI flow 'aiCompanionGuidanceFlow' did not produce valid guidance for input:", input);
      throw new Error('AI學伴未能生成有效的指導建議。');
    }
    return output;
  }
);
