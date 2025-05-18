
'use server';
/**
 * @fileOverview Generates learning goal suggestions based on SOLO taxonomy.
 *
 * - generateGoalSuggestions - A function that generates learning goal suggestions.
 * - GenerateGoalSuggestionsInput - The input type for the generateGoalSuggestions function.
 * - GenerateGoalSuggestionsOutput - The return type for the generateGoalSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGoalSuggestionsInputSchema = z.object({
  userLearningSummary: z.string().describe('用戶當前《紅樓夢》學習情況的簡要概述。'),
});
export type GenerateGoalSuggestionsInput = z.infer<typeof GenerateGoalSuggestionsInputSchema>;

const GoalSuggestionsSchema = z.object({
  singlePointGoals: z.array(z.string()).describe('單點結構目標建議 (例如：認識基本人物關係、識別特定情節)。每個目標建議請使用 Markdown 格式化，例如使用列表、粗體等。'),
  multiPointGoals: z.array(z.string()).describe('多點結構目標建議 (例如：比較多個概念，如不同人物的性格特點、不同事件的相似之處)。每個目標建議請使用 Markdown 格式化，例如使用列表、粗體等。'),
  relationalGoals: z.array(z.string()).describe('關聯結構目標建議 (例如：分析因果關係，如人物命運與其性格、社會環境的聯繫)。每個目標建議請使用 Markdown 格式化，例如使用列表、粗體等。'),
  extendedAbstractGoals: z.array(z.string()).describe('抽象拓展目標建議 (例如：實現理論遷移，如將書中的哲學思想、藝術手法應用於現代情境分析或個人感悟)。每個目標建議請使用 Markdown 格式化，例如使用列表、粗體等。'),
});
export type GenerateGoalSuggestionsOutput = z.infer<typeof GoalSuggestionsSchema>;

export async function generateGoalSuggestions(
  input: GenerateGoalSuggestionsInput
): Promise<GenerateGoalSuggestionsOutput> {
  return generateGoalSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGoalSuggestionsPrompt',
  input: {schema: GenerateGoalSuggestionsInputSchema},
  output: {schema: GoalSuggestionsSchema},
  prompt: `你是一位精通《紅樓夢》教學的AI教育專家。請根據用戶提供的當前學習概況，並嚴格依照 SOLO 分類評價理論的四個層級（單點結構、多點結構、關聯結構、抽象拓展結構），為用戶生成具體的、可操作的《紅樓夢》學習目標建議。

用戶學習概況：
{{{userLearningSummary}}}

請為每個 SOLO 層級提供 2-3 個目標建議。目標應該明確，有助於用戶逐步深入理解《紅樓夢》。
每個目標建議本身請使用 Markdown 格式化，例如使用列表、粗體等來強調重點。

輸出格式必須嚴格遵循以下JSON結構，所有目標建議都應以繁體中文呈現：
{
  "singlePointGoals": ["目標1", "目標2", ...],
  "multiPointGoals": ["目標1", "目標2", ...],
  "relationalGoals": ["目標1", "目標2", ...],
  "extendedAbstractGoals": ["目標1", "目標2", ...]
}

單點結構目標示例：
*   識別《紅樓夢》開篇神話中甄士隱夢境的關鍵元素。
*   列出金陵十二釵正冊中的前五位人物及其主要身份。

多點結構目標示例：
*   比較林黛玉與薛寶釵在性格上的主要不同點。
*   找出小說前十回中至少三個運用伏筆手法的例子。

關聯結構目標示例：
*   分析賈寶玉的“混世魔王”稱號與其在賈府主流價值觀念中的衝突。
*   探討王熙鳳的權力慾望如何影響了她的管理風格和最終命運。

抽象拓展目標示例：
*   從《紅樓夢》的悲劇性思考中，提煉對現代人際關係或社會現象的啟示。
*   將小說中描寫的園林藝術與中國傳統美學思想相聯繫進行闡釋。

請確保生成的目標具有引導性和層次性。請以繁體中文提供所有內容。`,
});

const generateGoalSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateGoalSuggestionsFlow',
    inputSchema: GenerateGoalSuggestionsInputSchema,
    outputSchema: GoalSuggestionsSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || 
        !output.singlePointGoals || 
        !output.multiPointGoals || 
        !output.relationalGoals || 
        !output.extendedAbstractGoals) {
      console.error("AI flow 'generateGoalSuggestionsFlow' did not produce a valid output for input:", input);
      throw new Error('AI模型未能生成有效的學習目標建議。');
    }
    return output;
  }
);
