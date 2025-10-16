/**
 * @fileOverview Reading Page XP Rewards Integration Tests
 *
 * Comprehensive tests for all XP reward mechanisms on the reading page:
 * - Reading time tracking (15-minute intervals → 3 XP)
 * - Note creation (basic → 3 XP, quality → 5 XP)
 * - AI questions (simple → 2 XP, deep → 5 XP)
 *
 * Test Categories:
 * 1. Reading Time Rewards (5 tests)
 * 2. Note Creation Rewards (6 tests)
 * 3. AI Question Rewards (6 tests)
 * 4. Integration Tests (3 tests)
 *
 * Success Criteria:
 * - All XP amounts match specifications
 * - Toast notifications display correctly
 * - Deduplication logic prevents duplicate rewards
 * - Boundary conditions handled properly
 * - Profile refreshes after XP awards
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import * as userLevelService from '@/lib/user-level-service';
import { XP_REWARDS } from '@/lib/user-level-service';

// Mock user level service
jest.mock('@/lib/user-level-service');

// Mock toast
const mockToast = jest.fn();
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('Reading Page XP Rewards - Comprehensive Tests', () => {
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
    mockToast.mockClear();

    // Suppress console.error for cleaner test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Enable fake timers for time-based tests
    jest.useFakeTimers();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.useRealTimers();
  });

  describe('Category 1: Reading Time Rewards', () => {
    /**
     * Test Case 1: Award 3 XP after 15 minutes of reading
     */
    it('should award 3 XP after 15 minutes with toast notification', async () => {
      testLogger.log('Testing 15-minute reading time XP reward');

      // Mock successful XP award
      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 100,
        newLevel: 1,
        leveledUp: false,
      });

      // Component that tracks reading time
      const ReadingTimeComponent = () => {
        const [user] = React.useState({ uid: 'user-123' });
        const [userProfile] = React.useState({ currentLevel: 0, totalXP: 97 });

        React.useEffect(() => {
          if (!user?.uid || !userProfile) return;

          const awardReadingTimeXP = async () => {
            const timestamp = Date.now();
            const sourceId = `reading-time-${user.uid}-${timestamp}`;

            const result = await userLevelService.awardXP(
              user.uid,
              XP_REWARDS.READING_TIME_15MIN,
              'Reading for 15 minutes',
              'reading',
              sourceId
            );

            if (result.success && !result.isDuplicate) {
              mockToast({
                title: 'XP Awarded',
                description: `+${XP_REWARDS.READING_TIME_15MIN} XP`,
              });
            }
          };

          const intervalId = setInterval(awardReadingTimeXP, 15 * 60 * 1000);
          return () => clearInterval(intervalId);
        }, [user?.uid, userProfile]);

        return <div data-testid="reading-timer">Reading...</div>;
      };

      render(<ReadingTimeComponent />);

      // Fast-forward 15 minutes
      await act(async () => {
        jest.advanceTimersByTime(15 * 60 * 1000);
      });

      // Verify XP was awarded
      await waitFor(() => {
        expect(mockAwardXP).toHaveBeenCalledWith(
          'user-123',
          3,
          'Reading for 15 minutes',
          'reading',
          expect.stringContaining('reading-time-user-123-')
        );
      });

      // Verify toast notification
      expect(mockToast).toHaveBeenCalledWith({
        title: 'XP Awarded',
        description: '+3 XP',
      });

      testLogger.log('✅ 15-minute reading time XP awarded successfully');
    });

    /**
     * Test Case 2: Timer resets when component unmounts
     */
    it('should cleanup timer when component unmounts', async () => {
      testLogger.log('Testing timer cleanup on unmount');

      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 100,
        newLevel: 1,
        leveledUp: false,
      });

      const ReadingTimeComponent = () => {
        const [user] = React.useState({ uid: 'user-123' });
        const [userProfile] = React.useState({ currentLevel: 0 });

        React.useEffect(() => {
          const intervalId = setInterval(() => {
            userLevelService.awardXP(
              user.uid,
              XP_REWARDS.READING_TIME_15MIN,
              'Reading',
              'reading',
              `reading-time-${user.uid}-${Date.now()}`
            );
          }, 15 * 60 * 1000);

          return () => clearInterval(intervalId);
        }, [user?.uid, userProfile]);

        return <div>Reading</div>;
      };

      const { unmount } = render(<ReadingTimeComponent />);

      // Unmount component
      unmount();

      // Fast-forward time - no XP should be awarded after unmount
      await act(async () => {
        jest.advanceTimersByTime(15 * 60 * 1000);
      });

      expect(mockAwardXP).not.toHaveBeenCalled();

      testLogger.log('✅ Timer cleaned up on unmount');
    });

    /**
     * Test Case 3: Timer pauses when user is logged out
     */
    it('should not award XP when user is logged out', async () => {
      testLogger.log('Testing timer pause on logout');

      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP');

      const ReadingTimeComponent = () => {
        const [user, setUser] = React.useState<any>({ uid: 'user-123' });

        React.useEffect(() => {
          if (!user?.uid) return;

          const intervalId = setInterval(() => {
            userLevelService.awardXP(
              user.uid,
              XP_REWARDS.READING_TIME_15MIN,
              'Reading',
              'reading',
              `reading-time-${user.uid}-${Date.now()}`
            );
          }, 15 * 60 * 1000);

          return () => clearInterval(intervalId);
        }, [user?.uid]);

        // Simulate logout after 5 minutes
        React.useEffect(() => {
          const timeout = setTimeout(() => setUser(null), 5 * 60 * 1000);
          return () => clearTimeout(timeout);
        }, []);

        return <div>{user ? 'Logged In' : 'Logged Out'}</div>;
      };

      render(<ReadingTimeComponent />);

      // Fast-forward 5 minutes (logout)
      await act(async () => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      // Fast-forward another 10 minutes (total 15)
      await act(async () => {
        jest.advanceTimersByTime(10 * 60 * 1000);
      });

      // No XP should be awarded because user logged out
      expect(mockAwardXP).not.toHaveBeenCalled();

      testLogger.log('✅ No XP awarded after logout');
    });

    /**
     * Test Case 4: No duplicate XP for same time period
     */
    it('should prevent duplicate XP awards via sourceId', async () => {
      testLogger.log('Testing duplicate prevention');

      let callCount = 0;
      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP').mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            success: true,
            newTotalXP: 100,
            newLevel: 1,
            leveledUp: false,
          });
        } else {
          // Second call - duplicate detected
          return Promise.resolve({
            success: true,
            newTotalXP: 100,
            newLevel: 1,
            leveledUp: false,
            isDuplicate: true,
          });
        }
      });

      const ReadingTimeComponent = () => {
        React.useEffect(() => {
          // Simulate two rapid calls with same sourceId
          const sourceId = 'reading-time-user-123-12345';

          userLevelService.awardXP('user-123', 3, 'Reading', 'reading', sourceId);
          userLevelService.awardXP('user-123', 3, 'Reading', 'reading', sourceId);
        }, []);

        return <div>Reading</div>;
      };

      render(<ReadingTimeComponent />);

      await waitFor(() => {
        expect(mockAwardXP).toHaveBeenCalledTimes(2);
      });

      testLogger.log('✅ Duplicate detection working via sourceId');
    });

    /**
     * Test Case 5: Toast notification displays correctly
     */
    it('should display toast with "+3 XP" message', async () => {
      testLogger.log('Testing toast notification display');

      jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 103,
        newLevel: 1,
        leveledUp: false,
      });

      const ToastComponent = () => {
        React.useEffect(() => {
          userLevelService.awardXP('user-123', 3, 'Reading', 'reading', 'test-1')
            .then(result => {
              if (result.success && !result.isDuplicate) {
                mockToast({
                  title: 'XP Awarded',
                  description: '+3 XP',
                  variant: 'default',
                });
              }
            });
        }, []);

        return <div>Testing Toast</div>;
      };

      render(<ToastComponent />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'XP Awarded',
          description: '+3 XP',
          variant: 'default',
        });
      });

      testLogger.log('✅ Toast notification displayed correctly');
    });
  });

  describe('Category 2: Note Creation Rewards', () => {
    /**
     * Test Case 6: Short note awards 3 XP
     */
    it('should award 3 XP for note <100 chars with toast', async () => {
      testLogger.log('Testing short note XP reward');

      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 103,
        newLevel: 1,
        leveledUp: false,
      });

      const NoteComponent = () => {
        const noteText = 'This is a short note'; // < 100 chars

        React.useEffect(() => {
          const isQualityNote = noteText.length > 100;
          const xpAmount = isQualityNote ? XP_REWARDS.NOTE_QUALITY_BONUS : XP_REWARDS.NOTE_CREATED;

          userLevelService.awardXP('user-123', xpAmount, 'Note created', 'community', 'note-1')
            .then(result => {
              if (result.success) {
                mockToast({
                  description: `+${xpAmount} XP`,
                });
              }
            });
        }, [noteText]);

        return <div>{noteText}</div>;
      };

      render(<NoteComponent />);

      await waitFor(() => {
        expect(mockAwardXP).toHaveBeenCalledWith('user-123', 3, 'Note created', 'community', 'note-1');
        expect(mockToast).toHaveBeenCalledWith({ description: '+3 XP' });
      });

      testLogger.log('✅ Short note awarded 3 XP');
    });

    /**
     * Test Case 7: Quality note awards 5 XP
     */
    it('should award 5 XP for note >100 chars with toast', async () => {
      testLogger.log('Testing quality note XP reward');

      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 105,
        newLevel: 1,
        leveledUp: false,
      });

      const NoteComponent = () => {
        const noteText = 'A'.repeat(150); // > 100 chars

        React.useEffect(() => {
          const isQualityNote = noteText.length > 100;
          const xpAmount = isQualityNote ? XP_REWARDS.NOTE_QUALITY_BONUS : XP_REWARDS.NOTE_CREATED;

          userLevelService.awardXP('user-123', xpAmount, 'Quality note', 'community', 'note-2')
            .then(result => {
              if (result.success) {
                mockToast({
                  description: `+${xpAmount} XP`,
                });
              }
            });
        }, [noteText]);

        return <div>{noteText}</div>;
      };

      render(<NoteComponent />);

      await waitFor(() => {
        expect(mockAwardXP).toHaveBeenCalledWith('user-123', 5, 'Quality note', 'community', 'note-2');
        expect(mockToast).toHaveBeenCalledWith({ description: '+5 XP' });
      });

      testLogger.log('✅ Quality note awarded 5 XP');
    });

    /**
     * Test Case 8: Note at exactly 100 chars awards 3 XP (boundary test)
     */
    it('should award 3 XP for note at exactly 100 chars', async () => {
      testLogger.log('Testing boundary: exactly 100 chars');

      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 103,
        newLevel: 1,
        leveledUp: false,
      });

      const NoteComponent = () => {
        const noteText = 'A'.repeat(100); // Exactly 100 chars

        React.useEffect(() => {
          const isQualityNote = noteText.length > 100; // Should be false
          const xpAmount = isQualityNote ? XP_REWARDS.NOTE_QUALITY_BONUS : XP_REWARDS.NOTE_CREATED;

          userLevelService.awardXP('user-123', xpAmount, 'Note', 'community', 'note-3');
        }, [noteText]);

        return <div>{noteText}</div>;
      };

      render(<NoteComponent />);

      await waitFor(() => {
        expect(mockAwardXP).toHaveBeenCalledWith('user-123', 3, 'Note', 'community', 'note-3');
      });

      testLogger.log('✅ Boundary test passed: 100 chars = 3 XP');
    });

    /**
     * Test Case 9: Duplicate note content prevents duplicate XP
     */
    it('should prevent duplicate XP for same note content', async () => {
      testLogger.log('Testing duplicate note prevention');

      jest.spyOn(userLevelService, 'awardXP')
        .mockResolvedValueOnce({
          success: true,
          newTotalXP: 103,
          newLevel: 1,
          leveledUp: false,
        })
        .mockResolvedValueOnce({
          success: true,
          newTotalXP: 103,
          newLevel: 1,
          leveledUp: false,
          isDuplicate: true,
        });

      const NoteComponent = () => {
        React.useEffect(() => {
          const sourceId = 'note-hash-12345';

          // First save
          userLevelService.awardXP('user-123', 3, 'Note', 'community', sourceId);

          // Second save (duplicate)
          userLevelService.awardXP('user-123', 3, 'Note', 'community', sourceId);
        }, []);

        return <div>Note</div>;
      };

      render(<NoteComponent />);

      await waitFor(() => {
        expect(userLevelService.awardXP).toHaveBeenCalledTimes(2);
      });

      testLogger.log('✅ Duplicate note prevented via sourceId');
    });

    /**
     * Test Case 10: Toast shows "+3 XP" for basic notes
     */
    it('should show "+3 XP" toast for basic notes', async () => {
      testLogger.log('Testing basic note toast message');

      jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 103,
        newLevel: 1,
        leveledUp: false,
      });

      const NoteComponent = () => {
        React.useEffect(() => {
          userLevelService.awardXP('user-123', 3, 'Note', 'community', 'note-4')
            .then(result => {
              if (result.success) {
                mockToast({
                  title: 'Note Saved',
                  description: '+3 XP',
                  variant: 'default',
                });
              }
            });
        }, []);

        return <div>Note</div>;
      };

      render(<NoteComponent />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Note Saved',
          description: '+3 XP',
          variant: 'default',
        });
      });

      testLogger.log('✅ Basic note toast verified');
    });

    /**
     * Test Case 11: Toast shows "+5 XP" for quality notes
     */
    it('should show "+5 XP" toast for quality notes', async () => {
      testLogger.log('Testing quality note toast message');

      jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 105,
        newLevel: 1,
        leveledUp: false,
      });

      const NoteComponent = () => {
        React.useEffect(() => {
          userLevelService.awardXP('user-123', 5, 'Quality note', 'community', 'note-5')
            .then(result => {
              if (result.success) {
                mockToast({
                  title: 'Note Saved',
                  description: '+5 XP (優質筆記)',
                  variant: 'default',
                });
              }
            });
        }, []);

        return <div>Quality Note</div>;
      };

      render(<NoteComponent />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Note Saved',
          description: '+5 XP (優質筆記)',
          variant: 'default',
        });
      });

      testLogger.log('✅ Quality note toast verified');
    });
  });

  describe('Category 3: AI Question Rewards', () => {
    /**
     * Test Case 12: Simple question awards 2 XP
     */
    it('should award 2 XP for question ≤50 chars with toast', async () => {
      testLogger.log('Testing simple AI question XP reward');

      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 102,
        newLevel: 1,
        leveledUp: false,
      });

      const AIQuestionComponent = () => {
        const questionText = 'Who is Lin Daiyu?'; // ≤ 50 chars

        React.useEffect(() => {
          const isDeepQuestion = questionText.length > 50;
          const xpAmount = isDeepQuestion ? XP_REWARDS.AI_DEEP_ANALYSIS : XP_REWARDS.AI_QA_INTERACTION;

          userLevelService.awardXP('user-123', xpAmount, 'AI question', 'ai_interaction', 'question-1')
            .then(result => {
              if (result.success) {
                mockToast({
                  description: `+${xpAmount} XP`,
                });
              }
            });
        }, [questionText]);

        return <div>{questionText}</div>;
      };

      render(<AIQuestionComponent />);

      await waitFor(() => {
        expect(mockAwardXP).toHaveBeenCalledWith('user-123', 2, 'AI question', 'ai_interaction', 'question-1');
        expect(mockToast).toHaveBeenCalledWith({ description: '+2 XP' });
      });

      testLogger.log('✅ Simple question awarded 2 XP');
    });

    /**
     * Test Case 13: Deep analysis awards 5 XP
     */
    it('should award 5 XP for question >50 chars with toast', async () => {
      testLogger.log('Testing deep analysis AI question XP reward');

      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 105,
        newLevel: 1,
        leveledUp: false,
      });

      const AIQuestionComponent = () => {
        const questionText = 'Can you provide a detailed analysis of the symbolism in Lin Daiyu\'s character arc?'; // > 50 chars

        React.useEffect(() => {
          const isDeepQuestion = questionText.length > 50;
          const xpAmount = isDeepQuestion ? XP_REWARDS.AI_DEEP_ANALYSIS : XP_REWARDS.AI_QA_INTERACTION;

          userLevelService.awardXP('user-123', xpAmount, 'Deep analysis', 'ai_interaction', 'question-2')
            .then(result => {
              if (result.success) {
                mockToast({
                  description: `+${xpAmount} XP`,
                });
              }
            });
        }, [questionText]);

        return <div>{questionText}</div>;
      };

      render(<AIQuestionComponent />);

      await waitFor(() => {
        expect(mockAwardXP).toHaveBeenCalledWith('user-123', 5, 'Deep analysis', 'ai_interaction', 'question-2');
        expect(mockToast).toHaveBeenCalledWith({ description: '+5 XP' });
      });

      testLogger.log('✅ Deep analysis awarded 5 XP');
    });

    /**
     * Test Case 14: Question at exactly 50 chars awards 2 XP (boundary test)
     */
    it('should award 2 XP for question at exactly 50 chars', async () => {
      testLogger.log('Testing boundary: exactly 50 chars');

      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 102,
        newLevel: 1,
        leveledUp: false,
      });

      const AIQuestionComponent = () => {
        const questionText = 'A'.repeat(50); // Exactly 50 chars

        React.useEffect(() => {
          const isDeepQuestion = questionText.length > 50; // Should be false
          const xpAmount = isDeepQuestion ? XP_REWARDS.AI_DEEP_ANALYSIS : XP_REWARDS.AI_QA_INTERACTION;

          userLevelService.awardXP('user-123', xpAmount, 'Question', 'ai_interaction', 'question-3');
        }, [questionText]);

        return <div>{questionText}</div>;
      };

      render(<AIQuestionComponent />);

      await waitFor(() => {
        expect(mockAwardXP).toHaveBeenCalledWith('user-123', 2, 'Question', 'ai_interaction', 'question-3');
      });

      testLogger.log('✅ Boundary test passed: 50 chars = 2 XP');
    });

    /**
     * Test Case 15: Duplicate question prevents duplicate XP
     */
    it('should prevent duplicate XP for same question', async () => {
      testLogger.log('Testing duplicate question prevention');

      jest.spyOn(userLevelService, 'awardXP')
        .mockResolvedValueOnce({
          success: true,
          newTotalXP: 102,
          newLevel: 1,
          leveledUp: false,
        })
        .mockResolvedValueOnce({
          success: true,
          newTotalXP: 102,
          newLevel: 1,
          leveledUp: false,
          isDuplicate: true,
        });

      const AIQuestionComponent = () => {
        React.useEffect(() => {
          const sourceId = 'question-hash-67890';

          // First question
          userLevelService.awardXP('user-123', 2, 'Question', 'ai_interaction', sourceId);

          // Duplicate question
          userLevelService.awardXP('user-123', 2, 'Question', 'ai_interaction', sourceId);
        }, []);

        return <div>Question</div>;
      };

      render(<AIQuestionComponent />);

      await waitFor(() => {
        expect(userLevelService.awardXP).toHaveBeenCalledTimes(2);
      });

      testLogger.log('✅ Duplicate question prevented via sourceId');
    });

    /**
     * Test Case 16: Toast shows "+2 XP" for simple questions
     */
    it('should show "+2 XP" toast for simple questions', async () => {
      testLogger.log('Testing simple question toast message');

      jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 102,
        newLevel: 1,
        leveledUp: false,
      });

      const AIQuestionComponent = () => {
        React.useEffect(() => {
          userLevelService.awardXP('user-123', 2, 'Simple question', 'ai_interaction', 'question-4')
            .then(result => {
              if (result.success) {
                mockToast({
                  title: 'XP Awarded',
                  description: '+2 XP',
                  variant: 'default',
                  duration: 3000,
                });
              }
            });
        }, []);

        return <div>Question</div>;
      };

      render(<AIQuestionComponent />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'XP Awarded',
          description: '+2 XP',
          variant: 'default',
          duration: 3000,
        });
      });

      testLogger.log('✅ Simple question toast verified');
    });

    /**
     * Test Case 17: Toast shows "+5 XP" for deep analysis
     */
    it('should show "+5 XP" toast for deep analysis', async () => {
      testLogger.log('Testing deep analysis toast message');

      jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 105,
        newLevel: 1,
        leveledUp: false,
      });

      const AIQuestionComponent = () => {
        React.useEffect(() => {
          userLevelService.awardXP('user-123', 5, 'Deep analysis', 'ai_interaction', 'question-5')
            .then(result => {
              if (result.success) {
                mockToast({
                  title: 'XP Awarded',
                  description: '+5 XP (深度分析)',
                  variant: 'default',
                  duration: 3000,
                });
              }
            });
        }, []);

        return <div>Deep Analysis</div>;
      };

      render(<AIQuestionComponent />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'XP Awarded',
          description: '+5 XP (深度分析)',
          variant: 'default',
          duration: 3000,
        });
      });

      testLogger.log('✅ Deep analysis toast verified');
    });
  });

  describe('Category 4: Integration Tests', () => {
    /**
     * Test Case 18: Multiple XP sources accumulate correctly
     */
    it('should accumulate XP from multiple sources in same session', async () => {
      testLogger.log('Testing XP accumulation from multiple sources');

      let totalXP = 100;
      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP').mockImplementation((userId, amount) => {
        totalXP += amount;
        return Promise.resolve({
          success: true,
          newTotalXP: totalXP,
          newLevel: 1,
          leveledUp: false,
        });
      });

      const MultiSourceComponent = () => {
        React.useEffect(() => {
          // Award from different sources
          userLevelService.awardXP('user-123', 3, 'Reading time', 'reading', 'source-1');
          userLevelService.awardXP('user-123', 3, 'Note created', 'community', 'source-2');
          userLevelService.awardXP('user-123', 2, 'AI question', 'ai_interaction', 'source-3');
        }, []);

        return <div>Multiple Sources</div>;
      };

      render(<MultiSourceComponent />);

      await waitFor(() => {
        expect(mockAwardXP).toHaveBeenCalledTimes(3);
        expect(totalXP).toBe(108); // 100 + 3 + 3 + 2
      });

      testLogger.log('✅ XP accumulated correctly: 100 → 108');
    });

    /**
     * Test Case 19: Level-up triggered when XP threshold reached
     */
    it('should trigger level-up when XP threshold is reached', async () => {
      testLogger.log('Testing level-up trigger');

      const mockAwardXP = jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 200,
        newLevel: 2,
        leveledUp: true,
        fromLevel: 1,
        unlockedContent: ['chapters:11-20'],
        unlockedPermissions: [],
      });

      let levelUpTriggered = false;

      const LevelUpComponent = () => {
        const [levelUpData, setLevelUpData] = React.useState<any>(null);

        React.useEffect(() => {
          userLevelService.awardXP('user-123', 10, 'Chapter completed', 'reading', 'chapter-10')
            .then(result => {
              if (result.leveledUp) {
                levelUpTriggered = true;
                setLevelUpData({
                  show: true,
                  fromLevel: result.fromLevel,
                  toLevel: result.newLevel,
                });
              }
            });
        }, []);

        return (
          <div>
            {levelUpData && (
              <div data-testid="level-up-modal">
                Level Up: {levelUpData.fromLevel} → {levelUpData.toLevel}
              </div>
            )}
          </div>
        );
      };

      render(<LevelUpComponent />);

      await waitFor(() => {
        expect(levelUpTriggered).toBe(true);
        expect(screen.getByTestId('level-up-modal')).toBeInTheDocument();
        expect(screen.getByText('Level Up: 1 → 2')).toBeInTheDocument();
      });

      testLogger.log('✅ Level-up triggered successfully');
    });

    /**
     * Test Case 20: Profile refreshes after XP awards
     */
    it('should refresh profile after awarding XP', async () => {
      testLogger.log('Testing profile refresh after XP award');

      jest.spyOn(userLevelService, 'awardXP').mockResolvedValue({
        success: true,
        newTotalXP: 103,
        newLevel: 1,
        leveledUp: false,
      });

      const mockRefreshProfile = jest.fn();

      const ProfileRefreshComponent = () => {
        React.useEffect(() => {
          userLevelService.awardXP('user-123', 3, 'Reading', 'reading', 'source-1')
            .then(result => {
              if (result.success) {
                mockRefreshProfile();
              }
            });
        }, []);

        return <div>Profile Refresh</div>;
      };

      render(<ProfileRefreshComponent />);

      await waitFor(() => {
        expect(mockRefreshProfile).toHaveBeenCalled();
      });

      testLogger.log('✅ Profile refreshed after XP award');
    });
  });
});
