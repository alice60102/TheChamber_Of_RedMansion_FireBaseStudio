
"use client";
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils"; 

// Interface and data for simulated graph are no longer needed

export function SimulatedKnowledgeGraph({ className, ...props }: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  const imageUrl = "https://storage.googleapis.com/project-ai-prototyper.appspot.com/sandbox/c3e81d33-d52d-4f66-97c7-aa8901a54197.png";

  return (
    <div 
      className={cn("p-1 flex flex-col items-center justify-center h-full w-full", className)} 
      {...props}
      data-ai-hint="character relationship map"
    >
      <div className="relative w-full h-full border rounded-md bg-card/50 shadow-inner overflow-hidden">
        <Image
          src={imageUrl}
          alt="章回知識圖譜 - 紅樓夢人物關係圖"
          layout="fill"
          objectFit="contain" // or "cover", "scale-down" depending on desired behavior
          quality={90}
          priority // If this image is critical for LCP
        />
      </div>
    </div>
  );
}
