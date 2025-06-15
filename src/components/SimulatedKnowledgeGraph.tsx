
"use client";
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";

export function SimulatedKnowledgeGraph({ className, ...props }: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  const imageUrl = "https://github.com/user-attachments/assets/9c6080c1-53ea-4d33-8d8c-0d050aa4bdf4";

  return (
    <div
      className={cn(
        "w-full flex items-center justify-center", // Takes full width from parent
        className // Parent should provide min-height, e.g., min-h-[300px] or specific height
      )}
      {...props}
      data-ai-hint="character relationship map"
    >
      {/* Inner div with explicit size and relative positioning for Image fill */}
      <div style={{
        width: '100%', // Takes full width of its flex container
        height: '400px', // Explicit height for testing visibility
        position: 'relative',
        border: '3px dashed red', // Highly visible debug border
        backgroundColor: 'rgba(200, 200, 200, 0.5)' // Debug background to see the area
      }}>
        <Image
          src={imageUrl}
          alt="章回知識圖譜 - 紅樓夢人物關係與事件脈絡圖" // Alt text in Traditional Chinese
          layout="fill"
          objectFit="contain" // Ensures the whole image is visible and aspect ratio is maintained
          quality={75}
          // Using unoptimized in dev can help rule out Next.js image optimizer issues
          unoptimized={process.env.NODE_ENV === 'development'}
        />
      </div>
    </div>
  );
}
