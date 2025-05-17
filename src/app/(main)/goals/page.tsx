
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Target, CheckCircle, Users, PlusCircle, ThumbsUp, AlertTriangle } from "lucide-react";
import { personalizedGoalGeneration } from '@/ai/flows/personalized-goal-generation';
import type { PersonalizedGoalGenerationInput, PersonalizedGoalGenerationOutput } from '@/ai/flows/personalized-goal-generation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SOLOLevels = ['Prestructural', 'Unistructural', 'Multistructural', 'Relational', 'Extended Abstract'];

interface TeachingGoal {
  goal: string;
  votes?: number; // For student voting simulation
}

export default function GoalsPage() {
  const [userData, setUserData] = useState<PersonalizedGoalGenerationInput['userData']>({
    readingInterest: "古典文學, 人物分析",
    abilityLevel: "中等",
    learningStyle: "視覺型, 互動型",
  });
  const [classCharacteristics, setClassCharacteristics] = useState("平均閱讀水平中等，學生對紅樓夢背景知識了解不一。");
  const [soloLevel, setSoloLevel] = useState<PersonalizedGoalGenerationInput['soloLevel']>('Multistructural');
  const [generatedGoals, setGeneratedGoals] = useState<TeachingGoal[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateGoals = async () => {
    setIsLoading(true);
    setGeneratedGoals(null);
    setErrorMessage(null); // Clear previous errors
    try {
      const input: PersonalizedGoalGenerationInput = {
        userData,
        classCharacteristics,
        soloLevel,
      };
      const result: PersonalizedGoalGenerationOutput = await personalizedGoalGeneration(input);
      setGeneratedGoals(result.teachingGoals.map(g => ({ ...g, votes: 0 })));
    } catch (error) {
      console.error("Error generating goals:", error);
      setErrorMessage(error instanceof Error ? error.message : "生成目標時發生未知錯誤。請檢查服務器日誌或稍後再試。");
    }
    setIsLoading(false);
  };

  const handleVote = (index: number) => {
    setGeneratedGoals(prevGoals => {
      if (!prevGoals) return null;
      const newGoals = [...prevGoals];
      newGoals[index] = { ...newGoals[index], votes: (newGoals[index].votes || 0) + 1 };
      return newGoals;
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-artistic text-2xl text-primary flex items-center gap-2">
            <Target className="h-7 w-7" />
            智能目標生成與協同制定
          </CardTitle>
          <CardDescription>
            基於學生數據與 SOLO 分類理論，為教師推薦分層教學目標，並可邀請學生參與目標制定。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">輸入信息 (教師視角)</h3>
            <div>
              <Label htmlFor="readingInterest">學生閱讀興趣</Label>
              <Input id="readingInterest" value={userData.readingInterest} onChange={(e) => setUserData({...userData, readingInterest: e.target.value})} className="bg-background/50"/>
            </div>
            <div>
              <Label htmlFor="abilityLevel">學力水平</Label>
              <Input id="abilityLevel" value={userData.abilityLevel} onChange={(e) => setUserData({...userData, abilityLevel: e.target.value})} className="bg-background/50"/>
            </div>
            <div>
              <Label htmlFor="learningStyle">學習風格偏好</Label>
              <Input id="learningStyle" value={userData.learningStyle} onChange={(e) => setUserData({...userData, learningStyle: e.target.value})} className="bg-background/50"/>
            </div>
            <div>
              <Label htmlFor="classCharacteristics">班級特點</Label>
              <Textarea id="classCharacteristics" value={classCharacteristics} onChange={(e) => setClassCharacteristics(e.target.value)} className="bg-background/50"/>
            </div>
            <div>
              <Label htmlFor="soloLevel">目標 SOLO 層級</Label>
              <Select value={soloLevel} onValueChange={(value) => setSoloLevel(value as PersonalizedGoalGenerationInput['soloLevel'])}>
                <SelectTrigger id="soloLevel" className="bg-background/50">
                  <SelectValue placeholder="選擇 SOLO 層級" />
                </SelectTrigger>
                <SelectContent>
                  {SOLOLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateGoals} disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {isLoading ? "生成中..." : "生成教學目標建議"}
            </Button>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">AI 生成目標建議</h3>
            {errorMessage && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>錯誤</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            {generatedGoals ? (
              <ScrollArea className="h-96 p-1 border rounded-md bg-muted/20">
                <ul className="space-y-3 p-3">
                  {generatedGoals.map((item, index) => (
                    <li key={index} className="p-3 rounded-md border bg-card flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground/90">{item.goal}</p>
                        <p className="text-xs text-muted-foreground">學生投票: {item.votes}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleVote(index)} title="投票支持此目標">
                        <ThumbsUp className="h-4 w-4 text-accent" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              !errorMessage && (
                <p className="text-sm text-muted-foreground p-4 border rounded-md bg-muted/20 text-center">
                  {isLoading ? "正在為您精心 crafting 目標..." : "點擊按鈕以生成個性化教學目標。"}
                </p>
              )
            )}
            {generatedGoals && generatedGoals.length > 0 && (
               <Button className="w-full mt-4"><CheckCircle className="h-4 w-4 mr-2"/>確認並采納目標</Button>
            )}
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                AI生成的目標僅供參考，教師可根據實際情況進行調整。學生投票功能旨在提升參與感。
            </p>
        </CardFooter>
      </Card>

      {/* Placeholder for student view of goals */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-artistic text-xl text-primary flex items-center gap-2">
            <Users className="h-6 w-6" />
            我的學習目標 (學生視角)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">此處將顯示教師設定的以及共同制定的個人學習目標。</p>
          {/* Example goal item */}
          <div className="mt-4 p-4 border rounded-md bg-card">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-foreground/90">深入理解林黛玉的人物性格</p>
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400">進行中</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">完成相關章節閱讀，並撰寫一篇人物分析短文。</p>
            {/* Progress bar placeholder */}
            <div className="w-full bg-muted rounded-full h-2.5 mt-2">
              <div className="bg-accent h-2.5 rounded-full" style={{ width: "60%" }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
