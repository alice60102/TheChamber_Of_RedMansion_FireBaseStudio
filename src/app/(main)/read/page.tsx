
"use client";
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Drama, Sparkles, BookText, HelpCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
// import { generateCharacterRelationshipMap } from '@/ai/flows/interactive-character-relationship-map'; // This flow was removed
import { connectThemesToModernContexts } from '@/ai/flows/connect-themes-to-modern-contexts';
import { analyzeContext } from '@/ai/flows/context-aware-analysis';
import { explainTextSelection } from '@/ai/flows/explain-text-selection';
import type { ExplainTextSelectionInput, ExplainTextSelectionOutput } from '@/ai/flows/explain-text-selection';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Placeholder chapter data - in a real app, this would come from a database or API
const chapters = [
  { id: 1, title: "第一回 甄士隱夢幻識通靈 賈雨村風塵懷閨秀", content: "此開卷第一回也。作者自云：因曾歷過一番夢幻之後，故將真事隱去，而借「通靈」之說，撰此《石頭記》一書也。故曰「甄士隱」云云。但書中所記何事何人？自又云：「今風塵碌碌，一事無成，忽念及當日所有之女子，一一細考較去，覺其行止見識，皆出我之上。我堂堂鬚眉，誠不若彼裙釵。我實愧則有餘，悔又無益，大無可如何之日也！當此日，欲將已往所賴天恩祖德，錦衣紈褲之時，飫甘饜肥之日，背父兄教育之恩，負師友規訓之德，以致今日一技無成，半生潦倒之罪，編述一集，以告天下。知我之負罪固多，然閨閣中歷歷有人，萬不可因我之不肖，自護己短，一併使其泯滅也。故當此時，自欲將以往經歷，及素所聞識，逐細編次，作為小說，聊以表我這些姊妹。雖不敢比類自己，自謂可以傳世，亦可使閨閣昭傳。復可破一時之悶，醒同人之目，不亦宜乎？」故曰「賈雨村」云云。\n\n此回中，甄士隱夢見一僧一道，談論石頭下凡歷劫之事。賈雨村寄居甄家，中秋與甄士隱賞月吟詩，後得甄家資助，上京赴考。甄士隱之女英蓮元宵燈節被拐，甄家隨後又遭火災，家道中落。甄士隱看破紅塵，隨跛足道人出家。" },
  { id: 2, title: "第二回 賈夫人仙逝揚州城 冷子興演說榮國府", content: "（此處省略第二回內容...）賈寶玉和林黛玉初次見面，寶玉便說：「這個妹妹我曾見過的。」" },
  { id: 3, title: "第三回 賈雨村夤緣復舊職 林黛玉拋父進京都", content: "（此處省略第三回內容...）林黛玉進賈府，處處小心，不肯輕易多說一句話，多行一步路。" },
];

export default function ReadPage() {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [characterMap, setCharacterMap] = useState<string | null>(null); // Retained for Context Analysis tab
  const [modernRelevance, setModernRelevance] = useState<string | null>(null);
  const [wordAnalysis, setWordAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionPosition, setSelectionPosition] = useState<{ top: number; left: number } | null>(null);
  const [textExplanation, setTextExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const popoverButtonRef = useRef<HTMLButtonElement>(null);

  const currentChapter = chapters[currentChapterIndex];

  useEffect(() => {
    // Reset AI content when chapter changes
    setCharacterMap(null);
    setModernRelevance(null);
    setWordAnalysis(null);
    setSelectedText('');
    setSelectionPosition(null);
    setTextExplanation(null);
    setIsPopoverOpen(false);
  }, [currentChapterIndex]);

  const handleMouseUp = (event: MouseEvent) => {
    if (contentRef.current && contentRef.current.contains(event.target as Node)) {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      if (text) {
        setSelectedText(text);
        const range = selection!.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Position relative to the contentRef or viewport
        const contentAreaRect = contentRef.current?.getBoundingClientRect();
        if (contentAreaRect) {
          setSelectionPosition({
            top: rect.bottom - contentAreaRect.top + (contentRef.current?.scrollTop || 0) + 5, // Below selection
            left: rect.left - contentAreaRect.left + (contentRef.current?.scrollLeft || 0) + rect.width / 2, // Middle of selection
          });
        } else {
           setSelectionPosition({ top: rect.bottom + window.scrollY + 5, left: rect.left + window.scrollX + rect.width / 2 });
        }
        setTextExplanation(null); // Clear previous explanation
        setIsPopoverOpen(false); // Ensure popover is ready to be triggered
      } else {
        setSelectedText('');
        setSelectionPosition(null);
        setIsPopoverOpen(false);
      }
    }
  };
  
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [currentChapter]);


  const handleFetchCharacterMapFromContext = async () => { // Renamed to avoid confusion
    if (!currentChapter) return;
    setIsLoadingAi(true);
    setWordAnalysis(null); // Also clear word analysis as they come from the same flow
    try {
      // Using analyzeContext for character map and word sense analysis
      const result = await analyzeContext({ text: currentChapter.content.substring(0, 1000), chapter: currentChapter.title });
      setCharacterMap(result.characterRelationships);
      setWordAnalysis(result.wordSenseAnalysis); // Set word analysis here
    } catch (error) {
      console.error("Error fetching from analyzeContext:", error);
      setCharacterMap("無法生成人物關係圖或詞義解析，請稍後再試。");
      setWordAnalysis("無法生成詞義解析，請稍後再試。");
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
  
  // This function is now for the "詞解" tab specifically if needed, or can be removed if analyzeContext covers it.
  // For now, let's assume analyzeContext is primary for the "詞解" tab.
  // const handleFetchWordAnalysis = async () => { /* ... */ };

  const handleExplainSelectedText = async () => {
    if (!selectedText || !currentChapter) return;
    setIsLoadingExplanation(true);
    setTextExplanation(null);
    try {
      const input: ExplainTextSelectionInput = {
        selectedText,
        chapterContext: currentChapter.content.substring(0, 500) // Provide some context
      };
      const result = await explainTextSelection(input);
      setTextExplanation(result.explanation);
    } catch (error) {
      console.error("Error explaining selected text:", error);
      setTextExplanation("抱歉，解釋此段文字時發生錯誤。");
    }
    setIsLoadingExplanation(false);
    setIsPopoverOpen(true); // Open popover after attempting to fetch
  };

  const goToNextChapter = () => {
    setCurrentChapterIndex((prev) => Math.min(prev + 1, chapters.length - 1));
  };

  const goToPrevChapter = () => {
    setCurrentChapterIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-var(--header-height,4rem)-2rem)] relative"> {/* Added relative for button positioning */}
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
          <ScrollArea className="flex-grow p-1 relative" id="chapter-content-scroll-area"> {/* Added relative */}
            <div ref={contentRef}> {/* Added ref for mouseup */}
                <CardContent 
                  className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none leading-relaxed whitespace-pre-line p-6 text-foreground/90" 
                  style={{ fontFamily: "'Noto Serif SC', serif" }}
                >
                  {currentChapter.content}
                </CardContent>
                 {selectedText && selectionPosition && (
                    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          ref={popoverButtonRef}
                          variant="outline"
                          size="sm"
                          className="absolute bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg z-10"
                          style={{ top: `${selectionPosition.top}px`, left: `${selectionPosition.left}px`, transform: 'translateX(-50%)' }}
                          onClick={handleExplainSelectedText}
                        >
                          <Sparkles className="h-4 w-4 mr-1" /> AI釋義
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-80 bg-card text-card-foreground shadow-xl border-border"
                        side="top" 
                        align="center"
                        // Optional: To make popover follow scroll if button is inside scroll area
                        // container={contentRef.current} // This might need `Popover` to support `portal={false}` or a different strategy
                      >
                        {isLoadingExplanation ? (
                          <div className="p-4 text-center">解釋生成中...</div>
                        ) : textExplanation ? (
                          <ScrollArea className="h-auto max-h-60 p-1">
                             <div className="text-sm p-2 whitespace-pre-line">{textExplanation}</div>
                          </ScrollArea>
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">點擊按鈕以生成解釋。</div>
                        )}
                      </PopoverContent>
                    </Popover>
                  )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <Textarea placeholder="寫下您的筆記或感想..." className="bg-background/50"/>
          </div>
        </Card>
      </div>

      {/* AI Tools Sidebar */}
      <div className="lg:w-1/3">
        <Tabs defaultValue="context-analysis" className="h-full"> {/* Changed default to context-analysis */}
          <TabsList className="grid w-full grid-cols-2 bg-muted/50"> {/* Updated grid-cols-3 to grid-cols-2 */}
            <TabsTrigger value="context-analysis"><Drama className="h-4 w-4 mr-1 inline-block" />脈絡分析</TabsTrigger> {/* Merged Character and Word Analysis */}
            <TabsTrigger value="modern-relevance"><Sparkles className="h-4 w-4 mr-1 inline-block" />現代關聯</TabsTrigger>
          </TabsList>
          
          <TabsContent value="context-analysis" className="mt-0">
            <Card className="shadow-lg h-[calc(100vh-var(--header-height,4rem)-6rem)]">
              <CardHeader>
                <CardTitle className="font-artistic text-lg">文本脈絡分析</CardTitle>
                <CardDescription>探索本章節人物關係與詞義典故。</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Button onClick={handleFetchCharacterMapFromContext} disabled={isLoadingAi} className="w-full mb-4">
                    {isLoadingAi && !characterMap && !wordAnalysis ? "分析中..." : "生成脈絡分析"}
                  </Button>
                  {characterMap || wordAnalysis ? (
                    <ScrollArea className="h-64 text-sm text-foreground/80 whitespace-pre-line space-y-3">
                      {characterMap && (
                        <div>
                          <h4 className="font-semibold text-primary mb-1">人物關係：</h4>
                          {characterMap}
                        </div>
                      )}
                      {wordAnalysis && (
                        <div>
                           <h4 className="font-semibold text-primary mb-1 mt-2">詞義解析：</h4>
                          {wordAnalysis}
                        </div>
                      )}
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">點擊按鈕生成人物關係圖與詞義解析。</p>
                  )}
                </div>
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
                <div>
                  <Button onClick={handleFetchModernRelevance} disabled={isLoadingAi} className="w-full mb-4">
                    {isLoadingAi && !modernRelevance ? "生成中..." : "生成現代關聯"}
                  </Button>
                  {modernRelevance ? (
                    <ScrollArea className="h-64 text-sm text-foreground/80 whitespace-pre-line">
                      {modernRelevance}
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">點擊按鈕生成現代關聯分析。</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
