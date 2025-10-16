"use client";

import { Note } from '@/lib/notes-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BookOpen, Pen, Share2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface NoteStatsProps {
  notes: Note[];
}

export function NoteStats({ notes }: NoteStatsProps) {
  const { t } = useLanguage();

  // Calculate statistics
  const totalNotes = notes.length;
  const totalWordCount = notes.reduce((sum, note) => sum + (note.wordCount || 0), 0);
  const uniqueChapters = new Set(notes.map(note => note.chapterId)).size;
  const publicNotes = notes.filter(note => note.isPublic).length;

  const stats = [
    {
      icon: FileText,
      label: t('notes.totalNotes'),
      value: totalNotes,
      color: 'text-blue-500'
    },
    {
      icon: BookOpen,
      label: t('notes.chaptersCovered'),
      value: uniqueChapters,
      color: 'text-green-500'
    },
    {
      icon: Pen,
      label: t('notes.totalWords'),
      value: totalWordCount,
      color: 'text-purple-500'
    },
    {
      icon: Share2,
      label: t('notes.publicNotes'),
      value: publicNotes,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <div className="text-3xl font-bold">{stat.value}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
