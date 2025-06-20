/**
 * @fileOverview Test Suite for useAuth Hook - Enhanced Authentication Management
 * 
 * This test suite validates the enhanced authentication state management functionality.
 * Tests cover:
 * - Firebase authentication integration
 * - Google OAuth functionality
 * - Email/password authentication and registration
 * - User display information formatting
 * - Error handling and internationalization
 * - Enhanced user information management
 */

import { renderHook, act } from '@testing-library/react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider 
} from 'firebase/auth';

// Import the hook being tested
import { useAuth } from '@/hooks/useAuth';

// Import context providers for testing
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';

// Mock external dependencies
jest.mock('firebase/auth', () => ({
  signInWithPopup: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  auth: {},
}));

jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('@/context/AuthContext', () => ({
  AuthContext: {
    Provider: ({ children }: any) => children,
    Consumer: ({ children }: any) => children({}),
  },
  useContext: jest.fn(),
}));

// Test data for different scenarios
const mockGoogleUser = {
  uid: 'google-123',
  email: 'test@gmail.com',
  displayName: 'Google User',
  photoURL: 'https://example.com/avatar.jpg',
  providerData: [{ providerId: 'google.com' }]
};

const mockEmailUser = {
  uid: 'email-456',
  email: 'test@example.com',
  displayName: 'Email User',
  photoURL: null,
  providerData: [{ providerId: 'password' }]
};

/**
 * Test Wrapper for useAuth Hook
 */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </LanguageProvider>
);

describe('useAuth Hook - Enhanced Authentication State Management', () => {
  // Mock functions and context
  const mockT = jest.fn((key: string) => key);
  const mockAuthContext = {
    user: null,
    isLoading: false,
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup language hook mock
    const { useLanguage } = require('@/hooks/useLanguage');
    useLanguage.mockReturnValue({ t: mockT });

    // Setup auth context mock
    const { useContext } = require('@/context/AuthContext');
    useContext.mockReturnValue(mockAuthContext);
  });

  /**
   * Test Category 1: Hook Initialization Tests
   */
  describe('Hook Initialization', () => {
    test('should throw error when used outside AuthProvider', () => {
      const { useContext } = require('@/context/AuthContext');
      useContext.mockReturnValue(undefined);

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    test('should return authentication context when properly initialized', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      // Verify hook returns expected functions
      expect(result.current.signInWithGoogle).toBeDefined();
      expect(result.current.signInWithEmail).toBeDefined();
      expect(result.current.signUpWithEmail).toBeDefined();
      expect(result.current.logout).toBeDefined();
      expect(result.current.getUserDisplayInfo).toBeDefined();
      
      // Verify no longer has demo user functionality
      expect((result.current as any).createDemoUser).toBeUndefined();
    });
  });

  /**
   * Test Category 2: Google Authentication Tests
   */
  describe('Google Authentication', () => {
    test('should successfully sign in with Google', async () => {
      const mockResult = { user: mockGoogleUser };
      (signInWithPopup as jest.Mock).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      let authResult;
      await act(async () => {
        authResult = await result.current.signInWithGoogle();
      });

      expect(signInWithPopup).toHaveBeenCalled();
      expect(authResult).toEqual(mockGoogleUser);
    });

    test('should handle Google auth popup errors with localized messages', async () => {
      const testCases = [
        { code: 'auth/popup-closed-by-user', expected: 'login.errorPopupClosed' },
        { code: 'auth/popup-blocked', expected: 'login.errorPopupBlocked' },
        { code: 'auth/cancelled-popup-request', expected: 'login.errorCancelled' },
        { code: 'auth/network-request-failed', expected: 'login.errorNetwork' },
        { code: 'auth/unknown-error', expected: 'login.errorDefault' }
      ];

      for (const testCase of testCases) {
        const mockError = { code: testCase.code };
        (signInWithPopup as jest.Mock).mockRejectedValue(mockError);

        const { result } = renderHook(() => useAuth(), {
          wrapper: TestWrapper,
        });

        await act(async () => {
          try {
            await result.current.signInWithGoogle();
          } catch (error: any) {
            expect(error.message).toBe(testCase.expected);
          }
        });
      }
    });

    test('should configure Google provider with correct scopes', async () => {
      const mockProvider = { addScope: jest.fn() };
      (GoogleAuthProvider as unknown as jest.Mock).mockReturnValue(mockProvider);
      (signInWithPopup as jest.Mock).mockResolvedValue({ user: mockGoogleUser });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(mockProvider.addScope).toHaveBeenCalledWith('profile');
      expect(mockProvider.addScope).toHaveBeenCalledWith('email');
    });
  });

  /**
   * Test Category 3: Email Authentication Tests
   */
  describe('Email Authentication', () => {
    test('should successfully sign in with email and password', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResult = { user: mockEmailUser };
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      let authResult;
      await act(async () => {
        authResult = await result.current.signInWithEmail(credentials.email, credentials.password);
      });

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        credentials.email,
        credentials.password
      );
      expect(authResult).toEqual(mockEmailUser);
    });

    test('should handle email sign-in errors with localized messages', async () => {
      const testCases = [
        { code: 'auth/user-not-found', expected: 'login.errorInvalidCredential' },
        { code: 'auth/wrong-password', expected: 'login.errorInvalidCredential' },
        { code: 'auth/invalid-credential', expected: 'login.errorInvalidCredential' },
        { code: 'auth/too-many-requests', expected: 'login.errorTooManyRequests' },
        { code: 'auth/unknown-error', expected: 'login.errorDefault' }
      ];

      for (const testCase of testCases) {
        const mockError = { code: testCase.code };
        (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(mockError);

        const { result } = renderHook(() => useAuth(), {
          wrapper: TestWrapper,
        });

        await act(async () => {
          try {
            await result.current.signInWithEmail('test@example.com', 'wrong');
          } catch (error: any) {
            expect(error.message).toBe(testCase.expected);
          }
        });
      }
    });

    test('should successfully sign up with email and password', async () => {
      const userData = { 
        email: 'new@example.com', 
        password: 'password123',
        displayName: 'New User'
      };
      const mockResult = { user: { ...mockEmailUser, displayName: 'New User' } };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockResult);
      (updateProfile as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      let authResult;
      await act(async () => {
        authResult = await result.current.signUpWithEmail(
          userData.email, 
          userData.password, 
          userData.displayName
        );
      });

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        userData.email,
        userData.password
      );
      expect(updateProfile).toHaveBeenCalledWith(
        mockResult.user,
        { displayName: userData.displayName }
      );
      expect(authResult).toEqual(mockResult.user);
    });

    test('should handle email sign-up errors with localized messages', async () => {
      const testCases = [
        { code: 'auth/email-already-in-use', expected: 'register.errorEmailInUse' },
        { code: 'auth/weak-password', expected: 'register.errorWeakPassword' },
        { code: 'auth/invalid-email', expected: 'register.errorInvalidEmail' },
        { code: 'auth/unknown-error', expected: 'register.errorDefault' }
      ];

      for (const testCase of testCases) {
        const mockError = { code: testCase.code };
        (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(mockError);

        const { result } = renderHook(() => useAuth(), {
          wrapper: TestWrapper,
        });

        await act(async () => {
          try {
            await result.current.signUpWithEmail('test@example.com', 'weak', 'Test User');
          } catch (error: any) {
            expect(error.message).toBe(testCase.expected);
          }
        });
      }
    });

    test('should sign up without display name', async () => {
      const userData = { 
        email: 'new@example.com', 
        password: 'password123'
      };
      const mockResult = { user: mockEmailUser };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      let authResult;
      await act(async () => {
        authResult = await result.current.signUpWithEmail(
          userData.email, 
          userData.password
        );
      });

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        userData.email,
        userData.password
      );
      expect(updateProfile).not.toHaveBeenCalled();
      expect(authResult).toEqual(mockEmailUser);
    });
  });

  /**
   * Test Category 4: User Display Information Tests
   */
  describe('User Display Information', () => {
    test('should format Google user display information correctly', () => {
      mockAuthContext.user = mockGoogleUser;

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      const displayInfo = result.current.getUserDisplayInfo();

      expect(displayInfo.displayName).toBe('Google User');
      expect(displayInfo.email).toBe('test@gmail.com');
      expect(displayInfo.provider).toBe('google');
      expect(displayInfo.initials).toBe('GU');
      expect(displayInfo.isDemo).toBe(false);
      expect(displayInfo.uid).toBe('google-123');
      expect(displayInfo.photoURL).toBe('https://example.com/avatar.jpg');
    });

    test('should format email user display information correctly', () => {
      mockAuthContext.user = mockEmailUser;

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      const displayInfo = result.current.getUserDisplayInfo();

      expect(displayInfo.displayName).toBe('Email User');
      expect(displayInfo.email).toBe('test@example.com');
      expect(displayInfo.provider).toBe('email');
      expect(displayInfo.initials).toBe('EU');
      expect(displayInfo.isDemo).toBe(false);
      expect(displayInfo.uid).toBe('email-456');
      expect(displayInfo.photoURL).toBe('');
    });

    test('should handle users without display names using email fallback', () => {
      const userWithoutName = {
        ...mockEmailUser,
        displayName: null,
      };
      mockAuthContext.user = userWithoutName;

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      const displayInfo = result.current.getUserDisplayInfo();

      expect(displayInfo.displayName).toBe('test'); // Falls back to email prefix
      expect(displayInfo.initials).toBe('T'); // First letter of email prefix
    });

    test('should handle users with empty email gracefully', () => {
      const userWithoutEmail = {
        ...mockEmailUser,
        email: null,
        displayName: null,
      };
      mockAuthContext.user = userWithoutEmail;

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      const displayInfo = result.current.getUserDisplayInfo();

      expect(displayInfo.displayName).toBe('user.anonymous');
      expect(displayInfo.email).toBe('');
      expect(displayInfo.initials).toBe('U'); // First letter of 'user.anonymous'
    });

    test('should generate correct initials for multi-word names', () => {
      const userWithLongName = {
        ...mockEmailUser,
        displayName: 'John Michael Smith Jr',
      };
      mockAuthContext.user = userWithLongName;

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      const displayInfo = result.current.getUserDisplayInfo();

      expect(displayInfo.initials).toBe('JM'); // Only first two initials
    });

    test('should handle null user returning guest information', () => {
      mockAuthContext.user = null;

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      const displayInfo = result.current.getUserDisplayInfo();

      expect(displayInfo.displayName).toBe('user.guest');
      expect(displayInfo.email).toBe('');
      expect(displayInfo.photoURL).toBe('');
      expect(displayInfo.initials).toBe('G');
      expect(displayInfo.isDemo).toBe(false);
      expect(displayInfo.provider).toBe('none');
    });

    test('should correctly identify provider types', () => {
      const testCases = [
        { 
          user: { ...mockEmailUser, providerData: [{ providerId: 'google.com' }] },
          expectedProvider: 'google'
        },
        { 
          user: { ...mockEmailUser, providerData: [{ providerId: 'password' }] },
          expectedProvider: 'email'
        },
        { 
          user: { ...mockEmailUser, providerData: [{ providerId: 'facebook.com' }] },
          expectedProvider: 'email'
        },
        { 
          user: { ...mockEmailUser, providerData: [] },
          expectedProvider: 'email'
        }
      ];

      testCases.forEach(({ user, expectedProvider }) => {
        (mockAuthContext as any).user = user;

        const { result } = renderHook(() => useAuth(), {
          wrapper: TestWrapper,
        });

        const displayInfo = result.current.getUserDisplayInfo();
        expect(displayInfo.provider).toBe(expectedProvider);
      });
    });

    test('should handle custom user parameter override', () => {
      const currentUser = mockEmailUser;
      const customUser = mockGoogleUser;
      
      mockAuthContext.user = currentUser;

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      const displayInfo = result.current.getUserDisplayInfo(customUser);

      // Should use custom user instead of context user
      expect(displayInfo.displayName).toBe('Google User');
      expect(displayInfo.email).toBe('test@gmail.com');
      expect(displayInfo.provider).toBe('google');
    });
  });

  /**
   * Test Category 5: Logout Functionality Tests
   */
  describe('Logout Functionality', () => {
    test('should successfully log out user', async () => {
      (signOut as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(signOut).toHaveBeenCalled();
    });

    test('should handle logout errors with localized message', async () => {
      const mockError = new Error('Logout failed');
      (signOut as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        try {
          await result.current.logout();
        } catch (error: any) {
          expect(error.message).toBe('auth.errorLogout');
        }
      });
    });
  });

  /**
   * Test Category 6: Context Integration Tests
   */
  describe('Context Integration', () => {
    test('should return loading state from context', () => {
      mockAuthContext.isLoading = true;

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isLoading).toBe(true);
    });

    test('should return user state from context', () => {
      mockAuthContext.user = mockEmailUser;

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.user).toEqual(mockEmailUser);
    });

    test('should spread all context properties', () => {
      mockAuthContext.user = mockGoogleUser;
      mockAuthContext.isLoading = false;

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      expect(result.current.user).toEqual(mockGoogleUser);
      expect(result.current.isLoading).toBe(false);
      // Verify enhanced methods are also available
      expect(result.current.signInWithGoogle).toBeDefined();
      expect(result.current.getUserDisplayInfo).toBeDefined();
    });
  });
}); 