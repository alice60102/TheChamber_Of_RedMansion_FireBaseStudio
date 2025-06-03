
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Target, BookOpen, CalendarDays, CheckCircle, Users, Trophy, Share2, ShieldCheck, BarChart3, Edit, Settings2, ListChecks, Clock, Zap } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState } from "react";

// Placeholder Data
const achievedAchievementsData = [
  { id: "ach1", icon: Award, name: "初窺門徑", description: "完成《紅樓夢》第一回閱讀", date: "2024-05-10", points: 50, category: "閱讀進度" },
  { id: "ach2", icon: Star, name: "日積月累", description: "連續學習 7 天", date: "2024-05-15", points: 100, category: "學習習慣" },
  { id: "ach3", icon: BookOpen, name: "博覽群書", description: "閱讀 3 部專家解讀著作", date: "2024-06-01", points: 150, category: "知識廣度" },
  { id: "ach4", icon: ShieldCheck, name: "判詞解析者", description: "完成所有金陵十二釵判詞筆記", date: "2024-06-20", points: 200, category: "深度理解" },
];

const learningStatsData = {
  totalReadingTime: "42 小時",
  chaptersCompleted: 35,
  totalChapters: 120,
  notesTaken: 12,
  currentStreak: 10,
};

const achievableGoalsData = [
  { id: "goal1", icon: Target, name: "完成前四十回", description: "繼續您的閱讀旅程，完成《紅樓夢》前四十回。", currentProgress: 35, targetProgress: 40, unit: "回" },
  { id: "goal2", icon: CalendarDays, name: "持續學習獎章", description: "保持連續學習15天，解鎖新的獎章。", currentProgress: 10, targetProgress: 15, unit: "天" },
  { id: "goal3", icon: Edit, name: "筆記大師", description: "撰寫至少20篇有深度的閱讀筆記。", currentProgress: 12, targetProgress: 20, unit: "篇" },
];

const challengesData = {
  daily: [
    { id: "daily1", name: "今日閱讀挑戰", description: "今日閱讀《紅樓夢》30分鐘", reward: "20 成就點", active: true },
    { id: "daily2", name: "每日一問", description: "回答一個關於今日閱讀內容的問題", reward: "10 成就點", active: false },
  ],
  weekly: [
    { id: "weekly1", name: "本週章回衝刺", description: "本週完成3個章回的閱讀與筆記", reward: "100 成就點", active: true },
  ],
  special: [
    { id: "special1", name: "紅樓詩詞大賞", description: "參與《紅樓夢》詩詞賞析與創作活動", reward: "特殊徽章 + 200點", active: false },
  ],
};


export default function AchievementsPage() {
  const [userAchievements, setUserAchievements] = useState(achievedAchievementsData);
  // In a real app, you would fetch and manage these states

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-artistic text-primary">我的成就與目標</CardTitle>
              <CardDescription>追蹤您的學習成果，設定新目標，迎接挑戰，不斷進步。</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 我的成就 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-artistic text-white flex items-center gap-2"><Star className="text-yellow-400" /> 我獲得的成就</CardTitle>
          <CardDescription>記錄您在紅樓慧讀旅程中達成的每一個里程碑。</CardDescription>
        </CardHeader>
        <CardContent>
          {userAchievements.length > 0 ? (
            <ScrollArea className="h-[300px] w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
                {userAchievements.map((ach) => (
                  <Card key={ach.id} className="bg-card/60 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <ach.icon className="h-8 w-8 text-primary mt-1" />
                        <div>
                          <CardTitle className="text-lg text-white">{ach.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1 text-xs">{ach.category}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{ach.description}</p>
                      <p className="text-xs text-primary">獲得於：{ach.date} (+{ach.points}點)</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                       <Button variant="ghost" size="sm" onClick={() => alert(`分享成就：${ach.name} (功能示意)`)}>
                        <Share2 className="mr-1.5 h-3.5 w-3.5" /> 分享
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => alert(`查看 ${ach.name} 詳細資訊 (功能示意)`)}>
                        查看詳情
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground">您目前尚未獲得任何成就，繼續努力吧！</p>
          )}
        </CardContent>
      </Card>

      {/* 學習進度總覽 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-artistic text-white flex items-center gap-2"><BarChart3 className="text-blue-400" /> 學習進度總覽</CardTitle>
          <CardDescription>全面了解您的學習投入與成果。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-card/50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-primary">{learningStatsData.totalReadingTime}</p>
              <p className="text-sm text-muted-foreground">總閱讀時長</p>
            </div>
            <div className="bg-card/50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-primary">{learningStatsData.chaptersCompleted} <span className="text-base text-muted-foreground">/ {learningStatsData.totalChapters}</span></p>
              <p className="text-sm text-muted-foreground">已完成章回</p>
            </div>
            <div className="bg-card/50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-primary">{learningStatsData.notesTaken}</p>
              <p className="text-sm text-muted-foreground">筆記數量</p>
            </div>
            <div className="bg-card/50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-primary">{learningStatsData.currentStreak} 天</p>
              <p className="text-sm text-muted-foreground">連續學習</p>
            </div>
          </div>
          <div>
            <Label htmlFor="overallProgress" className="text-sm text-muted-foreground">整體閱讀進度</Label>
            <Progress 
              id="overallProgress"
              value={(learningStatsData.chaptersCompleted / learningStatsData.totalChapters) * 100} 
              className="w-full h-3 mt-1" 
              indicatorClassName="bg-gradient-to-r from-primary to-yellow-400"
            />
             <p className="text-xs text-right text-muted-foreground mt-1">
              {learningStatsData.chaptersCompleted} / {learningStatsData.totalChapters} 章回
            </p>
          </div>
           <div className="text-right">
            <Button variant="link" onClick={() => alert("查看詳細學習分析 (功能示意)")} className="text-primary">
              查看詳細學習分析 &rarr;
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 可達成的目標 / 設定新目標 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-artistic text-white flex items-center gap-2"><Target className="text-green-400" /> 下一步目標</CardTitle>
            <CardDescription>系統為您推薦或您正在進行的目標。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievableGoalsData.map(goal => (
              <Card key={goal.id} className="bg-card/60 p-4">
                <div className="flex items-start gap-3">
                  <goal.icon className="h-7 w-7 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">{goal.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">{goal.description}</p>
                    <Progress value={(goal.currentProgress / goal.targetProgress) * 100} className="h-2 mb-1" indicatorClassName="bg-green-500" />
                    <p className="text-xs text-muted-foreground">{goal.currentProgress} / {goal.targetProgress} {goal.unit}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <Button size="sm" variant="outline" onClick={() => alert(`開始或編輯目標：${goal.name} (功能示意)`)}>
                    {goal.currentProgress > 0 && goal.currentProgress < goal.targetProgress ? "繼續努力" : "開始目標"}
                  </Button>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-artistic text-white flex items-center gap-2"><Settings2 className="text-purple-400" /> 設定新的學習目標</CardTitle>
            <CardDescription>根據您的偏好，設定個人化的學習計畫。</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="w-full justify-start h-auto py-3 text-left" onClick={() => alert("設定每日閱讀時間 (功能示意)")}>
              <Clock className="mr-2 h-5 w-5 text-purple-400" />
              <div>
                <p className="font-medium">每日閱讀時間</p>
                <p className="text-xs text-muted-foreground">設定每天的閱讀時長</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-auto py-3 text-left" onClick={() => alert("設定章回完成目標 (功能示意)")}>
              <ListChecks className="mr-2 h-5 w-5 text-purple-400" />
              <div>
                <p className="font-medium">章回完成目標</p>
                <p className="text-xs text-muted-foreground">設定要完成的章回數量</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-auto py-3 text-left" onClick={() => alert("設定連續學習天數 (功能示意)")}>
              <CalendarDays className="mr-2 h-5 w-5 text-purple-400" />
              <div>
                <p className="font-medium">連續學習天數</p>
                <p className="text-xs text-muted-foreground">挑戰連續學習的紀錄</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-auto py-3 text-left" onClick={() => alert("設定閱讀正確率目標 (功能示意)")}>
              <CheckCircle className="mr-2 h-5 w-5 text-purple-400" />
               <div>
                <p className="font-medium">閱讀正確率</p>
                <p className="text-xs text-muted-foreground">提升對內容的理解準確度</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 學習挑戰賽 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-artistic text-white flex items-center gap-2"><Zap className="text-orange-400" /> 學習挑戰賽</CardTitle>
          <CardDescription>參與社群挑戰，與其他讀者一同進步，贏取獎勵。</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="daily">每日挑戰</TabsTrigger>
              <TabsTrigger value="weekly">週間挑戰</TabsTrigger>
              <TabsTrigger value="special">特別活動</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              {challengesData.daily.length > 0 ? (
                <div className="space-y-3">
                  {challengesData.daily.map(challenge => (
                    <Card key={challenge.id} className={`bg-card/60 p-4 ${challenge.active ? 'border-primary' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white">{challenge.name}</h4>
                          <p className="text-xs text-muted-foreground">{challenge.description}</p>
                          <p className="text-xs text-amber-400 mt-1">獎勵：{challenge.reward}</p>
                        </div>
                        <Button size="sm" variant={challenge.active ? "default" : "outline"} onClick={() => alert(`參與挑戰：${challenge.name} (功能示意)`)}>
                          {challenge.active ? "進行中" : "參與挑戰"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-center py-4">今日暫無挑戰。</p>}
            </TabsContent>
            <TabsContent value="weekly">
              {challengesData.weekly.length > 0 ? (
                 <div className="space-y-3">
                  {challengesData.weekly.map(challenge => (
                     <Card key={challenge.id} className={`bg-card/60 p-4 ${challenge.active ? 'border-primary' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white">{challenge.name}</h4>
                          <p className="text-xs text-muted-foreground">{challenge.description}</p>
                          <p className="text-xs text-amber-400 mt-1">獎勵：{challenge.reward}</p>
                        </div>
                        <Button size="sm" variant={challenge.active ? "default" : "outline"} onClick={() => alert(`參與挑戰：${challenge.name} (功能示意)`)}>
                          {challenge.active ? "進行中" : "參與挑戰"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-center py-4">本週暫無挑戰。</p>}
            </TabsContent>
            <TabsContent value="special">
              {challengesData.special.length > 0 ? (
                <div className="space-y-3">
                  {challengesData.special.map(challenge => (
                    <Card key={challenge.id} className={`bg-card/60 p-4 ${challenge.active ? 'border-primary' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white">{challenge.name}</h4>
                          <p className="text-xs text-muted-foreground">{challenge.description}</p>
                          <p className="text-xs text-amber-400 mt-1">獎勵：{challenge.reward}</p>
                        </div>
                        <Button size="sm" variant={challenge.active ? "default" : "outline"} onClick={() => alert(`參與挑戰：${challenge.name} (功能示意)`)}>
                          {challenge.active ? "進行中" : "查看活動"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-center py-4">目前尚無特別活動。</p>}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
