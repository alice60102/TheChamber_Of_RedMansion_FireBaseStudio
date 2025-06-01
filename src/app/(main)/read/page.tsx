
"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; 
import {
  ChevronLeft, ChevronRight, Settings, Book, Search as SearchIcon, DownloadCloud, CornerUpLeft,
  BookOpen as BookOpenIcon, Columns, Type, Plus, Brain, List, ZoomIn, Maximize, FileText, MessageSquare, Eye, EyeOff, AlignLeft, AlignCenter, AlignJustify, Map
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { explainTextSelection } from '@/ai/flows/explain-text-selection';
import type { ExplainTextSelectionInput, ExplainTextSelectionOutput } from '@/ai/flows/explain-text-selection';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { SimulatedKnowledgeGraph } from '@/components/SimulatedKnowledgeGraph';

interface Paragraph {
  original: string;
  vernacular?: string; 
}

interface Chapter {
  id: number;
  title: string;
  subtitle?: string;
  summary: string;
  paragraphs: Paragraph[];
}

const chapters: Chapter[] = [
  {
    id: 1,
    title: "第一回 甄士隱夢幻識通靈 賈雨村風塵懷閨秀",
    subtitle: "紅樓夢:第三版(中國古典文學讀本叢書)",
    summary: "本回主要講述了甄士隱夢遇一僧一道談論石頭下凡歷劫，以及賈雨村的落魄與發跡。甄士隱因女兒英蓮被拐、家遭火災而看破紅塵，隨跛足道人出家，點出了小說「真事隱去，假語存焉」的創作主旨和「夢幻」的基調。",
    paragraphs: [
      { original: "此開卷第一回也。作者自云：因曾歷過一番夢幻之後，故將真事隱去，而借「通靈」之說，撰此《石頭記》一書也。故曰「甄士隱」云云。但書中所記何事何人？自又云：「今風塵碌碌，一事無成，忽念及當日所有之女子，一一細考較去，覺其行止見識，皆出我之上。我堂堂鬚眉，誠不若彼裙釵。我實愧則有餘，悔又無益，大無可如何之日也！當此日，欲將已往所賴天恩祖德，錦衣紈褲之時，飫甘饜肥之日，背父兄教育之恩，負師友規訓之德，以致今日一技無成，半生潦倒之罪，編述一集，以告天下。知我之負罪固多，然閨閣中歷歷有人，萬不可因我之不肖，自護己短，一併使其泯滅也。故當此時，自欲將以往經歷，及素所聞識，逐細編次，作為小說，聊以表我這些姊妹。雖不敢比類自己，自謂可以傳世，亦可使閨閣昭傳。復可破一時之悶，醒同人之目，不亦宜乎？」故曰「賈雨村」云云。", vernacular: "（白話文）這是本書的第一回。作者自己說：因為曾經經歷過一番夢幻般的事情，所以把真實的事情隱藏起來，借用「通靈寶玉」的說法，寫成了這本《石頭記》。所以書中稱「甄士隱」等等。但書中記載的是什麼事、什麼人呢？作者又說：「現在我到處奔波，一事無成，忽然想起當年的那些女子，一個個仔細回想比較，覺得她們的言行見識，都在我之上。我一個堂堂男子，實在不如那些女性。我實在是慚愧有餘，後悔也沒用，真是非常無奈啊！在那時，我想把自己過去依仗著上天的恩賜和祖先的功德，過著富裕悠閒生活的時候，享受著美味佳餚的日子，卻違背了父兄的教誨，辜負了老師朋友的規勸，以至於今天一無所長，半生潦倒的罪過，編寫成一本書，告訴世人。我知道我的罪過很多，但是女性當中確實有很多傑出的人物，千萬不能因為我的不成才，只顧著掩飾自己的缺點，而讓她们的事蹟也跟著被埋沒了。所以在這個時候，我自己想把過去的經歷，以及平時聽到見到的事情，詳細地編排起來，寫成小說，來表彰我這些姐妹們。雖然不敢和自己相提并論，自認為可以流傳後世，也可以讓女性們的事蹟顯揚。又可以解除一時的煩悶，提醒世人，不也是件好事嗎？」所以書中稱「賈雨村」等等。" },
      { original: "此回中，甄士隱夢見一僧一道，談論石頭下凡歷劫之事。賈雨村寄居甄家，中秋與甄士隱賞月吟詩，後得甄家資助，上京赴考。甄士隱之女英蓮元宵燈節被拐，甄家隨後又遭火災，家道中落。甄士隱看破紅塵，隨跛足道人出家。", vernacular: "（白話文）這一回裡，甄士隱夢見一個和尚和一個道士，談論石頭下凡間歷劫的事情。賈雨村寄住在甄家，中秋節和甄士隱一起賞月作詩，後來得到甄家的資助，到京城參加科舉考試。甄士隱的女兒英蓮在元宵節看花燈時被人拐走，甄家隨後又遭遇火災，家境衰落。甄士隱看破紅塵，跟著一個跛腳的道士出家了。" },
    ]
  },
  {
    id: 2,
    title: "第二回 賈夫人仙逝揚州城 冷子興演說榮國府",
    summary: "林黛玉之母賈敏病故。賈雨村偶遇舊識冷子興，冷子興向賈雨村詳細介紹了京城榮國府和寧國府的複雜人物關係、顯赫家世以及當前的衰敗跡象，為後文主要人物登場和故事展開作了重要鋪墊。",
    paragraphs: [
      { original: "（此處省略第二回內容...）賈寶玉和林黛玉初次見面，寶玉便說：「這個妹妹我曾見過的。」", vernacular: "（白話文）（此處省略第二回內容...）賈寶玉和林黛玉初次見面，寶玉便說：「這個妹妹我以前見過。」" }
    ]
  },
];

type AIInteractionState = 'asking' | 'answering' | 'answered' | 'error';
type ColumnLayout = 'single' | 'double' | 'triple';

export default function ReadPage() {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [showVernacular, setShowVernacular] = useState(false);
  const [columnLayout, setColumnLayout] = useState<ColumnLayout>('single');
  const [isKnowledgeGraphSheetOpen, setIsKnowledgeGraphSheetOpen] = useState(false);
  
  const [selectedTextInfo, setSelectedTextInfo] = useState<{ text: string; position: { top: number; left: number; } | null; range: Range | null; } | null>(null);
  const [isAIPopoverOpen, setIsAIPopoverOpen] = useState(false);
  const [userQuestionInput, setUserQuestionInput] = useState<string>('');
  const [textExplanation, setTextExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [aiInteractionState, setAiInteractionState] = useState<AIInteractionState>('asking');

  const chapterContentRef = useRef<HTMLDivElement>(null);
  const toolbarTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentChapter = chapters[currentChapterIndex];

  const hideToolbarAfterDelay = useCallback(() => {
    if (toolbarTimeoutRef.current) {
      clearTimeout(toolbarTimeoutRef.current);
    }
    toolbarTimeoutRef.current = setTimeout(() => {
      setIsToolbarVisible(false);
    }, 5000); 
  }, []);

  const handleInteraction = useCallback(() => {
    setIsToolbarVisible(true);
    hideToolbarAfterDelay();
  }, [hideToolbarAfterDelay]);

  useEffect(() => {
    if (isToolbarVisible) {
      hideToolbarAfterDelay();
    }
    return () => {
      if (toolbarTimeoutRef.current) {
        clearTimeout(toolbarTimeoutRef.current);
      }
    };
  }, [isToolbarVisible, hideToolbarAfterDelay, currentChapterIndex]);
  
  useEffect(() => {
    setSelectedTextInfo(null);
    setIsAIPopoverOpen(false);
    setTextExplanation(null);
    setUserQuestionInput('');
    setAiInteractionState('asking');
    setIsToolbarVisible(true); 
  }, [currentChapterIndex]);

  const handleMouseUp = useCallback((event: globalThis.MouseEvent) => {
    const targetElement = event.target as HTMLElement;

    // If click is on action buttons or AI popover, let them handle it.
    // Call handleInteraction to ensure toolbar stays visible during these interactions.
    if (targetElement?.closest('[data-selection-action-button="true"]')) {
        setTimeout(() => handleInteraction(), 0);
        return;
    }

    // If click is on areas that should clear selection (like main toolbar, marked with data-no-selection).
    if (targetElement?.closest('[data-no-selection="true"]')) {
        setSelectedTextInfo(null);
        setIsAIPopoverOpen(false);
        setTimeout(() => handleInteraction(), 0);
        return;
    }
    
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';
    let newSelectedTextInfo = null;

    if (text.length > 0 && chapterContentRef.current && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (chapterContentRef.current.contains(range.commonAncestorContainer)) {
            const rect = range.getBoundingClientRect();
            const top = rect.bottom + 5; 
            const left = rect.left + (rect.width / 2);
            newSelectedTextInfo = { text, position: { top, left }, range: range.cloneRange() };
        }
    }
    
    setSelectedTextInfo(newSelectedTextInfo);
    
    if (newSelectedTextInfo) {
      setIsAIPopoverOpen(false); 
    }
    
    setTimeout(() => handleInteraction(), 0);

  }, [handleInteraction]); 
  
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('scroll', handleInteraction, { passive: true });
    document.addEventListener('mousemove', handleInteraction);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('scroll', handleInteraction);
      document.removeEventListener('mousemove', handleInteraction);
      if (toolbarTimeoutRef.current) clearTimeout(toolbarTimeoutRef.current);
    };
  }, [handleMouseUp, handleInteraction]);

  const handleOpenAIPopover = () => {
    if (selectedTextInfo?.text) {
      setTextExplanation(null);
      setUserQuestionInput('');
      setAiInteractionState('asking');
      setIsAIPopoverOpen(true);
    }
  };

  const handleUserSubmitQuestion = async () => {
    if (!selectedTextInfo?.text || !userQuestionInput.trim() || !currentChapter) return;
    setIsLoadingExplanation(true);
    setAiInteractionState('answering');
    setTextExplanation(null);
    try {
      const input: ExplainTextSelectionInput = {
        selectedText: selectedTextInfo.text,
        chapterContext: currentChapter.paragraphs.map(p => p.original).join('\n').substring(0, 1000), 
        userQuestion: userQuestionInput,
      };
      const result = await explainTextSelection(input);
      setTextExplanation(result.explanation);
      setAiInteractionState('answered');
    } catch (error) {
      console.error("Error explaining selected text:", error);
      setTextExplanation(error instanceof Error ? error.message : "抱歉，回答您的問題時發生錯誤。");
      setAiInteractionState('error');
    }
    setIsLoadingExplanation(false);
  };

  const goToNextChapter = () => {
    setCurrentChapterIndex((prev) => Math.min(prev + 1, chapters.length - 1));
  };

  const goToPrevChapter = () => {
    setCurrentChapterIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleOpenNoteSheet = () => {
    if (selectedTextInfo?.text) {
      console.log("Opening note sheet for:", selectedTextInfo.text);
      // setShowNoteSheet(true); // Implement note functionality
      // setIsAIPopoverOpen(false); 
      // It's okay for selection buttons to remain if note sheet is a non-modal overlay or side panel.
      // If it's a full modal, then perhaps clear selectedTextInfo on note sheet close.
    }
  };
  
  const getColumnClass = () => {
    switch (columnLayout) {
      case 'single': return 'columns-1';
      case 'double': return 'md:columns-2';
      case 'triple': return 'md:columns-3';
      default: return 'columns-1';
    }
  };

  return (
    <div className="h-full flex flex-col" data-no-selection="false"> {/* Removed data-no-selection and onClick from root */}
      {/* Top Toolbar */}
      <div 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-md p-2 transition-all duration-300 ease-in-out",
          isToolbarVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
        )}
        data-no-selection="true" 
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="container mx-auto flex items-center justify-between max-w-screen-xl">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()} title="返回"><CornerUpLeft className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" title="設定" disabled><Settings className="h-5 w-5" /></Button>
            <Button variant={columnLayout === 'single' ? 'default' : 'ghost'} size="icon" onClick={() => setColumnLayout('single')} title="單欄"><AlignLeft className="h-5 w-5"/></Button>
            <Button variant={columnLayout === 'double' ? 'default' : 'ghost'} size="icon" onClick={() => setColumnLayout('double')} title="雙欄"><AlignCenter className="h-5 w-5"/></Button>
            <Button variant={columnLayout === 'triple' ? 'default' : 'ghost'} size="icon" onClick={() => setColumnLayout('triple')} title="三欄"><AlignJustify className="h-5 w-5"/></Button>
          </div>
          
          <div className="text-center overflow-hidden">
            <h1 className="text-sm md:text-base font-semibold text-primary truncate">{currentChapter.title}</h1>
            {currentChapter.subtitle && <p className="text-xs text-muted-foreground truncate">{currentChapter.subtitle}</p>}
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowVernacular(!showVernacular)} title={showVernacular ? "隱藏白話文" : "顯示白話文"}>
              {showVernacular ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsKnowledgeGraphSheetOpen(true)} title="知識圖譜"><Map className="h-5 w-5"/></Button>
            <Button variant="ghost" size="icon" title="目錄" disabled><List className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" title="書內搜尋" disabled><SearchIcon className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" title="全螢幕" disabled><Maximize className="h-5 w-5" /></Button>
          </div>
        </div>
         <div className="container mx-auto flex items-center justify-between max-w-screen-xl mt-1 px-2" data-no-selection="true">
            <Button variant="ghost" size="sm" onClick={goToPrevChapter} disabled={currentChapterIndex === 0}>
                <ChevronLeft className="h-4 w-4 mr-1" /> 上一回
            </Button>
            <Accordion type="single" collapsible className="w-full max-w-xs md:max-w-md mx-auto my-0 py-0">
              <AccordionItem value="chapter-summary" className="border-none">
                <AccordionTrigger className="text-xs text-muted-foreground hover:text-primary/90 data-[state=open]:text-primary py-1 px-1 justify-center">
                   本回提要概述
                </AccordionTrigger>
                <AccordionContent className="text-xs p-2 bg-muted/20 rounded-md border border-border/50 max-h-24 overflow-y-auto">
                  <ReactMarkdown className="prose prose-xs dark:prose-invert max-w-none whitespace-pre-line text-white">
                    {currentChapter.summary}
                  </ReactMarkdown>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button variant="ghost" size="sm" onClick={goToNextChapter} disabled={currentChapterIndex === chapters.length - 1}>
                下一回 <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
      </div>

      {/* Main Reading Area */}
      <ScrollArea className="flex-grow pt-28 pb-10 px-4 md:px-8" id="chapter-content-scroll-area">
        <div 
          ref={chapterContentRef}
          className={cn(
            "prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none mx-auto leading-relaxed whitespace-pre-line text-foreground select-text", 
            getColumnClass()
          )}
          style={{ fontFamily: "'Noto Serif SC', serif", position: 'relative' }}
        >
          {currentChapter.paragraphs.map((para, index) => (
            <div key={index} className="mb-4 break-inside-avoid-column">
              <p className="text-white">{para.original}</p>
              {showVernacular && para.vernacular && (
                <p className="italic text-muted-foreground mt-1 text-sm">{para.vernacular}</p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* AI Popover for selected text */}
      {selectedTextInfo?.text && selectedTextInfo.position && (
        <div 
            className="fixed flex gap-2" 
            style={{ 
                top: `${selectedTextInfo.position.top}px`, 
                left: `${selectedTextInfo.position.left}px`, 
                transform: 'translateX(-50%)',
                zIndex: 60, 
            }}
            data-selection-action-button="true" 
          >
            <Button
                variant="default"
                size="sm"
                className="bg-amber-500 text-white hover:bg-amber-600 shadow-lg flex items-center"
                onClick={handleOpenNoteSheet}
                data-selection-action-button="true" 
                >
                <FileText className="h-4 w-4 mr-1" /> 記筆記
            </Button>
            <Popover open={isAIPopoverOpen} onOpenChange={setIsAIPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                    variant="default"
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg flex items-center"
                    onClick={handleOpenAIPopover}
                    data-selection-action-button="true" 
                    >
                    <MessageSquare className="h-4 w-4 mr-1" /> 問AI
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className="w-96 bg-card text-card-foreground shadow-xl border-border z-70"
                    side="top" 
                    align="center"
                    onOpenAutoFocus={(e) => e.preventDefault()} 
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    data-selection-action-button="true" 
                    onClick={(e) => e.stopPropagation()} 
                >
                    <div className="space-y-3 p-2">
                    {aiInteractionState === 'asking' && (
                        <>
                        <p className="text-sm text-muted-foreground">
                            您選取的文字： "<strong className="text-primary">{selectedTextInfo.text.length > 50 ? selectedTextInfo.text.substring(0, 50) + '...' : selectedTextInfo.text}</strong>"
                        </p>
                        <Label htmlFor="userQuestion" className="text-base font-semibold">您的問題：</Label>
                        <Textarea 
                            id="userQuestion"
                            value={userQuestionInput}
                            onChange={(e) => setUserQuestionInput(e.target.value)}
                            placeholder="請輸入您想問的問題..."
                            className="min-h-[80px] text-sm bg-background/70"
                            rows={3}
                        />
                        <Button onClick={handleUserSubmitQuestion} disabled={isLoadingExplanation || !userQuestionInput.trim()} className="w-full">
                            {isLoadingExplanation ? "傳送中..." : "送出問題"}
                        </Button>
                        </>
                    )}
                    {(aiInteractionState === 'answering') && (
                        <div className="p-4 text-center text-muted-foreground">AI 思考中...</div>
                    )}
                    {(aiInteractionState === 'answered' || aiInteractionState === 'error') && textExplanation && (
                      <div>
                        <h4 className="font-semibold mb-2 text-primary">AI 回答：</h4>
                        <ScrollArea className="h-60 p-1 border rounded-md bg-muted/10">
                           <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line p-2 text-white">
                            {textExplanation}
                          </ReactMarkdown>
                        </ScrollArea>
                        <Button variant="ghost" onClick={() => {setAiInteractionState('asking'); handleInteraction();}} className="mt-2 text-sm">
                          返回提問
                        </Button>
                      </div>
                    )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
      )}
      
      {/* Knowledge Graph Sheet */}
      <Sheet open={isKnowledgeGraphSheetOpen} onOpenChange={setIsKnowledgeGraphSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] bg-card text-card-foreground p-0 flex flex-col" data-no-selection="true">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="text-primary text-xl font-artistic">章回知識圖譜: {currentChapter.title}</SheetTitle>
            <SheetDescription>
              呈現本章回主要概念之間的關聯。(此為模擬圖，實際圖譜會基於文本動態生成)
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-grow p-4">
            <SimulatedKnowledgeGraph className="w-full" />
          </ScrollArea>
          <SheetFooter className="p-4 border-t border-border">
            <SheetClose asChild>
              <Button variant="outline">關閉</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

    