/**
 * @fileOverview Interactive D3.js Knowledge Graph Visualization Component
 * 
 * This component provides an immersive, interactive knowledge graph visualization
 * for Chapter 1 of Dream of the Red Chamber based on research outputs from R.6/R.11.
 * It implements smooth zoom, pan, and node interactions with traditional Chinese aesthetics.
 * 
 * Key Features:
 * - D3.js force-directed graph layout with physics simulation
 * - Interactive node dragging, zooming (0.1x to 3x), and panning
 * - Entity categorization with color-coded visual representation
 * - Traditional Chinese color scheme and typography
 * - Smooth animations and transitions for user interactions
 * - Node hover effects and relationship highlighting
 * - Search functionality with visual node highlighting
 * - Expert-validated data from kg-gen DeepSeek processing
 * 
 * Technical Implementation:
 * - Uses D3.js v7 for visualization and physics simulation
 * - React functional component with hooks for state management
 * - SVG-based rendering for scalable vector graphics
 * - Force simulation with customizable node and link forces
 * - Responsive design adapting to container dimensions
 * - Performance optimized for smooth 60fps interactions
 * 
 * Cultural Design Elements:
 * - Traditional Chinese red (#DC2626) as primary accent color
 * - Elegant gold (#EAB308) for highlights and important nodes
 * - Classical typography supporting Traditional Chinese characters
 * - Aesthetic inspired by ancient Chinese scholarly traditions
 * - Subtle gradients and shadows maintaining cultural authenticity
 */

"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Search, 
  RotateCcw, 
  Play, 
  Pause, 
  ZoomIn, 
  ZoomOut,
  Info
} from 'lucide-react';

// Chapter 1 Knowledge Graph Data from R.6/R.11 Research (Expert-validated)
// This data structure is based on final_results_20250619_182710.json with D3.js optimization
interface KnowledgeGraphNode {
  id: string;
  name: string;
  type: 'character' | 'location' | 'concept' | 'event' | 'artifact';
  importance: 'primary' | 'secondary' | 'tertiary';
  description: string;
  category: string; // For grouping related entities
  // D3.js specific properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null; // Fixed position x
  fy?: number | null; // Fixed position y
  radius: number;
  color: string;
  group: number;
}

interface KnowledgeGraphLink {
  source: string | KnowledgeGraphNode;
  target: string | KnowledgeGraphNode;
  relationship: string;
  strength: number; // 0-1 for physics simulation
  type: 'family' | 'friendship' | 'conflict' | 'literary' | 'conceptual';
  description: string;
  distance: number; // For force simulation
}

interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  links: KnowledgeGraphLink[];
}

// Chapter 1 data extracted and transformed from kg-gen results
const chapter1GraphData: KnowledgeGraphData = {
  nodes: [
    // Primary Characters
    {
      id: 'nuwa',
      name: '女媧氏',
      type: 'character',
      importance: 'primary',
      description: '煉石補天的古代神話人物，創造了通靈寶玉',
      category: '神話人物',
      radius: 25,
      color: '#DC2626', // Traditional Chinese red
      group: 1
    },
    {
      id: 'stone',
      name: '頑石/通靈寶玉',
      type: 'artifact',
      importance: 'primary',
      description: '女媧補天剩下的石頭，後來變成通靈寶玉',
      category: '神器',
      radius: 22,
      color: '#EAB308', // Golden yellow
      group: 1
    },
    {
      id: 'monk',
      name: '那僧',
      type: 'character',
      importance: 'primary',
      description: '神祕的僧人，與道士一起點化頑石',
      category: '神仙',
      radius: 20,
      color: '#7C3AED', // Purple for mystical
      group: 2
    },
    {
      id: 'taoist',
      name: '道士',
      type: 'character',
      importance: 'primary',
      description: '神祕的道士，與僧人一起帶走通靈寶玉',
      category: '神仙',
      radius: 20,
      color: '#7C3AED',
      group: 2
    },
    {
      id: 'zhen-shiyin',
      name: '甄士隱',
      type: 'character',
      importance: 'primary',
      description: '姑蘇鄉紳，甄費字士隱，後來看破紅塵出家',
      category: '世俗人物',
      radius: 18,
      color: '#059669', // Emerald green
      group: 3
    },
    {
      id: 'jia-yucun',
      name: '賈雨村',
      type: 'character',
      importance: 'primary',
      description: '窮儒，賈化字時飛別號雨村，後來高中進士',
      category: '世俗人物',
      radius: 18,
      color: '#059669',
      group: 3
    },
    {
      id: 'yinglian',
      name: '英蓮',
      type: 'character',
      importance: 'secondary',
      description: '甄士隱之女，三歲時被拐走',
      category: '世俗人物',
      radius: 15,
      color: '#EC4899', // Pink for female character
      group: 3
    },
    {
      id: 'feng-shi',
      name: '封氏',
      type: 'character',
      importance: 'secondary',
      description: '甄士隱的妻子，性情賢淑',
      category: '世俗人物',
      radius: 12,
      color: '#EC4899',
      group: 3
    },
    
    // Locations
    {
      id: 'qingeng-peak',
      name: '青埂峰',
      type: 'location',
      importance: 'primary',
      description: '大荒山無稽崖下的山峰，頑石棄置之地',
      category: '神話地點',
      radius: 16,
      color: '#8B5CF6', // Purple for mystical places
      group: 4
    },
    {
      id: 'suzhou',
      name: '姑蘇城',
      type: 'location',
      importance: 'secondary',
      description: '甄士隱居住的城市',
      category: '世俗地點',
      radius: 14,
      color: '#F59E0B', // Amber for earthly places
      group: 4
    },
    {
      id: 'hulu-temple',
      name: '葫蘆廟',
      type: 'location',
      importance: 'secondary',
      description: '賈雨村寄居的廟宇',
      category: '世俗地點',
      radius: 12,
      color: '#F59E0B',
      group: 4
    },
    
    // Concepts and Events
    {
      id: 'mending-sky',
      name: '煉石補天',
      type: 'event',
      importance: 'primary',
      description: '女媧氏煉石補天的神話事件',
      category: '神話事件',
      radius: 14,
      color: '#DC2626',
      group: 5
    },
    {
      id: 'good-song',
      name: '好了歌',
      type: 'concept',
      importance: 'secondary',
      description: '跛足道人所唱，點化世人的歌謠',
      category: '哲學思想',
      radius: 12,
      color: '#0891B2', // Cyan for philosophical concepts
      group: 5
    },
    {
      id: 'vanity-fair',
      name: '溫柔富貴鄉',
      type: 'concept',
      importance: 'secondary',
      description: '僧道所說的花柳繁華地',
      category: '文學概念',
      radius: 12,
      color: '#0891B2',
      group: 5
    },
    {
      id: 'stone-record',
      name: '石頭記',
      type: 'artifact',
      importance: 'primary',
      description: '石頭記述的故事，即紅樓夢本身',
      category: '文學作品',
      radius: 16,
      color: '#EAB308',
      group: 1
    }
  ],
  links: [
    // Mythical relationships
    { source: 'nuwa', target: 'stone', relationship: '煉造', strength: 0.9, type: 'literary', description: '女媧煉石補天，剩下頑石', distance: 80 },
    { source: 'stone', target: 'monk', relationship: '點化', strength: 0.8, type: 'literary', description: '僧人點化頑石', distance: 100 },
    { source: 'stone', target: 'taoist', relationship: '點化', strength: 0.8, type: 'literary', description: '道士點化頑石', distance: 100 },
    { source: 'monk', target: 'taoist', relationship: '同伴', strength: 0.7, type: 'friendship', description: '一僧一道結伴而行', distance: 90 },
    { source: 'stone', target: 'qingeng-peak', relationship: '棄置', strength: 0.6, type: 'conceptual', description: '頑石被棄置在青埂峰下', distance: 120 },
    { source: 'mending-sky', target: 'nuwa', relationship: '主導', strength: 0.9, type: 'literary', description: '女媧主導補天事件', distance: 70 },
    { source: 'mending-sky', target: 'stone', relationship: '產生', strength: 0.8, type: 'literary', description: '補天事件產生了頑石', distance: 80 },
    
    // Worldly relationships
    { source: 'zhen-shiyin', target: 'feng-shi', relationship: '夫妻', strength: 0.9, type: 'family', description: '甄士隱的妻子', distance: 60 },
    { source: 'zhen-shiyin', target: 'yinglian', relationship: '父女', strength: 0.9, type: 'family', description: '甄士隱的女兒', distance: 60 },
    { source: 'zhen-shiyin', target: 'jia-yucun', relationship: '資助', strength: 0.7, type: 'friendship', description: '甄士隱資助賈雨村', distance: 100 },
    { source: 'jia-yucun', target: 'hulu-temple', relationship: '寄居', strength: 0.6, type: 'conceptual', description: '賈雨村寄居葫蘆廟', distance: 80 },
    { source: 'zhen-shiyin', target: 'suzhou', relationship: '居住', strength: 0.7, type: 'conceptual', description: '甄士隱住在姑蘇城外', distance: 90 },
    { source: 'hulu-temple', target: 'suzhou', relationship: '毗鄰', strength: 0.5, type: 'conceptual', description: '葫蘆廟在姑蘇城關外', distance: 70 },
    
    // Philosophical connections
    { source: 'good-song', target: 'zhen-shiyin', relationship: '點化', strength: 0.8, type: 'literary', description: '好了歌點化甄士隱', distance: 110 },
    { source: 'vanity-fair', target: 'monk', relationship: '描述', strength: 0.6, type: 'conceptual', description: '僧人描述溫柔富貴鄉', distance: 120 },
    { source: 'vanity-fair', target: 'taoist', relationship: '描述', strength: 0.6, type: 'conceptual', description: '道士描述溫柔富貴鄉', distance: 120 },
    
    // Meta-literary connections
    { source: 'stone-record', target: 'stone', relationship: '記述', strength: 0.9, type: 'literary', description: '石頭記述自己的經歷', distance: 50 },
    { source: 'stone-record', target: 'zhen-shiyin', relationship: '記錄', strength: 0.7, type: 'literary', description: '記錄甄士隱的故事', distance: 100 },
    { source: 'stone-record', target: 'jia-yucun', relationship: '記錄', strength: 0.7, type: 'literary', description: '記錄賈雨村的故事', distance: 100 }
  ]
};

// Component Props Interface
interface KnowledgeGraphViewerProps {
  className?: string;
  width?: number;
  height?: number;
  onNodeClick?: (node: KnowledgeGraphNode) => void;
  data?: KnowledgeGraphData;
  fullscreen?: boolean; // New prop for fullscreen mode
}

export const KnowledgeGraphViewer: React.FC<KnowledgeGraphViewerProps> = ({
  className,
  width = 800,
  height = 600,
  onNodeClick,
  data = chapter1GraphData,
  fullscreen = false
}) => {
  // Handle dynamic resize for fullscreen mode
  const [dimensions, setDimensions] = useState({ width, height });
  
  useEffect(() => {
    setDimensions({ width, height });
  }, [width, height]);
  
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };
    
    // Add resize listener for fullscreen mode
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  // Refs for D3.js integration
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<KnowledgeGraphNode, KnowledgeGraphLink> | null>(null);
  
  // Component state
  const [isPlaying, setIsPlaying] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // D3.js zoom behavior
  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Initialize D3.js visualization
  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    // Create main group for zooming and panning
    const g = svg.append("g").attr("class", "main-group");

    // Define gradients for enhanced visual appeal
    const defs = svg.append("defs");
    
    // Gradient for links
    const linkGradient = defs.append("linearGradient")
      .attr("id", "link-gradient")
      .attr("gradientUnits", "userSpaceOnUse");
    linkGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#DC2626")
      .attr("stop-opacity", 0.6);
    linkGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#EAB308")
      .attr("stop-opacity", 0.3);

    // Create force simulation
    const simulation = d3.forceSimulation<KnowledgeGraphNode>(data.nodes)
      .force("link", d3.forceLink<KnowledgeGraphNode, KnowledgeGraphLink>(data.links)
        .id(d => d.id)
        .distance(d => d.distance)
        .strength(d => d.strength * 0.3))
      .force("charge", d3.forceManyBody()
        .strength(-800)
        .distanceMax(400))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collision", d3.forceCollide()
        .radius(d => (d as KnowledgeGraphNode).radius + 5)
        .strength(0.7));

    simulationRef.current = simulation;

    // Create links
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("stroke", "url(#link-gradient)")
      .attr("stroke-width", d => Math.sqrt(d.strength) * 3)
      .attr("stroke-opacity", 0.6)
      .style("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))");

    // Create nodes
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(data.nodes)
      .enter().append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(d3.drag<SVGGElement, KnowledgeGraphNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add circular backgrounds for nodes
    node.append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => d.color)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0px 4px 8px rgba(0,0,0,0.2))")
      .style("opacity", 0.9);

    // Add inner circles for depth
    node.append("circle")
      .attr("r", d => d.radius - 5)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.5)")
      .attr("stroke-width", 1);

    // Add text labels
    node.append("text")
      .text(d => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("font-family", "'Noto Serif SC', serif")
      .style("font-size", d => `${Math.max(8, d.radius / 2)}px`)
      .style("font-weight", "600")
      .style("fill", "#ffffff")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.7)")
      .style("pointer-events", "none");

    // Node interaction handlers
    node
      .on("click", (event, d) => {
        setSelectedNode(d.id);
        onNodeClick?.(d);
      })
      .on("mouseenter", (event, d) => {
        setHoveredNode(d.id);
        
        // Highlight connected links
        link.style("stroke-opacity", l => 
          (l.source as KnowledgeGraphNode).id === d.id || 
          (l.target as KnowledgeGraphNode).id === d.id ? 1 : 0.2);
        
        // Highlight connected nodes
        node.select("circle")
          .style("opacity", n => {
            if (n.id === d.id) return 1;
            return data.links.some(l => 
              ((l.source as KnowledgeGraphNode).id === d.id && (l.target as KnowledgeGraphNode).id === n.id) ||
              ((l.target as KnowledgeGraphNode).id === d.id && (l.source as KnowledgeGraphNode).id === n.id)
            ) ? 0.8 : 0.3;
          });
      })
      .on("mouseleave", () => {
        setHoveredNode(null);
        link.style("stroke-opacity", 0.6);
        node.select("circle").style("opacity", 0.9);
      });

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as KnowledgeGraphNode).x!)
        .attr("y1", d => (d.source as KnowledgeGraphNode).y!)
        .attr("x2", d => (d.target as KnowledgeGraphNode).x!)
        .attr("y2", d => (d.target as KnowledgeGraphNode).y!);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Setup zoom and pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        const { transform } = event;
        g.attr("transform", transform);
        setZoomLevel(transform.k);
      });

    zoomBehavior.current = zoom;
    svg.call(zoom);

    // Cleanup function
    return () => {
      simulation.stop();
    };
  }, [data, dimensions.width, dimensions.height, onNodeClick]);

  // Search functionality
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const nodes = svg.selectAll(".node");

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      nodes.select("circle")
        .style("stroke", d => 
          (d as KnowledgeGraphNode).name.toLowerCase().includes(searchLower) ? 
          "#ff6b6b" : "#ffffff")
        .style("stroke-width", d => 
          (d as KnowledgeGraphNode).name.toLowerCase().includes(searchLower) ? 
          5 : 3);
    } else {
      nodes.select("circle")
        .style("stroke", "#ffffff")
        .style("stroke-width", 3);
    }
  }, [searchTerm]);

  // Control functions
  const resetView = useCallback(() => {
    if (!svgRef.current || !zoomBehavior.current) return;
    
    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .call(zoomBehavior.current.transform, d3.zoomIdentity);
  }, []);

  const toggleSimulation = useCallback(() => {
    if (!simulationRef.current) return;
    
    if (isPlaying) {
      simulationRef.current.stop();
    } else {
      simulationRef.current.restart();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const zoomIn = useCallback(() => {
    if (!svgRef.current || !zoomBehavior.current) return;
    
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehavior.current.scaleBy, 1.5);
  }, []);

  const zoomOut = useCallback(() => {
    if (!svgRef.current || !zoomBehavior.current) return;
    
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehavior.current.scaleBy, 1 / 1.5);
  }, []);

  // Fullscreen mode - minimal UI
  if (fullscreen) {
    return (
      <div className={cn("relative w-full h-full", className)}>
        {/* Fullscreen graph container */}
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full bg-gradient-to-br from-black via-gray-900 to-black"
        />
        
        {/* Floating controls for fullscreen */}
        <div className="absolute top-6 left-6 flex items-center space-x-3 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="text-white text-sm font-medium">
            縮放: {zoomLevel.toFixed(1)}x
          </div>
          <div className="w-px h-4 bg-white/30"></div>
          <Button variant="ghost" size="sm" onClick={toggleSimulation} className="text-white hover:bg-white/20 h-8 w-8 p-0">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={zoomOut} className="text-white hover:bg-white/20 h-8 w-8 p-0">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={zoomIn} className="text-white hover:bg-white/20 h-8 w-8 p-0">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={resetView} className="text-white hover:bg-white/20 h-8 w-8 p-0">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Floating search for fullscreen */}
        <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-sm rounded-lg p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜尋節點..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48 bg-black/60 border-white/20 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Floating legend for fullscreen */}
        <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
          <h4 className="font-semibold text-sm mb-3">圖例</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>神話人物</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>世俗人物</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>神仙</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>神器/文學</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>地點</span>
            </div>
          </div>
        </div>

        {/* Floating node info for fullscreen */}
        {hoveredNode && (
          <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
            {(() => {
              const node = data.nodes.find(n => n.id === hoveredNode);
              return node ? (
                <div>
                  <h4 className="font-bold mb-1">{node.name}</h4>
                  <p className="text-sm text-gray-300 mb-1">類型: {node.type}</p>
                  <p className="text-xs text-gray-400">{node.description}</p>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Floating statistics for fullscreen */}
        <div className="absolute bottom-6 center-6 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-xs">
          <div className="flex items-center space-x-4">
            <span>節點: {data.nodes.length}</span>
            <div className="w-px h-3 bg-white/30"></div>
            <span>關係: {data.links.length}</span>
            <div className="w-px h-3 bg-white/30"></div>
            <span className="flex items-center space-x-1">
              <Info className="h-3 w-3" />
              <span>拖拽節點以移動，滾輪縮放，點擊選擇</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Regular mode with traditional UI
  return (
    <div className={cn("flex flex-col bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 rounded-lg border shadow-lg", className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-bold font-serif">第一回 知識圖譜</h3>
          <div className="text-sm opacity-90">
            縮放: {zoomLevel.toFixed(1)}x
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜尋節點..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-40 bg-white/90 text-gray-800"
            />
          </div>
          
          {/* Controls */}
          <Button variant="outline" size="sm" onClick={toggleSimulation} className="bg-white/10 border-white/30 text-white hover:bg-white/20">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={zoomOut} className="bg-white/10 border-white/30 text-white hover:bg-white/20">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={zoomIn} className="bg-white/10 border-white/30 text-white hover:bg-white/20">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetView} className="bg-white/10 border-white/30 text-white hover:bg-white/20">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Graph container */}
      <div className="relative flex-1 overflow-hidden">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100"
        />
        
        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white/95 rounded-lg p-3 shadow-lg border">
          <h4 className="font-semibold text-sm mb-2 text-gray-800">圖例</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>神話人物</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span>世俗人物</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
              <span>神仙</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              <span>神器/文學</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-amber-600"></div>
              <span>地點</span>
            </div>
          </div>
        </div>

        {/* Node info panel */}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg p-4 shadow-lg border max-w-xs">
            {(() => {
              const node = data.nodes.find(n => n.id === hoveredNode);
              return node ? (
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">{node.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">類型: {node.type}</p>
                  <p className="text-xs text-gray-500">{node.description}</p>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* Footer with statistics */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-600 rounded-b-lg">
        <div className="flex justify-between items-center">
          <span>節點: {data.nodes.length} | 關係: {data.links.length}</span>
          <span className="flex items-center space-x-1">
            <Info className="h-3 w-3" />
            <span>拖拽節點以移動，滾輪縮放，點擊選擇</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphViewer;