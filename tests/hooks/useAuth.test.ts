/**
 * @fileOverview Test Suite for useAuth Hook (Task D.1.1)
 * 
 * This test suite validates the authentication state management functionality
 * as required by Task D.1.1. Tests cover:
 * - Firebase authentication integration
 * - Google OAuth functionality
 * - Email/password authentication
 * - Demo user creation for presentations
 * - User display information formatting
 * - Error handling and internationalization
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
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </LanguageProvider>
);

describe('useAuth Hook - Task D.1.1 Authentication State Management', () => {
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
      expect(result.current.createDemoUser).toBeDefined();
      expect(result.current.getUserDisplayInfo).toBeDefined();
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

    test('should handle Google auth popup errors', async () => {
      const mockError = { code: 'auth/popup-closed-by-user' };
      (signInWithPopup as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        try {
          await result.current.signInWithGoogle();
        } catch (error: any) {
          expect(error.message).toBe('login.errorPopupClosed');
        }
      });
    });

    test('should configure Google provider with correct scopes', async () => {
      const mockProvider = { addScope: jest.fn() };
      (GoogleAuthProvider as jest.Mock).mockReturnValue(mockProvider);
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

    test('should handle invalid credentials error', async () => {
      const mockError = { code: 'auth/invalid-credential' };
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        try {
          await result.current.signInWithEmail('test@example.com', 'wrong');
        } catch (error: any) {
          expect(error.message).toBe('login.errorInvalidCredential');
        }
      });
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
  });

  /**
   * Test Category 4: Demo User Functionality Tests
   */
  describe('Demo User Functionality', () => {
    test('should create demo user with predefined credentials', async () => {
      const mockDemoUser = {
        uid: 'demo-123',
        email: 'demo@redmansion.edu.tw',
        displayName: '示範用戶 (Demo User)',
      };
      
      // Mock sign-in failure followed by successful sign-up
      (signInWithEmailAndPassword as jest.Mock)
        .mockRejectedValueOnce(new Error('User not found'))
        .mockResolvedValue({ user: mockDemoUser });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      let demoUser;
      await act(async () => {
        demoUser = await result.current.createDemoUser();
      });

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'demo@redmansion.edu.tw',
        'RedMansion2025!'
      );
      expect(demoUser).toEqual(mockDemoUser);
    });

    test('should sign in existing demo user', async () => {
      const mockDemoUser = {
        uid: 'demo-123',
        email: 'demo@redmansion.edu.tw',
        displayName: '示範用戶 (Demo User)',
      };
      
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockDemoUser });

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      let demoUser;
      await act(async () => {
        demoUser = await result.current.createDemoUser();
      });

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'demo@redmansion.edu.tw',
        'RedMansion2025!'
      );
      expect(demoUser).toEqual(mockDemoUser);
    });
  });

  /**
   * Test Category 5: User Display Information Tests
   */
  describe('User Display Information', () => {
    test('should format Google user display information', () => {
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
    });

    test('should format email user display information', () => {
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
    });

    test('should identify demo users correctly', () => {
      const demoUser = {
        ...mockEmailUser,
        email: 'demo@redmansion.edu.tw',
        displayName: '示範用戶 (Demo User)',
      };
      mockAuthContext.user = demoUser;

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      const displayInfo = result.current.getUserDisplayInfo();

      expect(displayInfo.isDemo).toBe(true);
    });

    test('should handle users without display names', () => {
      const userWithoutName = {
        ...mockEmailUser,
        displayName: null,
      };
      mockAuthContext.user = userWithoutName;

      const { result } = renderHook(() => useAuth(), {
        wrapper: TestWrapper,
      });

      const displayInfo = result.current.getUserDisplayInfo();

      expect(displayInfo.displayName).toBe('test@example.com'); // Falls back to email
      expect(displayInfo.initials).toBe('T'); // First letter of email
    });
  });

  /**
   * Test Category 6: Logout Functionality Tests
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

    test('should handle logout errors', async () => {
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
}); 