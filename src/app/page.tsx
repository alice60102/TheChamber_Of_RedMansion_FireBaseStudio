
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingDown, BookLock, Puzzle, Award, Lightbulb, Library, ScrollText } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const painPoints = [
    {
      icon: TrendingDown,
      title: "學習動力難持續",
      description: "超過七成讀者曾在閱讀古典文學時中途放棄，因缺乏持續動力與成就感。面對傳統線性閱讀，易感孤獨無助。",
    },
    {
      icon: BookLock,
      title: "理解門檻高遠",
      description: "近半數讀者反映《紅樓夢》人物關係複雜、文化背景艱澀。理解劉姥姥進大觀園、寶黛釵情感糾葛等，如同攀登文化高峰。",
    },
    {
      icon: Puzzle,
      title: "專業資源難整合",
      description: "權威解讀與學術資源雖多，但分布零散，無法在閱讀當下即時輔助，也缺乏系統化學習指導，難建清晰理解框架。",
    },
  ];

  const solutions = [
    {
      icon: Award,
      title: "點燃持續動力",
      description: "採用遊戲化學習設計，將閱讀化為任務。透過成就徽章、進度追蹤、個性化目標與即時回饋，打造闖關般的愉悅體驗。",
    },
    {
      icon: Lightbulb,
      title: "AI 降低理解門檻",
      description: "整合先進語言模型與紅學知識庫。提供上下文詞義解析、文化背景補充、互動人物圖譜、選字即問及AI音韻朗讀，全面提升理解。",
    },
    {
      icon: Library,
      title: "AI 整合專業內容",
      description: "彙整名家學者解讀（如白先勇、蔣勳）為訓練資料，建立「章節對應專家觀點」機制，讓您即時參照權威見解，深化理解。",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 ml-4">
            <ScrollText className="h-7 w-7 text-primary" />
            <span className="text-xl font-artistic font-bold text-white">紅樓慧讀</span>
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
           <Image
            src="https://placehold.co/1920x800.png?tint=2E0A0A,932121"
            alt="紅樓夢藝術背景"
            fill
            priority
            quality={75}
            className="absolute inset-0 -z-10 object-cover opacity-30"
            data-ai-hint="chinese classical art"
          />
          <div className="container relative mx-auto px-6 text-center">
            <h1 className="text-4xl font-artistic font-bold text-white md:text-6xl leading-tight">
              智能引航，重煥<span className="text-primary">紅樓</span>之夢
            </h1>
            <p className="mt-6 text-lg text-foreground/80 md:text-xl max-w-3xl mx-auto">
              深入探索《紅樓夢》的宏大世界。借助 AI 賦能的文本分析、學習狀況洞察與深度研究工具，開啟您的智慧閱讀之旅。
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/dashboard">開始學習 <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent" asChild>
                <Link href="#challenges">了解更多</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Challenges Section */}
        <section id="challenges" className="py-16 md:py-24 bg-card/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-artistic font-bold text-white md:text-4xl">經典閱讀的挑戰</h2>
              <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
                《紅樓夢》雖為不朽巨著，然其深奧的文化內涵與複雜的人物脈絡，常使現代讀者望而卻步。
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {painPoints.map((item) => (
                <Card key={item.title} className="bg-card/80 shadow-lg hover:shadow-primary/10 transition-shadow duration-300 flex flex-col">
                  <CardHeader className="items-center text-center">
                    <div className="mb-4 rounded-full bg-destructive/20 p-3 ring-1 ring-destructive/30">
                      <item.icon className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="font-artistic text-xl text-white">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center flex-grow">
                    <CardDescription className="text-foreground/70 text-sm">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-artistic font-bold text-white md:text-4xl">紅樓慧讀：智能方案</h2>
              <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
                我們運用 AI 技術，打造互動化、個性化的學習體驗，助您輕鬆跨越閱讀障礙，領略經典魅力。
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {solutions.map((item) => (
                <Card key={item.title} className="bg-card/80 shadow-lg hover:shadow-primary/10 transition-shadow duration-300 flex flex-col">
                  <CardHeader className="items-center text-center">
                    <div className="mb-4 rounded-full bg-accent/20 p-3 ring-1 ring-accent/30">
                      <item.icon className="h-8 w-8 text-accent" />
                    </div>
                    <CardTitle className="font-artistic text-xl text-white">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center flex-grow">
                    <CardDescription className="text-foreground/70 text-sm">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-24 bg-card/50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-artistic font-bold text-white md:text-4xl">
              準備好開啟您的紅樓之旅了嗎？
            </h2>
            <p className="mt-4 text-lg text-foreground/70 max-w-xl mx-auto">
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

      <footer className="border-t border-border/40 bg-background text-foreground/70">
        <div className="container mx-auto px-6 py-8">
          <div className="md:flex md:justify-between items-center text-center md:text-left">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                <ScrollText className="h-7 w-7 text-primary" />
                <span className="text-lg font-artistic font-bold text-white">紅樓慧讀</span>
              </Link>
              <p className="text-sm">AI 賦能，重探紅樓之夢。您的智能《紅樓夢》學習夥伴。</p>
            </div>
            <div className="text-sm">
              <p>參加「113-2 數位人文創想競賽_高山文津_紅樓慧讀」</p>
            </div>
          </div>
          <div className="mt-8 border-t border-border/40 pt-6 text-center text-xs">
            <p>&copy; 2024 紅樓慧讀團隊. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
