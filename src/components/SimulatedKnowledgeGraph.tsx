
"use client";
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";

export function SimulatedKnowledgeGraph({ className, ...props }: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  const imageUrl = "https://github.com/user-attachments/assets/9c6080c1-53ea-4d33-8d8c-0d050aa4bdf4";

  return (
    <div
      className={cn(
        "relative w-full border rounded-md bg-card/50 shadow-inner overflow-hidden", // Base styles for the container
        className // Styles from parent, e.g., w-full min-h-[300px]
      )}
      {...props}
      data-ai-hint="character relationship map"
    >
      <Image
        src={imageUrl}
        alt="章回知識圖譜 - 紅樓夢人物關係圖"
        layout="fill"
        objectFit="contain" // Ensures the whole image is visible and aspect ratio is maintained
        quality={90}
        priority // Consider if this image is critical for Largest Contentful Paint
      />
    </div>
  );
}
