
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BookOpen, Activity, BarChart3, TrendingUp, Target, Edit3, ListChecks, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

// Example goals for dashboard display (can be replaced with actual data)
const exampleUserGoals = [
  { id: "d1", text: "完成《紅樓夢》前二十回閱讀", isAchieved: true },
  { id: "d2", text: "理解主要人物（寶、黛、釵）的性格特點", isAchieved: false },
  { id: "d3", text: "整理金陵十二釵判詞筆記", isAchieved: false },
];

interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon: Icon }) => (
  <Card className="w-[120px] h-[80px] bg-card flex flex-col items-center justify-center p-2 transition-transform hover:scale-105 focus:scale-105 cursor-pointer shadow-md">
    {Icon && <Icon className="h-5 w-5 mb-1 text-primary" />}
    <h2 className="text-xl font-semibold text-primary">{value}</h2>
    <p className="text-xs text-muted-foreground text-center">{label}</p>
  </Card>
);

interface RecentChapter {
  id: number;
  title: string;
  progress: number;
  current: boolean;
  thumbnail: string;
  thumbnailHint: string;
}

export default function DashboardPage() {
  const [completedChapters, setCompletedChapters] = useState(20);
  const totalChapters = 120;
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const circumference = 2 * Math.PI * 15.9155; // Radius of the circle path
    const targetOffset = circumference - (completedChapters / totalChapters) * circumference;
    
    // For stroke-dasharray animation
    const targetProgressForDasharray = (completedChapters / totalChapters) * 100;
    
    // Animate the progress value for strokeDasharray
    let startTimestamp: number | null = null;
    const animationDuration = 1500; // 1.5 seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min((elapsed / animationDuration) * targetProgressForDasharray, targetProgressForDasharray);
      setAnimatedProgress(progress);
      if (elapsed < animationDuration) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);

  }, [completedChapters, totalChapters]);

  const statsData: StatCardProps[] = [
    { value: "75%", label: "平均理解度", icon: TrendingUp },
    { value: "35 小時", label: "總學習時長", icon: Activity },
    { value: "5 篇", label: "筆記數量", icon: Edit3 },
    { value: "8 個", label: "已達目標", icon: Target },
  ];

  const recentChaptersData: RecentChapter[] = [
    { id: 1, title: "第一回 甄士隱夢幻識通靈", progress: 100, current: false, thumbnail: "https://placehold.co/200x80.png", thumbnailHint: "classical chinese art" },
    { id: 2, title: "第二回 賈夫人仙逝揚州城", progress: 100, current: false, thumbnail: "https://placehold.co/200x80.png", thumbnailHint: "traditional chinese story" },
    { id: 3, title: "第三回 金陵城起復賈雨村", progress: 75, current: false, thumbnail: "https://placehold.co/200x80.png", thumbnailHint: "chapter scene illustration" },
    { id: 4, title: "第四回 薄命女偏逢薄命郎", progress: 90, current: false, thumbnail: "https://placehold.co/200x80.png", thumbnailHint: "book chapter art" },
    { id: 5, title: "第五回 遊幻境指迷十二釵", progress: 60, current: true, thumbnail: "https://placehold.co/200x80.png", thumbnailHint: "literary theme" },
    { id: 6, title: "第六回 賈寶玉初試雲雨情", progress: 20, current: false, thumbnail: "https://placehold.co/200x80.png", thumbnailHint: "character illustration" },
  ];

  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 py-6">
      {/* Learning Progress Overview Block */}
      <Card className="h-[300px] p-6 shadow-xl hover:shadow-primary/20 transition-shadow">
        <div className="flex h-full items-center">
          {/* Progress Ring (Left Side) */}
          <div className="w-1/2 flex flex-col items-center justify-center pr-6 border-r border-border/50">
            <div className="relative w-[180px] h-[180px]">
              <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90)">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'hsl(var(--secondary))', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  className="stroke-muted fill-none"
                  strokeWidth="2.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  className="fill-none"
                  stroke="url(#progressGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${(animatedProgress / 100) * circumference}, ${circumference}`}
                  style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{completedChapters}</span>
                <span className="text-sm text-muted-foreground">/ {totalChapters} 章</span>
              </div>
            </div>
            <p className="mt-3 text-lg font-semibold text-foreground">學習總覽</p>
          </div>

          {/* Stats Cards (Right Side) */}
          <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-4 pl-6">
            {statsData.map(stat => (
              <StatCard key={stat.label} value={stat.value} label={stat.label} icon={stat.icon} />
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Reading Activity Block */}
      <Card className="shadow-xl hover:shadow-primary/20 transition-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-artistic text-primary">最近閱讀活動</CardTitle>
          <CardDescription>快速返回您上次閱讀的章節，或回顧最近的學習內容。</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-4 pb-4">
              {recentChaptersData.map(chapter => (
                <Card 
                  key={chapter.id} 
                  className={cn(
                    "w-[200px] h-[150px] shrink-0 overflow-hidden flex flex-col group transition-all duration-300 ease-in-out hover:shadow-lg",
                    chapter.current ? 'border-2 border-primary shadow-primary/30' : 'border-border'
                  )}
                >
                  <Link href="/read" className="block h-full">
                    <CardContent className="p-0 h-full flex flex-col">
                      <div className="h-[80px] relative overflow-hidden">
                        <Image 
                          src={chapter.thumbnail} 
                          alt={chapter.title} 
                          width={200} 
                          height={80} 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          data-ai-hint={chapter.thumbnailHint} 
                        />
                        {chapter.current && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-sm shadow">繼續閱讀</div>
                        )}
                      </div>
                      <div className="p-3 flex flex-col flex-grow justify-between bg-card">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{chapter.title}</p>
                        <Progress value={chapter.progress} className="h-1 w-full mt-1" indicatorClassName={chapter.current ? "bg-primary" : "bg-secondary"} />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Placeholder for User-Set Goals - similar to old dashboard but styled consistently */}
      <Card className="shadow-xl hover:shadow-primary/20 transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-artistic text-primary flex items-center">
            <ListChecks className="h-6 w-6 mr-2" />
            我的學習目標 (示例)
          </CardTitle>
          <CardDescription>追蹤您的個人學習目標，保持學習動力。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exampleUserGoals.map(goal => (
              <div key={goal.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                {goal.isAchieved ? <CheckSquare className="h-5 w-5 text-green-500" /> : <Square className="h-5 w-5 text-muted-foreground" />}
                <span className={cn("text-sm", goal.isAchieved ? 'line-through text-muted-foreground' : 'text-foreground')}>
                  {goal.text}
                </span>
              </div>
            ))}
             <Button variant="link" className="px-0 text-primary hover:text-primary/80 mt-2 text-sm" asChild>
                <Link href="/goals">管理所有目標 &rarr;</Link>
              </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
