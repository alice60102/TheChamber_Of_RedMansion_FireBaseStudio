
"use client";
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import { Link2, User, Book, Zap } from "lucide-react"; // Added User, Book, Zap icons

interface Node {
  id: string;
  label: string;
  description?: string;
  type: 'character' | 'concept' | 'event';
}

interface Edge {
  from: string;
  to: string;
  label: string;
}

interface ChapterGraphData {
  chapterTitle: string;
  nodes: Node[];
  edges: Edge[];
}

// Simulate data for Chapter 1
const simulatedChapter1Data: ChapterGraphData = {
  chapterTitle: "第一回 甄士隱夢幻識通靈 賈雨村風塵懷閨秀",
  nodes: [
    { id: "zhen_shiyin", label: "甄士隱", description: "姑蘇鄉宦，遭遇不幸後看破紅塵。", type: "character" },
    { id: "jia_yucun", label: "賈雨村", description: "貧寒書生，受甄家資助後中舉。", type: "character" },
    { id: "stone", label: "通靈寶玉 (石頭)", description: "女媧補天頑石，下凡歷劫。", type: "concept" },
    { id: "monks", label: "僧道二人", description: "點化甄士隱，談論石頭來歷。", type: "character" },
    { id: "yinglian", label: "英蓮 (香菱)", description: "甄士隱之女，命途多舛。", type: "character" },
    { id: "dream_theme", label: "夢幻主題", description: "小說開篇點明「夢幻」基調。", type: "concept" },
  ],
  edges: [
    { from: "monks", to: "zhen_shiyin", label: "點化" },
    { from: "monks", to: "stone", label: "談論" },
    { from: "zhen_shiyin", to: "jia_yucun", label: "資助" },
    { from: "zhen_shiyin", to: "yinglian", label: "父女" },
    { from: "stone", to: "dream_theme", label: "核心象徵" },
  ],
};

const NodeIcon = ({ type }: { type: Node['type'] }) => {
  if (type === 'character') return <User className="h-4 w-4 mr-1.5 text-primary/80" />;
  if (type === 'concept') return <Book className="h-4 w-4 mr-1.5 text-accent/80" />;
  if (type === 'event') return <Zap className="h-4 w-4 mr-1.5 text-blue-400/80" />;
  return null;
};

const NodeCard = ({ node }: { node: Node }) => (
  <div className="p-3 border rounded-lg shadow-sm bg-card/70 hover:shadow-primary/20 transition-shadow text-left flex flex-col items-center">
    <div className="flex items-center mb-1">
      <NodeIcon type={node.type} />
      <p className="font-semibold text-sm text-foreground">{node.label}</p>
    </div>
    {node.description && <p className="text-xs text-muted-foreground text-center">{node.description}</p>}
  </div>
);

const EdgeDisplay = ({ edge, nodes }: { edge: Edge, nodes: Node[] }) => {
  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode = nodes.find(n => n.id === edge.to);
  if (!fromNode || !toNode) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 p-2 border-b border-dashed border-border/30 text-sm">
      <span className="font-medium text-foreground/90 flex items-center"><NodeIcon type={fromNode.type} />{fromNode.label}</span>
      <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">{edge.label}</span>
      <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="font-medium text-foreground/90 flex items-center"><NodeIcon type={toNode.type} />{toNode.label}</span>
    </div>
  );
};

export function SimulatedKnowledgeGraph({ className, ...props }: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  const data = simulatedChapter1Data; 

  return (
    <div data-ai-hint="knowledge graph simulation" className={className ? className : "space-y-6 p-1"} {...props}>
      <h3 className="text-lg font-artistic font-semibold text-center text-primary mb-4">{data.chapterTitle} - 主要概念關聯 (模擬)</h3>
      
      <div className="mb-6">
        <h4 className="font-semibold text-accent mb-3 text-center border-b border-accent/30 pb-1">主要元素:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {data.nodes.map(node => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-accent mb-3 text-center border-b border-accent/30 pb-1">主要關聯:</h4>
        <div className="space-y-1.5 max-h-60 overflow-y-auto p-1 rounded-md bg-muted/10">
          {data.edges.map((edge, index) => (
            <EdgeDisplay key={index} edge={edge} nodes={data.nodes} />
          ))}
        </div>
      </div>
       <p className="text-xs text-muted-foreground text-center mt-6">
        (此為基於第一回內容的前端模擬知識圖譜。未來將根據您的完整學習歷史動態生成更複雜的交互式圖譜。)
      </p>
    </div>
  );
}
