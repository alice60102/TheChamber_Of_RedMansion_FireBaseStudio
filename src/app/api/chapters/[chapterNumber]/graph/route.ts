// API route to serve chapter knowledge graph data
// This will eventually connect to cloud database

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterNumber: string }> }
) {
  try {
    const { chapterNumber } = await params;
    
    // Validate chapter number
    const chapterNum = parseInt(chapterNumber);
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 120) {
      return NextResponse.json(
        { error: 'Invalid chapter number' },
        { status: 400 }
      );
    }

    // For now, load from local file
    // In production, this will connect to cloud database
    const filePath = path.join(
      process.cwd(),
      'src',
      'app',
      '(main)',
      'read',
      'chapterGraph',
      `chapter${chapterNumber}.json`
    );

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const chapterData = JSON.parse(fileContent);
      
      return NextResponse.json(chapterData);
    } catch (fileError) {
      // If file doesn't exist, return empty data
      return NextResponse.json({
        entities: [],
        relationships: [],
        metadata: {
          version: 'empty',
          description: `第${chapterNumber}回知識圖譜數據尚未準備`,
          processing_time: 0,
          chunks_processed: 0,
          total_characters: 0,
          clustering_time: 0,
          clustered_entities: 0,
          phase3_time: 0,
          synonym_merges_applied: 0,
          entities_merged: 0,
          total_processing_time: 0,
          strategy: '空數據',
          text_length: 0,
          original_entities: 0,
          streamlined_entities: 0,
          original_relationships: 0,
          streamlined_relationships: 0,
          reduction_ratio: '0%',
          focus: '無數據',
          creation_date: new Date().toISOString().split('T')[0],
          notes: `第${chapterNumber}回的知識圖譜數據尚未生成或上傳至資料庫`
        }
      });
    }

  } catch (error) {
    console.error('Error loading chapter graph data:', error);
    return NextResponse.json(
      { error: 'Failed to load chapter graph data' },
      { status: 500 }
    );
  }
}

// Future implementation for POST (uploading new graph data to database)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chapterNumber: string }> }
) {
  try {
    const { chapterNumber } = await params;
    const chapterData = await request.json();
    
    // TODO: Implement cloud database storage
    // For now, return success but don't actually store
    console.log(`Received graph data for chapter ${chapterNumber}:`, chapterData.metadata);
    
    return NextResponse.json(
      { 
        message: `Chapter ${chapterNumber} graph data received`,
        status: 'pending_database_implementation'
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error storing chapter graph data:', error);
    return NextResponse.json(
      { error: 'Failed to store chapter graph data' },
      { status: 500 }
    );
  }
} 