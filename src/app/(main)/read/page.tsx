
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Edit } from 'lucide-react'; // Edit can be used for "编辑" if needed later

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  aiHint: string;
  price?: string; // Kept for interface consistency, but won't be rendered
  memberFree?: boolean; // Kept for interface consistency, but won't be rendered
  readLink: string;
}

const placeholderBooks: Book[] = [
  {
    id: 'hlm-v3',
    title: '紅樓夢 (第三版)',
    author: '[清] 曹雪芹',
    description: '以寶黛愛情悲劇為主線，展現清代貴族生活畫卷。',
    coverImage: 'https://placehold.co/150x220.png',
    aiHint: 'classic chinese novel',
    readLink: '/read-book', 
  },
  {
    id: 'hlm-chengjia',
    title: '紅樓夢 (程甲本影印)',
    author: '[清] 曹雪芹 高鶚',
    description: '清代程偉元、高鶚整理的《紅樓夢》早期印本之一。',
    coverImage: 'https://placehold.co/150x220.png',
    aiHint: 'antique chinese book',
    readLink: '#',
  },
  {
    id: 'hlm-gengchen',
    title: '紅樓夢 (庚辰本校注)',
    author: '[清] 曹雪芹 著；俞平伯 校注',
    description: '以庚辰本為底本，參校各脂本，進行詳細校勘與註釋。',
    coverImage: 'https://placehold.co/150x220.png',
    aiHint: 'scholarly chinese literature',
    readLink: '#',
  },
  {
    id: 'hlm-zhiyan',
    title: '脂硯齋重評石頭記 (校訂本)',
    author: '[清] 曹雪芹；脂硯齋 評',
    description: '彙集了帶有脂硯齋等人大量批語的早期抄本。',
    coverImage: 'https://placehold.co/150x220.png',
    aiHint: 'historical chinese manuscript',
    readLink: '#',
  },
  {
    id: 'hlm-menggao',
    title: '紅樓夢 (夢稿本整理版)',
    author: '[清] 曹雪芹',
    description: '根據「夢稿本」整理排印，保留早期稿本特色。',
    coverImage: 'https://placehold.co/150x220.png',
    aiHint: 'rare chinese book',
    readLink: '#',
  },
  {
    id: 'hlm-anniversary',
    title: '紅樓夢 (百年紀念版)',
    author: '[清] 曹雪芹',
    description: '紀念《紅樓夢》研究百年，匯集名家點評的珍藏版本。',
    coverImage: 'https://placehold.co/150x220.png',
    aiHint: 'special edition book',
    readLink: '#',
  },
];

export default function BookSelectionPage() {
  const [activeTab, setActiveTab] = useState("ebooks");

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-artistic text-3xl text-primary">
            我的書架
          </CardTitle>
          <CardDescription>
            選擇您的下一本讀物，開始智慧閱讀之旅。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ebooks" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mb-4">
              <TabsTrigger value="recent">最近學習</TabsTrigger>
              <TabsTrigger value="ebooks">紅樓夢原文</TabsTrigger>
              <TabsTrigger value="audiobooks">專家解讀</TabsTrigger>
            </TabsList>

            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Button variant="default" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">全部 ({placeholderBooks.length})</Button>
              <Button variant="outline" size="sm">進度</Button>
              <Button variant="outline" size="sm">分類</Button>
              <div className="ml-auto hidden md:block">
                <Button variant="ghost" size="sm">
                  <Edit className="mr-2 h-4 w-4" /> 編輯
                </Button>
              </div>
            </div>
            
            <TabsContent value="ebooks">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {placeholderBooks.map((book) => (
                  <Card key={book.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-card/70">
                    <CardContent className="p-0">
                      <div className="relative aspect-[3/4.4]">
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint={book.aiHint}
                        />
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-sm">
                          電子書
                        </div>
                      </div>
                      <div className="p-3 space-y-1">
                        <h3 className="font-semibold text-sm text-foreground truncate" title={book.title}>{book.title}</h3>
                        <p className="text-xs text-muted-foreground truncate" title={book.author}>{book.author}</p>
                        <div className="flex items-center justify-end pt-1"> {/* Changed justify-between to justify-end */}
                           <Button asChild variant="link" size="sm" className="p-0 h-auto text-primary hover:text-primary/80">
                            <Link href={book.readLink}>
                              <BookOpen className="mr-1 h-3.5 w-3.5" />閱讀
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="recent">
              <div className="text-center py-12 text-muted-foreground">
                <p>最近學習記錄將顯示於此。</p>
              </div>
            </TabsContent>
            <TabsContent value="audiobooks">
              <div className="text-center py-12 text-muted-foreground">
                <p>專家解讀內容正在準備中。</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
