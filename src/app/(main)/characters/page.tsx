
"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Drama, Info, Zap } from "lucide-react";
import { generateCharacterRelationshipMap } from '@/ai/flows/interactive-character-relationship-map';
import type { CharacterRelationshipMapInput, CharacterRelationshipMapOutput } from '@/ai/flows/interactive-character-relationship-map';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from "@/components/ui/label"; // Added import

// Placeholder for a graph visualization component
const CharacterGraphPlaceholder = ({ data }: { data: string | null }) => {
  if (!data) {
    return <div className="aspect-video w-full bg-muted/30 rounded-md flex items-center justify-center text-muted-foreground">請生成關係圖以在此處查看。</div>;
  }
  // In a real app, this would render an interactive graph using a library like vis.js, react-flow, or d3.js
  return (
    <ScrollArea className="h-96 p-4 border rounded-md bg-muted/10 whitespace-pre-line text-sm text-foreground/80">
      <h3 className="font-semibold mb-2 text-primary">關係描述:</h3>
      {data}
      <div className="mt-4 text-center text-muted-foreground text-xs"> (此處應為互動式圖譜) </div>
    </ScrollArea>
  );
};

export default function CharactersPage() {
  const [textInput, setTextInput] = useState<string>("林黛玉進賈府，與賈寶玉初次相見。王熙鳳出場，言語爽利，處理家中事務。");
  const [relationshipMap, setRelationshipMap] = useState<CharacterRelationshipMapOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateMap = async () => {
    if (!textInput.trim()) {
      alert("請輸入文本以分析人物關係。");
      return;
    }
    setIsLoading(true);
    setRelationshipMap(null);
    try {
      const input: CharacterRelationshipMapInput = { text: textInput };
      const result = await generateCharacterRelationshipMap(input);
      setRelationshipMap(result);
    } catch (error) {
      console.error("Error generating character map:", error);
      // Display error to user
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-artistic text-2xl text-primary flex items-center gap-2">
            <Drama className="h-7 w-7" />
            互動式人物關係圖
          </CardTitle>
          <CardDescription>
            輸入一段文本，AI 將分析並展示其中人物的關係網絡。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <Label htmlFor="textInput" className="text-lg font-semibold text-foreground">輸入文本段落</Label>
            <Textarea
              id="textInput"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="在此輸入《紅樓夢》文本片段，例如：寶玉和黛玉在花園相遇..."
              className="min-h-[150px] bg-background/50 text-base"
              rows={8}
            />
            <Button onClick={handleGenerateMap} disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Zap className="h-4 w-4 mr-2"/> {isLoading ? "生成中..." : "生成人物關係圖"}
            </Button>
            <div className="flex items-start p-3 rounded-md bg-muted/50 border border-dashed border-accent/50 text-accent">
              <Info className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
              <p className="text-xs">
                <strong>提示：</strong> 輸入的文本越具體，人物關係分析越準確。AI 將根據文本內容動態生成關係圖譜。
              </p>
            </div>
          </div>

          {/* Output/Graph Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">人物關係圖譜</h3>
            {isLoading ? (
              <div className="aspect-video w-full bg-muted/30 rounded-md flex items-center justify-center text-muted-foreground">
                AI 正在解析人物關係，請稍候...
              </div>
            ) : (
              <CharacterGraphPlaceholder data={relationshipMap?.description || null} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
