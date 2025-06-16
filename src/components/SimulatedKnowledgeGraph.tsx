"use client";
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { useState } from 'react';

export function SimulatedKnowledgeGraph({ className, ...props }: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  // Updated ImgBB direct image URL
  const imageUrl = "https://i.ibb.co/8gqXHgCK/knowledge-Graph-main-Page-for-Reading-Page.jpg";
  const [imageError, setImageError] = useState(false);

  // Enhanced fallback content with Dream of Red Chamber theme
  const FallbackContent = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 rounded-lg border-2 border-red-200">
      {/* Traditional Chinese pattern decoration */}
      <div className="text-6xl mb-4 animate-pulse">🌸</div>
      
      {/* Title */}
      <h3 className="text-2xl font-bold text-red-800 mb-2 text-center">知識圖譜</h3>
      <h4 className="text-lg font-semibold text-amber-700 mb-4">紅樓夢人物關係圖</h4>
      
      {/* Character names in traditional layout */}
      <div className="grid grid-cols-3 gap-2 text-sm text-red-700 text-center mb-4">
        <div className="bg-red-100 rounded-full px-3 py-1">賈寶玉</div>
        <div className="bg-yellow-100 rounded-full px-3 py-1">林黛玉</div>
        <div className="bg-green-100 rounded-full px-3 py-1">薛寶釵</div>
        <div className="bg-blue-100 rounded-full px-3 py-1">王夫人</div>
        <div className="bg-purple-100 rounded-full px-3 py-1">賈母</div>
        <div className="bg-pink-100 rounded-full px-3 py-1">史湘雲</div>
      </div>
      
      {/* Description */}
      <p className="text-sm text-slate-600 text-center px-6 leading-relaxed">
        章回知識圖譜展示區域<br/>
        <span className="text-xs text-slate-500">
          Knowledge Graph Display Area<br/>
          圖片載入中或載入失敗
        </span>
      </p>
    </div>
  );

  return (
    <div
      className={cn(
        "w-full flex items-center justify-center", // Takes full width from parent
        className // Parent should provide min-height, e.g., min-h-[300px] or specific height
      )}
      {...props}
      data-ai-hint="character relationship map"
    >
      {/* Container for original size image display */}
      <div className="flex items-center justify-center">
        {imageError ? (
          <div style={{
            width: '800px', // Fallback container size
            height: '400px',
            position: 'relative',
          }}>
            <FallbackContent />
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt="章回知識圖譜 - 紅樓夢人物關係與事件脈絡圖" // Alt text in Traditional Chinese
            width={0} // Let Next.js determine dimensions
            height={0} // Let Next.js determine dimensions
            sizes="100vw" // Responsive sizing
            style={{ 
              width: 'auto', 
              height: 'auto',
              maxWidth: '100%', // Ensure it doesn't overflow container
              maxHeight: '100%'
            }}
            quality={90} // Higher quality for knowledge graph details
            onError={() => setImageError(true)} // Handle image load errors
            // Using unoptimized in dev can help rule out Next.js image optimizer issues
            unoptimized={process.env.NODE_ENV === 'development'}
          />
        )}
      </div>
    </div>
  );
}
