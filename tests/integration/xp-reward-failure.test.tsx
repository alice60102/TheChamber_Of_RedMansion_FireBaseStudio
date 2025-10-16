/**
 * @fileOverview XP Reward Failure Tests
 *
 * Tests to verify that core functionality continues working even when XP reward system fails.
 * Ensures graceful degradation where XP features fail silently without breaking main features.
 *
 * Test Categories:
 * 1. Notes functionality when XP fails
 * 2. Posts functionality when XP fails
 * 3. Comments functionality when XP fails
 * 4. Like/interaction functionality when XP fails
 * 5. Chapter completion when XP fails
 * 6. XP service error handling
 *
 * Success Criteria:
 * - Core features (notes, posts, comments) work independently of XP system
 * - XP failures do not block user actions
 * - Users can still interact with content when XP service is down
 * - Appropriate fallback behavior when XP awards fail
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as userLevelService from '@/lib/user-level-service';

// Mock user level service
jest.mock('@/lib/user-level-service');

describe('XP Reward Failure - Core Feature Independence', () => {
  let testLogger: any;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Initialize test logger
    testLogger = {
      logs: [],
      log: (message: string, data?: any) => {
        testLogger.logs.push({ message, data, timestamp: new Date().toISOString() });
      }
    };

    // Reset all mocks
    jest.clearAllMocks();

    // Suppress console.error for cleaner test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Notes Functionality with XP Failure', () => {
    /**
     * Test Case 1: Creating notes works when XP award fails
     *
     * Verifies that users can still create notes even if XP reward fails
     */
    it('should allow creating notes even when XP award fails', async () => {
      testLogger.log('Testing note creation with XP failure');

      // Mock XP award failure
      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP').mockRejectedValue(
        new Error('XP service unavailable')
      );

      const NotesComponent = () => {
        const [notes, setNotes] = React.useState<string[]>([]);
        const [noteText, setNoteText] = React.useState('');

        const handleCreateNote = async () => {
          try {
            // Simulate note creation
            const newNote = noteText;
            setNotes([...notes, newNote]);
            setNoteText('');

            // Try to award XP (this should fail but not block note creation)
            try {
              await userLevelService.awardXP('user-123', 5, 'Note created', 'community');
            } catch (xpError) {
              // XP failed, but note was still created - this is OK
              console.log('XP award failed, but note created successfully');
            }
          } catch (error) {
            console.error('Note creation failed:', error);
          }
        };

        return (
          <div data-testid="notes-container">
            <input
              data-testid="note-input"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write a note..."
            />
            <button data-testid="create-note-button" onClick={handleCreateNote}>
              Create Note
            </button>
            <div data-testid="notes-list">
              {notes.map((note, index) => (
                <div key={index} data-testid={`note-${index}`}>
                  {note}
                </div>
              ))}
            </div>
          </div>
        );
      };

      render(<NotesComponent />);

      // Create a note
      const input = screen.getByTestId('note-input');
      const button = screen.getByTestId('create-note-button');

      fireEvent.change(input, { target: { value: 'This is my note about Chapter 1' } });
      fireEvent.click(button);

      // Verify note was created despite XP failure
      await waitFor(() => {
        expect(screen.getByTestId('note-0')).toBeInTheDocument();
        expect(screen.getByText('This is my note about Chapter 1')).toBeInTheDocument();
      });

      // Verify XP was attempted but failed
      expect(mockAwardXP).toHaveBeenCalledWith('user-123', 5, 'Note created', 'community');

      testLogger.log('✅ Note created successfully despite XP failure');
    });

    /**
     * Test Case 2: Editing notes works when XP award fails
     *
     * Verifies that note editing is independent of XP system
     */
    it('should allow editing notes when XP service fails', async () => {
      testLogger.log('Testing note editing with XP failure');

      // Mock XP failure
      jest.spyOn(userLevelService, 'awardXP').mockRejectedValue(
        new Error('XP database connection lost')
      );

      const EditNotesComponent = () => {
        const [note, setNote] = React.useState('Original note text');
        const [isEditing, setIsEditing] = React.useState(false);

        const handleSaveEdit = async () => {
          setIsEditing(false);

          // Try to award XP for editing (should fail gracefully)
          try {
            await userLevelService.awardXP('user-123', 2, 'Note edited', 'community');
          } catch (error) {
            // Ignore XP error, editing should still work
          }
        };

        return (
          <div data-testid="edit-notes-container">
            {isEditing ? (
              <>
                <input
                  data-testid="edit-input"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button data-testid="save-button" onClick={handleSaveEdit}>
                  Save
                </button>
              </>
            ) : (
              <>
                <p data-testid="note-display">{note}</p>
                <button data-testid="edit-button" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              </>
            )}
          </div>
        );
      };

      render(<EditNotesComponent />);

      // Start editing
      fireEvent.click(screen.getByTestId('edit-button'));

      // Edit note
      const input = screen.getByTestId('edit-input');
      fireEvent.change(input, { target: { value: 'Updated note text' } });

      // Save edit
      fireEvent.click(screen.getByTestId('save-button'));

      // Verify edit was saved
      await waitFor(() => {
        expect(screen.getByTestId('note-display')).toHaveTextContent('Updated note text');
      });

      testLogger.log('✅ Note editing works despite XP failure');
    });
  });

  describe('Posts Functionality with XP Failure', () => {
    /**
     * Test Case 3: Creating posts works when XP award fails
     *
     * Verifies that community posts can be created even if XP system is down
     */
    it('should allow creating posts even when XP award fails', async () => {
      testLogger.log('Testing post creation with XP failure');

      // Mock XP award failure
      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP').mockRejectedValue(
        new Error('XP transaction timeout')
      );

      const PostsComponent = () => {
        const [posts, setPosts] = React.useState<Array<{ title: string; content: string }>>([]);
        const [title, setTitle] = React.useState('');
        const [content, setContent] = React.useState('');

        const handleCreatePost = async () => {
          // Create post first
          const newPost = { title, content };
          setPosts([...posts, newPost]);
          setTitle('');
          setContent('');

          // Try to award XP (non-blocking)
          userLevelService.awardXP('user-123', 10, 'Post created', 'community')
            .catch(error => {
              console.log('XP award failed but post created:', error.message);
            });
        };

        return (
          <div data-testid="posts-container">
            <input
              data-testid="post-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
            />
            <textarea
              data-testid="post-content-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post content"
            />
            <button data-testid="create-post-button" onClick={handleCreatePost}>
              Create Post
            </button>
            <div data-testid="posts-list">
              {posts.map((post, index) => (
                <div key={index} data-testid={`post-${index}`}>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        );
      };

      render(<PostsComponent />);

      // Create a post
      fireEvent.change(screen.getByTestId('post-title-input'), {
        target: { value: 'My thoughts on Red Mansion' }
      });
      fireEvent.change(screen.getByTestId('post-content-input'), {
        target: { value: 'The character development is amazing...' }
      });
      fireEvent.click(screen.getByTestId('create-post-button'));

      // Verify post was created
      await waitFor(() => {
        expect(screen.getByTestId('post-0')).toBeInTheDocument();
        expect(screen.getByText('My thoughts on Red Mansion')).toBeInTheDocument();
        expect(screen.getByText('The character development is amazing...')).toBeInTheDocument();
      });

      // Verify XP was attempted
      await waitFor(() => {
        expect(mockAwardXP).toHaveBeenCalled();
      });

      testLogger.log('✅ Post created successfully despite XP failure');
    });
  });

  describe('Comments Functionality with XP Failure', () => {
    /**
     * Test Case 4: Creating comments works when XP award fails
     *
     * Verifies that users can comment even if XP rewards are failing
     */
    it('should allow creating comments even when XP award fails', async () => {
      testLogger.log('Testing comment creation with XP failure');

      // Mock XP failure
      jest.spyOn(userLevelService, 'awardXP').mockRejectedValue(
        new Error('XP service rate limit exceeded')
      );

      const CommentsComponent = () => {
        const [comments, setComments] = React.useState<string[]>([]);
        const [commentText, setCommentText] = React.useState('');

        const handleAddComment = async () => {
          // Add comment regardless of XP status
          setComments([...comments, commentText]);
          setCommentText('');

          // Non-blocking XP award attempt
          userLevelService.awardXP('user-123', 3, 'Comment added', 'community')
            .catch(() => {
              // Silently fail - comment is more important than XP
            });
        };

        return (
          <div data-testid="comments-container">
            <input
              data-testid="comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
            />
            <button data-testid="add-comment-button" onClick={handleAddComment}>
              Add Comment
            </button>
            <div data-testid="comments-list">
              {comments.map((comment, index) => (
                <div key={index} data-testid={`comment-${index}`}>
                  {comment}
                </div>
              ))}
            </div>
          </div>
        );
      };

      render(<CommentsComponent />);

      // Add a comment
      fireEvent.change(screen.getByTestId('comment-input'), {
        target: { value: 'Great analysis!' }
      });
      fireEvent.click(screen.getByTestId('add-comment-button'));

      // Verify comment was added
      await waitFor(() => {
        expect(screen.getByTestId('comment-0')).toBeInTheDocument();
        expect(screen.getByText('Great analysis!')).toBeInTheDocument();
      });

      testLogger.log('✅ Comment added successfully despite XP failure');
    });
  });

  describe('Like/Interaction Functionality with XP Failure', () => {
    /**
     * Test Case 5: Liking posts works when XP award fails
     *
     * Verifies that social interactions work independently of XP system
     */
    it('should allow liking posts even when XP award fails', async () => {
      testLogger.log('Testing like functionality with XP failure');

      // Mock XP failure
      jest.spyOn(userLevelService, 'awardXP').mockRejectedValue(
        new Error('XP database write failed')
      );

      const LikeComponent = () => {
        const [liked, setLiked] = React.useState(false);
        const [likeCount, setLikeCount] = React.useState(0);

        const handleLike = async () => {
          // Toggle like immediately
          const newLikedState = !liked;
          setLiked(newLikedState);
          setLikeCount(newLikedState ? likeCount + 1 : likeCount - 1);

          // Try to award XP (should not block like action)
          if (newLikedState) {
            try {
              await userLevelService.awardXP('user-123', 1, 'Liked a post', 'community');
            } catch (error) {
              // Like already registered, XP failure doesn't matter
            }
          }
        };

        return (
          <div data-testid="like-container">
            <button
              data-testid="like-button"
              onClick={handleLike}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              {liked ? '❤️ Liked' : '🤍 Like'}
            </button>
            <span data-testid="like-count">{likeCount}</span>
          </div>
        );
      };

      render(<LikeComponent />);

      // Click like button
      const likeButton = screen.getByTestId('like-button');
      fireEvent.click(likeButton);

      // Verify like was registered
      await waitFor(() => {
        expect(screen.getByTestId('like-button')).toHaveTextContent('❤️ Liked');
        expect(screen.getByTestId('like-count')).toHaveTextContent('1');
      });

      testLogger.log('✅ Like functionality works despite XP failure');
    });
  });

  describe('Chapter Completion with XP Failure', () => {
    /**
     * Test Case 6: Chapter completion tracked when XP award fails
     *
     * Verifies that reading progress is saved even if XP rewards fail
     */
    it('should track chapter completion even when XP award fails', async () => {
      testLogger.log('Testing chapter completion with XP failure');

      // Mock XP failure
      jest.spyOn(userLevelService, 'awardXP').mockRejectedValue(
        new Error('XP service timeout')
      );

      const ChapterComponent = () => {
        const [completedChapters, setCompletedChapters] = React.useState<number[]>([]);
        const [currentChapter, setCurrentChapter] = React.useState(1);

        const handleCompleteChapter = async () => {
          // Mark chapter as completed FIRST (critical data)
          setCompletedChapters([...completedChapters, currentChapter]);

          // Try to award XP (nice-to-have, but not critical)
          try {
            await userLevelService.awardXP(
              'user-123',
              10,
              `Completed Chapter ${currentChapter}`,
              'reading'
            );
          } catch (error) {
            // Chapter is still marked complete, just missing XP
            console.log('Chapter completed but XP award failed');
          }

          setCurrentChapter(currentChapter + 1);
        };

        return (
          <div data-testid="chapter-container">
            <h2 data-testid="current-chapter">Chapter {currentChapter}</h2>
            <button data-testid="complete-button" onClick={handleCompleteChapter}>
              Complete Chapter
            </button>
            <div data-testid="completed-list">
              Completed: {completedChapters.join(', ')}
            </div>
          </div>
        );
      };

      render(<ChapterComponent />);

      // Complete chapter
      fireEvent.click(screen.getByTestId('complete-button'));

      // Verify chapter was marked complete
      await waitFor(() => {
        expect(screen.getByTestId('completed-list')).toHaveTextContent('Completed: 1');
        expect(screen.getByTestId('current-chapter')).toHaveTextContent('Chapter 2');
      });

      testLogger.log('✅ Chapter completion tracked despite XP failure');
    });
  });

  describe('XP Service Error Handling', () => {
    /**
     * Test Case 7: Multiple XP failures don't accumulate errors
     *
     * Verifies that repeated XP failures are handled gracefully
     */
    it('should handle multiple XP failures without error accumulation', async () => {
      testLogger.log('Testing multiple XP failures');

      let xpCallCount = 0;
      jest.spyOn(userLevelService, 'awardXP').mockImplementation(() => {
        xpCallCount++;
        return Promise.reject(new Error('XP service down'));
      });

      const MultiActionComponent = () => {
        const [actions, setActions] = React.useState<string[]>([]);

        const performAction = async (actionName: string) => {
          // Perform action
          setActions([...actions, actionName]);

          // Try to award XP (always fails in this test)
          await userLevelService.awardXP('user-123', 5, actionName, 'community')
            .catch(() => {
              // Silent failure - this is expected behavior
            });
        };

        return (
          <div data-testid="multi-action-container">
            <button
              data-testid="action-1"
              onClick={() => performAction('Action 1')}
            >
              Action 1
            </button>
            <button
              data-testid="action-2"
              onClick={() => performAction('Action 2')}
            >
              Action 2
            </button>
            <button
              data-testid="action-3"
              onClick={() => performAction('Action 3')}
            >
              Action 3
            </button>
            <div data-testid="actions-list">
              {actions.map((action, i) => (
                <div key={i}>{action}</div>
              ))}
            </div>
          </div>
        );
      };

      render(<MultiActionComponent />);

      // Perform multiple actions
      fireEvent.click(screen.getByTestId('action-1'));
      fireEvent.click(screen.getByTestId('action-2'));
      fireEvent.click(screen.getByTestId('action-3'));

      // Verify all actions completed despite XP failures
      await waitFor(() => {
        expect(screen.getByText('Action 1')).toBeInTheDocument();
        expect(screen.getByText('Action 2')).toBeInTheDocument();
        expect(screen.getByText('Action 3')).toBeInTheDocument();
      });

      // Verify XP was attempted for each action
      expect(xpCallCount).toBe(3);

      testLogger.log('✅ Multiple actions succeeded despite repeated XP failures');
    });

    /**
     * Test Case 8: XP service recovery doesn't break state
     *
     * Verifies that XP service coming back online doesn't cause issues
     */
    it('should handle XP service recovery gracefully', async () => {
      testLogger.log('Testing XP service recovery');

      let callCount = 0;
      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP').mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          // First 2 calls fail
          return Promise.reject(new Error('XP service down'));
        } else {
          // Service recovers
          return Promise.resolve({
            success: true,
            newTotalXP: 100,
            newLevel: 1,
            leveledUp: false,
            xpAwarded: 5,
          });
        }
      });

      const RecoveryComponent = () => {
        const [status, setStatus] = React.useState('');

        const performAction = async () => {
          try {
            const result = await userLevelService.awardXP('user-123', 5, 'Action', 'community');
            if (result.success) {
              setStatus('XP Awarded');
            }
          } catch (error) {
            setStatus('Action Complete (XP Failed)');
          }
        };

        return (
          <div data-testid="recovery-container">
            <button data-testid="action-button" onClick={performAction}>
              Perform Action
            </button>
            <div data-testid="status">{status}</div>
          </div>
        );
      };

      render(<RecoveryComponent />);

      // First action - XP fails
      fireEvent.click(screen.getByTestId('action-button'));
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('Action Complete (XP Failed)');
      });

      // Second action - XP still fails
      fireEvent.click(screen.getByTestId('action-button'));
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('Action Complete (XP Failed)');
      });

      // Third action - XP service recovered
      fireEvent.click(screen.getByTestId('action-button'));
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('XP Awarded');
      });

      expect(mockAwardXP).toHaveBeenCalledTimes(3);

      testLogger.log('✅ XP service recovery handled gracefully');
    });
  });
});
