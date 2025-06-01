
"use client";
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import { cn } from "@/lib/utils"; 

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'character' | 'concept' | 'event';
}

interface Edge {
  from: string;
  to: string;
  label: string;
}

interface SimulatedGraphData {
  chapterTitle: string;
  nodes: Node[];
  edges: Edge[];
  viewBoxWidth: number;
  viewBoxHeight: number;
}

const simulatedChapter1Data: SimulatedGraphData = {
  chapterTitle: "第一回 甄士隱夢幻識通靈 賈雨村風塵懷閨秀",
  nodes: [
    { id: "zhen_shiyin", label: "甄士隱", x: 100, y: 200, type: "character" },
    { id: "jia_yucun", label: "賈雨村", x: 300, y: 100, type: "character" },
    { id: "stone", label: "通靈寶玉", x: 300, y: 300, type: "concept" },
    { id: "monks", label: "僧道二人", x: 500, y: 200, type: "character" },
    { id: "yinglian", label: "英蓮", x: 100, y: 350, type: "character" },
    { id: "dream_theme", label: "夢幻主題", x: 500, y: 50, type: "concept" },
  ],
  edges: [
    { from: "monks", to: "zhen_shiyin", label: "點化" },
    { from: "monks", to: "stone", label: "談論" },
    { from: "zhen_shiyin", to: "jia_yucun", label: "資助" },
    { from: "zhen_shiyin", to: "yinglian", label: "父女" },
    { from: "stone", to: "dream_theme", label: "核心象徵" },
    { from: "jia_yucun", to: "dream_theme", label: "應和" },
  ],
  viewBoxWidth: 600,
  viewBoxHeight: 400,
};

const NODE_WIDTH = 100;
const NODE_HEIGHT = 40;
const TEXT_OFFSET_Y = 5; 

export function SimulatedKnowledgeGraph({ className, ...props }: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  const data = simulatedChapter1Data;
  const nodesMap = new Map(data.nodes.map(node => [node.id, node]));

  return (
    <div data-ai-hint="knowledge graph svg simulation" className={cn("space-y-2 p-1 flex flex-col items-center h-full", className)} {...props}>
      {/* Title removed from here, will be in SheetHeader */}
      <svg 
        width="100%" 
        height="100%" // Make SVG take full height of its container
        viewBox={`0 0 ${data.viewBoxWidth} ${data.viewBoxHeight}`} 
        className="border rounded-md bg-card/50 shadow-inner flex-grow" // flex-grow to take available space
        preserveAspectRatio="xMidYMid meet" // Ensures graph scales nicely
        style={{ minHeight: `${data.viewBoxHeight}px`}}
      >
        {/* Edges */}
        {data.edges.map((edge, index) => {
          const fromNode = nodesMap.get(edge.from);
          const toNode = nodesMap.get(edge.to);
          if (!fromNode || !toNode) return null;

          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;

          return (
            <g key={`edge-${index}`}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="hsl(var(--accent))" 
                strokeWidth="1.5"
                markerEnd="url(#arrowhead)"
              />
              <text
                x={midX}
                y={midY - 5} 
                fill="hsl(var(--muted-foreground))"
                fontSize="10"
                textAnchor="middle"
                className="font-sans"
              >
                {edge.label}
              </text>
            </g>
          );
        })}

        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="8" 
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L8,3 z" fill="hsl(var(--accent))" />
          </marker>
        </defs>

        {data.nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x - NODE_WIDTH / 2}, ${node.y - NODE_HEIGHT / 2})`}>
            <rect
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              rx="5" 
              ry="5"
              fill="hsl(var(--card))"
              stroke="hsl(var(--primary))"
              strokeWidth="1"
            />
            <text
              x={NODE_WIDTH / 2}
              y={NODE_HEIGHT / 2 + TEXT_OFFSET_Y}
              textAnchor="middle"
              fill="hsl(var(--card-foreground))"
              fontSize="12"
              className="font-semibold font-sans" 
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      {/* Description removed from here, will be in SheetDescription */}
    </div>
  );
}

    