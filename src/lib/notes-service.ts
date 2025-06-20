/**
 * @fileOverview Service functions for saving and retrieving user notes in Firestore.
 *
 * This module provides functions to save a note and fetch notes for a specific user and chapter.
 * It is designed for integration with the Red Mansion reading system's note-taking feature.
 */

import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, deleteDoc, doc } from 'firebase/firestore';

// Type definition for a user note
export interface Note {
  id?: string; // Firestore document ID
  userId: string; // User's unique ID
  chapterId: number; // Chapter number
  selectedText: string; // The text user selected
  note: string; // The user's note content
  createdAt: Date; // Timestamp of creation
}

/**
 * Save a note to Firestore for a user and chapter.
 * @param note - Note object without id and createdAt
 * @returns The Firestore document ID of the saved note
 */
export async function saveNote(note: Omit<Note, 'id' | 'createdAt'>) {
  // Add a new document to the 'notes' collection
  const docRef = await addDoc(collection(db, 'notes'), {
    ...note,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
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