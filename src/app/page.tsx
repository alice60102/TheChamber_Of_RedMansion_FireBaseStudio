
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingDown, BookLock, Puzzle, Award, Lightbulb, Library } from 'lucide-react';
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
      title: "AI 點燃持續動力",
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
            <span className="text-2xl font-artistic font-bold text-white">紅樓慧讀</span>
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
            <h1 className="text-4xl font-artistic font-bold text-white md:text-6xl leading-tight">
              智能引航，重煥<span className="text-white">紅樓</span>之夢
            </h1>
            <p className="mt-6 text-lg text-foreground/80 md:text-xl">
              深入探索《紅樓夢》的宏大世界。借助 AI 賦能的文本分析、學習狀況洞察與深度研究工具，開啟您的智慧閱讀之旅。
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/dashboard">開始學習 <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent" asChild>
                <Link href="#challenges-solutions">了解更多</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Challenges and Solutions Section */}
        <section id="challenges-solutions" className="py-16 md:py-24 bg-background/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-artistic font-bold text-foreground md:text-4xl">深入經典，不再卻步</h2>
              <p className="mt-4 text-lg text-foreground/70">
                「紅樓慧讀」如何化解您閱讀《紅樓夢》的常見障礙
              </p>
            </div>

            <div className="mb-16">
              <h3 className="text-2xl font-artistic font-semibold text-center text-primary mb-8">您是否也遇到這些《紅樓夢》閱讀挑戰？</h3>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {painPoints.map((item) => (
                  <Card key={item.title} className="bg-card/80 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                    <CardHeader className="items-center text-center">
                      <div className="mb-4 rounded-full bg-destructive/10 p-3">
                        <item.icon className="h-8 w-8 text-destructive" />
                      </div>
                      <CardTitle className="font-artistic text-xl text-white">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center flex-grow">
                      <CardDescription className="text-foreground/70">{item.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-artistic font-semibold text-center text-primary mb-8">「紅樓慧讀」的智能解決方案</h3>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {solutions.map((item) => (
                  <Card key={item.title} className="bg-card/80 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                    <CardHeader className="items-center text-center">
                      <div className="mb-4 rounded-full bg-accent/20 p-3">
                        <item.icon className="h-8 w-8 text-accent" />
                      </div>
                      <CardTitle className="font-artistic text-xl text-white">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center flex-grow">
                      <CardDescription className="text-foreground/70">{item.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
        <p>參加「113-2 數位人文創想競賽_高山文津_紅樓慧讀」</p>
      </footer>
    </div>
  );
}
