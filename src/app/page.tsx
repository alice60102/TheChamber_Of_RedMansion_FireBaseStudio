/**
 * @fileOverview Redesigned Homepage - Simplified Vertical Layout
 *
 * A clean, intuitive homepage design that showcases the Red Mansions study system
 * with Traditional Chinese as the primary language and clear feature presentation.
 *
 * Key Improvements:
 * - Simplified vertical scroll layout replacing complex horizontal design
 * - Prominent National Palace Museum header image integration
 * - Enhanced Traditional Chinese content and cultural aesthetics
 * - Clear feature highlighting with intuitive user flow
 * - Better visual hierarchy and reduced cognitive load
 * - Mobile-responsive design with elegant transitions
 */

"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import {
  ArrowRight,
  BookOpen,
  Users,
  Sparkles,
  Crown,
  Heart,
  ScrollText,
  ChevronDown,
  Brain,
  Map,
  Feather,
  MessageCircle,
  BarChart3,
  Compass,
  Star,
  Eye,
  Clock,
  TrendingUp,
  Award,
  Globe,
  Zap,
} from 'lucide-react';

// Language and context
import { useLanguage } from '@/hooks/useLanguage';
import { LANGUAGES } from '@/lib/translations';
import type { Language } from '@/lib/translations';

/**
 * Main Homepage Component with Simplified Design
 */
export default function HomePage() {
  const { language, setLanguage, t } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Feature cards data
  const features = [
    {
      icon: Brain,
      title: 'AI 智能分析',
      description: '運用先進AI技術，深度解析文本含義、人物性格與情節發展',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users,
      title: '人物關係圖譜',
      description: '互動式人物關係圖，清晰呈現複雜的人物脈絡與情感糾葛',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: BookOpen,
      title: '智能註解系統',
      description: '逐句詳細註解，文言文白話對照，降低閱讀理解門檻',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: MessageCircle,
      title: '學習社群交流',
      description: '與同好分享心得，參與討論，在交流中加深理解',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: BarChart3,
      title: '學習進度追蹤',
      description: '個人化學習儀表板，追蹤閱讀進度與理解深度',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: Sparkles,
      title: '詩詞意境探索',
      description: '深入品味作品中的詩詞歌賦，感受古典文學之美',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  // Learning statistics
  const stats = [
    { number: '1,200+', label: '活躍學習者', icon: Users },
    { number: '120', label: '詳細章節解析', icon: BookOpen },
    { number: '400+', label: '人物深度剖析', icon: Crown },
    { number: '85%', label: '學習完成率', icon: TrendingUp },
  ];

  // Content preview sections
  const contentPreviews = [
    {
      title: '人物花園',
      subtitle: '探索紅樓人物世界',
      description: '在虛擬園林中邂逅林黛玉、賈寶玉等經典人物，了解他們的性格特點與人生軌跡',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      href: '/characters',
      badge: '人物關係',
    },
    {
      title: '章節導覽',
      subtitle: '120回經典重現',
      description: '跟隨故事脈絡，體驗從繁華到衰落的人生百態，感受曹雪芹筆下的世情冷暖',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop',
      href: '/chapters',
      badge: '故事情節',
    },
    {
      title: '詩詞賞析',
      subtitle: '古典文學精華',
      description: '品味紅樓夢中的詩詞歌賦，從文學角度深度理解人物內心與時代背景',
      image: 'https://images.unsplash.com/photo-1485988843227-72ba07e5339f?w=600&h=400&fit=crop',
      href: '/poetry',
      badge: '詩詞文學',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <ScrollText className="h-8 w-8 text-primary" />
            <div className="text-left">
              <div className="text-xl font-bold text-foreground">紅樓慧讀</div>
              <div className="text-xs text-muted-foreground">Red Mansions Study</div>
            </div>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {LANGUAGES.find(lang => lang.code === language)?.name || language}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGUAGES.map((langOption) => (
                  <DropdownMenuItem
                    key={langOption.code}
                    onSelect={() => setLanguage(langOption.code)}
                    disabled={language === langOption.code}
                  >
                    {langOption.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Action Buttons */}
            <Button variant="ghost" asChild>
              <Link href="/login">登入</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                <Compass className="w-4 h-4 mr-2" />
                開始探索
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with NPM Taiwan Header Image */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://theme.npm.edu.tw/Attachments/WebSitePictures/913/Header_913_3843.jpg"
            alt="故宮經典藝術背景"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        {/* Hero Content */}
        <div className={`relative z-10 text-center max-w-4xl mx-auto px-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              <span className="block">智能引航，重煥</span>
              <span className="block text-red-400 mt-2">紅樓之夢</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              深入探索《紅樓夢》的宏大世界<br />
              借助 AI 賦能的智慧分析，開啟您的經典文學之旅
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg" asChild>
                <Link href="/dashboard">
                  <BookOpen className="mr-2 h-5 w-5" />
                  立即開始學習
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg">
                <Eye className="mr-2 h-5 w-5" />
                了解更多功能
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              核心功能特色
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              結合傳統文學與現代科技，為您打造前所未有的經典閱讀體驗
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${feature.bgColor}`}>
                <CardContent className="p-0">
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Content Preview Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              探索學習內容
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              從人物到情節，從詩詞到文化，全方位深度學習紅樓夢
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {contentPreviews.map((content, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={content.image}
                    alt={content.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-red-600 text-white">
                    {content.badge}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{content.title}</CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    {content.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {content.description}
                  </p>
                  <Button variant="outline" className="w-full group-hover:bg-red-600 group-hover:text-white transition-colors" asChild>
                    <Link href={content.href}>
                      立即探索
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-red-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              學習成果展現
            </h2>
            <p className="text-xl text-gray-600">
              與千名學習者一同探索經典文學的魅力
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              開啟您的紅樓夢學習之旅
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              加入我們的學習社群，與志同道合的朋友一起深入探索中國古典文學的瑰寶。
              無論您是初學者還是資深愛好者，都能在這裡找到適合的學習內容。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 px-8 py-4 text-lg" asChild>
                <Link href="/register">
                  <Star className="mr-2 h-5 w-5" />
                  免費開始學習
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg" asChild>
                <Link href="/dashboard">
                  <Globe className="mr-2 h-5 w-5" />
                  探索學習社群
                </Link>
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                已有超過 1,200 名學習者選擇了我們的平台
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <ScrollText className="h-8 w-8 text-red-400" />
              <div>
                <div className="text-xl font-bold">紅樓慧讀</div>
                <div className="text-sm text-gray-400">Red Mansions Study Platform</div>
              </div>
            </div>

            <div className="text-sm text-gray-400 text-center md:text-right">
              <p>© 2024 紅樓慧讀平台. 致力於傳承中華古典文學.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}