/**
 * @fileOverview Service functions for saving and retrieving user underline highlights in Firestore.
 *
 * This module provides functions to save a highlight and fetch highlights for a specific user and chapter.
 * It is designed for underline (not background highlight) integration with the Red Mansion reading system.
 */

import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, deleteDoc, doc } from 'firebase/firestore';

// Type definition for a user highlight (underline)
export interface Highlight {
  id?: string; // Firestore document ID
  userId: string; // User's unique ID
  chapterId: number; // Chapter number
  selectedText: string; // The text user underlined
  createdAt: Date; // Timestamp of creation
}

/**
 * Save an underline highlight to Firestore for a user and chapter.
 * @param highlight - Highlight object without id and createdAt
 * @returns The Firestore document ID of the saved highlight
 */
export async function saveHighlight(highlight: Omit<Highlight, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'highlights'), {
    ...highlight,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Fetch all underline highlights for a user and chapter from Firestore.
 * @param userId - The user's unique ID
 * @param chapterId - The chapter number
 * @returns Array of Highlight objects
 */
export async function getHighlightsByUserAndChapter(userId: string, chapterId: number): Promise<Highlight[]> {
  const q = query(
    collection(db, 'highlights'),
    where('userId', '==', userId),
    where('chapterId', '==', chapterId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  } as Highlight));
}

export async function deleteHighlightById(id: string) {
  await deleteDoc(doc(db, 'highlights', id));
} 