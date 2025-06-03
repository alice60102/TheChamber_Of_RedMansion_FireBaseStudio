
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardDescription, CardFooter
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Edit } from 'lucide-react'; 

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string; // Kept for potential future use, but icon is used now
  aiHint: string;     // For actual image generation if needed
  readLink: string;
  badgeText?: string; // For badges like "電子書" or "專家解讀"
}

const originalTextBooks: Book[] = [
  {
    id: 'hlm-times-edition',
    title: '紅樓夢上中下三冊',
    author: '時報出版',
    description: '時報出版發行的《紅樓夢》全集，分為上、中、下三冊。',
    coverImage: 'https://placehold.co/150x220.png?tint=662929', // Tint for icon background placeholder
    aiHint: 'chinese novel set',
    readLink: '#', // Placeholder link
    badgeText: '電子書',
  },
  {
    id: 'hlm-v3',
    title: '紅樓夢 (第三版)',
    author: '[清] 曹雪芹',
    description: '以寶黛愛情悲劇為主線，展現清代貴族生活畫卷。',
    coverImage: 'https://placehold.co/150x220.png?tint=662929',
    aiHint: 'chinese novel',
    readLink: '/read-book', // Actual link for this specific book
    badgeText: '電子書',
  },
  {
    id: 'hlm-chengjia',
    title: '紅樓夢 (程甲本影印)',
    author: '[清] 曹雪芹 高鶚',
    description: '清代程偉元、高鶚整理的《紅樓夢》早期印本之一。',
    coverImage: 'https://placehold.co/150x220.png?tint=662929',
    aiHint: 'chinese antique',
    readLink: '#',
    badgeText: '電子書',
  },
  {
    id: 'hlm-gengchen',
    title: '紅樓夢 (庚辰本校注)',
    author: '[清] 曹雪芹 著；俞平伯 校注',
    description: '以庚辰本為底本，參校各脂本，進行詳細校勘與註釋。',
    coverImage: 'https://placehold.co/150x220.png?tint=662929',
    aiHint: 'chinese scholarly',
    readLink: '#',
    badgeText: '電子書',
  },
  {
    id: 'hlm-zhiyan',
    title: '脂硯齋重評石頭記 (校訂本)',
    author: '[清] 曹雪芹；脂硯齋 評',
    description: '彙集了帶有脂硯齋等人大量批語的早期抄本。',
    coverImage: 'https://placehold.co/150x220.png?tint=662929',
    aiHint: 'chinese manuscript',
    readLink: '#',
    badgeText: '電子書',
  },
  {
    id: 'hlm-menggao',
    title: '紅樓夢 (夢稿本整理版)',
    author: '[清] 曹雪芹',
    description: '根據「夢稿本」整理排印，保留早期稿本特色。',
    coverImage: 'https://placehold.co/150x220.png?tint=662929',
    aiHint: 'chinese rare',
    readLink: '#',
    badgeText: '電子書',
  },
  {
    id: 'hlm-anniversary',
    title: '紅樓夢 (百年紀念版)',
    author: '[清] 曹雪芹',
    description: '紀念《紅樓夢》研究百年，匯集名家點評的珍藏版本。',
    coverImage: 'https://placehold.co/150x220.png?tint=662929',
    aiHint: 'chinese edition',
    readLink: '#',
    badgeText: '電子書',
  },
];

const expertInterpretationBooks: Book[] = [
  {
    id: 'jiangxun-youth',
    title: '蔣勳說紅樓夢青春版',
    author: '蔣勳',
    description: '除了文字之外，附加了很多的圖，閱讀的易讀性增加了許多。詳細講解每一回，並且排版很舒服。文筆柔和，內容也沒有多大門檻、生活化，適合青少年讀。',
    coverImage: 'https://placehold.co/150x220.png?tint=555555', // Slightly different tint for expert books
    aiHint: 'chinese literary criticism',
    readLink: '#',
    badgeText: '專家解讀',
  },
  {
    id: 'jiangxun-dream',
    title: '蔣勳 夢紅樓',
    author: '蔣勳',
    description: '為入門的紅樓夢書籍 可以作為讀紅樓夢之前的概觀 不用太多的專業知識也能讀懂 和生活連結性強。',
    coverImage: 'https://placehold.co/150x220.png?tint=555555',
    aiHint: 'chinese literary introduction',
    readLink: '#',
    badgeText: '專家解讀',
  },
  {
    id: 'jiangxun-microdust',
    title: '蔣勳 微塵眾',
    author: '蔣勳',
    description: '也是入門的紅樓夢書籍 一一介紹了紅樓夢的各個人物',
    coverImage: 'https://placehold.co/150x220.png?tint=555555',
    aiHint: 'chinese character analysis',
    readLink: '#',
    badgeText: '專家解讀',
  },
  {
    id: 'baixianyong-detailed',
    title: '白先勇細說紅樓夢',
    author: '白先勇',
    description: '也詳細講了每一回，和蔣勳老師不同之處在於生活的部分少了很多。詳細講的全面、深入，較為深思型的，有另一個不一樣的視角。需要一點中國文學的背景知識。書中有文字也有圖。',
    coverImage: 'https://placehold.co/150x220.png?tint=555555',
    aiHint: 'chinese literary analysis',
    readLink: '#',
    badgeText: '專家解讀',
  },
  {
    id: 'oulijuan-sixviews',
    title: '歐麗娟 六觀紅樓(綜論卷)、紅樓夢公開課',
    author: '歐麗娟',
    description: '歐麗娟老師的適合讀完紅樓夢整本，以及對紅樓夢有較整體認識來讀的，並且學術性較多，多為專題式的研究。',
    coverImage: 'https://placehold.co/150x220.png?tint=555555',
    aiHint: 'chinese academic study',
    readLink: '#',
    badgeText: '專家解讀',
  },
  {
    id: 'dongmei-thorough',
    title: '董梅講透紅樓夢',
    author: '董梅',
    description: '介於生活和學術之間，需要的閱讀能力有點在白先勇的前面一些，門檻沒有很高。但是為主題式的說明，從各個角度，例如生活美學、文學傑作、生活符號綜合來了解紅樓夢。',
    coverImage: 'https://placehold.co/150x220.png?tint=555555',
    aiHint: 'chinese thematic interpretation',
    readLink: '#',
    badgeText: '專家解讀',
  },
];


const BookCard = ({ book }: { book: Book }) => (
  <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-card/70 flex flex-col">
    <CardContent className="p-0 flex-grow flex flex-col">
      <div className="relative aspect-[3/4.4] bg-muted/50 flex items-center justify-center rounded-t-md overflow-hidden">
        {/* Using Font Awesome icon directly */}
        <i className="fa fa-book text-7xl text-primary/60" aria-hidden="true"></i>
        {book.badgeText && (
          <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-sm">
            {book.badgeText}
          </div>
        )}
      </div>
      <div className="p-3 space-y-1 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm text-foreground truncate" title={book.title}>{book.title}</h3>
          <p className="text-xs text-muted-foreground truncate" title={book.author}>{book.author}</p>
          <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2" title={book.description}>{book.description}</p>
        </div>
        <div className="flex items-center justify-end pt-2 mt-auto"> {/* mt-auto pushes this div to the bottom */}
           <Button asChild variant="link" size="sm" className="p-0 h-auto text-primary hover:text-primary/80">
            <Link href={book.readLink}>
              <BookOpen className="mr-1 h-3.5 w-3.5" />閱讀
            </Link>
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function BookSelectionPage() {
  const [activeTab, setActiveTab] = useState("originals");

  // Calculate total count for "全部" button
  const allBooksCount = originalTextBooks.length + expertInterpretationBooks.length;


  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-artistic text-3xl text-primary">
            我的書架
          </CardTitle>
          {/* <CardDescription>
            選擇您的下一本讀物，開始智慧閱讀之旅。
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="originals" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mb-4">
              <TabsTrigger value="recent">最近學習</TabsTrigger>
              <TabsTrigger value="originals">紅樓夢原文</TabsTrigger>
              <TabsTrigger value="interpretations">專家解讀</TabsTrigger>
            </TabsList>

            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Button variant="default" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">全部 ({allBooksCount})</Button>
              <Button variant="outline" size="sm">進度</Button>
              <Button variant="outline" size="sm">分類</Button>
              <div className="ml-auto hidden md:block">
                <Button variant="ghost" size="sm">
                  <Edit className="mr-2 h-4 w-4" /> 編輯
                </Button>
              </div>
            </div>
            
            <TabsContent value="originals">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {originalTextBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="interpretations">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {expertInterpretationBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="recent">
              <div className="text-center py-12 text-muted-foreground">
                <p>最近學習記錄將顯示於此。</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

