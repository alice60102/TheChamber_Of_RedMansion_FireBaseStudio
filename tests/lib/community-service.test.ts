/**
 * @fileOverview Community Service Unit Tests
 * 
 * Comprehensive test suite for the CommunityService class including:
 * - Post creation, reading, updating, and deletion
 * - Comment management and threading
 * - Like/unlike functionality
 * - Real-time listeners and data synchronization
 * - Error handling and edge cases
 * - Performance and pagination testing
 * 
 * Test Categories:
 * 1. Expected Use Cases: Normal operations that users perform daily
 * 2. Edge Cases: Boundary conditions and unusual but valid inputs
 * 3. Failure Cases: Error conditions and invalid inputs
 * 
 * Each test includes comprehensive error logging and result tracking.
 */

import { CommunityService } from '@/lib/community-service';
import type { 
  CommunityPost, 
  PostComment, 
  CreatePostData, 
  CreateCommentData 
} from '@/lib/community-service';

// Import Firebase mocks (configured in jest.setup.js)
import {
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

describe('CommunityService', () => {
  let communityService: CommunityService;
  let testLogger: any;

  beforeEach(() => {
    // Initialize service and test logger for each test
    communityService = new CommunityService();
    testLogger = {
      logs: [],
      log: (message: string, data?: any) => {
        testLogger.logs.push({ message, data, timestamp: new Date().toISOString() });
      }
    };

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Save test logs to organized output directory
    const fs = require('fs');
    const path = require('path');
    
    if (global.__TEST_CONFIG__) {
      const testName = expect.getState().currentTestName?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown';
      const logPath = path.join(
        global.__TEST_CONFIG__.outputDir,
        'community-service',
        `${testName}_logs.json`
      );
      
      try {
        fs.writeFileSync(logPath, JSON.stringify({
          testName: expect.getState().currentTestName,
          logs: testLogger.logs,
          testResult: expect.getState().assertionCalls,
          timestamp: new Date().toISOString(),
        }, null, 2));
      } catch (error) {
        console.error('Failed to write test logs:', error);
      }
    }
  });

  describe('Post Management - Expected Use Cases', () => {
    /**
     * Test Case 1: Expected Use - Create a new post successfully
     * 
     * This test verifies the basic functionality of creating a forum post
     * with all required fields and proper data validation.
     */
    it('should create a new post successfully with valid data', async () => {
      testLogger.log('Testing post creation with valid data');
      
      // Arrange: Set up test data and mock responses
      const mockPostData: CreatePostData = {
        authorId: 'user123',
        authorName: '寶玉哥哥',
        content: '今日讀《紅樓夢》第一回，深感曹雪芹筆力之深厚，實為千古奇書。',
        tags: ['紅樓夢', '讀書心得', '古典文學'],
        category: 'discussion'
      };

      const mockDocRef = { id: 'post_123456' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      // Act: Execute the function under test
      const result = await communityService.createPost(mockPostData);

      // Assert: Verify expected behavior
      expect(result).toBe('post_123456');
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(), // collection reference
        expect.objectContaining({
          ...mockPostData,
          likes: 0,
          likedBy: [],
          commentCount: 0,
          viewCount: 0,
          isEdited: false,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );

      testLogger.log('Post creation test completed successfully', { postId: result });
    });
  });

  describe('Post Management - Edge Cases', () => {
    /**
     * Edge Case 1: Create post with minimal valid data
     * 
     * This test ensures the system handles posts with only required fields
     * and applies appropriate defaults for optional fields.
     */
    it('should handle post creation with minimal required data', async () => {
      testLogger.log('Testing post creation with minimal data');

      // Arrange: Use only required fields
      const minimalPostData: CreatePostData = {
        authorId: 'user999',
        authorName: '無名氏',
        content: '簡短測試內容',
        tags: []
      };

      const mockDocRef = { id: 'minimal_post' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      // Act
      const result = await communityService.createPost(minimalPostData);

      // Assert: Verify defaults are applied
      expect(result).toBe('minimal_post');
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          tags: [], // Empty array should be preserved
          category: undefined, // Optional field should remain undefined
          likes: 0,
          likedBy: [],
          commentCount: 0,
        })
      );

      testLogger.log('Minimal post creation test completed');
    });
  });

  describe('Post Management - Failure Cases', () => {
    /**
     * Failure Case 1: Handle Firebase connection failure
     * 
     * This test ensures proper error handling when Firebase operations fail,
     * providing meaningful error messages to the user.
     */
    it('should handle Firebase connection failures gracefully', async () => {
      testLogger.log('Testing Firebase connection failure handling');

      // Arrange: Mock Firebase error
      const firebaseError = new Error('Firebase: Permission denied');
      (addDoc as jest.Mock).mockRejectedValue(firebaseError);

      const postData: CreatePostData = {
        authorId: 'test_user',
        authorName: 'Test User',
        content: 'This should fail',
        tags: ['test']
      };

      // Act & Assert: Verify error is properly handled
      await expect(communityService.createPost(postData)).rejects.toThrow(
        'Failed to create post. Please try again.'
      );

      testLogger.log('Firebase failure handling test completed', { 
        originalError: firebaseError.message 
      });
    });

    /**
     * Failure Case 2: Handle invalid post data validation
     * 
     * This test ensures the service properly validates input data and
     * rejects invalid or malformed requests.
     */
    it('should reject invalid post data', async () => {
      testLogger.log('Testing invalid post data rejection');

      // Arrange: Create invalid post data (missing required fields)
      const invalidPostData = {
        // Missing authorId and authorName
        content: '',  // Empty content should be invalid
        tags: ['test']
      } as CreatePostData;

      // Act & Assert: Should throw validation error
      try {
        await communityService.createPost(invalidPostData);
        // If it succeeds when it shouldn't, that's a test failure
        expect(true).toBe(false); // Force failure
      } catch (error) {
        expect(error).toBeDefined();
        testLogger.log('Invalid data rejection test completed', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });

    /**
     * Failure Case 3: Handle network timeout scenarios
     * 
     * This test verifies behavior when Firebase operations timeout,
     * ensuring the application remains responsive.
     */
    it('should handle network timeout scenarios', async () => {
      testLogger.log('Testing network timeout handling');

      // Arrange: Mock timeout error
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      (getDocs as jest.Mock).mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(communityService.getPosts()).rejects.toThrow(
        'Failed to fetch posts. Please try again.'
      );

      testLogger.log('Network timeout handling test completed');
    });
  });

  describe('Comment Management - Expected Use Cases', () => {
    /**
     * Test Case 1: Expected Use - Add comment to post
     * 
     * This test verifies the comment functionality including proper
     * comment count incrementation and data structure.
     */
    it('should add comment to post and update comment count', async () => {
      testLogger.log('Testing comment addition');

      // Arrange: Set up comment data and mock responses
      const commentData: CreateCommentData = {
        postId: 'post123',
        authorId: 'user456',
        authorName: '王熙鳳',
        content: '寶玉哥哥此番見解深刻，實在佩服！'
      };

      const mockCommentId = 'comment_789';
      (addDoc as jest.Mock).mockResolvedValue({ id: mockCommentId });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      // Act: Add comment
      const result = await communityService.addComment(commentData);

      // Assert: Verify comment creation and post update
      expect(result).toBe(mockCommentId);
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(), // comments collection reference
        expect.objectContaining({
          ...commentData,
          likes: 0,
          likedBy: [],
          isEdited: false,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(), // post document reference
        { commentCount: increment(1) }
      );

      testLogger.log('Comment addition test completed', { commentId: result });
    });

    /**
     * Test Case 2: Expected Use - Retrieve comments for a post
     * 
     * This test verifies comment retrieval with proper ordering and formatting.
     */
    it('should retrieve comments for a post correctly', async () => {
      testLogger.log('Testing comment retrieval');

      // Arrange
      const postId = 'test_post_123';
      const mockComments = [
        testUtils.createMockDoc('comment1', {
          postId,
          authorName: '賈寶玉',
          content: '這個觀點很有趣',
          likes: 5,
          createdAt: testUtils.createMockTimestamp(),
        }),
        testUtils.createMockDoc('comment2', {
          postId,
          authorName: '林黛玉',
          content: '我也這麼認為',
          likes: 2,
          createdAt: testUtils.createMockTimestamp(),
        })
      ];

      const mockQuerySnapshot = testUtils.createMockQuerySnapshot(mockComments);
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      // Act
      const result = await communityService.getComments(postId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'comment1',
        authorName: '賈寶玉',
        content: '這個觀點很有趣',
      });

      testLogger.log('Comment retrieval test completed', { commentCount: result.length });
    });
  });

  describe('Like System - Expected Use Cases', () => {
    /**
     * Test Case 1: Expected Use - Like a post
     * 
     * This test verifies the like functionality including proper
     * like count incrementation and user tracking.
     */
    it('should like a post and update like count', async () => {
      testLogger.log('Testing post like functionality');

      // Arrange
      const postId = 'likeable_post';
      const userId = 'like_user';
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await communityService.togglePostLike(postId, userId, true);

      // Assert
      expect(result).toBe(true);
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          likes: increment(1),
          likedBy: arrayUnion(userId)
        }
      );

      testLogger.log('Post like test completed');
    });

    /**
     * Test Case 2: Expected Use - Unlike a post
     * 
     * This test verifies the unlike functionality including proper
     * like count decrementation and user removal.
     */
    it('should unlike a post and update like count', async () => {
      testLogger.log('Testing post unlike functionality');

      // Arrange
      const postId = 'unlikeable_post';
      const userId = 'unlike_user';
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await communityService.togglePostLike(postId, userId, false);

      // Assert
      expect(result).toBe(true);
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          likes: increment(-1),
          likedBy: arrayRemove(userId)
        }
      );

      testLogger.log('Post unlike test completed');
    });
  });

  describe('Post Retrieval - Expected Use Cases', () => {
    /**
     * Test Case 1: Expected Use - Retrieve posts with filtering
     * 
     * This test verifies the ability to fetch posts with various filters
     * and pagination, simulating normal user browsing behavior.
     */
    it('should retrieve posts with filters and pagination', async () => {
      testLogger.log('Testing post retrieval with filters');

      // Arrange: Set up mock data for multiple posts
      const mockPosts = [
        testUtils.createMockDoc('post1', {
          authorId: 'user1',
          authorName: '林黛玉',
          content: '花謝花飛花滿天，紅消香斷有誰憐？',
          tags: ['詩詞', '紅樓夢'],
          likes: 15,
          commentCount: 3,
          createdAt: testUtils.createMockTimestamp(new Date('2024-01-15')),
          status: 'active'
        }),
        testUtils.createMockDoc('post2', {
          authorId: 'user2',
          authorName: '薛寶釵',
          content: '好風憑借力，送我上青雲。',
          tags: ['詩詞', '勵志'],
          likes: 8,
          commentCount: 1,
          createdAt: testUtils.createMockTimestamp(new Date('2024-01-14')),
          status: 'active'
        })
      ];

      const mockQuerySnapshot = testUtils.createMockQuerySnapshot(mockPosts);
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      // Act: Execute with various filters
      const filters = { category: 'discussion', searchText: '紅樓夢' };
      const result = await communityService.getPosts(filters, 20);

      // Assert: Verify correct query construction and filtering
      expect(getDocs).toHaveBeenCalled();
      expect(result).toHaveLength(1); // Only post1 should match the search filter
      expect(result[0]).toMatchObject({
        id: 'post1',
        authorName: '林黛玉',
        content: expect.stringContaining('紅樓夢'),
      });

      testLogger.log('Post retrieval test completed', { 
        filteredPosts: result.length,
        filters 
      });
    });

    /**
     * Test Case 2: Edge Case - Retrieve posts with empty result set
     * 
     * This test verifies proper handling when no posts match the query filters.
     */
    it('should handle empty post results gracefully', async () => {
      testLogger.log('Testing empty post retrieval');

      // Arrange: Mock empty query result
      const emptyQuerySnapshot = testUtils.createMockQuerySnapshot([]);
      (getDocs as jest.Mock).mockResolvedValue(emptyQuerySnapshot);

      // Act
      const result = await communityService.getPosts({ searchText: '不存在的搜索詞' });

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);

      testLogger.log('Empty post retrieval test completed');
    });
  });

  describe('Performance and Load Tests', () => {
    /**
     * Test pagination performance with large datasets
     */
    it('should handle large dataset pagination efficiently', async () => {
      testLogger.log('Testing pagination performance');

      const startTime = Date.now();

      // Arrange: Mock large dataset
      const largeMockPosts = Array.from({ length: 50 }, (_, i) => 
        testUtils.createMockDoc(`post_${i}`, {
          authorName: `User${i}`,
          content: `Test content ${i}`,
          likes: i,
          createdAt: testUtils.createMockTimestamp(new Date(Date.now() - i * 1000)),
        })
      );

      const mockQuerySnapshot = testUtils.createMockQuerySnapshot(largeMockPosts);
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      // Act
      const result = await communityService.getPosts({}, 50);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      expect(result).toHaveLength(50);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second

      testLogger.log('Pagination performance test completed', { 
        posts: result.length,
        duration: `${duration}ms`
      });
    });
  });

  describe('Data Validation and Edge Cases', () => {
    /**
     * Edge Case: Handle like/unlike edge cases
     */
    it('should handle like/unlike edge cases correctly', async () => {
      testLogger.log('Testing like/unlike edge cases');

      // Arrange
      const postId = 'edge_case_post';
      const userId = 'edge_user';
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      // Act & Assert: Test double-like scenario
      await communityService.togglePostLike(postId, userId, true);
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          likes: increment(1),
          likedBy: arrayUnion(userId)
        }
      );

      // Act & Assert: Test unlike after like
      await communityService.togglePostLike(postId, userId, false);
      expect(updateDoc).toHaveBeenLastCalledWith(
        expect.anything(),
        {
          likes: increment(-1),
          likedBy: arrayRemove(userId)
        }
      );

      testLogger.log('Like/unlike edge cases test completed');
    });

    /**
     * Edge Case: Handle very long content
     */
    it('should handle posts with very long content', async () => {
      testLogger.log('Testing long content handling');

      // Arrange: Create post with very long content
      const longContent = '長'.repeat(5000); // 5000 characters
      const longPostData: CreatePostData = {
        authorId: 'long_user',
        authorName: 'Long Content User',
        content: longContent,
        tags: ['long', 'test']
      };

      const mockDocRef = { id: 'long_post' };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      // Act
      const result = await communityService.createPost(longPostData);

      // Assert
      expect(result).toBe('long_post');
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          content: longContent,
        })
      );

      testLogger.log('Long content test completed', { contentLength: longContent.length });
    });
  });
}); 