/**
 * @fileOverview Simplified Integration Test for Task D.1.1
 * 
 * This test file focuses on testing components in isolation with proper mocks,
 * avoiding complex context dependency issues while still validating core functionality.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserProfile } from '@/components/UserProfile';
import { LanguageProvider } from '@/context/LanguageContext';

// Mock useAuth hook directly
const mockUseAuth = jest.fn();
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock useLanguage hook for consistent testing
const mockUseLanguage = jest.fn(() => ({
  language: 'zh-TW' as const,
  setLanguage: jest.fn(),
  t: (key: string) => {
    const translations: Record<string, string> = {
      'user.notLoggedIn': '尚未登入',
      'user.userId': '用戶ID',
      'buttons.logout': '登出',
      'auth.providerGoogle': 'Google',
      'auth.providerEmail': '電子郵件'
    };
    return translations[key] || key;
  }
}));

jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => mockUseLanguage()
}));

// Simple test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
);

describe('Simplified Integration Tests - Task D.1.1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Display', () => {
    test('should show not logged in state when no user', () => {
      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      expect(screen.getByText('尚未登入')).toBeInTheDocument();
    });

    test('should show loading state correctly', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        logout: jest.fn(),
        getUserDisplayInfo: jest.fn()
      });

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    test('should display authenticated user information', () => {
      const mockUser = {
        uid: 'test-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null
      };

      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        logout: jest.fn(),
        getUserDisplayInfo: jest.fn().mockReturnValue({
          displayName: 'Test User',
          email: 'test@example.com',
          photoURL: null,
          initials: 'TU',
          provider: 'email',
          isDemo: false,
          uid: 'test-123'
        })
      });

      render(
        <TestWrapper>
          <UserProfile variant="demo" />
        </TestWrapper>
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    test('should handle Google user provider display', () => {
      // Mock Google user
      const mockGoogleUser = {
        uid: 'google-123',
        email: 'user@gmail.com',
        displayName: 'Google User',
        photoURL: 'https://example.com/photo.jpg'
      };

      mockUseAuth.mockReturnValue({
        user: mockGoogleUser,
        isLoading: false,
        logout: jest.fn(),
        getUserDisplayInfo: jest.fn().mockReturnValue({
          displayName: 'Google User',
          email: 'user@gmail.com',
          photoURL: 'https://example.com/photo.jpg',
          initials: 'GU',
          provider: 'google',
          isDemo: false,
          uid: 'google-123'
        })
      });

      render(
        <TestWrapper>
          <UserProfile variant="full" />
        </TestWrapper>
      );

      expect(screen.getByText('Google User')).toBeInTheDocument();
      expect(screen.getByText('user@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('Google')).toBeInTheDocument();
    });
  });

  describe('Component Variants', () => {
    const mockUser = {
      uid: 'test-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        logout: jest.fn(),
        getUserDisplayInfo: jest.fn().mockReturnValue({
          displayName: 'Test User',
          email: 'test@example.com',
          photoURL: null,
          initials: 'TU',
          provider: 'email',
          isDemo: false,
          uid: 'test-123'
        })
      });
    });

    test('should render compact variant correctly', () => {
      render(
        <TestWrapper>
          <UserProfile variant="compact" />
        </TestWrapper>
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
      // Compact variant should have logout button
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('should render demo variant correctly', () => {
      render(
        <TestWrapper>
          <UserProfile variant="demo" />
        </TestWrapper>
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    test('should render full variant correctly', () => {
      render(
        <TestWrapper>
          <UserProfile variant="full" />
        </TestWrapper>
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      // Look for partial text since the colon is separate
      expect(screen.getByText(/用戶ID/)).toBeInTheDocument();
    });
  });

  describe('Authentication Actions', () => {
    test('should call logout function when logout button is clicked', () => {
      const mockLogout = jest.fn();
      const mockUser = {
        uid: 'test-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null
      };

      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        logout: mockLogout,
        getUserDisplayInfo: jest.fn().mockReturnValue({
          displayName: 'Test User',
          email: 'test@example.com',
          photoURL: null,
          initials: 'TU',
          provider: 'email',
          isDemo: false,
          uid: 'test-123'
        })
      });

      render(
        <TestWrapper>
          <UserProfile variant="demo" showLogout={true} />
        </TestWrapper>
      );

      const logoutButton = screen.getByText('登出');
      logoutButton.click();

      expect(mockLogout).toHaveBeenCalled();
    });
  });
}); 