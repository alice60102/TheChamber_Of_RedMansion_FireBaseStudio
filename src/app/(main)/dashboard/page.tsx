
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BookOpen, Activity, BarChart3, TrendingUp, Target, Edit3, ListChecks, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/hooks/useLanguage';

// Example goals for dashboard display (can be replaced with actual data)
const getExampleUserGoals = (t: (key: string) => string) => [
  { id: "d1", text: t('dashboard.myLearningGoalsDesc'), isAchieved: true }, // Example, adjust key
  { id: "d2", text: "理解主要人物（寶、黛、釵）的性格特點", isAchieved: false }, // Keep some Chinese for context
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

interface RecentActivityItem {
  id: string;
  title: string;
  author: string;
  progress: number;
  current: boolean;
  readLink: string;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [completedChapters, setCompletedChapters] = useState(20);
  const totalChapters = 120;
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const exampleUserGoals = getExampleUserGoals(t);


  useEffect(() => {
    const targetProgressForDasharray = (completedChapters / totalChapters) * 100;
    
    let startTimestamp: number | null = null;
    const animationDuration = 1500; 

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
    { value: "75%", label: t('dashboard.avgUnderstanding'), icon: TrendingUp },
    { value: "35 小時", label: t('dashboard.totalLearningTime'), icon: Activity }, // "小時" can be part of translation if needed
    { value: "5 篇", label: t('dashboard.notesCount'), icon: Edit3 }, // "篇"
    { value: "8 個", label: t('dashboard.goalsAchieved'), icon: Target }, // "個"
  ];

  const recentActivityData: RecentActivityItem[] = [
    { id: "hlm-gengchen", title: "紅樓夢 (庚辰本校注)", author: "曹雪芹", progress: 75, current: true, readLink: "/read-book" },
    { id: "jiangxun-youth", title: "蔣勳說紅樓夢青春版", author: "蔣勳", progress: 50, current: false, readLink: "#" },
    { id: "hlm-chengjia", title: "紅樓夢 (程甲本影印)", author: "[清] 曹雪芹 高鶚", progress: 90, current: false, readLink: "#" },
    { id: "baixianyong-detailed", title: "白先勇細說紅樓夢", author: "白先勇", progress: 20, current: false, readLink: "#" },
    { id: "oulijuan-sixviews", title: "歐麗娟 六觀紅樓(綜論卷)", author: "歐麗娟", progress: 60, current: false, readLink: "#" },
  ];

  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 py-6">
      <Card className="h-[300px] p-6 shadow-xl hover:shadow-primary/20 transition-shadow">
        <div className="flex h-full items-center">
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
                <span className="text-sm text-muted-foreground">/ {totalChapters} {t('dashboard.chaptersCompleted')}</span>
              </div>
            </div>
            <p className="mt-3 text-lg font-semibold text-foreground">{t('dashboard.learningOverview')}</p>
          </div>
          <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-4 pl-6">
            {statsData.map(stat => (
              <StatCard key={stat.label} value={stat.value} label={stat.label} icon={stat.icon} />
            ))}
          </div>
        </div>
      </Card>

      <Card className="shadow-xl hover:shadow-primary/20 transition-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-artistic text-primary">{t('dashboard.recentReading')}</CardTitle>
          <CardDescription>{t('dashboard.recentReadingDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-4 pb-4">
              {recentActivityData.map(item => (
                <Card 
                  key={item.id} 
                  className={cn(
                    "w-[200px] h-[150px] shrink-0 overflow-hidden flex flex-col group transition-all duration-300 ease-in-out hover:shadow-lg",
                    item.current ? 'border-2 border-primary shadow-primary/30' : 'border-border'
                  )}
                >
                  <Link href={item.readLink} className="block h-full">
                    <CardContent className="p-0 h-full flex flex-col">
                      <div className="h-[80px] relative overflow-hidden bg-muted/30 flex items-center justify-center rounded-t-md">
                        <i className="fa fa-book text-5xl text-primary/60" aria-hidden="true"></i>
                        {item.current && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-sm shadow">{t('dashboard.continueReading')}</div>
                        )}
                      </div>
                      <div className="p-3 flex flex-col flex-grow justify-between bg-card">
                        <div>
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors" title={item.title}>{item.title}</p>
                          <p className="text-xs text-muted-foreground truncate" title={item.author}>{item.author}</p>
                        </div>
                        <Progress value={item.progress} className="h-1 w-full mt-1" indicatorClassName={item.current ? "bg-primary" : "bg-secondary"} />
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
      
      <Card className="shadow-xl hover:shadow-primary/20 transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-artistic text-primary flex items-center">
            <ListChecks className="h-6 w-6 mr-2" />
            {t('dashboard.myLearningGoals')}
          </CardTitle>
          <CardDescription>{t('dashboard.myLearningGoalsDesc')}</CardDescription>
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
                <Link href="/achievements">{t('dashboard.manageAllGoals')} &rarr;</Link> 
                {/* Assuming goals management is part of achievements page now */}
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
