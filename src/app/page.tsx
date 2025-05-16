
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Edit3, Users, ArrowRight, Lightbulb, Target, Library } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            {/* Replace with an actual logo if available */}
            {/* <ScrollText className="h-8 w-8 text-primary" /> */}
            <span className="text-2xl font-artistic font-bold text-primary">紅樓慧讀</span>
          </Link>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">登入</Link>
            </Button>
            <Button variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <Link href="/register">註冊</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <div
            aria-hidden="true"
            className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
          >
            <div className="h-56 bg-gradient-to-br from-primary to-purple-400 blur-[106px] dark:from-primary-darker"></div>
            <div className="h-32 bg-gradient-to-r from-accent to-pink-400 blur-[106px] dark:to-pink-600"></div>
          </div>
           <Image
            src="https://placehold.co/1920x800.png?tint=2E0A0A,932121"
            alt="紅樓夢藝術背景"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 -z-10 opacity-20"
            data-ai-hint="chinese classical art"
          />
          <div className="container relative mx-auto px-6 text-center">
            <h1 className="text-4xl font-artistic font-bold text-foreground md:text-6xl leading-tight">
              智能引航，重煥<span className="text-primary/80">紅樓</span>之夢
            </h1>
            <p className="mt-6 text-lg text-foreground/80 md:text-xl">
              深入探索《紅樓夢》的宏大世界。借助 AI 賦能的互動工具、情境分析與寫作輔導，開啟您的智慧閱讀之旅。
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/dashboard">開始學習 <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent" asChild>
                <Link href="#features">了解更多</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-background/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-artistic font-bold text-foreground md:text-4xl">核心功能</h2>
              <p className="mt-4 text-lg text-foreground/70">
                專為《紅樓夢》愛好者與學習者打造的強大工具
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: BookOpen,
                  title: "章回文本閱讀",
                  description: "優雅呈現《紅樓夢》原文，支持沉浸式閱讀體驗。",
                },
                {
                  icon: Users,
                  title: "互動人物圖譜",
                  description: "AI 生成人物關係圖，助您梳理複雜的人物網絡。",
                },
                {
                  icon: Edit3,
                  title: "智能寫作輔導",
                  description: "從結構引導到表達優化，AI 教練全程陪伴您的寫作。",
                },
                {
                  icon: Lightbulb,
                  title: "情境連結現代",
                  description: "發掘經典主題與當代社會的共鳴，拓展思考維度。",
                },
                {
                  icon: Target,
                  title: "個性化目標",
                  description: "AI 輔助生成學習目標，定制您的專屬學習路徑。",
                },
                {
                  icon: Library,
                  title: "深度專題研究",
                  description: "提供研究框架與工具，引導您進行深度文本探究。",
                },
              ].map((feature) => (
                <Card key={feature.title} className="bg-card/80 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="items-center text-center">
                    <div className="mb-4 rounded-full bg-accent/20 p-3">
                      <feature.icon className="h-8 w-8 text-accent" />
                    </div>
                    <CardTitle className="font-artistic text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-artistic font-bold text-foreground md:text-4xl">
              準備好開啟您的紅樓之旅了嗎？
            </h2>
            <p className="mt-4 text-lg text-foreground/70">
              立即註冊，體驗 AI 時代的古典文學學習新範式。
            </p>
            <div className="mt-8">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                <Link href="/register">免費註冊 <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-background py-8 text-center text-sm text-foreground/60">
        <p>&copy; {new Date().getFullYear()} 紅樓慧讀. 版權所有.</p>
        <p className="mt-1">一個充滿熱情的項目，旨在弘揚中華文化。</p>
      </footer>
    </div>
  );
}
