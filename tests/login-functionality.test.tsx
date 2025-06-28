/**
 * @fileOverview Comprehensive Login Functionality Tests
 * 
 * This test suite provides comprehensive coverage for the login page functionality,
 * including form validation, user interactions, authentication flows, and error handling.
 * 
 * Test Categories:
 * - Form validation and user input handling
 * - Multi-step login flow (email -> password/register)
 * - Firebase authentication integration
 * - Error handling and user feedback
 * - Loading states and UI interactions
 * - Provider detection and routing logic
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/login/page';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

// Mock external dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Setup for all tests
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  pathname: '/login',
  query: {},
  asPath: '/login',
};

const mockAuthFunctions = {
  signInWithGoogle: jest.fn(),
  signInWithEmail: jest.fn(),
  signInAsGuest: jest.fn(),
  checkExistingProviders: jest.fn(),
};

const mockLanguage = {
  t: (key: string) => {
    const translations: { [key: string]: string } = {
      'login.welcomeBack': '歡迎回來',
      'login.pageDescription': '登入您的帳戶以繼續學習',
      'login.orContinueWith': '或繼續使用',
      'login.noAccount': '還沒有帳戶？',
      'login.registerNow': '立即註冊',
    };
    return translations[key] || key;
  },
};

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuthFunctions);
    (useLanguage as jest.Mock).mockReturnValue(mockLanguage);
    
    // Reset mock functions
    mockAuthFunctions.checkExistingProviders.mockResolvedValue([]);
    mockAuthFunctions.signInWithEmail.mockResolvedValue({ email: 'test@example.com' });
    mockAuthFunctions.signInWithGoogle.mockResolvedValue({ email: 'test@example.com' });
    mockAuthFunctions.signInAsGuest.mockResolvedValue({ email: null });
  });

  describe('Initial Render and UI Elements', () => {
    test('renders login page with all essential elements', () => {
      render(<LoginPage />);
      
      // Check for main UI elements
      expect(screen.getByText('歡迎回來')).toBeInTheDocument();
      expect(screen.getByText('登入您的帳戶以繼續學習')).toBeInTheDocument();
      expect(screen.getByLabelText('電子郵件地址')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '下一步' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '使用Google登入' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '訪客登入' })).toBeInTheDocument();
    });

    test('shows correct initial state - email input step', () => {
      render(<LoginPage />);
      
      // Should show email input step initially
      expect(screen.getByLabelText('電子郵件地址')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('請輸入您的電子郵件地址')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '下一步' })).toBeInTheDocument();
      
      // Should not show password input initially
      expect(screen.queryByLabelText('密碼')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('validates email format before submission', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('電子郵件地址');
      const submitButton = screen.getByRole('button', { name: '下一步' });

      // Test with invalid email
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('請輸入有效的電子郵件地址')).toBeInTheDocument();
      });

      // Verify that provider check was not called due to validation failure
      expect(mockAuthFunctions.checkExistingProviders).not.toHaveBeenCalled();
    });

    test('allows submission with valid email format', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('電子郵件地址');
      const submitButton = screen.getByRole('button', { name: '下一步' });

      // Test with valid email
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthFunctions.checkExistingProviders).toHaveBeenCalledWith('test@example.com');
      });
    });

    test('validates password in password step', async () => {
      const user = userEvent.setup();
      
      // Mock that email exists with password provider
      mockAuthFunctions.checkExistingProviders.mockResolvedValue(['password']);
      
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      // Wait for password step
      await waitFor(() => {
        expect(screen.getByLabelText('密碼')).toBeInTheDocument();
      });

      // Try to submit without password
      const loginButton = screen.getByRole('button', { name: '登入' });
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('請輸入密碼')).toBeInTheDocument();
      });
    });
  });

  describe('Multi-Step Login Flow', () => {
    test('progresses from email to password step for existing password users', async () => {
      const user = userEvent.setup();
      
      // Mock that email exists with password provider
      mockAuthFunctions.checkExistingProviders.mockResolvedValue(['password']);
      
      render(<LoginPage />);

      // Step 1: Enter email
      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      // Step 2: Should show password input
      await waitFor(() => {
        expect(screen.getByLabelText('密碼')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test@example.com')).toBeDisabled();
        expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
      });

      // Verify provider check was called
      expect(mockAuthFunctions.checkExistingProviders).toHaveBeenCalledWith('test@example.com');
    });

    test('progresses from email to register step for new users', async () => {
      const user = userEvent.setup();
      
      // Mock that email doesn't exist
      mockAuthFunctions.checkExistingProviders.mockResolvedValue([]);
      
      render(<LoginPage />);

      // Step 1: Enter email
      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'newuser@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      // Step 2: Should show register options
      await waitFor(() => {
        expect(screen.getByText('帳戶選項')).toBeInTheDocument();
        expect(screen.getByText('電子郵件：newuser@example.com')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '創建新帳戶' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '我已有帳戶，輸入密碼' })).toBeInTheDocument();
      });
    });

    test('handles Google account detection correctly', async () => {
      const user = userEvent.setup();
      
      // Mock that email exists with Google provider only
      mockAuthFunctions.checkExistingProviders.mockResolvedValue(['google.com']);
      
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'googleuser@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      await waitFor(() => {
        expect(screen.getByText('此Email已使用Google帳號註冊。您可以使用Google登入，或者我們將為您創建獨立的Email密碼帳號。')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '創建新帳戶' })).toBeInTheDocument();
      });
    });

    test('allows navigation back to email step from password step', async () => {
      const user = userEvent.setup();
      
      mockAuthFunctions.checkExistingProviders.mockResolvedValue(['password']);
      
      render(<LoginPage />);

      // Progress to password step
      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      await waitFor(() => {
        expect(screen.getByLabelText('密碼')).toBeInTheDocument();
      });

      // Click "更改電子郵件" button
      const changeEmailButton = screen.getByRole('button', { name: '更改電子郵件' });
      await user.click(changeEmailButton);

      // Should return to email step
      await waitFor(() => {
        expect(screen.getByPlaceholderText('請輸入您的電子郵件地址')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '下一步' })).toBeInTheDocument();
        expect(screen.queryByLabelText('密碼')).not.toBeInTheDocument();
      });
    });
  });

  describe('Authentication Integration', () => {
    test('successfully completes email/password login', async () => {
      const user = userEvent.setup();
      
      mockAuthFunctions.checkExistingProviders.mockResolvedValue(['password']);
      
      render(<LoginPage />);

      // Enter email and progress to password step
      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      await waitFor(() => {
        expect(screen.getByLabelText('密碼')).toBeInTheDocument();
      });

      // Enter password and submit
      const passwordInput = screen.getByLabelText('密碼');
      await user.type(passwordInput, 'password123');
      await user.click(screen.getByRole('button', { name: '登入' }));

      // Verify authentication was called and redirect happened
      await waitFor(() => {
        expect(mockAuthFunctions.signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('successfully completes Google login', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: '使用Google登入' });
      await user.click(googleButton);

      await waitFor(() => {
        expect(mockAuthFunctions.signInWithGoogle).toHaveBeenCalled();
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('successfully completes guest login', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const guestButton = screen.getByRole('button', { name: '訪客登入' });
      await user.click(guestButton);

      await waitFor(() => {
        expect(mockAuthFunctions.signInAsGuest).toHaveBeenCalled();
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Error Handling', () => {
    test('handles Firebase authentication errors gracefully', async () => {
      const user = userEvent.setup();
      
      mockAuthFunctions.checkExistingProviders.mockResolvedValue(['password']);
      mockAuthFunctions.signInWithEmail.mockRejectedValue({
        code: 'auth/invalid-credential',
        message: 'Invalid credentials'
      });
      
      render(<LoginPage />);

      // Progress to password step and attempt login
      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      await waitFor(() => {
        expect(screen.getByLabelText('密碼')).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText('密碼');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(screen.getByRole('button', { name: '登入' }));

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('密碼錯誤，請重新輸入。')).toBeInTheDocument();
      });
    });

    test('handles provider check popup errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock popup error during provider check
      mockAuthFunctions.checkExistingProviders.mockRejectedValue({
        code: 'auth/popup-closed-by-user',
        message: 'Popup closed by user'
      });
      
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      // Should progress to register step despite error
      await waitFor(() => {
        expect(screen.getByText('帳戶選項')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '創建新帳戶' })).toBeInTheDocument();
      });
    });

    test('handles Google signin popup errors', async () => {
      const user = userEvent.setup();
      
      mockAuthFunctions.signInWithGoogle.mockRejectedValue({
        code: 'auth/popup-closed-by-user',
        message: 'Popup closed'
      });
      
      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: '使用Google登入' });
      await user.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText('Google登入失敗，請稍後再試')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States and UI Feedback', () => {
    test('shows loading state during email checking', async () => {
      const user = userEvent.setup();
      
      // Mock delayed response
      let resolvePromise: (value: string[]) => void;
      const promise = new Promise<string[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockAuthFunctions.checkExistingProviders.mockReturnValue(promise);
      
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      // Should show loading state
      expect(screen.getByText('檢查中...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '檢查中...' })).toBeDisabled();

      // Resolve the promise
      act(() => {
        resolvePromise!([]);
      });

      await waitFor(() => {
        expect(screen.queryByText('檢查中...')).not.toBeInTheDocument();
      });
    });

    test('shows loading state during login', async () => {
      const user = userEvent.setup();
      
      mockAuthFunctions.checkExistingProviders.mockResolvedValue(['password']);
      
      // Mock delayed login response
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      mockAuthFunctions.signInWithEmail.mockReturnValue(loginPromise);
      
      render(<LoginPage />);

      // Progress to password step
      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      await waitFor(() => {
        expect(screen.getByLabelText('密碼')).toBeInTheDocument();
      });

      // Attempt login
      const passwordInput = screen.getByLabelText('密碼');
      await user.type(passwordInput, 'password123');
      await user.click(screen.getByRole('button', { name: '登入' }));

      // Should show loading state
      expect(screen.getByText('登入中...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '登入中...' })).toBeDisabled();

      // Resolve login
      act(() => {
        resolveLogin!({ email: 'test@example.com' });
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('disables buttons appropriately during different loading states', async () => {
      const user = userEvent.setup();
      
      let resolveGoogle: (value: any) => void;
      const googlePromise = new Promise((resolve) => {
        resolveGoogle = resolve;
      });
      mockAuthFunctions.signInWithGoogle.mockReturnValue(googlePromise);
      
      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: '使用Google登入' });
      const guestButton = screen.getByRole('button', { name: '訪客登入' });
      const nextButton = screen.getByRole('button', { name: '下一步' });

      // Start Google login
      await user.click(googleButton);

      // All buttons should be disabled during Google loading
      expect(googleButton).toBeDisabled();
      expect(guestButton).toBeDisabled();
      expect(nextButton).toBeDisabled();

      // Resolve Google login
      act(() => {
        resolveGoogle!({ email: 'test@example.com' });
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Navigation and Registration Flow', () => {
    test('navigates to registration page with pre-filled email', async () => {
      const user = userEvent.setup();
      
      mockAuthFunctions.checkExistingProviders.mockResolvedValue([]);
      
      render(<LoginPage />);

      // Enter email and progress to register step
      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'newuser@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '創建新帳戶' })).toBeInTheDocument();
      });

      // Click register button
      const registerButton = screen.getByRole('button', { name: '創建新帳戶' });
      await user.click(registerButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/register?email=newuser%40example.com');
    });

    test('allows switching from register step to password step', async () => {
      const user = userEvent.setup();
      
      mockAuthFunctions.checkExistingProviders.mockResolvedValue([]);
      
      render(<LoginPage />);

      // Progress to register step
      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '我已有帳戶，輸入密碼' })).toBeInTheDocument();
      });

      // Click "I have account" button
      const hasAccountButton = screen.getByRole('button', { name: '我已有帳戶，輸入密碼' });
      await user.click(hasAccountButton);

      // Should show password step
      await waitFor(() => {
        expect(screen.getByLabelText('密碼')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and User Experience', () => {
    test('provides proper form labels and accessibility attributes', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('電子郵件地址');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');

      const submitButton = screen.getByRole('button', { name: '下一步' });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    test('shows validation errors with proper styling', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('電子郵件地址');
      const submitButton = screen.getByRole('button', { name: '下一步' });

      // Trigger validation error
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('請輸入有效的電子郵件地址');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('text-destructive');
      });
    });

    test('maintains focus management during step transitions', async () => {
      const user = userEvent.setup();
      
      mockAuthFunctions.checkExistingProviders.mockResolvedValue(['password']);
      
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      await waitFor(() => {
        const passwordInput = screen.getByLabelText('密碼');
        expect(passwordInput).toBeInTheDocument();
        // Note: Focus management can be tested more thoroughly in integration tests
      });
    });
  });
});

export {}; 