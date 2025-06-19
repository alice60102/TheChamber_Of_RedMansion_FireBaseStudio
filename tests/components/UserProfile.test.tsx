/**
 * @fileOverview Test Suite for UserProfile Component (Task D.1.1)
 * 
 * This test suite validates the simple user profile display functionality
 * as required by Task D.1.1. Tests cover:
 * - User profile information display
 * - Authentication state management
 * - Different display variants (full, compact, demo)
 * - Provider-specific displays (Google, Email)
 * - Demo user identification
 * 
 * Test Categories:
 * 1. Component Rendering Tests
 * 2. Authentication State Tests
 * 3. Display Variant Tests
 * 4. User Information Display Tests
 * 5. Logout Functionality Tests
 * 6. Demo User Features Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import the component being tested
import { UserProfile } from '@/components/UserProfile';

// Import context providers for testing
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';

// Mock external dependencies
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: jest.fn(),
}));

// Test data for different user scenarios
const mockGoogleUser = {
  uid: 'google-user-123',
  email: 'test@gmail.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/avatar.jpg',
  providerData: [{ providerId: 'google.com' }]
};

const mockEmailUser = {
  uid: 'email-user-456',
  email: 'test@example.com',
  displayName: 'Email User',
  photoURL: null,
  providerData: [{ providerId: 'password' }]
};

const mockDemoUser = {
  uid: 'demo-user-789',
  email: 'demo@redmansion.edu.tw',
  displayName: '示範用戶 (Demo User)',
  photoURL: null,
  providerData: [{ providerId: 'password' }]
};

/**
 * Test Wrapper Component
 * 
 * Provides necessary context providers for testing the UserProfile component.
 */
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </LanguageProvider>
);

/**
 * Helper function to render UserProfile with required providers and props
 */
const renderUserProfile = (props = {}) => {
  return render(
    <TestWrapper>
      <UserProfile {...props} />
    </TestWrapper>
  );
};

describe('UserProfile Component - Task D.1.1 User Profile Display', () => {
  // Mock authentication and language hooks
  const mockLogout = jest.fn();
  const mockGetUserDisplayInfo = jest.fn();
  const mockT = jest.fn((key: string) => key); // Simple mock translation

  const mockUseAuth = {
    user: null,
    isLoading: false,
    logout: mockLogout,
    getUserDisplayInfo: mockGetUserDisplayInfo,
  };

  const mockUseLanguage = {
    t: mockT,
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup hook mocks
    const { useAuth } = require('@/hooks/useAuth');
    const { useLanguage } = require('@/hooks/useLanguage');
    
    useAuth.mockReturnValue(mockUseAuth);
    useLanguage.mockReturnValue(mockUseLanguage);
  });

  /**
   * Test Category 1: Component Rendering Tests
   * 
   * Validates that the UserProfile component renders correctly in different states
   * as required for the minimal authentication setup.
   */
  describe('Component Rendering', () => {
    test('should render loading state when authentication is in progress', () => {
      mockUseAuth.isLoading = true;
      renderUserProfile();

      // Verify loading animation is displayed
      expect(screen.getByTestId('user-profile-loading') || 
             document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    test('should render not logged in state when no user is authenticated', () => {
      mockUseAuth.user = null;
      mockUseAuth.isLoading = false;
      renderUserProfile();

      // Verify not logged in message is displayed
      expect(screen.getByText(/not.*logged.*in/i)).toBeInTheDocument();
      expect(screen.getByTestId('user-icon') || 
             document.querySelector('[data-testid="user-icon"]')).toBeInTheDocument();
    });

    test('should render user profile when user is authenticated', () => {
      mockUseAuth.user = mockGoogleUser;
      mockUseAuth.isLoading = false;
      mockGetUserDisplayInfo.mockReturnValue({
        displayName: 'Test User',
        email: 'test@gmail.com',
        photoURL: 'https://example.com/avatar.jpg',
        initials: 'TU',
        provider: 'google',
        isDemo: false,
      });

      renderUserProfile();

      // Verify user information is displayed
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@gmail.com')).toBeInTheDocument();
    });
  });

  /**
   * Test Category 2: Authentication State Tests
   * 
   * Tests how the component responds to different authentication states
   * and properly displays user information from Firebase Authentication.
   */
  describe('Authentication State Management', () => {
    test('should update display when user logs in', () => {
      // Start with no user
      mockUseAuth.user = null;
      const { rerender } = renderUserProfile();
      expect(screen.getByText(/not.*logged.*in/i)).toBeInTheDocument();

      // Simulate user login
      mockUseAuth.user = mockGoogleUser;
      mockGetUserDisplayInfo.mockReturnValue({
        displayName: 'Test User',
        email: 'test@gmail.com',
        photoURL: 'https://example.com/avatar.jpg',
        initials: 'TU',
        provider: 'google',
        isDemo: false,
      });

      rerender(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Verify user information is now displayed
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.queryByText(/not.*logged.*in/i)).not.toBeInTheDocument();
    });

    test('should handle getUserDisplayInfo function correctly', () => {
      mockUseAuth.user = mockEmailUser;
      mockGetUserDisplayInfo.mockReturnValue({
        displayName: 'Email User',
        email: 'test@example.com',
        photoURL: null,
        initials: 'EU',
        provider: 'email',
        isDemo: false,
      });

      renderUserProfile();

      // Verify getUserDisplayInfo was called with the user
      expect(mockGetUserDisplayInfo).toHaveBeenCalledWith(mockEmailUser);
    });
  });

  /**
   * Test Category 3: Display Variant Tests
   * 
   * Tests the different display variants (full, compact, demo) to ensure
   * proper user interface adaptation for different use cases.
   */
  describe('Display Variants', () => {
    beforeEach(() => {
      mockUseAuth.user = mockGoogleUser;
      mockGetUserDisplayInfo.mockReturnValue({
        displayName: 'Test User',
        email: 'test@gmail.com',
        photoURL: 'https://example.com/avatar.jpg',
        initials: 'TU',
        provider: 'google',
        isDemo: false,
      });
    });

    test('should render full variant with complete information', () => {
      renderUserProfile({ variant: 'full' });

      // Verify full profile information is displayed
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@gmail.com')).toBeInTheDocument();
      
      // Should show larger avatar in full variant
      const avatar = screen.getByTestId('user-avatar') || 
                    document.querySelector('[data-testid="user-avatar"]');
      expect(avatar).toBeInTheDocument();
    });

    test('should render compact variant for navigation use', () => {
      renderUserProfile({ variant: 'compact' });

      // Verify compact display
      expect(screen.getByText('Test User')).toBeInTheDocument();
      
      // Compact variant should have smaller elements
      const avatar = screen.getByTestId('user-avatar') || 
                    document.querySelector('[data-testid="user-avatar"]');
      expect(avatar).toBeInTheDocument();
    });

    test('should render demo variant optimized for presentations', () => {
      renderUserProfile({ variant: 'demo' });

      // Verify demo-specific styling and layout
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@gmail.com')).toBeInTheDocument();
      
      // Demo variant should have special presentation styling
      const demoContainer = document.querySelector('.bg-gradient-to-br');
      expect(demoContainer).toBeInTheDocument();
    });
  });

  /**
   * Test Category 4: User Information Display Tests
   * 
   * Tests the display of various user information elements including
   * avatar, name, email, and provider-specific indicators.
   */
  describe('User Information Display', () => {
    test('should display Google user with Chrome icon', () => {
      mockUseAuth.user = mockGoogleUser;
      mockGetUserDisplayInfo.mockReturnValue({
        displayName: 'Google User',
        email: 'test@gmail.com',
        photoURL: 'https://example.com/avatar.jpg',
        initials: 'GU',
        provider: 'google',
        isDemo: false,
      });

      renderUserProfile();

      // Verify Google provider indication
      expect(screen.getByText('Google User')).toBeInTheDocument();
      expect(screen.getByText('test@gmail.com')).toBeInTheDocument();
      
      // Should show Chrome icon for Google users
      const chromeIcon = screen.getByTestId('chrome-icon') || 
                        document.querySelector('[data-testid="chrome-icon"]');
      expect(chromeIcon).toBeInTheDocument();
    });

    test('should display email user with mail icon', () => {
      mockUseAuth.user = mockEmailUser;
      mockGetUserDisplayInfo.mockReturnValue({
        displayName: 'Email User',
        email: 'test@example.com',
        photoURL: null,
        initials: 'EU',
        provider: 'email',
        isDemo: false,
      });

      renderUserProfile();

      // Verify email provider indication
      expect(screen.getByText('Email User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      
      // Should show mail icon for email users
      const mailIcon = screen.getByTestId('mail-icon') || 
                      document.querySelector('[data-testid="mail-icon"]');
      expect(mailIcon).toBeInTheDocument();
    });

    test('should display user initials when no photo is available', () => {
      mockUseAuth.user = mockEmailUser;
      mockGetUserDisplayInfo.mockReturnValue({
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: null,
        initials: 'TU',
        provider: 'email',
        isDemo: false,
      });

      renderUserProfile();

      // Verify initials are displayed in avatar fallback
      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    test('should display user photo when available', () => {
      mockUseAuth.user = mockGoogleUser;
      mockGetUserDisplayInfo.mockReturnValue({
        displayName: 'Photo User',
        email: 'test@gmail.com',
        photoURL: 'https://example.com/avatar.jpg',
        initials: 'PU',
        provider: 'google',
        isDemo: false,
      });

      renderUserProfile();

      // Verify user photo is displayed
      const userImage = screen.getByAltText('Photo User') ||
                       document.querySelector('img[alt="Photo User"]');
      expect(userImage).toBeInTheDocument();
    });
  });

  /**
   * Test Category 5: Logout Functionality Tests
   * 
   * Tests the logout functionality to ensure users can properly sign out
   * and that the authentication state is correctly updated.
   */
  describe('Logout Functionality', () => {
    beforeEach(() => {
      mockUseAuth.user = mockGoogleUser;
      mockGetUserDisplayInfo.mockReturnValue({
        displayName: 'Test User',
        email: 'test@gmail.com',
        photoURL: 'https://example.com/avatar.jpg',
        initials: 'TU',
        provider: 'google',
        isDemo: false,
      });
    });

    test('should display logout button when showLogout is true', () => {
      renderUserProfile({ showLogout: true });

      // Verify logout button is present
      const logoutButton = screen.getByRole('button', { name: /logout/i }) ||
                          screen.getByTestId('logout-button');
      expect(logoutButton).toBeInTheDocument();
    });

    test('should hide logout button when showLogout is false', () => {
      renderUserProfile({ showLogout: false });

      // Verify logout button is not present
      const logoutButton = screen.queryByRole('button', { name: /logout/i });
      expect(logoutButton).not.toBeInTheDocument();
    });

    test('should call logout function when logout button is clicked', async () => {
      const user = userEvent.setup();
      renderUserProfile({ showLogout: true });

      const logoutButton = screen.getByRole('button', { name: /logout/i }) ||
                          screen.getByTestId('logout-button');

      // Click logout button
      await user.click(logoutButton);

      // Verify logout function was called
      expect(mockLogout).toHaveBeenCalled();
    });

    test('should call onLogout callback when provided', async () => {
      const user = userEvent.setup();
      const mockOnLogout = jest.fn();
      
      renderUserProfile({ 
        showLogout: true, 
        onLogout: mockOnLogout 
      });

      const logoutButton = screen.getByRole('button', { name: /logout/i }) ||
                          screen.getByTestId('logout-button');

      // Click logout button
      await user.click(logoutButton);

      // Wait for logout to complete and callback to be called
      await waitFor(() => {
        expect(mockOnLogout).toHaveBeenCalled();
      });
    });

    test('should handle logout errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock logout to throw an error
      mockLogout.mockRejectedValue(new Error('Logout failed'));
      
      renderUserProfile({ showLogout: true });

      const logoutButton = screen.getByRole('button', { name: /logout/i }) ||
                          screen.getByTestId('logout-button');

      // Click logout button
      await user.click(logoutButton);

      // Wait for error to be logged
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  /**
   * Test Category 6: Demo User Features Tests
   * 
   * Tests special handling and display of demo users for presentation purposes
   * as required by Task D.1.1 demo functionality.
   */
  describe('Demo User Features', () => {
    test('should identify and display demo user badge', () => {
      mockUseAuth.user = mockDemoUser;
      mockGetUserDisplayInfo.mockReturnValue({
        displayName: '示範用戶 (Demo User)',
        email: 'demo@redmansion.edu.tw',
        photoURL: null,
        initials: 'DU',
        provider: 'email',
        isDemo: true,
      });

      renderUserProfile();

      // Verify demo user identification
      expect(screen.getByText('示範用戶 (Demo User)')).toBeInTheDocument();
      expect(screen.getByText('demo@redmansion.edu.tw')).toBeInTheDocument();
      
      // Should show demo user badge
      const demoBadge = screen.getByText(/demo/i) || 
                       screen.getByTestId('demo-badge');
      expect(demoBadge).toBeInTheDocument();
    });

    test('should display crown icon for demo users', () => {
      mockUseAuth.user = mockDemoUser;
      mockGetUserDisplayInfo.mockReturnValue({
        displayName: '示範用戶 (Demo User)',
        email: 'demo@redmansion.edu.tw',
        photoURL: null,
        initials: 'DU',
        provider: 'email',
        isDemo: true,
      });

      renderUserProfile({ variant: 'demo' });

      // Should show crown icon for demo users
      const crownIcon = screen.getByTestId('crown-icon') || 
                       document.querySelector('[data-testid="crown-icon"]');
      expect(crownIcon).toBeInTheDocument();
    });

    test('should not display demo badge for regular users', () => {
      mockUseAuth.user = mockGoogleUser;
      mockGetUserDisplayInfo.mockReturnValue({
        displayName: 'Regular User',
        email: 'test@gmail.com',
        photoURL: 'https://example.com/avatar.jpg',
        initials: 'RU',
        provider: 'google',
        isDemo: false,
      });

      renderUserProfile();

      // Should not show demo badge for regular users
      const demoBadge = screen.queryByText(/demo/i);
      expect(demoBadge).not.toBeInTheDocument();
    });
  });

  /**
   * Test Category 7: Accessibility Tests
   * 
   * Tests that the UserProfile component is accessible and follows
   * best practices for users with disabilities.
   */
  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseAuth.user = mockGoogleUser;
      mockGetUserDisplayInfo.mockReturnValue({
        displayName: 'Test User',
        email: 'test@gmail.com',
        photoURL: 'https://example.com/avatar.jpg',
        initials: 'TU',
        provider: 'google',
        isDemo: false,
      });
    });

    test('should have proper alt text for user avatar', () => {
      renderUserProfile();

      // Verify avatar has proper alt text
      const userImage = screen.getByAltText('Test User');
      expect(userImage).toBeInTheDocument();
    });

    test('should have proper button labels for logout', () => {
      renderUserProfile({ showLogout: true });

      // Verify logout button has proper accessible name
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });

    test('should provide proper text alternatives for icons', () => {
      renderUserProfile();

      // Icons should have proper labeling or be decorative
      // This test ensures icons don't create accessibility barriers
      const icons = document.querySelectorAll('svg');
      icons.forEach(icon => {
        // Icons should either have aria-label, title, or aria-hidden
        const hasLabel = icon.hasAttribute('aria-label') || 
                        icon.hasAttribute('title') || 
                        icon.getAttribute('aria-hidden') === 'true';
        expect(hasLabel).toBe(true);
      });
    });
  });
}); 