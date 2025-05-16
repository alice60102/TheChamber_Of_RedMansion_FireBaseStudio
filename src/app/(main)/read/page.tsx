
"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Drama, Sparkles, BookText, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { generateCharacterRelationshipMap } from '@/ai/flows/interactive-character-relationship-map';
import { connectThemesToModernContexts } from '@/ai/flows/connect-themes-to-modern-contexts';
import { analyzeContext } from '@/ai/flows/context-aware-analysis';
import { ScrollArea } from '@/components/ui/scroll-area';

// Placeholder chapter data - in a real app, this would come from a database or API
const chapters = [
  { id: 1, title: "第一回 甄士隱夢幻識通靈 賈雨村風塵懷閨秀", content: "此開卷第一回也。作者自云：因曾歷過一番夢幻之後，故將真事隱去，而借「通靈」之說，撰此《石頭記》一書也。故曰「甄士隱」云云。但書中所記何事何人？自又云：「今風塵碌碌，一事無成，忽念及當日所有之女子，一一細考較去，覺其行止見識，皆出我之上。我堂堂鬚眉，誠不若彼裙釵。我實愧則有餘，悔又無益，大無可如何之日也！當此日，欲將已往所賴天恩祖德，錦衣紈褲之時，飫甘饜肥之日，背父兄教育之恩，負師友規訓之德，以致今日一技無成，半生潦倒之罪，編述一集，以告天下。知我之負罪固多，然閨閣中歷歷有人，萬不可因我之不肖，自護己短，一併使其泯滅也。故當此時，自欲將以往經歷，及素所聞識，逐細編次，作為小說，聊以表我這些姊妹。雖不敢比類自己，自謂可以傳世，亦可使閨閣昭傳。復可破一時之悶，醒同人之目，不亦宜乎？」故曰「賈雨村」云云。\n\n此回中，甄士隱夢見一僧一道，談論石頭下凡歷劫之事。賈雨村寄居甄家，中秋與甄士隱賞月吟詩，後得甄家資助，上京赴考。甄士隱之女英蓮元宵燈節被拐，甄家隨後又遭火災，家道中落。甄士隱看破紅塵，隨跛足道人出家。" },
  { id: 2, title: "第二回 賈夫人仙逝揚州城 冷子興演說榮國府", content: "（此處省略第二回內容...）" },
  { id: 3, title: "第三回 賈雨村夤緣復舊職 林黛玉拋父進京都", content: "（此處省略第三回內容...）" },
];

export default function ReadPage() {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [characterMap, setCharacterMap] = useState<string | null>(null);
  const [modernRelevance, setModernRelevance] = useState<string | null>(null);
  const [wordAnalysis, setWordAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const currentChapter = chapters[currentChapterIndex];

  useEffect(() => {
    // Reset AI content when chapter changes
    setCharacterMap(null);
    setModernRelevance(null);
    setWordAnalysis(null);
  }, [currentChapterIndex]);

  const handleFetchCharacterMap = async () => {
    if (!currentChapter) return;
    setIsLoadingAi(true);
    try {
      const result = await generateCharacterRelationshipMap({ text: currentChapter.content.substring(0, 1000) }); // Use a snippet for brevity
      setCharacterMap(result.description);
    } catch (error) {
      console.error("Error fetching character map:", error);
      setCharacterMap("無法生成人物關係圖，請稍後再試。");
    }
    setIsLoadingAi(false);
  };

  const handleFetchModernRelevance = async () => {
    if (!currentChapter) return;
    setIsLoadingAi(true);
    try {
      const result = await connectThemesToModernContexts({ chapterText: currentChapter.content.substring(0, 1000) });
      setModernRelevance(result.modernContextInsights);
    } catch (error) {
      console.error("Error fetching modern relevance:", error);
      setModernRelevance("無法生成現代關聯，請稍後再試。");
    }
    setIsLoadingAi(false);
  };
  
  const handleFetchWordAnalysis = async () => {
    if (!currentChapter) return;
    setIsLoadingAi(true);
    try {
      const result = await analyzeContext({ text: currentChapter.content.substring(0, 500), chapter: currentChapter.title });
      setWordAnalysis(result.wordSenseAnalysis);
      // Optionally update character map from analyzeContext too
      // setCharacterMap(result.characterRelationships);
    } catch (error) {
      console.error("Error fetching word analysis:", error);
      setWordAnalysis("無法生成詞義解析，請稍後再試。");
    }
    setIsLoadingAi(false);
  };


  const goToNextChapter = () => {
    setCurrentChapterIndex((prev) => Math.min(prev + 1, chapters.length - 1));
  };

  const goToPrevChapter = () => {
    setCurrentChapterIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-var(--header-height,4rem)-2rem)]"> {/* Adjust height based on header */}
      {/* Main Content Area */}
      <div className="flex-grow lg:w-2/3">
        <Card className="h-full flex flex-col shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={goToPrevChapter} disabled={currentChapterIndex === 0}>
                <ChevronLeft className="h-5 w-5" /> 上一回
              </Button>
              <CardTitle className="text-center font-artistic text-xl md:text-2xl text-primary">{currentChapter.title}</CardTitle>
              <Button variant="ghost" onClick={goToNextChapter} disabled={currentChapterIndex === chapters.length - 1}>
                下一回 <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <ScrollArea className="flex-grow p-1">
            <CardContent className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none leading-relaxed whitespace-pre-line p-6 text-foreground/90" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              {currentChapter.content}
            </CardContent>
          </ScrollArea>
          <div className="p-4 border-t">
            <Textarea placeholder="寫下您的筆記或感想..." className="bg-background/50"/>
          </div>
        </Card>
      </div>

      {/* AI Tools Sidebar */}
      <div className="lg:w-1/3">
        <Tabs defaultValue="character-map" className="h-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="character-map"><Drama className="h-4 w-4 mr-1 inline-block" />人物</TabsTrigger>
            <TabsTrigger value="modern-relevance"><Sparkles className="h-4 w-4 mr-1 inline-block" />關聯</TabsTrigger>
            <TabsTrigger value="word-analysis"><BookText className="h-4 w-4 mr-1 inline-block" />詞解</TabsTrigger>
          </TabsList>
          
          <TabsContent value="character-map" className="mt-0">
            <Card className="shadow-lg h-[calc(100vh-var(--header-height,4rem)-6rem)]"> {/* Adjust height */}
              <CardHeader>
                <CardTitle className="font-artistic text-lg">互動人物關係圖</CardTitle>
                <CardDescription>探索本章節人物關係。</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleFetchCharacterMap} disabled={isLoadingAi} className="w-full mb-4">
                  {isLoadingAi ? "生成中..." : "生成人物關係"}
                </Button>
                {characterMap ? (
                  <ScrollArea className="h-64 text-sm text-foreground/80 whitespace-pre-line">
                    {characterMap}
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground">點擊按鈕生成人物關係圖。</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modern-relevance" className="mt-0">
            <Card className="shadow-lg h-[calc(100vh-var(--header-height,4rem)-6rem)]">
              <CardHeader>
                <CardTitle className="font-artistic text-lg">現代關聯</CardTitle>
                <CardDescription>連接經典與當代生活。</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleFetchModernRelevance} disabled={isLoadingAi} className="w-full mb-4">
                  {isLoadingAi ? "生成中..." : "生成現代關聯"}
                </Button>
                {modernRelevance ? (
                  <ScrollArea className="h-64 text-sm text-foreground/80 whitespace-pre-line">
                    {modernRelevance}
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground">點擊按鈕生成現代關聯分析。</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="word-analysis" className="mt-0">
            <Card className="shadow-lg h-[calc(100vh-var(--header-height,4rem)-6rem)]">
              <CardHeader>
                <CardTitle className="font-artistic text-lg">詞義解析</CardTitle>
                <CardDescription>解析文中難詞、典故。</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleFetchWordAnalysis} disabled={isLoadingAi} className="w-full mb-4">
                  {isLoadingAi ? "生成中..." : "解析詞義"}
                </Button>
                {wordAnalysis ? (
                  <ScrollArea className="h-64 text-sm text-foreground/80 whitespace-pre-line">
                    {wordAnalysis}
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground">點擊按鈕生成詞義解析。</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
