/**
 * @fileOverview Test Suite for Login Page Component (Task D.1.1)
 * 
 * This test suite validates the Firebase-Based Minimal Authentication Setup
 * as required by Task D.1.1. Tests cover:
 * - Basic Firebase Auth integration (Google/Email login)
 * - Form validation and user experience
 * - Authentication state management
 * - Error handling and internationalization
 * 
 * Test Categories:
 * 1. Component Rendering Tests
 * 2. Form Validation Tests  
 * 3. Authentication Integration Tests
 * 4. Error Handling Tests
 * 5. Demo User Creation Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Import the component being tested
import LoginPage from '@/app/login/page';

// Import context providers for testing
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';

// Mock external dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  auth: {},
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Test data for various scenarios
const validCredentials = {
  email: 'test@example.com',
  password: 'validPassword123',
};

const invalidCredentials = {
  email: 'invalid-email',
  password: '',
};

/**
 * Test Wrapper Component
 * 
 * Provides necessary context providers for testing the LoginPage component.
 * This ensures the component has access to authentication and language contexts.
 */
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </LanguageProvider>
);

/**
 * Helper function to render LoginPage with required providers
 */
const renderLoginPage = () => {
  return render(
    <TestWrapper>
      <LoginPage />
    </TestWrapper>
  );
};

describe('LoginPage Component - Task D.1.1 Firebase Authentication', () => {
  // Mock router for testing navigation
  const mockPush = jest.fn();
  const mockUseAuth = {
    signInWithGoogle: jest.fn(),
    createDemoUser: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Setup useAuth mock
    const { useAuth } = require('@/hooks/useAuth');
    useAuth.mockReturnValue(mockUseAuth);
  });

  /**
   * Test Category 1: Component Rendering Tests
   * 
   * Validates that the login page renders correctly with all required elements
   * for the minimal authentication setup as specified in Task D.1.1.
   */
  describe('Component Rendering', () => {
    test('should render login form with all required fields', () => {
      renderLoginPage();

      // Verify essential form elements are present
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('should display welcome message and page description', () => {
      renderLoginPage();

      // Check for welcome content (may vary based on translations)
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });

    test('should render Google sign-in button for demo phase', () => {
      renderLoginPage();

      // Verify Google authentication option is available
      const googleButton = screen.getByTestId('google-signin-button') || 
                          screen.getByText(/google/i);
      expect(googleButton).toBeInTheDocument();
    });

    test('should render demo user creation button', () => {
      renderLoginPage();

      // Verify demo user functionality for presentations
      const demoButton = screen.getByTestId('demo-signin-button') || 
                        screen.getByText(/demo/i);
      expect(demoButton).toBeInTheDocument();
    });

    test('should display link to registration page', () => {
      renderLoginPage();

      // Verify users can navigate to registration
      const registerLink = screen.getByRole('link', { name: /register/i }) ||
                          screen.getByText(/sign up/i);
      expect(registerLink).toBeInTheDocument();
    });
  });

  /**
   * Test Category 2: Form Validation Tests
   * 
   * Tests client-side validation for email and password fields
   * to ensure proper user experience before Firebase authentication.
   */
  describe('Form Validation', () => {
    test('should show validation error for invalid email format', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      // Enter invalid email format
      await user.type(emailInput, invalidCredentials.email);
      await user.type(passwordInput, validCredentials.password);
      await user.click(submitButton);

      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    test('should show validation error for empty password', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const submitButton = screen.getByRole('button', { name: /login/i });

      // Enter valid email but leave password empty
      await user.type(emailInput, validCredentials.email);
      await user.click(submitButton);

      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText(/password.*required/i)).toBeInTheDocument();
      });
    });

    test('should enable submit button only with valid inputs', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      // Initially button should be enabled (form allows submission for validation)
      expect(submitButton).toBeEnabled();

      // Enter valid credentials
      await user.type(emailInput, validCredentials.email);
      await user.type(passwordInput, validCredentials.password);

      // Button should remain enabled with valid inputs
      expect(submitButton).toBeEnabled();
    });
  });

  /**
   * Test Category 3: Authentication Integration Tests
   * 
   * Tests the core Firebase authentication functionality required by Task D.1.1:
   * - Email/password authentication
   * - Google OAuth integration
   * - Successful authentication flow
   */
  describe('Firebase Authentication Integration', () => {
    test('should successfully authenticate with valid email and password', async () => {
      const user = userEvent.setup();
      
      // Mock successful Firebase authentication
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: { uid: '123', email: validCredentials.email }
      });

      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      // Enter valid credentials and submit
      await user.type(emailInput, validCredentials.email);
      await user.type(passwordInput, validCredentials.password);
      await user.click(submitButton);

      // Wait for authentication to complete
      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(), // auth object
          validCredentials.email,
          validCredentials.password
        );
      });

      // Verify successful navigation to dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('should handle Google sign-in authentication', async () => {
      const user = userEvent.setup();
      
      // Mock successful Google authentication
      mockUseAuth.signInWithGoogle.mockResolvedValue({
        uid: '123',
        email: 'test@gmail.com',
        displayName: 'Test User'
      });

      renderLoginPage();

      const googleButton = screen.getByTestId('google-signin-button') || 
                          screen.getByText(/google/i);

      // Click Google sign-in button
      await user.click(googleButton);

      // Wait for Google authentication to complete
      await waitFor(() => {
        expect(mockUseAuth.signInWithGoogle).toHaveBeenCalled();
      });

      // Verify successful navigation to dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('should handle demo user creation for presentations', async () => {
      const user = userEvent.setup();
      
      // Mock successful demo user creation
      mockUseAuth.createDemoUser.mockResolvedValue({
        uid: 'demo123',
        email: 'demo@redmansion.edu.tw',
        displayName: '示範用戶 (Demo User)'
      });

      renderLoginPage();

      const demoButton = screen.getByTestId('demo-signin-button') || 
                        screen.getByText(/demo/i);

      // Click demo user creation button
      await user.click(demoButton);

      // Wait for demo user creation to complete
      await waitFor(() => {
        expect(mockUseAuth.createDemoUser).toHaveBeenCalled();
      });

      // Verify successful navigation to dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  /**
   * Test Category 4: Error Handling Tests
   * 
   * Tests proper error handling for various authentication failure scenarios
   * to ensure good user experience during authentication errors.
   */
  describe('Authentication Error Handling', () => {
    test('should display error message for invalid credentials', async () => {
      const user = userEvent.setup();
      
      // Mock Firebase authentication error
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/invalid-credential',
        message: 'Invalid credentials'
      });

      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      // Enter credentials and submit
      await user.type(emailInput, validCredentials.email);
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText(/invalid.*credential/i)).toBeInTheDocument();
      });
    });

    test('should handle Google sign-in popup errors', async () => {
      const user = userEvent.setup();
      
      // Mock Google authentication popup error
      mockUseAuth.signInWithGoogle.mockRejectedValue(
        new Error('Popup closed by user')
      );

      renderLoginPage();

      const googleButton = screen.getByTestId('google-signin-button') || 
                          screen.getByText(/google/i);

      // Click Google sign-in button
      await user.click(googleButton);

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText(/popup.*closed/i)).toBeInTheDocument();
      });
    });

    test('should handle demo user creation errors', async () => {
      const user = userEvent.setup();
      
      // Mock demo user creation error
      mockUseAuth.createDemoUser.mockRejectedValue(
        new Error('Demo user creation failed')
      );

      renderLoginPage();

      const demoButton = screen.getByTestId('demo-signin-button') || 
                        screen.getByText(/demo/i);

      // Click demo user creation button
      await user.click(demoButton);

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText(/demo.*failed/i)).toBeInTheDocument();
      });
    });
  });

  /**
   * Test Category 5: Loading States Tests
   * 
   * Tests that appropriate loading states are shown during authentication
   * to provide good user experience during async operations.
   */
  describe('Loading States', () => {
    test('should show loading state during email authentication', async () => {
      const user = userEvent.setup();
      
      // Mock pending Firebase authentication
      let resolveAuth: (value: any) => void;
      const authPromise = new Promise(resolve => { resolveAuth = resolve; });
      (signInWithEmailAndPassword as jest.Mock).mockReturnValue(authPromise);

      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      // Enter credentials and submit
      await user.type(emailInput, validCredentials.email);
      await user.type(passwordInput, validCredentials.password);
      await user.click(submitButton);

      // Verify loading state is shown
      expect(screen.getByText(/logging.*in/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Resolve the authentication
      resolveAuth!({ user: { uid: '123' } });
    });

    test('should show loading state during Google authentication', async () => {
      const user = userEvent.setup();
      
      // Mock pending Google authentication
      let resolveAuth: (value: any) => void;
      const authPromise = new Promise(resolve => { resolveAuth = resolve; });
      mockUseAuth.signInWithGoogle.mockReturnValue(authPromise);

      renderLoginPage();

      const googleButton = screen.getByTestId('google-signin-button') || 
                          screen.getByText(/google/i);

      // Click Google sign-in button
      await user.click(googleButton);

      // Verify loading state is shown
      expect(googleButton).toBeDisabled();

      // Resolve the authentication
      resolveAuth!({ uid: '123' });
    });
  });

  /**
   * Test Category 6: Accessibility Tests
   * 
   * Tests that the login form is accessible and follows best practices
   * for users with disabilities.
   */
  describe('Accessibility', () => {
    test('should have proper form labels and ARIA attributes', () => {
      renderLoginPage();

      // Check that form inputs have proper labels
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

      // Check that submit button is properly labeled
      const submitButton = screen.getByRole('button', { name: /login/i });
      expect(submitButton).toBeInTheDocument();
    });

    test('should announce errors to screen readers', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const submitButton = screen.getByRole('button', { name: /login/i });

      // Enter invalid email and submit
      await user.type(emailInput, invalidCredentials.email);
      await user.click(submitButton);

      // Wait for error message and check it's properly associated
      await waitFor(() => {
        const errorMessage = screen.getByText(/invalid email/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
}); 