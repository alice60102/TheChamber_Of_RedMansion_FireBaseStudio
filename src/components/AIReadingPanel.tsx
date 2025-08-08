"use client";

/**
 * @fileOverview Presentational AI Reading Panel (UI Only)
 *
 * This component renders a right-side AI helper panel UI for the reading page.
 * It follows the product mock: shows suggestion chips and three quick tabs
 * (書籍亮點 / 背景解讀 / 關鍵概念). It does not perform any AI calls; it only
 * emits UI events so the parent can wire actual logic.
 *
 * Why this component:
 * - Keeps the large `read-book/page.tsx` lean by extracting UI details.
 * - Provides a focused, reusable UI surface for future AI features.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface AIReadingPanelProps {
  /** Optional currently selected text from the reading area */
  selectedText?: string | null;
  /** Callback when user clicks a suggestion chip */
  onPickSuggestion?: (text: string) => void;
}

const suggestionChips: string[] = [
  '書中如何解釋「保留判斷」與「完全開放」的矛盾？',
  '父親對「保留判斷」的強調暗示何種溝通智慧？',
  '為何作者認為「道德統一」是必要的？'
];

export const AIReadingPanel: React.FC<AIReadingPanelProps> = ({ selectedText, onPickSuggestion }) => {
  return (
    <div className="space-y-3">
      {/* Selected text preview (optional) */}
      {selectedText && (
        <div>
          <div className="text-sm text-muted-foreground">已選取內容</div>
          <blockquote className="mt-1 p-2 border-l-4 border-primary bg-primary/10 text-sm text-white rounded-sm max-h-24 overflow-y-auto">
            {selectedText.length > 140 ? selectedText.slice(0, 140) + '…' : selectedText}
          </blockquote>
        </div>
      )}

      {/* Suggestion chips */}
      <div className="space-y-2">
        <div className="text-sm font-medium">你可以問：</div>
        <div className="flex flex-wrap gap-2">
          {suggestionChips.map((q) => (
            <Button key={q} variant="secondary" size="sm" className="h-auto py-1 px-2"
              onClick={() => onPickSuggestion?.(q)}
              title={q}
            >
              {q}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick tabs area */}
      <Tabs defaultValue="highlights" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="highlights">書籍亮點</TabsTrigger>
          <TabsTrigger value="background">背景解讀</TabsTrigger>
          <TabsTrigger value="concepts">關鍵概念</TabsTrigger>
        </TabsList>

        <TabsContent value="highlights">
          <ScrollArea className="h-52 p-2 border rounded-md bg-muted/10">
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>文學史上的「爵士時代」名片</li>
              <li>美國夢興衰的深刻寓言</li>
              <li>消費社會與虛榮文化的犀利批判</li>
              <li>敘事與象徵的藝術亮點</li>
            </ul>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="background">
          <ScrollArea className="h-52 p-2 border rounded-md bg-muted/10">
            <div className="text-sm space-y-1">
              <p>1920年代美國的社會與經濟背景、禁酒令、咆哮年代文化氛圍概述。</p>
              <p>作家與作品風格、同時代文本對照的閱讀路徑建議。</p>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="concepts">
          <ScrollArea className="h-52 p-2 border rounded-md bg-muted/10">
            <ul className="text-sm space-y-1">
              <li>象徵符號與物件隱喻（如：綠光、灰谷、T.J.艾克博格之眼）</li>
              <li>階級、欲望與自我敘事</li>
              <li>敘事視角與不可靠敘事者</li>
            </ul>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIReadingPanel;


