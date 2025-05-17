
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Edit3, Target, Activity, BarChart3, Users } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-artistic font-bold tracking-tight text-foreground">儀表板</h1>
          <p className="text-muted-foreground">歡迎回來！這是您的學習進度概覽。</p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">開始新的學習</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">當前閱讀</CardTitle>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div>
              <div className="text-2xl font-bold font-artistic">紅樓夢 - 第五回</div>
              <p className="text-xs text-muted-foreground">
                遊幻境指迷十二釵 飲仙醪曲演紅樓夢
              </p>
              <Button variant="link" className="px-0 text-primary hover:text-primary/80 mt-2" asChild>
                <Link href="/read">繼續閱讀 &rarr;</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">學習目標 (示例)</CardTitle>
            <Target className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div>
              <div className="text-2xl font-bold font-artistic">完成前十章節</div>
              <p className="text-xs text-muted-foreground">
                已完成 40%
              </p>
               {/* Removed Button Link Here */}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
        <CardHeader>
          <CardTitle className="font-artistic">近期活動</CardTitle>
          <CardDescription>您最近的學習記錄和互動。</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <span className="text-sm">完成了 "第四回" 測驗，得分 85%。</span>
              <span className="ml-auto text-xs text-muted-foreground">2 小時前</span>
            </li>
            <li className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <span className="text-sm">閱讀時長達到 5 小時。</span>
              <span className="ml-auto text-xs text-muted-foreground">3 天前</span>
            </li>
             <li className="flex items-center gap-3">
              <Edit3 className="h-5 w-5 text-accent" />
              <span className="text-sm">提交了關於 "金陵十二釵判詞" 的初步筆記。</span>
              <span className="ml-auto text-xs text-muted-foreground">4 天前</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
