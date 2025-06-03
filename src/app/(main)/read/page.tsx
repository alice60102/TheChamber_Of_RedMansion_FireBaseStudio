
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
  price?: string;
  memberFree?: boolean;
  readLink: string;
}

const placeholderBooks: Book[] = [
  {
    id: 'hlm',
    title: '紅樓夢 (第三版)',
    author: '[清] 曹雪芹',
    description: '以寶黛愛情悲劇為主線，展現清代貴族生活畫卷。',
    coverImage: 'https://placehold.co/150x220.png',
    aiHint: 'classic chinese book',
    price: '22.90元',
    memberFree: true,
    readLink: '/read-book', // Links to the existing detailed reader page
  },
  {
    id: 'farewell-to-arms',
    title: '永別了，武器 (海明威文集)',
    author: '[美] 歐内斯特·海明威',
    description: '美國青年弗瑞德里克·亨利在第一次世界大戰中的經歷...',
    coverImage: 'https://placehold.co/150x220.png',
    aiHint: 'book cover war novel',
    price: '54.99元',
    memberFree: true,
    readLink: '#',
  },
  {
    id: 'beauty-of-programming',
    title: '編程之美：微軟技術面試心得',
    author: '《編程之美》小組',
    description: '本書收集了約60道算法和程序設計題目...',
    coverImage: 'https://placehold.co/150x220.png',
    aiHint: 'tech book cover',
    price: '15.80元',
    memberFree: true,
    readLink: '#',
  },
  {
    id: 'fu-lei',
    title: '傅雷譯著小全集：托爾斯泰傳 (精裝)',
    author: '[法] 羅曼·羅蘭 (著), 傅雷 (譯)',
    description: '本書以翔實的資料、獨特的視角和生動的文筆...',
    coverImage: 'https://placehold.co/150x220.png',
    aiHint: 'biography book cover',
    price: '26.00元',
    memberFree: true,
    readLink: '#',
  },
  {
    id: 'imperfect-relationships',
    title: '不完美關係：人際關係解答手冊',
    author: '熊太行',
    description: '本書詳細拆解了職場關係、婚戀關係...',
    coverImage: 'https://placehold.co/150x220.png',
    aiHint: 'self help book',
    price: '29.50元',
    memberFree: true,
    readLink: '#',
  },
  {
    id: 'les-miserables',
    title: '悲慘世界 (全三冊 名著名譯叢書)',
    author: '[法] 維克多·雨果',
    description: '《悲慘世界》是雨果在流亡期間寫的長篇小說...',
    coverImage: 'https://placehold.co/150x220.png',
    aiHint: 'classic literature cover',
    price: '45.00元',
    memberFree: false,
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
            電子書書架
          </CardTitle>
          <CardDescription>
            選擇您的下一本讀物，開始智慧閱讀之旅。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ebooks" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mb-4">
              <TabsTrigger value="recent">最近學習</TabsTrigger>
              <TabsTrigger value="ebooks">電子書書架</TabsTrigger>
              <TabsTrigger value="audiobooks">聽書書架</TabsTrigger>
            </TabsList>

            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Button variant="default" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">全部 (41)</Button>
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
                        {/* <p className="text-xs text-muted-foreground/80 line-clamp-2">{book.description}</p> */}
                        <div className="flex items-center justify-between pt-1">
                           {book.price && !book.memberFree && <span className="text-sm font-semibold text-primary">{book.price}</span>}
                           {book.memberFree && <span className="text-xs bg-yellow-500/20 text-yellow-400 py-0.5 px-2 rounded-full">會員免費</span>}
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
                <p>聽書書架功能正在開發中。</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
