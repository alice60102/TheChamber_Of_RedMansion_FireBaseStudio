
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, CheckSquare, Brain, Palette, FileText, MessageSquare } from "lucide-react";
import { aiWritingCoach } from '@/ai/flows/ai-writing-coach';
import { ScrollArea } from '@/components/ui/scroll-area';

// Placeholder for essay structure inspired by Chinese architecture
const essayStructures = [
  { name: "起承轉合 (Qǐ Chéng Zhuǎn Hé)", description: "傳統四段式結構：開頭、發展、轉折、總結。", image: "https://placehold.co/300x200.png?text=起承轉合&tint=D4B76A,2E0A0A", dataAiHint: "chinese architecture" },
  { name: "總分總 (Zǒng Fēn Zǒng)", description: "總述-分述-總結，適用於說明文和議論文。", image: "https://placehold.co/300x200.png?text=總分總&tint=D4B76A,2E0A0A", dataAiHint: "classical building" },
  { name: "並列式 (Bìng Liè Shì)", description: "多個方面平行展開論述，適用於多角度分析。", image: "https://placehold.co/300x200.png?text=並列式&tint=D4B76A,2E0A0A", dataAiHint: "temple structure" },
];

interface WritingFeedback {
  structureSuggestions?: string;
  biasDetection?: string;
  completenessCheck?: string;
  expressionOptimizations?: string;
}

export default function WritePage() {
  const [essayText, setEssayText] = useState("");
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState(essayStructures[0]);

  const handleGetFeedback = async () => {
    if (!essayText.trim()) {
      alert("請先輸入您的文本內容。");
      return;
    }
    setIsLoading(true);
    setFeedback(null);
    try {
      const result = await aiWritingCoach({ text: essayText });
      setFeedback(result);
    } catch (error) {
      console.error("Error getting writing feedback:", error);
      setFeedback({ structureSuggestions: "無法獲取反饋，請稍後再試。" });
    }
    setIsLoading(false);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-var(--header-height,4rem)-2rem)]">
      {/* Writing Structure Guidance */}
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col shadow-xl">
          <CardHeader>
            <CardTitle className="font-artistic text-xl text-primary">寫作結構引導</CardTitle>
            <CardDescription>選擇一個結構開始您的創作之旅。</CardDescription>
          </CardHeader>
          <ScrollArea className="flex-grow">
            <CardContent className="space-y-4 p-4">
              {essayStructures.map((structure) => (
                <Card 
                  key={structure.name} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${selectedStructure.name === structure.name ? 'ring-2 ring-accent' : 'border-border'}`}
                  onClick={() => setSelectedStructure(structure)}
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-base font-semibold">{structure.name}</CardTitle>
                  </CardHeader>
                  {/* Visual representation (placeholder image) */}
                  <img src={structure.image} alt={structure.name} className="w-full h-24 object-cover" data-ai-hint={structure.dataAiHint} />
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">{structure.description}</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>

      {/* Essay Input and AI Coach */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col shadow-xl">
          <CardHeader>
            <CardTitle className="font-artistic text-xl text-primary">AI 寫作教練</CardTitle>
            <CardDescription>在此處撰寫您的文章，並獲取 AI 提供的專業反饋。</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <Textarea
              placeholder={`以 "${selectedStructure.name}" 結構撰寫您的《紅樓夢》讀後感或研究報告...`}
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              className="min-h-[200px] flex-grow resize-none bg-background/50 text-base"
            />
            <Button onClick={handleGetFeedback} disabled={isLoading} className="mt-4 w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {isLoading ? "分析中..." : "獲取 AI 反饋"}
            </Button>
          </CardContent>
          {feedback && (
            <CardFooter className="pt-4 flex-grow-0 overflow-hidden">
              <Tabs defaultValue="structure" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                  <TabsTrigger value="structure"><Palette className="h-4 w-4 mr-1 inline-block"/>結構</TabsTrigger>
                  <TabsTrigger value="bias"><Brain className="h-4 w-4 mr-1 inline-block"/>偏見</TabsTrigger>
                  <TabsTrigger value="completeness"><CheckSquare className="h-4 w-4 mr-1 inline-block"/>完整性</TabsTrigger>
                  <TabsTrigger value="expression"><MessageSquare className="h-4 w-4 mr-1 inline-block"/>表達</TabsTrigger>
                </TabsList>
                <ScrollArea className="h-48 mt-2 p-1 border rounded-md">
                  <TabsContent value="structure">
                    <h4 className="font-semibold mb-2 text-sm">結構建議:</h4>
                    <p className="text-sm text-foreground/80 whitespace-pre-line">{feedback.structureSuggestions || "暫無建議。"}</p>
                  </TabsContent>
                  <TabsContent value="bias">
                    <h4 className="font-semibold mb-2 text-sm">偏見檢測:</h4>
                    <p className="text-sm text-foreground/80 whitespace-pre-line">{feedback.biasDetection || "未檢測到明顯偏見。"}</p>
                  </TabsContent>
                  <TabsContent value="completeness">
                    <h4 className="font-semibold mb-2 text-sm">完整性檢查:</h4>
                    <p className="text-sm text-foreground/80 whitespace-pre-line">{feedback.completenessCheck || "論證較為完整。"}</p>
                  </TabsContent>
                  <TabsContent value="expression">
                    <h4 className="font-semibold mb-2 text-sm">表達優化:</h4>
                    <p className="text-sm text-foreground/80 whitespace-pre-line">{feedback.expressionOptimizations || "表達流暢。"}</p>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
