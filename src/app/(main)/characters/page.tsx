
"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Info, Zap, BookOpen, BarChartHorizontalBig, Lightbulb } from "lucide-react";
import { analyzeLearningData } from '@/ai/flows/learning-analysis';
import type { LearningAnalysisInput, LearningAnalysisOutput } from '@/ai/flows/learning-analysis';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";


const AnalysisOutputDisplay = ({ data }: { data: LearningAnalysisOutput | null }) => {
  if (!data) {
    return <div className="aspect-video w-full bg-muted/30 rounded-md flex items-center justify-center text-muted-foreground">請生成分析結果以在此處查看。</div>;
  }
  return (
    <ScrollArea className="h-96 p-4 border rounded-md bg-muted/10 text-sm text-foreground/80 space-y-4">
      <div>
        <h3 className="font-semibold mb-2 text-primary flex items-center gap-1"><BookOpen className="h-4 w-4" />文本掌握分析描述:</h3>
        <p className="whitespace-pre-line">{data.cognitiveHeatmap}</p>
      </div>
      <div>
        <h3 className="font-semibold mb-2 text-primary flex items-center gap-1"><BarChartHorizontalBig className="h-4 w-4" />理解偏差分析:</h3>
        <p className="whitespace-pre-line">{data.comprehensionDeviations}</p>
      </div>
      <div>
        <h3 className="font-semibold mb-2 text-primary flex items-center gap-1"><Lightbulb className="h-4 w-4" />學習建議:</h3>
        <p className="whitespace-pre-line">{data.recommendations}</p>
      </div>
      <div className="mt-4 text-center text-muted-foreground text-xs"> (此處未來可展示更豐富的視覺化圖譜) </div>
    </ScrollArea>
  );
};

export default function LearningAnalysisPage() {
  const [learningDataInput, setLearningDataInput] = useState<string>("已完成《紅樓夢》前五回閱讀，對於人物出場順序和主要家族關係有初步了解。在課堂測驗中，關於賈寶玉早期經歷的題目得分較高，但對於甄士隱和賈雨村的象徵意義理解較模糊。筆記中多次提及對林黛玉初進賈府的場景感興趣。");
  const [analysisResult, setAnalysisResult] = useState<LearningAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyzeData = async () => {
    if (!learningDataInput.trim()) {
      setErrorMessage("請輸入學習數據。");
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);
    setErrorMessage(null);
    try {
      const input: LearningAnalysisInput = { 
        learningData: learningDataInput 
      };
      const result = await analyzeLearningData(input);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error analyzing learning data:", error);
      setErrorMessage(error instanceof Error ? error.message : "分析學習數據時發生未知錯誤。");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-artistic text-2xl text-primary flex items-center gap-2">
            <BookOpen className="h-7 w-7" /> {/* Or another suitable icon like Share2 for graph */}
            個人學習知識圖譜
          </CardTitle>
          <CardDescription>
            根據您的學習數據生成的專屬知識脈絡，助您了解學習現狀與強弱項。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !analysisResult ? (
            <div className="h-48 p-4 border rounded-md bg-muted/30 flex items-center justify-center text-muted-foreground">
              知識圖譜生成中...
            </div>
          ) : analysisResult?.cognitiveHeatmap ? (
            <ScrollArea className="h-48 p-4 border rounded-md bg-muted/10">
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none whitespace-pre-line text-foreground/80">
                {analysisResult.cognitiveHeatmap}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-48 p-4 border rounded-md bg-muted/30 flex items-center justify-center text-muted-foreground">
              請先輸入學習數據並點擊下方的「生成學習狀況分析」按鈕以查看您的知識圖譜。
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-artistic text-2xl text-primary flex items-center gap-2">
            <Brain className="h-7 w-7" />
            學習狀況分析工具
          </CardTitle>
          <CardDescription>
            輸入學習數據，AI 將分析並生成相關的見解，包括文本掌握分析描述、理解偏差和學習建議。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="learningDataInput" className="text-lg font-semibold text-foreground">學習數據</Label>
                <Textarea
                  id="learningDataInput"
                  value={learningDataInput}
                  onChange={(e) => setLearningDataInput(e.target.value)}
                  placeholder="輸入學習記錄，例如已讀章節、筆記摘要、測驗結果等..."
                  className="min-h-[150px] bg-background/50 text-base"
                  rows={8}
                />
              </div>
              <Button onClick={handleAnalyzeData} disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Zap className="h-4 w-4 mr-2"/> {isLoading ? "分析中..." : "生成學習狀況分析"}
              </Button>
              <div className="flex items-start p-3 rounded-md bg-muted/50 border border-dashed border-accent/50 text-accent">
                <Info className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                <p className="text-xs">
                  <strong>提示：</strong> 輸入的學習數據越詳細（如閱讀章節、時長、測驗分數、筆記等），分析結果越準確。
                </p>
              </div>
            </div>

            {/* Output/Graph Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">學習狀況分析結果</h3>
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>分析錯誤</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              {isLoading && !errorMessage && !analysisResult ? ( // Adjusted loading condition
                <div className="aspect-video w-full bg-muted/30 rounded-md flex items-center justify-center text-muted-foreground">
                  AI 正在分析學習數據並構建學習狀況見解，請稍候...
                </div>
              ) : (
                <AnalysisOutputDisplay data={analysisResult} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
