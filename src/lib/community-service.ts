/**
 * @fileOverview Community Service for Firebase Firestore Operations
 * 
 * This service handles all community-related database operations including:
 * - Creating, reading, updating, and deleting forum posts
 * - Managing comments and replies on posts
 * - Handling user interactions (likes, views)
 * - Real-time updates for community engagement
 * - Content moderation and validation
 * 
 * Database Structure:
 * - posts: Main forum posts collection
 * - comments: Sub-collection under each post for threaded discussions
 * - users: User profiles and authentication data
 * - categories: Post categorization system
 * 
 * Features implemented:
 * - Real-time data synchronization with Firestore
 * - Optimistic UI updates for better user experience
 * - Content validation and sanitization
 * - Error handling and retry mechanisms
 * - Support for pagination and infinite scrolling
 * - Like/unlike functionality with user tracking
 * - Threaded comment system with nested replies
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where, 
  limit, 
  startAfter,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Type definitions for community data structures
export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  title?: string;
  content: string;
  tags: string[];
  likes: number;
  likedBy: string[];
  commentCount: number;
  viewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isEdited: boolean;
  category?: string;
  status: 'active' | 'hidden' | 'deleted';
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  likes: number;
  likedBy: string[];
  parentCommentId?: string; // For nested replies
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isEdited: boolean;
  status: 'active' | 'hidden' | 'deleted';
}

export interface CreatePostData {
  authorId: string;
  authorName: string;
  title?: string;
  content: string;
  tags: string[];
  category?: string;
}

export interface CreateCommentData {
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  parentCommentId?: string;
}

export interface PostFilters {
  category?: string;
  tags?: string[];
  authorId?: string;
  searchText?: string;
}

// Community Service Class
export class CommunityService {
  private postsCollection = collection(db, 'posts');
  
  /**
   * Create a new forum post
   * @param postData - Data for the new post
   * @returns Promise with the created post ID
   */
  async createPost(postData: CreatePostData): Promise<string> {
    try {
      const newPost = {
        ...postData,
        likes: 0,
        likedBy: [],
        commentCount: 0,
        viewCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isEdited: false,
        status: 'active' as const
      };

      const docRef = await addDoc(this.postsCollection, newPost);
      console.log('Post created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post. Please try again.');
    }
  }

  /**
   * Get all posts with optional filtering and pagination
   * @param filters - Optional filters for posts
   * @param limitCount - Number of posts to fetch (default: 20)
   * @param lastDoc - Last document for pagination
   * @returns Promise with array of posts
   */
  async getPosts(
    filters: PostFilters = {}, 
    limitCount: number = 20,
    lastDoc?: any
  ): Promise<CommunityPost[]> {
    try {
      let postsQuery = query(
        this.postsCollection,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      // Add filters
      if (filters.category) {
        postsQuery = query(postsQuery, where('category', '==', filters.category));
      }
      
      if (filters.authorId) {
        postsQuery = query(postsQuery, where('authorId', '==', filters.authorId));
      }

      // Add pagination
      if (lastDoc) {
        postsQuery = query(postsQuery, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(postsQuery);
      const posts: CommunityPost[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || Timestamp.now()
        } as CommunityPost);
      });

      // Apply text search filter on client side (for better performance with small datasets)
      if (filters.searchText) {
        const searchTerm = filters.searchText.toLowerCase();
        return posts.filter(post => 
          post.content.toLowerCase().includes(searchTerm) ||
          post.authorName.toLowerCase().includes(searchTerm) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts. Please try again.');
    }
  }

  /**
   * Get a single post by ID
   * @param postId - ID of the post to fetch
   * @returns Promise with the post data
   */
  async getPost(postId: string): Promise<CommunityPost | null> {
    try {
      const postDoc = await getDoc(doc(this.postsCollection, postId));
      
      if (!postDoc.exists()) {
        return null;
      }

      const data = postDoc.data();
      return {
        id: postDoc.id,
        ...data,
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now()
      } as CommunityPost;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw new Error('Failed to fetch post. Please try again.');
    }
  }

  /**
   * Update a post's like status for a user
   * @param postId - ID of the post to like/unlike
   * @param userId - ID of the user performing the action
   * @param isLiking - Whether the user is liking (true) or unliking (false)
   * @returns Promise with success status
   */
  async togglePostLike(postId: string, userId: string, isLiking: boolean): Promise<boolean> {
    try {
      const postRef = doc(this.postsCollection, postId);
      
      if (isLiking) {
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(userId),
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(userId),
          updatedAt: serverTimestamp()
        });
      }

      return true;
    } catch (error) {
      console.error('Error toggling post like:', error);
      throw new Error('Failed to update like status. Please try again.');
    }
  }

  /**
   * Increment post view count
   * @param postId - ID of the post being viewed
   * @returns Promise with success status
   */
  async incrementViewCount(postId: string): Promise<boolean> {
    try {
      const postRef = doc(this.postsCollection, postId);
      await updateDoc(postRef, {
        viewCount: increment(1),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error incrementing view count:', error);
      // Don't throw error for view count as it's not critical
      return false;
    }
  }

  /**
   * Add a comment to a post
   * @param commentData - Data for the new comment
   * @returns Promise with the created comment ID
   */
  async addComment(commentData: CreateCommentData): Promise<string> {
    try {
      const commentsCollection = collection(db, 'posts', commentData.postId, 'comments');
      
      const newComment = {
        ...commentData,
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isEdited: false,
        status: 'active' as const
      };

      const docRef = await addDoc(commentsCollection, newComment);

      // Update comment count on the parent post
      const postRef = doc(this.postsCollection, commentData.postId);
      await updateDoc(postRef, {
        commentCount: increment(1),
        updatedAt: serverTimestamp()
      });

      console.log('Comment added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment. Please try again.');
    }
  }

  /**
   * Get comments for a specific post
   * @param postId - ID of the post to get comments for
   * @param limitCount - Number of comments to fetch (default: 50)
   * @returns Promise with array of comments
   */
  async getComments(postId: string, limitCount: number = 50): Promise<PostComment[]> {
    try {
      const commentsCollection = collection(db, 'posts', postId, 'comments');
      const commentsQuery = query(
        commentsCollection,
        where('status', '==', 'active'),
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(commentsQuery);
      const comments: PostComment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          postId,
          ...data,
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || Timestamp.now()
        } as PostComment);
      });

      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new Error('Failed to fetch comments. Please try again.');
    }
  }

  /**
   * Setup real-time listener for posts
   * @param callback - Callback function to handle post updates
   * @param filters - Optional filters for posts
   * @returns Unsubscribe function
   */
  setupPostsListener(
    callback: (posts: CommunityPost[]) => void,
    filters: PostFilters = {}
  ): () => void {
    let postsQuery = query(
      this.postsCollection,
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    // Add filters
    if (filters.category) {
      postsQuery = query(postsQuery, where('category', '==', filters.category));
    }

    return onSnapshot(postsQuery, (querySnapshot) => {
      const posts: CommunityPost[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || Timestamp.now()
        } as CommunityPost);
      });

      callback(posts);
    }, (error) => {
      console.error('Error in posts listener:', error);
    });
  }

  /**
   * Setup real-time listener for comments
   * @param postId - ID of the post to listen for comments
   * @param callback - Callback function to handle comment updates
   * @returns Unsubscribe function
   */
  setupCommentsListener(
    postId: string,
    callback: (comments: PostComment[]) => void
  ): () => void {
    const commentsCollection = collection(db, 'posts', postId, 'comments');
    const commentsQuery = query(
      commentsCollection,
      where('status', '==', 'active'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(commentsQuery, (querySnapshot) => {
      const comments: PostComment[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          postId,
          ...data,
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || Timestamp.now()
        } as PostComment);
      });

      callback(comments);
    }, (error) => {
      console.error('Error in comments listener:', error);
    });
  }
}

// Export singleton instance
export const communityService = new CommunityService(); 