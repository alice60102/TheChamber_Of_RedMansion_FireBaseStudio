/**
 * @fileOverview Service functions for saving and retrieving user notes in Firestore.
 *
 * This module provides functions to save a note and fetch notes for a specific user and chapter.
 * It is designed for integration with the Red Mansion reading system's note-taking feature.
 */

import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// Type definition for a user note
export interface Note {
  id?: string; // Firestore document ID
  userId: string; // User's unique ID
  chapterId: number; // Chapter number
  selectedText: string; // The text user selected
  note: string; // The user's note content
  createdAt: Date; // Timestamp of creation
  tags?: string[]; // User-defined tags for categorization
  isPublic?: boolean; // Whether note is shared publicly
  wordCount?: number; // Calculated word count of note content
  lastModified?: Date; // Last modification timestamp
  noteType?: string; // Optional categorization (general, vocabulary, character, theme, question)
}

/**
 * Calculate word count for note content
 * @param text - Text to count words in
 * @returns Word count
 */
function calculateWordCount(text: string): number {
  // Remove extra whitespace and count words
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Save a note to Firestore for a user and chapter.
 * @param note - Note object without id and createdAt
 * @returns The Firestore document ID of the saved note
 */
export async function saveNote(note: Omit<Note, 'id' | 'createdAt'>) {
  const now = Timestamp.now();

  // Add a new document to the 'notes' collection with auto-calculated fields
  const docRef = await addDoc(collection(db, 'notes'), {
    ...note,
    createdAt: now,
    lastModified: now,
    wordCount: calculateWordCount(note.note),
    tags: note.tags || [],
    isPublic: note.isPublic || false,
  });
  return docRef.id;
}

/**
 * Update an existing note in Firestore.
 * @param id - The Firestore document ID of the note to update
 * @param content - The new content of the note
 */
export async function updateNote(id: string, content: string) {
  const noteRef = doc(db, 'notes', id);
  await updateDoc(noteRef, {
    note: content,
    wordCount: calculateWordCount(content),
    lastModified: Timestamp.now(),
  });
}

/**
 * Fetch all notes for a user and chapter from Firestore.
 * @param userId - The user's unique ID
 * @param chapterId - The chapter number
 * @returns Array of Note objects
 */
export async function getNotesByUserAndChapter(userId: string, chapterId: number): Promise<Note[]> {
  const q = query(
    collection(db, 'notes'),
    where('userId', '==', userId),
    where('chapterId', '==', chapterId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  } as Note));
}

export async function deleteNoteById(id: string) {
  await deleteDoc(doc(db, 'notes', id));
}

/**
 * Fetch all notes for a user across all chapters from Firestore.
 * Used for the notes dashboard page.
 * @param userId - The user's unique ID
 * @returns Array of Note objects sorted by creation date (newest first)
 */
export async function getAllNotesByUser(userId: string): Promise<Note[]> {
  const q = query(
    collection(db, 'notes'),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  const notes = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    lastModified: doc.data().lastModified?.toDate() || doc.data().createdAt.toDate(),
  } as Note));

  // Sort by creation date, newest first
  return notes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Update the visibility (public/private) of a note.
 * @param noteId - The Firestore document ID of the note
 * @param isPublic - Whether the note should be public
 */
export async function updateNoteVisibility(noteId: string, isPublic: boolean) {
  const noteRef = doc(db, 'notes', noteId);
  await updateDoc(noteRef, {
    isPublic,
    lastModified: Timestamp.now(),
  });
}

/**
 * Fetch public notes from all users for the community feed.
 * @param limit - Maximum number of notes to fetch (default: 50)
 * @returns Array of public Note objects sorted by creation date (newest first)
 */
export async function getPublicNotes(limit: number = 50): Promise<Note[]> {
  const q = query(
    collection(db, 'notes'),
    where('isPublic', '==', true)
  );
  const querySnapshot = await getDocs(q);
  const notes = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    lastModified: doc.data().lastModified?.toDate() || doc.data().createdAt.toDate(),
  } as Note));

  // Sort by creation date, newest first, and limit results
  return notes
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

/**
 * Update note tags.
 * @param noteId - The Firestore document ID of the note
 * @param tags - Array of tag strings
 */
export async function updateNoteTags(noteId: string, tags: string[]) {
  const noteRef = doc(db, 'notes', noteId);
  await updateDoc(noteRef, {
    tags,
    lastModified: Timestamp.now(),
  });
} 