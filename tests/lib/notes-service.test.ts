/**
 * @fileOverview Unit tests for notes service
 *
 * Tests the note-taking functionality including:
 * - Creating notes (public and private)
 * - Updating notes
 * - Deleting notes
 * - Fetching notes by user and chapter
 * - Public note visibility
 */

import {
  saveNote,
  updateNote,
  updateNoteVisibility,
  deleteNoteById,
  getNotesByUserAndChapter,
  getPublicNotes,
  type Note
} from '@/lib/notes-service';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

describe('Notes Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveNote', () => {
    it('should save a private note with all required fields', async () => {
      const mockDocRef = { id: 'mock-note-id-123' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const noteData: Omit<Note, 'id' | 'createdAt'> = {
        userId: 'user-123',
        chapterId: 1,
        selectedText: '此開卷第一回也',
        note: '這是我的第一篇筆記',
        isPublic: false
      };

      const noteId = await saveNote(noteData);

      expect(noteId).toBe('mock-note-id-123');
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'user-123',
          chapterId: 1,
          selectedText: '此開卷第一回也',
          note: '這是我的第一篇筆記',
          isPublic: false,
          wordCount: expect.any(Number),
          tags: [],
          createdAt: expect.any(Object),
          lastModified: expect.any(Object)
        })
      );
    });

    it('should save a public note correctly', async () => {
      const mockDocRef = { id: 'mock-public-note-id' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const noteData: Omit<Note, 'id' | 'createdAt'> = {
        userId: 'user-456',
        chapterId: 2,
        selectedText: '女媧氏煉石補天',
        note: '這是一個公開的筆記',
        isPublic: true,
        tags: ['第2回', '神話']
      };

      const noteId = await saveNote(noteData);

      expect(noteId).toBe('mock-public-note-id');
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isPublic: true,
          tags: ['第2回', '神話']
        })
      );
    });

    it('should calculate word count correctly', async () => {
      const mockDocRef = { id: 'mock-note-id' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const noteData: Omit<Note, 'id' | 'createdAt'> = {
        userId: 'user-123',
        chapterId: 1,
        selectedText: 'test',
        note: '這是 一個 測試 筆記 內容',
        isPublic: false
      };

      await saveNote(noteData);

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          wordCount: 5 // 5 words separated by spaces
        })
      );
    });
  });

  describe('updateNote', () => {
    it('should update note content and word count', async () => {
      const mockNoteRef = {};
      (doc as jest.Mock).mockReturnValue(mockNoteRef);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateNote('note-id-123', '更新後的筆記內容');

      expect(updateDoc).toHaveBeenCalledWith(
        mockNoteRef,
        expect.objectContaining({
          note: '更新後的筆記內容',
          wordCount: expect.any(Number),
          lastModified: expect.any(Object)
        })
      );
    });
  });

  describe('updateNoteVisibility', () => {
    it('should update note visibility to public', async () => {
      const mockNoteRef = {};
      (doc as jest.Mock).mockReturnValue(mockNoteRef);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateNoteVisibility('note-id-123', true);

      expect(updateDoc).toHaveBeenCalledWith(
        mockNoteRef,
        expect.objectContaining({
          isPublic: true,
          lastModified: expect.any(Object)
        })
      );
    });

    it('should update note visibility to private', async () => {
      const mockNoteRef = {};
      (doc as jest.Mock).mockReturnValue(mockNoteRef);
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateNoteVisibility('note-id-456', false);

      expect(updateDoc).toHaveBeenCalledWith(
        mockNoteRef,
        expect.objectContaining({
          isPublic: false
        })
      );
    });
  });

  describe('deleteNoteById', () => {
    it('should delete a note by id', async () => {
      const mockNoteRef = {};
      (doc as jest.Mock).mockReturnValue(mockNoteRef);
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await deleteNoteById('note-id-789');

      expect(deleteDoc).toHaveBeenCalledWith(mockNoteRef);
    });
  });

  describe('getNotesByUserAndChapter', () => {
    it('should fetch notes for a specific user and chapter', async () => {
      const mockNotes = [
        {
          id: 'note-1',
          userId: 'user-123',
          chapterId: 1,
          selectedText: '此開卷第一回也',
          note: '筆記1',
          isPublic: false,
          createdAt: Timestamp.now(),
          wordCount: 2
        },
        {
          id: 'note-2',
          userId: 'user-123',
          chapterId: 1,
          selectedText: '女媧氏煉石補天',
          note: '筆記2',
          isPublic: true,
          createdAt: Timestamp.now(),
          wordCount: 2
        }
      ];

      const mockQuerySnapshot = {
        docs: mockNotes.map(note => ({
          id: note.id,
          data: () => note
        }))
      };

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const notes = await getNotesByUserAndChapter('user-123', 1);

      expect(notes).toHaveLength(2);
      expect(notes[0].id).toBe('note-1');
      expect(notes[1].id).toBe('note-2');
      expect(where).toHaveBeenCalledWith('userId', '==', 'user-123');
      expect(where).toHaveBeenCalledWith('chapterId', '==', 1);
    });

    it('should return empty array when no notes found', async () => {
      const mockQuerySnapshot = {
        docs: []
      };

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const notes = await getNotesByUserAndChapter('user-999', 99);

      expect(notes).toHaveLength(0);
    });
  });

  describe('getPublicNotes', () => {
    it('should fetch only public notes', async () => {
      const mockPublicNotes = [
        {
          id: 'public-note-1',
          userId: 'user-123',
          chapterId: 1,
          selectedText: 'Text 1',
          note: 'Public note 1',
          isPublic: true,
          createdAt: Timestamp.fromDate(new Date('2025-10-17')),
          lastModified: Timestamp.fromDate(new Date('2025-10-17'))
        },
        {
          id: 'public-note-2',
          userId: 'user-456',
          chapterId: 2,
          selectedText: 'Text 2',
          note: 'Public note 2',
          isPublic: true,
          createdAt: Timestamp.fromDate(new Date('2025-10-16')),
          lastModified: Timestamp.fromDate(new Date('2025-10-16'))
        }
      ];

      const mockQuerySnapshot = {
        docs: mockPublicNotes.map(note => ({
          id: note.id,
          data: () => note
        }))
      };

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const notes = await getPublicNotes(50);

      expect(notes).toHaveLength(2);
      expect(notes[0].isPublic).toBe(true);
      expect(notes[1].isPublic).toBe(true);
      expect(where).toHaveBeenCalledWith('isPublic', '==', true);
    });

    it('should sort notes by creation date (newest first)', async () => {
      const mockPublicNotes = [
        {
          id: 'older-note',
          userId: 'user-123',
          chapterId: 1,
          selectedText: 'Text',
          note: 'Older note',
          isPublic: true,
          createdAt: Timestamp.fromDate(new Date('2025-10-15')),
          lastModified: Timestamp.fromDate(new Date('2025-10-15'))
        },
        {
          id: 'newer-note',
          userId: 'user-456',
          chapterId: 2,
          selectedText: 'Text',
          note: 'Newer note',
          isPublic: true,
          createdAt: Timestamp.fromDate(new Date('2025-10-17')),
          lastModified: Timestamp.fromDate(new Date('2025-10-17'))
        }
      ];

      const mockQuerySnapshot = {
        docs: mockPublicNotes.map(note => ({
          id: note.id,
          data: () => note
        }))
      };

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const notes = await getPublicNotes(50);

      expect(notes[0].id).toBe('newer-note');
      expect(notes[1].id).toBe('older-note');
    });

    it('should limit results to specified number', async () => {
      const mockPublicNotes = Array.from({ length: 20 }, (_, i) => ({
        id: `note-${i}`,
        userId: `user-${i}`,
        chapterId: 1,
        selectedText: `Text ${i}`,
        note: `Note ${i}`,
        isPublic: true,
        createdAt: Timestamp.fromDate(new Date(2025, 9, 17 - i)),
        lastModified: Timestamp.fromDate(new Date(2025, 9, 17 - i))
      }));

      const mockQuerySnapshot = {
        docs: mockPublicNotes.map(note => ({
          id: note.id,
          data: () => note
        }))
      };

      (query as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const notes = await getPublicNotes(10);

      expect(notes).toHaveLength(10);
    });
  });

  describe('Error handling', () => {
    it('should handle Firebase errors when saving note', async () => {
      (addDoc as jest.Mock).mockRejectedValue(new Error('Firebase error'));

      const noteData: Omit<Note, 'id' | 'createdAt'> = {
        userId: 'user-123',
        chapterId: 1,
        selectedText: 'test',
        note: 'test note',
        isPublic: false
      };

      await expect(saveNote(noteData)).rejects.toThrow('Firebase error');
    });

    it('should handle Firebase errors when updating note', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await expect(updateNote('note-id', 'new content')).rejects.toThrow('Update failed');
    });

    it('should handle Firebase errors when deleting note', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (deleteDoc as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      await expect(deleteNoteById('note-id')).rejects.toThrow('Delete failed');
    });
  });
});
