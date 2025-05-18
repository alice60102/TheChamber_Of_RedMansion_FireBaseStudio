
"use client";
import { useState, useEffect, useRef, MouseEvent as ReactMouseEvent, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Drama, Sparkles, BookText, HelpCircle, MessageSquare, FilePenLine, Globe, Lock, Save, XCircle, Eye } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { connectThemesToModernContexts } from '@/ai/flows/connect-themes-to-modern-contexts';
import { analyzeContext } from '@/ai/flows/context-aware-analysis';
import { explainTextSelection } from '@/ai/flows/explain-text-selection';
import type { ExplainTextSelectionInput, ExplainTextSelectionOutput } from '@/ai/flows/explain-text-selection';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ReactMarkdown from 'react-markdown';

// Placeholder chapter data
const chapters = [
  { 
    id: 1, 
    title: "第一回 甄士隱夢幻識通靈 賈雨村風塵懷閨秀", 
    summary: "本回主要講述了甄士隱夢遇一僧一道談論石頭下凡歷劫，以及賈雨村的落魄與發跡。甄士隱因女兒英蓮被拐、家遭火災而看破紅塵，隨跛足道人出家，點出了小說「真事隱去，假語存焉」的創作主旨和「夢幻」的基調。",
    content: "此開卷第一回也。作者自云：因曾歷過一番夢幻之後，故將真事隱去，而借「通靈」之說，撰此《石頭記》一書也。故曰「甄士隱」云云。但書中所記何事何人？自又云：「今風塵碌碌，一事無成，忽念及當日所有之女子，一一細考較去，覺其行止見識，皆出我之上。我堂堂鬚眉，誠不若彼裙釵。我實愧則有餘，悔又無益，大無可如何之日也！當此日，欲將已往所賴天恩祖德，錦衣紈褲之時，飫甘饜肥之日，背父兄教育之恩，負師友規訓之德，以致今日一技無成，半生潦倒之罪，編述一集，以告天下。知我之負罪固多，然閨閣中歷歷有人，萬不可因我之不肖，自護己短，一併使其泯滅也。故當此時，自欲將以往經歷，及素所聞識，逐細編次，作為小說，聊以表我這些姊妹。雖不敢比類自己，自謂可以傳世，亦可使閨閣昭傳。復可破一時之悶，醒同人之目，不亦宜乎？」故曰「賈雨村」云云。\n\n此回中，甄士隱夢見一僧一道，談論石頭下凡歷劫之事。賈雨村寄居甄家，中秋與甄士隱賞月吟詩，後得甄家資助，上京赴考。甄士隱之女英蓮元宵燈節被拐，甄家隨後又遭火災，家道中落。甄士隱看破紅塵，隨跛足道人出家。" 
  },
  { 
    id: 2, 
    title: "第二回 賈夫人仙逝揚州城 冷子興演說榮國府", 
    summary: "林黛玉之母賈敏病故。賈雨村偶遇舊識冷子興，冷子興向賈雨村詳細介紹了京城榮國府和寧國府的複雜人物關係、顯赫家世以及當前的衰敗跡象，為後文主要人物登場和故事展開作了重要鋪墊。",
    content: "（此處省略第二回內容...）賈寶玉和林黛玉初次見面，寶玉便說：「這個妹妹我曾見過的。」" 
  },
  { 
    id: 3, 
    title: "第三回 賈雨村夤緣復舊職 林黛玉拋父進京都", 
    summary: "賈雨村通過鑽營關係，由林如海推薦，官復原職。林黛玉奉外祖母賈母之命，在其父林如海的安排下，離開揚州，進京入賈府。本回細緻描寫了黛玉初進賈府的所見所聞、謹慎言行以及與賈府眾人的初次會面，特別是與賈寶玉的相見。",
    content: "（此處省略第三回內容...）林黛玉進賈府，處處小心，不肯輕易多說一句話，多行一步路。" 
  },
];

type AIInteractionState = 'asking' | 'answering' | 'answered' | 'error';

interface UserNote {
  id: string;
  chapterId: number;
  targetText: string; 
  content: string;
  isPublic: boolean;
  rangeRect: { top: number; left: number; width: number; height: number; } | null; 
}

interface SelectedTextInfo {
  text: string;
  position: { top: number; left: number; } | null;
  range: Range | null;
}

export default function ReadPage() {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [characterMap, setCharacterMap] = useState<string | null>(null); 
  const [modernRelevance, setModernRelevance] = useState<string | null>(null);
  const [wordAnalysis, setWordAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const [selectedTextInfo, setSelectedTextInfo] = useState<SelectedTextInfo | null>(null);
  const [isAIPopoverOpen, setIsAIPopoverOpen] = useState(false);
  const [userQuestionInput, setUserQuestionInput] = useState<string>('');
  const [textExplanation, setTextExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [aiInteractionState, setAiInteractionState] = useState<AIInteractionState>('asking');

  const [notes, setNotes] = useState<UserNote[]>([]);
  const [showNoteSheet, setShowNoteSheet] = useState(false);
  const [currentNoteTargetText, setCurrentNoteTargetText] = useState<string>('');
  const [currentNoteContent, setCurrentNoteContent] = useState('');
  const [currentNoteIsPublic, setCurrentNoteIsPublic] = useState(true);
  const [currentNoteSelectionRect, setCurrentNoteSelectionRect] = useState<{ top: number; left: number; width: number; height: number; } | null>(null);
  
  const [activeNotePopover, setActiveNotePopover] = useState<string | null>(null); 

  const chapterContentRef = useRef<HTMLDivElement>(null);
  const currentChapter = chapters[currentChapterIndex];

  useEffect(() => {
    setCharacterMap(null);
    setModernRelevance(null);
    setWordAnalysis(null);
    setSelectedTextInfo(null);
    setIsAIPopoverOpen(false);
    setTextExplanation(null);
    setUserQuestionInput('');
    setAiInteractionState('asking');
    setActiveNotePopover(null);
  }, [currentChapterIndex]);

  const handleMouseUp = useCallback((event: globalThis.MouseEvent) => {
    const targetElement = event.target as HTMLElement;
    if (targetElement?.closest('[data-selection-action-button="true"]') || 
        targetElement?.closest('[data-note-highlight="true"]')) {
      return;
    }
    
    if (chapterContentRef.current && chapterContentRef.current.contains(targetElement)) {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      if (text && text.length > 1) {
        const range = selection!.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        let top = rect.bottom + (chapterContentRef.current?.scrollTop || 0) + 5;
        let left = rect.left + rect.width / 2 + (chapterContentRef.current?.scrollLeft || 0);

        const chapterContentRect = chapterContentRef.current?.getBoundingClientRect();
        if (chapterContentRect) {
            top = rect.bottom - chapterContentRect.top + (chapterContentRef.current?.scrollTop || 0) + 5;
            left = rect.left - chapterContentRect.left + (chapterContentRef.current?.scrollLeft || 0) + rect.width / 2;
        }
        
        setSelectedTextInfo({ text, position: { top, left }, range: range.cloneRange() });
        setIsAIPopoverOpen(false); 
        setActiveNotePopover(null);
      } else {
        if (!isAIPopoverOpen && !showNoteSheet && !activeNotePopover) {
           setSelectedTextInfo(null);
        }
      }
    } else {
       if (!isAIPopoverOpen && !showNoteSheet && !activeNotePopover) {
          setSelectedTextInfo(null);
       }
    }
  }, [isAIPopoverOpen, showNoteSheet, activeNotePopover]);
  
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  const handleFetchCharacterMapFromContext = async () => { 
    if (!currentChapter) return;
    setIsLoadingAi(true);
    setWordAnalysis(null); 
    setCharacterMap(null);
    try {
      const result = await analyzeContext({ text: currentChapter.content.substring(0, 1000), chapter: currentChapter.title });
      setCharacterMap(result.characterRelationships);
      setWordAnalysis(result.wordSenseAnalysis); 
    } catch (error) {
      console.error("Error fetching from analyzeContext:", error);
      setCharacterMap("無法生成人物關係圖，請稍後再試。");
      setWordAnalysis("無法生成詞義解析，請稍後再試。");
    }
    setIsLoadingAi(false);
  };

  const handleFetchModernRelevance = async () => {
    if (!currentChapter) return;
    setIsLoadingAi(true);
    setModernRelevance(null);
    try {
      const result = await connectThemesToModernContexts({ chapterText: currentChapter.content.substring(0, 1000) });
      setModernRelevance(result.modernContextInsights);
    } catch (error) {
      console.error("Error fetching modern relevance:", error);
      setModernRelevance("無法生成現代關聯，請稍後再試。");
    }
    setIsLoadingAi(false);
  };
  
  const handleOpenAIPopover = () => {
    if (selectedTextInfo?.text) {
      setTextExplanation(null);
      setUserQuestionInput('');
      setAiInteractionState('asking');
      setIsAIPopoverOpen(true);
      setActiveNotePopover(null); 
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
        chapterContext: currentChapter.content.substring(0, 1000), 
        userQuestion: userQuestionInput,
      };
      const result = await explainTextSelection(input);
      setTextExplanation(result.explanation);
      setAiInteractionState('answered');
    } catch (error) {
      console.error("Error explaining selected text with user question:", error);
      setTextExplanation(error instanceof Error ? error.message : "抱歉，回答您的問題時發生錯誤。");
      setAiInteractionState('error');
    }
    setIsLoadingExplanation(false);
  };

  const handleOpenNoteSheet = () => {
    if (selectedTextInfo?.text && selectedTextInfo.range && chapterContentRef.current) {
      const selectionRect = selectedTextInfo.range.getBoundingClientRect();
      const containerRect = chapterContentRef.current.getBoundingClientRect();
      
      setCurrentNoteTargetText(selectedTextInfo.text);
      const existingNote = notes.find(n => n.targetText === selectedTextInfo.text && n.chapterId === currentChapter.id);
      setCurrentNoteContent(existingNote ? existingNote.content : '');
      setCurrentNoteIsPublic(existingNote ? existingNote.isPublic : true);
      
      setCurrentNoteSelectionRect({
        top: selectionRect.top - containerRect.top + chapterContentRef.current.scrollTop,
        left: selectionRect.left - containerRect.left + chapterContentRef.current.scrollLeft,
        width: selectionRect.width,
        height: selectionRect.height,
      });
  
      setShowNoteSheet(true);
      setSelectedTextInfo(null); 
      setIsAIPopoverOpen(false);
      setActiveNotePopover(null);
    }
  };

  const handleSaveNote = () => {
    if (!currentNoteTargetText.trim() || !currentNoteContent.trim() || !currentNoteSelectionRect) {
        alert("筆記內容不能為空或選区信息丢失！");
        return;
    }

    const newNote: UserNote = {
      id: Date.now().toString(),
      chapterId: currentChapter.id,
      targetText: currentNoteTargetText,
      content: currentNoteContent,
      isPublic: currentNoteIsPublic,
      rangeRect: currentNoteSelectionRect, 
    };
    setNotes(prevNotes => {
      const filteredNotes = prevNotes.filter(
        note => !(note.targetText === newNote.targetText && note.chapterId === newNote.chapterId)
      );
      return [...filteredNotes, newNote];
    });

    if (currentNoteIsPublic) {
      console.log("筆記已設為公開，模擬發佈到紅學社:", newNote);
    }
    setShowNoteSheet(false);
    setCurrentNoteTargetText('');
    setCurrentNoteContent('');
    setCurrentNoteSelectionRect(null);
  };

  const handleNoteHighlightClick = (noteId: string, event: ReactMouseEvent<HTMLDivElement>) => {
    event.stopPropagation(); 
    setSelectedTextInfo(null); 
    setIsAIPopoverOpen(false); 
    setActiveNotePopover(noteId === activeNotePopover ? null : noteId); 
  };

  const goToNextChapter = () => {
    setCurrentChapterIndex((prev) => Math.min(prev + 1, chapters.length - 1));
  };

  const goToPrevChapter = () => {
    setCurrentChapterIndex((prev) => Math.max(prev - 1, 0));
  };
  
  const charLimit = 5000;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-var(--header-height,4rem)-2rem)]">
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
            <Accordion type="single" collapsible className="w-full mt-2">
              <AccordionItem value="chapter-summary">
                <AccordionTrigger className="text-sm text-muted-foreground hover:text-primary/90 data-[state=open]:text-primary py-2 px-1">
                  <BookText className="h-4 w-4 mr-2" /> 本回提要概述
                </AccordionTrigger>
                <AccordionContent className="text-sm p-3 bg-muted/20 rounded-md border border-border/50">
                  <div className="prose prose-sm sm:prose-base dark:prose-invert prose-strong:text-white prose-li:text-white prose-ul:text-white prose-ol:text-white prose-bullets:text-white max-w-none whitespace-pre-line text-white">
                    <ReactMarkdown>{currentChapter.summary}</ReactMarkdown>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardHeader>
          <ScrollArea className="flex-grow p-1 relative" id="chapter-content-scroll-area">
            <CardContent 
              ref={chapterContentRef}
              className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none leading-relaxed whitespace-pre-line p-6 text-white relative"
              style={{ fontFamily: "'Noto Serif SC', serif", position: 'relative' }}
            >
              {currentChapter.content}

              {chapterContentRef.current && notes.filter(n => n.chapterId === currentChapter.id && n.rangeRect).map(note => {
                if (!note.rangeRect || !chapterContentRef.current) return null;
                
                const currentScrollTop = chapterContentRef.current.scrollTop;
                const currentScrollLeft = chapterContentRef.current.scrollLeft;

                const style: React.CSSProperties = {
                  position: 'absolute',
                  left: `${note.rangeRect.left - currentScrollLeft}px`,
                  top: `${note.rangeRect.top - currentScrollTop}px`,
                  width: `${note.rangeRect.width}px`,
                  height: `${note.rangeRect.height}px`,
                  borderBottom: '1.5px dashed hsl(var(--primary)/0.7)',
                  cursor: 'pointer',
                  pointerEvents: 'all', 
                  zIndex: 1, 
                };

                return (
                  <Popover 
                    key={`highlight-popover-${note.id}`} 
                    open={activeNotePopover === note.id} 
                    onOpenChange={(isOpen) => {
                      if (!isOpen) setActiveNotePopover(null);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <div
                        data-note-highlight="true"
                        title={`筆記: ${note.targetText.substring(0,20)}...`}
                        style={style}
                        onClick={(e) => handleNoteHighlightClick(note.id, e)}
                      />
                    </PopoverTrigger>
                    <PopoverContent 
                      side="top" 
                      align="center" 
                      className="w-80 z-20 bg-card text-card-foreground shadow-xl border-border" 
                      onOpenAutoFocus={e => e.preventDefault()}
                      onCloseAutoFocus={e => e.preventDefault()} 
                    >
                      <ScrollArea className="max-h-60">
                        <div className="space-y-2 p-2 prose prose-sm dark:prose-invert prose-strong:text-white prose-li:text-white prose-ul:text-white prose-ol:text-white prose-bullets:text-white max-w-none text-white">
                          <h4 className="font-semibold text-primary mb-1 truncate">
                            關聯筆記: "{note.targetText.substring(0,15)}{note.targetText.length > 15 ? '...' : ''}"
                          </h4>
                          <ReactMarkdown>{note.content}</ReactMarkdown>
                          <p className="text-xs text-muted-foreground mt-1">
                            {note.isPublic ? 
                              <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-green-500" />公開筆記</span> : 
                              <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-red-500" />私人筆記</span>
                            }
                          </p>
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                );
              })}
            </CardContent>

            {selectedTextInfo?.text && selectedTextInfo.position && (
              <div 
                  className="absolute flex gap-2" 
                  style={{ 
                      top: `${selectedTextInfo.position.top}px`, 
                      left: `${selectedTextInfo.position.left}px`, 
                      transform: 'translateX(-50%)',
                      zIndex: 10, 
                  }}
                >
                  <Button
                      variant="default"
                      size="sm"
                      className="bg-amber-500 text-white hover:bg-amber-600 shadow-lg flex items-center"
                      onClick={handleOpenNoteSheet}
                      data-selection-action-button="true"
                      >
                      <FilePenLine className="h-4 w-4 mr-1" /> 記筆記
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
                          className="w-96 bg-card text-card-foreground shadow-xl border-border z-20"
                          side="top" 
                          align="center"
                          onOpenAutoFocus={(e) => e.preventDefault()} 
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
                                <div className="prose prose-sm dark:prose-invert prose-strong:text-white prose-li:text-white prose-ul:text-white prose-ol:text-white prose-bullets:text-white max-w-none whitespace-pre-line p-2 text-white">
                                  <ReactMarkdown>{textExplanation}</ReactMarkdown>
                                </div>
                              </ScrollArea>
                              <Button variant="ghost" onClick={() => setAiInteractionState('asking')} className="mt-2 text-sm">
                                返回提問
                              </Button>
                            </div>
                          )}
                          {(aiInteractionState === 'answered' || aiInteractionState === 'error') && !textExplanation && (
                              <div className="p-4 text-center text-muted-foreground">發生錯誤或沒有回答。</div>
                          )}
                          </div>
                      </PopoverContent>
                  </Popover>
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>

      <div className="lg:w-1/3">
        <Tabs defaultValue="context-analysis" className="h-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="context-analysis"><Drama className="h-4 w-4 mr-1 inline-block" />脈絡分析</TabsTrigger>
            <TabsTrigger value="modern-relevance"><Sparkles className="h-4 w-4 mr-1 inline-block" />現代關聯</TabsTrigger>
          </TabsList>
          
          <TabsContent value="context-analysis" className="mt-0">
            <Card className="shadow-lg h-[calc(100vh-var(--header-height,4rem)-6rem)]">
              <CardHeader>
                <CardTitle className="font-artistic text-lg">文本脈絡分析</CardTitle>
                <CardDescription>探索本章節人物關係與詞義典故。</CardDescription>
              </CardHeader>
              <CardContent>
              <div className="space-y-4">
                  <Button onClick={handleFetchCharacterMapFromContext} disabled={isLoadingAi} className="w-full">
                    {isLoadingAi && !characterMap && !wordAnalysis ? "分析中..." : "生成脈絡分析"}
                  </Button>
                  {(characterMap || wordAnalysis) && !isLoadingAi ? (
                    <ScrollArea className="h-64 p-2 border rounded-md bg-muted/10">
                      {characterMap && (
                        <div>
                          <h4 className="font-semibold text-primary mb-1">人物關係：</h4>
                          <div className="prose prose-sm dark:prose-invert prose-strong:text-white prose-li:text-white prose-ul:text-white prose-ol:text-white prose-bullets:text-white max-w-none whitespace-pre-line text-white">
                            <ReactMarkdown>{characterMap}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      {wordAnalysis && (
                        <div className="mt-3">
                           <h4 className="font-semibold text-primary mb-1">詞義解析：</h4>
                           <div className="prose prose-sm dark:prose-invert prose-strong:text-white prose-li:text-white prose-ul:text-white prose-ol:text-white prose-bullets:text-white max-w-none whitespace-pre-line text-white">
                            <ReactMarkdown>{wordAnalysis}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                  ) : isLoadingAi ? (
                     <p className="text-sm text-muted-foreground text-center p-4">AI 正在分析中，請稍候...</p>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center p-4">點擊按鈕生成人物關係圖與詞義解析。</p>
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
              <div className="space-y-4">
                  <Button onClick={handleFetchModernRelevance} disabled={isLoadingAi} className="w-full">
                    {isLoadingAi && !modernRelevance ? "生成中..." : "生成現代關聯"}
                  </Button>
                  {modernRelevance && !isLoadingAi ? (
                    <ScrollArea className="h-64 p-2 border rounded-md bg-muted/10">
                      <div className="prose prose-sm dark:prose-invert prose-strong:text-white prose-li:text-white prose-ul:text-white prose-ol:text-white prose-bullets:text-white max-w-none whitespace-pre-line text-white">
                        <ReactMarkdown>{modernRelevance}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                  ) : isLoadingAi ? (
                    <p className="text-sm text-muted-foreground text-center p-4">AI 正在生成中，請稍候...</p>
                  ): (
                    <p className="text-sm text-muted-foreground text-center p-4">點擊按鈕生成現代關聯分析。</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={showNoteSheet} onOpenChange={setShowNoteSheet}>
        <SheetContent className="sm:max-w-lg w-[90vw] bg-card text-card-foreground p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="text-primary text-xl font-artistic">
                寫筆記：{currentNoteTargetText.substring(0, 20)}{currentNoteTargetText.length > 20 ? '...' : ''}
            </SheetTitle>
            <SheetDescription>
                針對選取的文本記錄您的想法與心得。
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 space-y-4 flex-grow overflow-y-auto">
            <Textarea 
              value={currentNoteContent}
              onChange={(e) => {
                if (e.target.value.length <= charLimit) {
                    setCurrentNoteContent(e.target.value)
                }
              }}
              placeholder="在此輸入您的筆記內容..."
              className="min-h-[200px] text-base bg-background/70 focus:border-primary"
              rows={10}
            />
          </div>
          <SheetFooter className="p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentNoteIsPublic(!currentNoteIsPublic)}
                    className="border-accent hover:bg-accent/10"
                >
                    {currentNoteIsPublic ? <Globe className="h-4 w-4 mr-1.5 text-green-500"/> : <Lock className="h-4 w-4 mr-1.5 text-red-500"/>}
                    {currentNoteIsPublic ? "公開" : "私人"}
                </Button>
                <p className="text-xs text-muted-foreground">
                    {currentNoteContent.length}/{charLimit}
                </p>
            </div>
            <div className="flex gap-2">
                 <SheetClose asChild>
                    <Button variant="ghost" size="sm">取消</Button>
                 </SheetClose>
                <Button onClick={handleSaveNote} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Save className="h-4 w-4 mr-1.5"/>儲存筆記
                </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
