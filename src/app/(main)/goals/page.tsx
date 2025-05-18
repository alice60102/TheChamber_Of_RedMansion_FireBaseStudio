
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Target, Lightbulb, Brain, BarChartHorizontalBig, BookOpen, AlertTriangle, Zap, PlusCircle, Trash2, Award, CheckCircle2, Circle } from "lucide-react";
import { generateGoalSuggestions, type GenerateGoalSuggestionsInput, type GenerateGoalSuggestionsOutput } from '@/ai/flows/generate-goal-suggestions';
import { analyzeLearningData, type LearningAnalysisInput, type LearningAnalysisOutput } from '@/ai/flows/learning-analysis';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';

interface UserGoal {
  id: string;
  text: string;
  isAchieved: boolean;
}

// Sample data for the learning curve chart
const learningCurveData = [
  { chapter: "第1回", comprehension: 50, timeSpent: 75 },
  { chapter: "第2回", comprehension: 65, timeSpent: 60 },
  { chapter: "第3回", comprehension: 45, timeSpent: 70 },
  { chapter: "第4回", comprehension: 30, timeSpent: 80 },
  { chapter: "第5回", comprehension: 70, timeSpent: 85 },
  { chapter: "第6回", comprehension: 72, timeSpent: 90 },
  { chapter: "第7回", comprehension: 80, timeSpent: 95 },
];

// Sample data for simulated Cognitive Heatmap (Mastery by Topic)
const cognitiveHeatmapData = [
  { name: '人物關係', mastery: 70 },
  { name: '詩詞典故', mastery: 50 },
  { name: '情節發展', mastery: 85 },
  { name: '社會背景', mastery: 60 },
  { name: '象徵手法', mastery: 40 },
  { name: '哲學思想', mastery: 55 },
];

// Sample data for simulated Reading Trajectory (Chapters read per day)
const readingTrajectoryData = [
  { day: '週一', chapters: 2 },
  { day: '週二', chapters: 1 },
  { day: '週三', chapters: 3 },
  { day: '週四', chapters: 1 },
  { day: '週五', chapters: 2 },
  { day: '週六', chapters: 4 },
  { day: '週日', chapters: 2 },
];


export default function GoalsPage() {
  const [userLearningSummary, setUserLearningSummary] = useState<string>("目前已初步閱讀《紅樓夢》前五回，對主要人物如賈寶玉、林黛玉、薛寶釵有基本印象。對小說開篇的甄士隱故事線較為模糊。");
  const [aiSuggestedGoals, setAiSuggestedGoals] = useState<GenerateGoalSuggestionsOutput | null>(null);
  const [isLoadingAiGoals, setIsLoadingAiGoals] = useState(false);
  const [aiGoalsError, setAiGoalsError] = useState<string | null>(null);

  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
  const [newGoalText, setNewGoalText] = useState<string>("");

  const [learningAnalysis, setLearningAnalysis] = useState<LearningAnalysisOutput | null>(null);
  const [isLoadingLearningAnalysis, setIsLoadingLearningAnalysis] = useState(false);
  const [learningAnalysisError, setLearningAnalysisError] = useState<string | null>(null);

  const [aiCompanionQuery, setAiCompanionQuery] = useState<string>("");
  const [aiCompanionResponse, setAiCompanionResponse] = useState<string>("");
  const [isLoadingAiCompanion, setIsLoadingAiCompanion] = useState(false);

  const handleGenerateAiGoals = async () => {
    if (!userLearningSummary.trim()) {
      setAiGoalsError("請先輸入您的學習概況。");
      return;
    }
    setIsLoadingAiGoals(true);
    setAiGoalsError(null);
    setAiSuggestedGoals(null);
    try {
      const input: GenerateGoalSuggestionsInput = { userLearningSummary };
      const result = await generateGoalSuggestions(input);
      setAiSuggestedGoals(result);
    } catch (error) {
      console.error("Error generating AI goal suggestions:", error);
      setAiGoalsError(error instanceof Error ? error.message : "生成AI目標建議時發生未知錯誤。");
    }
    setIsLoadingAiGoals(false);
  };

  const handleAddUserGoal = () => {
    if (newGoalText.trim()) {
      setUserGoals([...userGoals, { id: Date.now().toString(), text: newGoalText, isAchieved: false }]);
      setNewGoalText("");
    }
  };

  const handleToggleGoalStatus = (id: string) => {
    setUserGoals(userGoals.map(goal => goal.id === id ? { ...goal, isAchieved: !goal.isAchieved } : goal));
  };
  
  const handleDeleteGoal = (id: string) => {
    setUserGoals(userGoals.filter(goal => goal.id !== id));
  };

  const handleGenerateLearningAnalysis = async () => {
     if (!userLearningSummary.trim() && userGoals.length === 0) {
      setLearningAnalysisError("請提供學習概況或設定一些目標以進行分析。");
      return;
    }
    setIsLoadingLearningAnalysis(true);
    setLearningAnalysisError(null);
    setLearningAnalysis(null);
    try {
      // Combine summary and goals for a richer analysis context
      const analysisInputText = `學習概況：${userLearningSummary}\n設定的目標：${userGoals.map(g => `${g.text} (狀態: ${g.isAchieved ? '已完成' : '進行中'})`).join('; ')}`;
      const input: LearningAnalysisInput = { learningData: analysisInputText };
      const result = await analyzeLearningData(input);
      setLearningAnalysis(result);
    } catch (error) {
      console.error("Error generating learning analysis:", error);
      setLearningAnalysisError(error instanceof Error ? error.message : "生成學習分析時發生未知錯誤。");
    }
    setIsLoadingLearningAnalysis(false);
  };
  
  const handleAiCompanionSubmit = async () => {
    if (!aiCompanionQuery.trim()) return;
    setIsLoadingAiCompanion(true);
    setAiCompanionResponse(`AI正在思考關於「${aiCompanionQuery}」的回答... (此功能待實現更複雜的AI對話流程)`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAiCompanionResponse(`針對「${aiCompanionQuery}」：AI建議您參考相關章節的研讀筆記，並嘗試將此問題與您設定的學習目標關聯起來。例如，如果您的目標是理解主要人物性格，可以思考這個問題如何幫助您深化對某人物的認識。(此為佔位回應)`);
    setIsLoadingAiCompanion(false);
  };

  const renderGoalList = (goals: UserGoal[], isActiveList: boolean) => (
    <div className="space-y-3">
      {goals.map(goal => (
        <Card key={goal.id} className={`p-3 shadow-sm ${goal.isAchieved ? 'bg-green-500/10 border-green-500/50' : 'bg-card/80'}`}>
          <div className="flex justify-between items-center">
            <p className={`flex-grow text-sm ${goal.isAchieved ? 'line-through text-muted-foreground' : 'text-foreground/90'}`}>{goal.text}</p>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {isActiveList ? (
                <Button variant="ghost" size="sm" onClick={() => handleToggleGoalStatus(goal.id)} className="h-7 px-2 text-xs text-green-600 hover:bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 mr-1"/> 標記完成
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => handleToggleGoalStatus(goal.id)} className="h-7 px-2 text-xs text-amber-600 hover:bg-amber-500/10">
                  <Circle className="h-4 w-4 mr-1"/> 重新激活
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)} className="h-7 w-7">
                <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-artistic text-2xl text-primary flex items-center gap-2">
            <Target className="h-7 w-7" />
            學習目標設定與追蹤
          </CardTitle>
          <CardDescription>
            在此設定您的《紅樓夢》學習目標，並利用 AI 輔助獲得個性化建議，追蹤您的學習進程。
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-artistic text-xl text-foreground/90">學習進度總覽 (模擬學習曲線)</CardTitle>
          <CardDescription>您的學習曲線將在此以圖表風格呈現。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-[16/7] w-full bg-muted/30 rounded-md p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={learningCurveData}
                margin={{
                  top: 5,
                  right: 20,
                  left: -20, 
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                <XAxis dataKey="chapter" stroke="hsl(var(--foreground)/0.7)" fontSize={12} />
                <YAxis yAxisId="left" stroke="hsl(var(--primary))" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                    borderRadius: 'var(--radius)',
                  }}
                  labelStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground)/0.8)' }} />
                <Line yAxisId="left" type="monotone" dataKey="comprehension" name="理解程度 (%)" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6 }} dot={{ fill: 'hsl(var(--primary))', r:3 }}/>
                <Line yAxisId="right" type="monotone" dataKey="timeSpent" name="學習時長 (分鐘)" stroke="hsl(var(--chart-2))" strokeWidth={2} activeDot={{ r: 6 }} dot={{ fill: 'hsl(var(--chart-2))', r:3 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-artistic text-xl text-foreground/90">設定與追蹤您的學習目標</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-primary">我的目標 (進行中)</h3>
            <div className="flex gap-2">
              <Input 
                placeholder="輸入您的新學習目標..." 
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                className="bg-background/50"
              />
              <Button onClick={handleAddUserGoal} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <PlusCircle className="h-4 w-4 mr-1.5"/>新增
              </Button>
            </div>
            {userGoals.filter(g => !g.isAchieved).length > 0 ? (
              <ScrollArea className="h-60 pr-3">
                {renderGoalList(userGoals.filter(g => !g.isAchieved), true)}
              </ScrollArea>
            ) : <p className="text-sm text-muted-foreground">暫無進行中的目標。請在上方輸入框添加您的第一個目標！</p>}

            {userGoals.filter(g => g.isAchieved).length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-1.5"><Award className="h-5 w-5"/>已達成成就</h4>
                <ScrollArea className="h-40 pr-3">
                 {renderGoalList(userGoals.filter(g => g.isAchieved), false)}
                </ScrollArea>
              </div>
            )}
          </div>

          <div className="space-y-4 p-4 rounded-md bg-primary/5 border border-primary/20">
            <h3 className="font-semibold text-primary">AI 目標建議</h3>
            <div>
              <Label htmlFor="learningSummary" className="text-sm text-foreground/80">您的當前學習概況 (簡述) 正式系統會由AI自主判斷，不須用戶輸入</Label>
              <Textarea 
                id="learningSummary"
                value={userLearningSummary}
                onChange={(e) => setUserLearningSummary(e.target.value)}
                placeholder="例如：已閱讀前十章，對主要人物關係有初步了解..."
                className="min-h-[80px] bg-background/70"
                rows={3}
              />
            </div>
            <Button onClick={handleGenerateAiGoals} disabled={isLoadingAiGoals} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Zap className="h-4 w-4 mr-1.5"/> {isLoadingAiGoals ? "建議生成中..." : "獲取 AI 目標建議"}
            </Button>
            {aiGoalsError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>錯誤</AlertTitle>
                <AlertDescription>{aiGoalsError}</AlertDescription>
              </Alert>
            )}
            {aiSuggestedGoals && !isLoadingAiGoals && (
              <ScrollArea className="h-72 mt-2">
                <Accordion type="multiple" className="w-full">
                  {Object.entries(aiSuggestedGoals).map(([levelKey, goalsArray]) => (
                    <AccordionItem value={levelKey} key={levelKey} className="border-accent/30">
                      <AccordionTrigger className="text-sm font-medium text-accent hover:text-accent/80 py-2">
                        {
                          levelKey === 'singlePointGoals' ? '單點結構目標' :
                          levelKey === 'multiPointGoals' ? '多點結構目標' :
                          levelKey === 'relationalGoals' ? '關聯結構目標' :
                          levelKey === 'extendedAbstractGoals' ? '抽象拓展目標' : levelKey
                        }
                      </AccordionTrigger>
                      <AccordionContent className="bg-card/50 p-0">
                        <ul className="list-none p-3 space-y-1.5">
                          {(goalsArray as string[]).map((goal, index) => (
                            <li key={index} className="text-xs text-foreground/80 flex items-start">
                              <Lightbulb className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-accent/70 shrink-0" />
                              <span>{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            )}
          </div>
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">提示：AI建議的目標可作為參考，您可以選擇性地將它們添加到「我的目標」中進行追蹤。</p>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-artistic text-xl text-foreground/90">AI學伴 - 目標輔導</CardTitle>
          <CardDescription>對您的學習目標有疑問？或需要針對性指導？在此與AI互動。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 p-4 rounded-md" style={{border: '1px solid hsl(var(--border))', backgroundImage: 'url(https://placehold.co/600x400/FFF8E1/4A3B31.png?text=書卷背景)', backgroundSize: 'cover', backgroundPosition: 'center'}} data-ai-hint="old paper scroll">
            <Textarea 
              value={aiCompanionQuery}
              onChange={(e) => setAiCompanionQuery(e.target.value)}
              placeholder="輸入您關於學習目標的問題..."
              className="min-h-[80px] bg-background/80"
              rows={3}
            />
            <Button onClick={handleAiCompanionSubmit} disabled={isLoadingAiCompanion} className="bg-primary text-primary-foreground">
              {isLoadingAiCompanion ? "發送中..." : "提問AI學伴"}
            </Button>
            {aiCompanionResponse && (
              <div className="mt-3 p-3 border rounded-md bg-muted/50 text-sm text-foreground/80 whitespace-pre-line">
                <strong>AI學伴回覆：</strong> {aiCompanionResponse}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-artistic text-xl text-foreground/90">個人化學習分析</CardTitle>
          <CardDescription>基於您的學習數據與目標，AI提供深度分析與建議。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <Button onClick={handleGenerateLearningAnalysis} disabled={isLoadingLearningAnalysis} className="w-full md:w-auto bg-accent text-accent-foreground">
            <Brain className="h-4 w-4 mr-2" /> {isLoadingLearningAnalysis ? "分析生成中..." : "生成學習分析報告"}
          </Button>
           {learningAnalysisError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>分析錯誤</AlertTitle>
              <AlertDescription>{learningAnalysisError}</AlertDescription>
            </Alert>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-primary">文本主題掌握度 (模擬)</h4>
              <div className="aspect-[16/7] w-full bg-muted/30 rounded-md p-2" data-ai-hint="knowledge graph topic">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cognitiveHeatmapData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground)/0.7)" fontSize={10} />
                    <YAxis stroke="hsl(var(--foreground)/0.7)" fontSize={10}/>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                        borderRadius: 'var(--radius)',
                        fontSize: '12px'
                      }}
                      labelStyle={{ color: 'hsl(var(--primary))', marginBottom: '4px' }}
                      itemStyle={{ color: 'hsl(var(--foreground)/0.8)' }}
                    />
                    <Bar dataKey="mastery" name="掌握度" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {learningAnalysis?.cognitiveHeatmap && <p className="text-xs mt-2 text-foreground/80 p-2 bg-muted/20 rounded border border-border/30">{learningAnalysis.cognitiveHeatmap}</p>}
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">每日閱讀進度 (模擬)</h4>
              <div className="aspect-[16/7] w-full bg-muted/30 rounded-md p-2" data-ai-hint="reading progress chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={readingTrajectoryData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                    <XAxis dataKey="day" stroke="hsl(var(--foreground)/0.7)" fontSize={10} />
                    <YAxis stroke="hsl(var(--foreground)/0.7)" fontSize={10} />
                    <Tooltip
                       contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                        borderRadius: 'var(--radius)',
                        fontSize: '12px'
                      }}
                      labelStyle={{ color: 'hsl(var(--primary))', marginBottom: '4px' }}
                      itemStyle={{ color: 'hsl(var(--foreground)/0.8)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', color: 'hsl(var(--foreground)/0.7)', paddingTop: '4px' }}/>
                    <Line type="monotone" dataKey="chapters" name="閱讀章數" stroke="hsl(var(--chart-3))" strokeWidth={2} activeDot={{ r: 5 }} dot={{ fill: 'hsl(var(--chart-3))', r:2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {learningAnalysis && (
            <Card className="mt-4 bg-card/50 p-4" style={{border: '1px solid hsl(var(--border))'}}>
              <CardTitle className="text-lg font-artistic text-primary mb-2">AI 個性化學習建議</CardTitle>
              <ScrollArea className="h-40 text-sm text-foreground/80 space-y-2 pr-2">
                {learningAnalysis.comprehensionDeviations && (
                  <div>
                    <h5 className="font-semibold text-foreground/90 flex items-center gap-1"><BarChartHorizontalBig className="h-4 w-4 text-accent" />理解偏差提醒:</h5>
                    <p className="pl-5">{learningAnalysis.comprehensionDeviations}</p>
                  </div>
                )}
                {learningAnalysis.recommendations && (
                  <div className="mt-2">
                    <h5 className="font-semibold text-foreground/90 flex items-center gap-1"><Lightbulb className="h-4 w-4 text-accent" />學習策略優化:</h5>
                    <p className="pl-5">{learningAnalysis.recommendations}</p>
                  </div>
                )}
              </ScrollArea>
              <p className="text-xs text-muted-foreground mt-3 text-center">(此處未來可融入學習倦怠預警、適應性路徑調整等更多AI分析結果)</p>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

