"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Library, Search, FileText, Microscope, Share2, MessageSquare } from "lucide-react"; // Added MessageSquare
import { generateSpecialTopicFramework } from '@/ai/flows/generate-special-topic-framework';
import type { GenerateSpecialTopicFrameworkInput, GenerateSpecialTopicFrameworkOutput } from '@/ai/flows/generate-special-topic-framework';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';

const researchTopics = [
  "《紅樓夢》中的詩詞賞析",
  "賈寶玉與林黛玉的愛情悲劇",
  "清代社會風貌在《紅樓夢》中的反映",
  "《紅樓夢》的敘事藝術與結構特點",
  "王熙鳳的人物形象分析",
  "《紅樓夢》中的哲學思想探討",
];

export default function ResearchPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [customTopic, setCustomTopic] = useState<string>("");
  const [studentReadingData, setStudentReadingData] = useState<string>("已閱讀前二十回，對詩詞及人物情感線索較感興趣。");
  const [researchFramework, setResearchFramework] = useState<GenerateSpecialTopicFrameworkOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleGenerateFramework = async () => {
    const topicToUse = customTopic || selectedTopic;
    if (!topicToUse) {
      alert("請選擇或輸入一個研究主題。");
      return;
    }
    setIsLoading(true);
    setResearchFramework(null);
    try {
      const input: GenerateSpecialTopicFrameworkInput = {
        readingData: studentReadingData,
        selectedTopic: topicToUse,
        language: "zh-TW", // 明確指定使用繁體中文
      };
      const result = await generateSpecialTopicFramework(input);
      // 預處理可能的空列表項問題，並確保輸出繁體中文
      if (result.researchFramework) {
        result.researchFramework = result.researchFramework
          .replace(/\n\s*•\s*\n/g, '\n• ') // 修復空的列表項
          .replace(/:\s*\n/g, ': ') // 修復冒號後直接換行的情況
          .replace(/Dream of the Red Chamber/g, '《紅樓夢》') // 將英文書名替換為中文
          .replace(/Lin Daiyu/g, '林黛玉'); // 將英文人名替換為中文
      }
      setResearchFramework(result);
    } catch (error) {
      console.error("Error generating research framework:", error);
      // Display error to user
    }
    setIsLoading(false);
  };

  const filteredTopics = researchTopics.filter(topic =>
    topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-artistic text-2xl text-primary flex items-center gap-2">
            <Library className="h-7 w-7" />
            研讀階段深度探究
          </CardTitle>
          <CardDescription>
            選擇感興趣的專題方向，AI 將協助您搭建研究框架，提供相關資料與分析工具。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Topic Selection */}
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">選擇研究主題</h3>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索推薦主題..."
                  className="pl-8 bg-background/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <ScrollArea className="h-60 border rounded-md">
                <div className="p-2 space-y-1">
                  {filteredTopics.map((topic, index) => (
                    <Button
                      key={index}
                      variant={selectedTopic === topic ? "default" : "ghost"}
                      className={`w-full justify-start text-left h-auto py-1.5 px-2 ${selectedTopic === topic ? 'bg-primary text-primary-foreground' : 'text-foreground/80'}`}
                      onClick={() => { setSelectedTopic(topic); setCustomTopic(""); }}
                    >
                      {topic}
                    </Button>
                  ))}
                  {filteredTopics.length === 0 && <p className="text-sm text-muted-foreground p-2 text-center">未找到匹配主題。</p>}
                </div>
              </ScrollArea>
              <div>
                <Label htmlFor="customTopic">或自定義主題</Label>
                <Input
                  id="customTopic"
                  placeholder="輸入您的研究主題"
                  value={customTopic}
                  onChange={(e) => { setCustomTopic(e.target.value); setSelectedTopic(""); }}
                  className="bg-background/50"
                />
              </div>
              <div>
                <Label htmlFor="readingData">您的閱讀數據/背景 (簡述)</Label>
                <Textarea
                  id="readingData"
                  value={studentReadingData}
                  onChange={(e) => setStudentReadingData(e.target.value)}
                  className="bg-background/50"
                  rows={3}
                />
              </div>
              <Button onClick={handleGenerateFramework} disabled={isLoading || (!selectedTopic && !customTopic)} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {isLoading ? "框架生成中..." : "生成研究框架"}
              </Button>
            </div>

            {/* Research Framework Display */}
            <div className="md:col-span-2 flex flex-col">
              <h3 className="text-lg font-semibold text-foreground mb-4">AI 生成研究框架 ({customTopic || selectedTopic || "待選擇主題"})</h3>
              {isLoading ? (
                <div className="flex-grow h-0 border rounded-md p-4 bg-muted/20 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground text-center">
                    正在為您構建研究框架...
                  </p>
                </div>
              ) : researchFramework ? (
                <ScrollArea className="flex-grow h-0 border rounded-md p-4 bg-muted/20">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-white">
                    <ReactMarkdown className="text-white prose-h1:text-white prose-h2:text-white prose-h3:text-white prose-h4:text-white prose-h5:text-white prose-h6:text-white prose-p:text-white prose-a:text-white prose-blockquote:text-white prose-figcaption:text-white prose-pre:text-white prose-code:text-white prose-li:text-white prose-ul:text-white prose-ol:text-white prose-table:text-white prose-th:text-white prose-td:text-white prose-img:text-white prose-hr:text-white prose-strong:text-white prose-em:text-white prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-li:pl-1">
                      {researchFramework.researchFramework}
                    </ReactMarkdown>
                    
                    <h4 className="font-semibold text-primary mt-4 mb-1.5">相關材料:</h4>
                    <ReactMarkdown className="text-white prose-h1:text-white prose-h2:text-white prose-h3:text-white prose-h4:text-white prose-h5:text-white prose-h6:text-white prose-p:text-white prose-a:text-white prose-blockquote:text-white prose-figcaption:text-white prose-pre:text-white prose-code:text-white prose-li:text-white prose-ul:text-white prose-ol:text-white prose-table:text-white prose-th:text-white prose-td:text-white prose-img:text-white prose-hr:text-white prose-strong:text-white prose-em:text-white prose-ul:my-1.5 prose-li:my-0.5 prose-li:pl-1">
                      {researchFramework.relatedMaterials}
                    </ReactMarkdown>

                    <h4 className="font-semibold text-primary mt-4 mb-1.5">分析工具:</h4>
                    <ReactMarkdown className="text-white prose-h1:text-white prose-h2:text-white prose-h3:text-white prose-h4:text-white prose-h5:text-white prose-h6:text-white prose-p:text-white prose-a:text-white prose-blockquote:text-white prose-figcaption:text-white prose-pre:text-white prose-code:text-white prose-li:text-white prose-ul:text-white prose-ol:text-white prose-table:text-white prose-th:text-white prose-td:text-white prose-img:text-white prose-hr:text-white prose-strong:text-white prose-em:text-white prose-ul:my-1.5 prose-li:my-0.5 prose-li:pl-1">
                      {researchFramework.analysisTools}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex-grow h-0 border rounded-md p-4 bg-muted/20 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground text-center">
                    選擇或輸入主題後，點擊按鈕生成研究框架。
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col items-start gap-2 md:flex-row md:justify-between w-full">
            <p className="text-xs text-muted-foreground">
              AI 生成的框架為初步建議，您可以此為基礎進行調整和深化。
            </p>
            {researchFramework && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-2"/>導出為文檔</Button>
                <Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-2"/>分享框架</Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Placeholder for other research tools */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-artistic text-xl text-primary flex items-center gap-2"><Microscope className="h-6 w-6"/>其他研究工具</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start gap-2"><FileText className="h-4 w-4"/>敘事結構可視化 (待實現)</Button>
            <Button variant="outline" className="justify-start gap-2"><MessageSquare className="h-4 w-4"/>多層次問題生成 (待實現)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    
