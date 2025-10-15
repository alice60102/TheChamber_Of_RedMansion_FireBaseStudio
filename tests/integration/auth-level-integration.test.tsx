/**
 * @fileOverview Integration Tests for Firebase Auth & User Level System
 *
 * These tests verify the integration between:
 * - Firebase Authentication (AuthContext)
 * - User Level Service
 * - Profile initialization and management
 *
 * Test Categories:
 * 1. Authentication state changes
 * 2. Profile loading and initialization
 * 3. Profile refresh after XP awards
 * 4. Error handling and graceful degradation
 *
 * Each test includes comprehensive error logging and result tracking.
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from '@/context/AuthContext';
import { userLevelService } from '@/lib/user-level-service';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

// Mock Firebase auth
jest.mock('firebase/auth');
jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

describe('Firebase Auth & User Level Integration', () => {
  let testLogger: any;
  let mockAuthStateCallback: ((user: FirebaseUser | null) => void) | null;

  beforeEach(() => {
    // Initialize test logger
    testLogger = {
      logs: [],
      log: (message: string, data?: any) => {
        testLogger.logs.push({ message, data, timestamp: new Date().toISOString() });
      }
    };

    // Reset mocks
    jest.clearAllMocks();
    mockAuthStateCallback = null;

    // Setup onAuthStateChanged mock to capture callback
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      mockAuthStateCallback = callback;
      return jest.fn(); // Return unsubscribe function
    });

    // Mock userLevelService methods
    jest.spyOn(userLevelService, 'getUserProfile').mockResolvedValue(null);
    jest.spyOn(userLevelService, 'initializeUserProfile').mockResolvedValue({
      uid: 'test-user-123',
      displayName: 'Test User',
      email: 'test@example.com',
      currentLevel: 0,
      currentXP: 0,
      totalXP: 0,
      nextLevelXP: 100,
      completedTasks: [],
      unlockedContent: ['chapters:1-5', 'intro_guide', 'character_intro_basic'],
      badges: [],
      attributes: {
        scholarship: 0,
        talent: 0,
        wisdom: 0,
        kindness: 0,
        elegance: 0,
      },
      createdAt: new Date(),
      lastActive: new Date(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Authentication State Management - Expected Use Cases', () => {
    /**
     * Test Case 1: Initial authentication check
     *
     * Verifies that AuthProvider shows loading state during initial auth check
     */
    it('should show loading state during initial authentication', () => {
      testLogger.log('Testing initial authentication loading state');

      // Render AuthProvider
      render(
        <AuthProvider>
          <div>Test Content</div>
        </AuthProvider>
      );

      // Should show loading skeleton, not content
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();

      testLogger.log('Loading state verified');
    });

    /**
     * Test Case 2: User login triggers profile loading
     *
     * Verifies that when user logs in, their profile is loaded from Firestore
     */
    it('should load user profile when user logs in', async () => {
      testLogger.log('Testing user login and profile loading');

      const mockUser: FirebaseUser = {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
      } as FirebaseUser;

      const mockProfile = {
        uid: 'test-user-123',
        currentLevel: 2,
        totalXP: 350,
        displayName: 'Test User',
        email: 'test@example.com',
      };

      // Mock existing profile
      (userLevelService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile);

      let contextValue: any;

      // Render with context consumer to access values
      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              contextValue = value;
              return <div>Test Content</div>;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      );

      // Simulate user login
      await act(async () => {
        if (mockAuthStateCallback) {
          await mockAuthStateCallback(mockUser);
        }
      });

      // Wait for profile to load
      await waitFor(() => {
        expect(userLevelService.getUserProfile).toHaveBeenCalledWith('test-user-123');
        expect(contextValue.user).toEqual(mockUser);
        expect(contextValue.userProfile).toEqual(mockProfile);
        expect(contextValue.isLoading).toBe(false);
      });

      testLogger.log('User login and profile loading verified', { mockProfile });
    });

    /**
     * Test Case 3: User logout clears profile
     *
     * Verifies that logging out clears user profile data
     */
    it('should clear user profile when user logs out', async () => {
      testLogger.log('Testing user logout and profile clearing');

      let contextValue: any;

      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              contextValue = value;
              return <div>Test Content</div>;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      );

      // Simulate user logout
      await act(async () => {
        if (mockAuthStateCallback) {
          await mockAuthStateCallback(null);
        }
      });

      await waitFor(() => {
        expect(contextValue.user).toBeNull();
        expect(contextValue.userProfile).toBeNull();
        expect(contextValue.isLoading).toBe(false);
      });

      testLogger.log('User logout and profile clearing verified');
    });
  });

  describe('Profile Initialization - Expected Use Cases', () => {
    /**
     * Test Case: New user profile initialization
     *
     * Verifies that new users get profile initialized automatically
     */
    it('should initialize profile for new users', async () => {
      testLogger.log('Testing new user profile initialization');

      const mockUser: FirebaseUser = {
        uid: 'new-user-456',
        email: 'newuser@example.com',
        displayName: 'New User',
        emailVerified: true,
      } as FirebaseUser;

      // Mock no existing profile (new user)
      (userLevelService.getUserProfile as jest.Mock).mockResolvedValue(null);

      let contextValue: any;

      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              contextValue = value;
              return <div>Test Content</div>;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      );

      // Simulate new user login
      await act(async () => {
        if (mockAuthStateCallback) {
          await mockAuthStateCallback(mockUser);
        }
      });

      await waitFor(() => {
        expect(userLevelService.getUserProfile).toHaveBeenCalledWith('new-user-456');
        expect(userLevelService.initializeUserProfile).toHaveBeenCalledWith(
          'new-user-456',
          'New User',
          'newuser@example.com'
        );
        expect(contextValue.userProfile).toBeDefined();
        expect(contextValue.userProfile?.currentLevel).toBe(0);
      });

      testLogger.log('New user profile initialization verified');
    });

    /**
     * Test Case: New user without displayName
     *
     * Verifies handling of new users without displayName
     */
    it('should handle new users without displayName', async () => {
      testLogger.log('Testing new user without displayName');

      const mockUser: FirebaseUser = {
        uid: 'new-user-no-name',
        email: 'noname@example.com',
        displayName: null,
        emailVerified: true,
      } as FirebaseUser;

      (userLevelService.getUserProfile as jest.Mock).mockResolvedValue(null);

      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => <div>Test Content</div>}
          </AuthContext.Consumer>
        </AuthProvider>
      );

      await act(async () => {
        if (mockAuthStateCallback) {
          await mockAuthStateCallback(mockUser);
        }
      });

      await waitFor(() => {
        expect(userLevelService.initializeUserProfile).toHaveBeenCalledWith(
          'new-user-no-name',
          'User', // Default name
          'noname@example.com'
        );
      });

      testLogger.log('New user without displayName handled correctly');
    });
  });

  describe('Profile Refresh - Expected Use Cases', () => {
    /**
     * Test Case: Refresh user profile after XP award
     *
     * Verifies that refreshUserProfile updates the profile data
     */
    it('should refresh user profile data', async () => {
      testLogger.log('Testing user profile refresh');

      const mockUser: FirebaseUser = {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
      } as FirebaseUser;

      const initialProfile = {
        uid: 'test-user-123',
        currentLevel: 1,
        totalXP: 150,
      };

      const updatedProfile = {
        uid: 'test-user-123',
        currentLevel: 2,
        totalXP: 350, // After XP award
      };

      // Initially return old profile
      (userLevelService.getUserProfile as jest.Mock).mockResolvedValueOnce(initialProfile);

      let contextValue: any;

      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              contextValue = value;
              return <div>Test Content</div>;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      );

      // Simulate user login
      await act(async () => {
        if (mockAuthStateCallback) {
          await mockAuthStateCallback(mockUser);
        }
      });

      await waitFor(() => {
        expect(contextValue.userProfile).toEqual(initialProfile);
      });

      // Mock updated profile for refresh
      (userLevelService.getUserProfile as jest.Mock).mockResolvedValueOnce(updatedProfile);

      // Call refreshUserProfile
      await act(async () => {
        await contextValue.refreshUserProfile();
      });

      await waitFor(() => {
        expect(contextValue.userProfile).toEqual(updatedProfile);
      });

      testLogger.log('User profile refresh verified', { initialProfile, updatedProfile });
    });

    /**
     * Test Case: Refresh with no user
     *
     * Verifies that refresh clears profile when no user is logged in
     */
    it('should clear profile when refreshing with no user', async () => {
      testLogger.log('Testing profile refresh with no user');

      let contextValue: any;

      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              contextValue = value;
              return <div>Test Content</div>;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      );

      // Simulate no user
      await act(async () => {
        if (mockAuthStateCallback) {
          await mockAuthStateCallback(null);
        }
      });

      // Call refreshUserProfile when no user
      await act(async () => {
        await contextValue.refreshUserProfile();
      });

      await waitFor(() => {
        expect(contextValue.userProfile).toBeNull();
        expect(userLevelService.getUserProfile).not.toHaveBeenCalled();
      });

      testLogger.log('Profile refresh with no user handled correctly');
    });
  });

  describe('Error Handling - Failure Cases', () => {
    /**
     * Failure Case: Profile loading error
     *
     * Verifies graceful handling when profile loading fails
     */
    it('should handle profile loading errors gracefully', async () => {
      testLogger.log('Testing profile loading error handling');

      const mockUser: FirebaseUser = {
        uid: 'error-user',
        email: 'error@example.com',
        displayName: 'Error User',
        emailVerified: true,
      } as FirebaseUser;

      // Mock profile loading error
      (userLevelService.getUserProfile as jest.Mock).mockRejectedValue(
        new Error('Firestore connection failed')
      );

      let contextValue: any;

      // Suppress console.error for this test
      const consoleError = console.error;
      console.error = jest.fn();

      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              contextValue = value;
              return <div>Test Content</div>;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      );

      await act(async () => {
        if (mockAuthStateCallback) {
          await mockAuthStateCallback(mockUser);
        }
      });

      await waitFor(() => {
        expect(contextValue.user).toEqual(mockUser);
        expect(contextValue.userProfile).toBeNull(); // Profile should be null on error
        expect(contextValue.isLoading).toBe(false);
      });

      // Restore console.error
      console.error = consoleError;

      testLogger.log('Profile loading error handled gracefully');
    });

    /**
     * Failure Case: Profile refresh error
     *
     * Verifies graceful handling when profile refresh fails
     */
    it('should handle profile refresh errors gracefully', async () => {
      testLogger.log('Testing profile refresh error handling');

      const mockUser: FirebaseUser = {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
      } as FirebaseUser;

      const initialProfile = {
        uid: 'test-user-123',
        currentLevel: 1,
        totalXP: 150,
      };

      (userLevelService.getUserProfile as jest.Mock).mockResolvedValueOnce(initialProfile);

      let contextValue: any;

      // Suppress console.error for this test
      const consoleError = console.error;
      console.error = jest.fn();

      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              contextValue = value;
              return <div>Test Content</div>;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      );

      await act(async () => {
        if (mockAuthStateCallback) {
          await mockAuthStateCallback(mockUser);
        }
      });

      // Mock error on refresh
      (userLevelService.getUserProfile as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      // Call refreshUserProfile
      await act(async () => {
        await contextValue.refreshUserProfile();
      });

      // Profile should remain unchanged on error
      await waitFor(() => {
        expect(contextValue.userProfile).toEqual(initialProfile);
      });

      // Restore console.error
      console.error = consoleError;

      testLogger.log('Profile refresh error handled gracefully');
    });
  });
});
