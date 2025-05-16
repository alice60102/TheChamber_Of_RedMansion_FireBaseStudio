
"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, BookOpen, Zap } from "lucide-react";
import { connectThemesToModernContexts } from '@/ai/flows/connect-themes-to-modern-contexts';
import type { ConnectThemesToModernContextsInput, ConnectThemesToModernContextsOutput } from '@/ai/flows/connect-themes-to-modern-contexts';
import { ScrollArea } from '@/components/ui/scroll-area';

const sampleChapterText = "賈府的奢華生活背後，隱藏著複雜的人際關係和權力鬥爭。寶玉對仕途經濟的厭惡，以及對純真愛情的追求，與當時社會主流價值觀形成對比。人物的悲歡離合，反映了世事的無常和命運的不可捉摸。";

export default function ModernRelevancePage() {
  const [chapterText, setChapterText] = useState<string>(sampleChapterText);
  const [insights, setInsights] = useState<ConnectThemesToModernContextsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateInsights = async () => {
    if (!chapterText.trim()) {
      alert("請輸入章節文本以分析現代關聯。");
      return;
    }
    setIsLoading(true);
    setInsights(null);
    try {
      const input: ConnectThemesToModernContextsInput = { chapterText };
      const result = await connectThemesToModernContexts(input);
      setInsights(result);
    } catch (error) {
      console.error("Error generating modern relevance insights:", error);
      // Display error to user
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-artistic text-2xl text-primary flex items-center gap-2">
            <Sparkles className="h-7 w-7" />
            情境連結：經典與現代的對話
          </CardTitle>
          <CardDescription>
            輸入《紅樓夢》的章節文本，AI 將幫助您發掘其主題與當代社會、個人生活的深刻聯繫。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <Label htmlFor="chapterText" className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5"/> 章節文本片段
            </Label>
            <Textarea
              id="chapterText"
              value={chapterText}
              onChange={(e) => setChapterText(e.target.value)}
              placeholder="在此粘貼或輸入《紅樓夢》的章節文本..."
              className="min-h-[200px] bg-background/50 text-base"
              rows={10}
            />
            <Button onClick={handleGenerateInsights} disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Zap className="h-4 w-4 mr-2"/> {isLoading ? "生成中..." : "生成現代關聯見解"}
            </Button>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">現代關聯見解</h3>
            {isLoading ? (
              <div className="h-80 p-4 border rounded-md bg-muted/30 flex items-center justify-center text-muted-foreground">
                AI 正在思考經典與現代的連接點，請稍候...
              </div>
            ) : insights ? (
              <ScrollArea className="h-80 p-4 border rounded-md bg-muted/10">
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none whitespace-pre-line text-foreground/80">
                  {insights.modernContextInsights}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-80 p-4 border rounded-md bg-muted/30 flex items-center justify-center text-muted-foreground">
                點擊按鈕以生成現代關聯分析。
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
