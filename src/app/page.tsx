
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingDown, BookLock, Puzzle, Award, Lightbulb, Library, ScrollText, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Language = 'zh-TW' | 'zh-CN' | 'en-US';

const LANGUAGES: Record<Language, string> = {
  'zh-TW': '繁體中文',
  'zh-CN': '简体中文',
  'en-US': 'English (US)',
};

const translations = {
  'zh-TW': {
    pageTitle: '紅樓慧讀',
    navHome: '主頁',
    navFeatures: '特色',
    navSolutions: '主要功能',
    heroTitlePart1: '智能引航，重煥',
    heroTitleHighlight: '紅樓',
    heroTitlePart2: '之夢',
    heroSubtitle: '深入探索《紅樓夢》的宏大世界。借助 AI 賦能的文本分析、學習狀況洞察與深度研究工具，開啟您的智慧閱讀之旅。',
    heroButtonStart: '開始學習',
    heroButtonLearnMore: '了解更多',
    challengesTitle: '經典閱讀的挑戰',
    challengesSubtitle: '《紅樓夢》雖為不朽巨著，然其深奧的文化內涵與複雜的人物脈絡，常使現代讀者望而卻步。',
    painPoint1Title: '學習動力難持續',
    painPoint1Desc: '超過七成讀者曾在閱讀古典文學時中途放棄，因缺乏持續動力與成就感。面對傳統線性閱讀，易感孤獨無助。',
    painPoint2Title: '理解門檻高遠',
    painPoint2Desc: '近半數讀者反映《紅樓夢》人物關係複雜、文化背景艱澀難懂。理解劉姥姥進大觀園、寶黛釵情感糾葛等，如同攀登文化高峰。',
    painPoint3Title: '專業資源難整合',
    painPoint3Desc: '權威解讀與學術資源雖多，但分布零散，無法在閱讀當下即時輔助，也缺乏系統化學習指導，難建清晰理解框架。',
    solutionsTitle: '紅樓慧讀：智能方案',
    solutionsSubtitle: '我們運用 AI 技術，打造互動化、個性化的學習體驗，助您輕鬆跨越閱讀障礙，領略經典魅力。',
    solution1Title: '點燃持續動力',
    solution1Desc: '採用遊戲化學習設計，將閱讀化為任務。透過成就徽章、進度追蹤、個性化目標与即時回饋，打造闖關般的愉悅體驗。',
    solution2Title: 'AI 降低理解門檻',
    solution2Desc: '整合先進語言模型與紅學知識庫。提供上下文詞義解析、文化背景補充、互動人物圖譜、選字即問及AI音韻朗讀，全面提升理解。',
    solution3Title: 'AI 整合專業內容',
    solution3Desc: '彙整名家學者解讀（如白先勇、蔣勳）為訓練資料，建立「章節對應專家觀點」機制，讓您即時參照權威見解，深化理解。',
    ctaTitle: '準備好開啟您的紅樓之旅了嗎？',
    ctaSubtitle: '立即註冊，體驗 AI 時代的古典文學學習新範式。',
    ctaButton: '免費註冊',
    footerSlogan: 'AI 賦能，重探紅樓之夢。您的智能《紅樓夢》學習夥伴。',
    footerRights: '© 2024 紅樓慧讀團隊. All Rights Reserved.',
  },
  'zh-CN': {
    pageTitle: '红楼慧读',
    navHome: '主页',
    navFeatures: '特色',
    navSolutions: '主要功能',
    heroTitlePart1: '智能引航，重焕',
    heroTitleHighlight: '红楼',
    heroTitlePart2: '之梦',
    heroSubtitle: '深入探索《红楼梦》的宏大世界。借助 AI 赋能的文本分析、学习状况洞察与深度研究工具，开启您的智慧阅读之旅。',
    heroButtonStart: '开始学习',
    heroButtonLearnMore: '了解更多',
    challengesTitle: '经典阅读的挑战',
    challengesSubtitle: '《红楼梦》虽为不朽巨著，然其深奥的文化内涵与复杂的人物脉络，常使现代读者望而却步。',
    painPoint1Title: '学习动力难持续',
    painPoint1Desc: '超过七成读者曾在阅读古典文学时中途放弃，因缺乏持续动力与成就感。面对传统线性阅读，易感孤独无助。',
    painPoint2Title: '理解门槛高远',
    painPoint2Desc: '近半数读者反映《红楼梦》人物关系复杂、文化背景艰涩难懂。理解刘姥姥进大观园、宝黛钗情感纠葛等，如同攀登文化高峰。',
    painPoint3Title: '专业资源难整合',
    painPoint3Desc: '权威解读与学术资源虽多，但分布零散，无法在阅读当下即时辅助，也缺乏系统化学习指导，难建清晰理解框架。',
    solutionsTitle: '红楼慧读：智能方案',
    solutionsSubtitle: '我们运用 AI 技术，打造互动化、个性化的学习体验，助您轻松跨越阅读障碍，领略经典魅力。',
    solution1Title: '点燃持续动力',
    solution1Desc: '采用游戏化学习设计，将阅读化为任务。通过成就徽章、进度追踪、个性化目标与即时回馈，打造闯关般的愉悦体验。',
    solution2Title: 'AI 降低理解门槛',
    solution2Desc: '整合先进语言模型与红学知识库。提供上下文词义解析、文化背景补充、互动人物图谱、选字即问及AI音韵朗读，全面提升理解。',
    solution3Title: 'AI 整合专业内容',
    solution3Desc: '汇整名家学者解读（如白先勇、蒋勋）为训练资料，建立「章节对应专家观点」机制，让您即时参照权威见解，深化理解。',
    ctaTitle: '准备好开启您的红楼之旅了吗？',
    ctaSubtitle: '立即注册，体验 AI 时代的古典文学学习新范式。',
    ctaButton: '免费注册',
    footerSlogan: 'AI 赋能，重探红楼之梦。您的智能《红楼梦》学习伙伴。',
    footerRights: '© 2024 红楼慧读团队. All Rights Reserved.',
  },
  'en-US': {
    pageTitle: 'IntelliRedChamber',
    navHome: 'Home',
    navFeatures: 'Features',
    navSolutions: 'Solutions',
    heroTitlePart1: 'Intelligent Guidance, Reviving the ',
    heroTitleHighlight: 'Red Chamber',
    heroTitlePart2: ' Dream',
    heroSubtitle: 'Deeply explore the grand world of "Dream of the Red Chamber". Leverage AI-powered text analysis, learning insights, and in-depth research tools to embark on your intelligent reading journey.',
    heroButtonStart: 'Start Learning',
    heroButtonLearnMore: 'Learn More',
    challengesTitle: 'Challenges of Reading Classics',
    challengesSubtitle: '"Dream of the Red Chamber", though an immortal masterpiece, often daunts modern readers with its profound cultural connotations and complex character relationships.',
    painPoint1Title: 'Difficulty Sustaining Motivation',
    painPoint1Desc: 'Over 70% of readers abandon classical literature midway due to a lack of sustained motivation and a sense of accomplishment, often feeling isolated in traditional linear reading.',
    painPoint2Title: 'High Comprehension Barriers',
    painPoint2Desc: 'Nearly half of readers find the intricate character relationships and obscure cultural background of "Dream of the Red Chamber" difficult to understand, like scaling a cultural peak.',
    painPoint3Title: 'Fragmented Expert Resources',
    painPoint3Desc: 'Authoritative interpretations and academic resources are abundant but scattered, failing to provide real-time assistance during reading and lacking systematic guidance for a clear understanding.',
    solutionsTitle: 'IntelliRedChamber: Smart Solutions',
    solutionsSubtitle: 'We use AI technology to create interactive and personalized learning experiences, helping you overcome reading barriers and appreciate the charm of classics.',
    solution1Title: 'Ignite Sustained Motivation',
    solution1Desc: 'Employ gamified learning design, turning reading into missions. Achievement badges, progress tracking, personalized goals, and instant feedback create an enjoyable quest-like experience.',
    solution2Title: 'AI Lowers Comprehension Barriers',
    solution2Desc: 'Integrate advanced language models with a Redology knowledge base. Provides contextual word sense disambiguation, cultural background supplements, interactive character maps, and AI-powered phonetic reading.',
    solution3Title: 'AI Consolidates Expert Content',
    solution3Desc: 'Compile interpretations from renowned scholars (e.g., Bai Xianyong, Jiang Xun) as training data, establishing a "chapter-to-expert-viewpoint" mechanism for instant reference to authoritative insights.',
    ctaTitle: 'Ready to Begin Your Red Chamber Journey?',
    ctaSubtitle: 'Register now and experience a new paradigm for learning classical literature in the AI era.',
    ctaButton: 'Register for Free',
    footerSlogan: 'AI-powered, re-exploring the Dream of the Red Chamber. Your intelligent "Dream of the Red Chamber" learning companion.',
    footerRights: '© 2024 IntelliRedChamber Team. All Rights Reserved.',
  },
};

export default function HomePage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('zh-TW');
  const t = translations[currentLanguage];

  const painPoints = [
    {
      icon: TrendingDown,
      title: t.painPoint1Title,
      description: t.painPoint1Desc,
    },
    {
      icon: BookLock,
      title: t.painPoint2Title,
      description: t.painPoint2Desc,
    },
    {
      icon: Puzzle,
      title: t.painPoint3Title,
      description: t.painPoint3Desc,
    },
  ];

  const solutions = [
    {
      icon: Award,
      title: t.solution1Title,
      description: t.solution1Desc,
    },
    {
      icon: Lightbulb,
      title: t.solution2Title,
      description: t.solution2Desc,
    },
    {
      icon: Library,
      title: t.solution3Title,
      description: t.solution3Desc,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 ml-4">
            <ScrollText className="h-7 w-7 text-primary" />
            <span className="text-xl font-artistic font-bold text-white">{t.pageTitle}</span>
          </Link>
          <nav className="flex items-center space-x-1 md:space-x-2 mr-4">
            <Button variant="ghost" asChild className="text-xs sm:text-sm font-medium text-foreground/80 hover:text-foreground px-2 sm:px-3">
              <Link href="/">{t.navHome}</Link>
            </Button>
            <Button variant="ghost" asChild className="text-xs sm:text-sm font-medium text-foreground/80 hover:text-foreground px-2 sm:px-3">
              <Link href="#challenges">{t.navFeatures}</Link>
            </Button>
            <Button variant="ghost" asChild className="text-xs sm:text-sm font-medium text-foreground/80 hover:text-foreground px-2 sm:px-3">
              <Link href="#solutions">{t.navSolutions}</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-xs sm:text-sm font-medium text-foreground/70 hover:text-foreground px-2 sm:px-3">
                  {LANGUAGES[currentLanguage]}
                  <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(LANGUAGES) as Language[]).map((langCode) => (
                  <DropdownMenuItem
                    key={langCode}
                    onSelect={() => setCurrentLanguage(langCode)}
                    disabled={currentLanguage === langCode}
                  >
                    {LANGUAGES[langCode]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
           <Image
            src="https://placehold.co/1920x800.png?tint=2E0A0A,932121" // Base red background
            alt="紅樓夢藝術背景底色"
            fill
            priority
            quality={75}
            className="absolute inset-0 -z-20 object-cover opacity-30" 
            data-ai-hint="red texture"
          />
          <Image
            src="https://sc0.blr1.digitaloceanspaces.com/large/876203-87586-yybgacqder-1524133512.jpg" // New overlay image
            alt="紅樓夢古典繪畫疊加背景"
            fill
            quality={75}
            className="absolute inset-0 -z-10 object-cover opacity-50"
            data-ai-hint="chinese classical painting"
          />
          <div className="container relative z-0 mx-auto px-6 text-center">
            <h1 className="text-4xl font-artistic font-bold text-white md:text-6xl leading-tight">
              {t.heroTitlePart1}
              <span className="text-primary">{t.heroTitleHighlight}</span>
              {currentLanguage === 'en-US' ? t.heroTitlePart2 : ''} 
              {currentLanguage !== 'en-US' && t.heroTitlePart2}
            </h1>
            <p className="mt-6 text-lg text-foreground/80 md:text-xl max-w-3xl mx-auto">
              {t.heroSubtitle}
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/dashboard">{t.heroButtonStart} <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent" asChild>
                <Link href="#challenges">{t.heroButtonLearnMore}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Challenges Section */}
        <section id="challenges" className="py-16 md:py-24 bg-card/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-artistic font-bold text-white md:text-4xl">{t.challengesTitle}</h2>
              <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
                {t.challengesSubtitle}
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
              <h2 className="text-3xl font-artistic font-bold text-white md:text-4xl">{t.solutionsTitle}</h2>
              <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
                {t.solutionsSubtitle}
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
              {t.ctaTitle}
            </h2>
            <p className="mt-4 text-lg text-foreground/70 max-w-xl mx-auto">
              {t.ctaSubtitle}
            </p>
            <div className="mt-8">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                <Link href="/register">{t.ctaButton} <ArrowRight className="ml-2 h-5 w-5" /></Link>
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
                <span className="text-lg font-artistic font-bold text-white">{t.pageTitle}</span>
              </Link>
              <p className="text-sm">{t.footerSlogan}</p>
            </div>
            <div className="text-sm">
            </div>
          </div>
          <div className="mt-8 border-t border-border/40 pt-6 text-center text-xs">
            <p>{t.footerRights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
