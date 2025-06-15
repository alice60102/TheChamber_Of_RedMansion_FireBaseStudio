
"use client";
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";

export function SimulatedKnowledgeGraph({ className, ...props }: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  const imageUrl = "https://github.com/user-attachments/assets/9c6080c1-53ea-4d33-8d8c-0d050aa4bdf4";

  return (
    <div
      className={cn(
        "relative overflow-hidden", // Minimal base styles
        "border border-dashed border-primary/50 bg-muted/20", // Debug styles to see the container
        className // This is where w-full min-h-[300px] from parent should apply
      )}
      {...props}
      data-ai-hint="character relationship map"
    >
      <Image
        src={imageUrl}
        alt="知識圖譜 - 紅樓夢人物關係與事件脈絡圖" // Standardized alt text
        layout="fill"
        objectFit="contain" // Ensures the whole image is visible and aspect ratio is maintained
        quality={75}
      />
    </div>
  );
}
