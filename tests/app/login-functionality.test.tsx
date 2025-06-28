/**
 * @fileOverview Comprehensive Login Functionality Tests
 * 
 * 此測試套件為登入頁面功能提供全面的測試覆蓋，包括表單驗證、
 * 用戶交互、認證流程和錯誤處理。
 * 
 * 測試類別：
 * - 表單驗證和用戶輸入處理
 * - 多步驟登入流程（電子郵件 -> 密碼/註冊）
 * - Firebase 認證整合
 * - 錯誤處理和用戶反饋
 * - 載入狀態和 UI 交互
 * - 提供者檢測和路由邏輯
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/login/page';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

// Mock external dependencies - 模擬外部依賴
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: jest.fn(),
}));

// Mock Next.js Link component - 模擬 Next.js Link 元件
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Test setup for all tests - 所有測試的設置
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

describe('LoginPage - 登入頁面測試', () => {
  beforeEach(() => {
    // Reset all mocks before each test - 每個測試前重置所有模擬
    jest.clearAllMocks();
    
    // Setup default mock implementations - 設置默認模擬實現
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuthFunctions);
    (useLanguage as jest.Mock).mockReturnValue(mockLanguage);
    
    // Reset mock functions - 重置模擬函數
    mockAuthFunctions.checkExistingProviders.mockResolvedValue([]);
    mockAuthFunctions.signInWithEmail.mockResolvedValue({ email: 'test@example.com' });
    mockAuthFunctions.signInWithGoogle.mockResolvedValue({ email: 'test@example.com' });
    mockAuthFunctions.signInAsGuest.mockResolvedValue({ email: null });
  });

  describe('Initial Render and UI Elements - 初始渲染和 UI 元素', () => {
    test('renders login page with all essential elements - 渲染登入頁面包含所有必要元素', () => {
      render(<LoginPage />);
      
      // Check for main UI elements - 檢查主要 UI 元素
      expect(screen.getByText('歡迎回來')).toBeInTheDocument();
      expect(screen.getByText('登入您的帳戶以繼續學習')).toBeInTheDocument();
      expect(screen.getByLabelText('電子郵件地址')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '下一步' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '使用Google登入' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '訪客登入' })).toBeInTheDocument();
    });

    test('shows correct initial state - email input step - 顯示正確的初始狀態（電子郵件輸入步驟）', () => {
      render(<LoginPage />);
      
      // Should show email input step initially - 應該初始顯示電子郵件輸入步驟
      expect(screen.getByLabelText('電子郵件地址')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('請輸入您的電子郵件地址')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '下一步' })).toBeInTheDocument();
      
      // Should not show password input initially - 初始時不應顯示密碼輸入
      expect(screen.queryByLabelText('密碼')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation - 表單驗證', () => {
    test('validates email format before submission - 提交前驗證電子郵件格式', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('電子郵件地址');
      const submitButton = screen.getByRole('button', { name: '下一步' });

      // Test with invalid email - 測試無效電子郵件
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('請輸入有效的電子郵件地址')).toBeInTheDocument();
      });

      // Verify that provider check was not called due to validation failure
      // 驗證由於驗證失敗而未調用提供者檢查
      expect(mockAuthFunctions.checkExistingProviders).not.toHaveBeenCalled();
    });

    test('allows submission with valid email format - 有效電子郵件格式允許提交', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('電子郵件地址');
      const submitButton = screen.getByRole('button', { name: '下一步' });

      // Test with valid email - 測試有效電子郵件
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthFunctions.checkExistingProviders).toHaveBeenCalledWith('test@example.com');
      });
    });

    test('validates password in password step - 在密碼步驟中驗證密碼', async () => {
      const user = userEvent.setup();
      
      // Mock that email exists with password provider - 模擬電子郵件存在密碼提供者
      mockAuthFunctions.checkExistingProviders.mockResolvedValue(['password']);
      
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      // Wait for password step - 等待密碼步驟
      await waitFor(() => {
        expect(screen.getByLabelText('密碼')).toBeInTheDocument();
      });

      // Try to submit without password - 嘗試在沒有密碼的情況下提交
      const loginButton = screen.getByRole('button', { name: '登入' });
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('請輸入密碼')).toBeInTheDocument();
      });
    });
  });

  describe('Multi-Step Login Flow - 多步驟登入流程', () => {
    test('progresses from email to password step for existing password users - 現有密碼用戶從電子郵件進入密碼步驟', async () => {
      const user = userEvent.setup();
      
      // Mock that email exists with password provider - 模擬電子郵件存在密碼提供者
      mockAuthFunctions.checkExistingProviders.mockResolvedValue(['password']);
      
      render(<LoginPage />);

      // Step 1: Enter email - 步驟1：輸入電子郵件
      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      // Step 2: Should show password input - 步驟2：應該顯示密碼輸入
      await waitFor(() => {
        expect(screen.getByLabelText('密碼')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test@example.com')).toBeDisabled();
        expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
      });

      // Verify provider check was called - 驗證提供者檢查被調用
      expect(mockAuthFunctions.checkExistingProviders).toHaveBeenCalledWith('test@example.com');
    });

    test('progresses from email to register step for new users - 新用戶從電子郵件進入註冊步驟', async () => {
      const user = userEvent.setup();
      
      // Mock that email doesn't exist - 模擬電子郵件不存在
      mockAuthFunctions.checkExistingProviders.mockResolvedValue([]);
      
      render(<LoginPage />);

      // Step 1: Enter email - 步驟1：輸入電子郵件
      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'newuser@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      // Step 2: Should show register options - 步驟2：應該顯示註冊選項
      await waitFor(() => {
        expect(screen.getByText('帳戶選項')).toBeInTheDocument();
        expect(screen.getByText('電子郵件：newuser@example.com')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '創建新帳戶' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '我已有帳戶，輸入密碼' })).toBeInTheDocument();
      });
    });

    test('handles popup errors during provider check - 在提供者檢查期間處理彈窗錯誤', async () => {
      const user = userEvent.setup();
      
      // Mock popup error during provider check - 在提供者檢查期間模擬彈窗錯誤
      mockAuthFunctions.checkExistingProviders.mockRejectedValue({
        code: 'auth/popup-closed-by-user',
        message: 'Popup closed by user'
      });
      
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      // Should progress to register step despite error - 儘管出現錯誤，仍應進入註冊步驟
      await waitFor(() => {
        expect(screen.getByText('帳戶選項')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '創建新帳戶' })).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Integration - 認證整合', () => {
    test('successfully completes email/password login - 成功完成電子郵件/密碼登入', async () => {
      const user = userEvent.setup();
      
      mockAuthFunctions.checkExistingProviders.mockResolvedValue(['password']);
      
      render(<LoginPage />);

      // Enter email and progress to password step - 輸入電子郵件並進入密碼步驟
      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      await waitFor(() => {
        expect(screen.getByLabelText('密碼')).toBeInTheDocument();
      });

      // Enter password and submit - 輸入密碼並提交
      const passwordInput = screen.getByLabelText('密碼');
      await user.type(passwordInput, 'password123');
      await user.click(screen.getByRole('button', { name: '登入' }));

      // Verify authentication was called and redirect happened - 驗證認證被調用並且重定向發生
      await waitFor(() => {
        expect(mockAuthFunctions.signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('successfully completes Google login - 成功完成 Google 登入', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: '使用Google登入' });
      await user.click(googleButton);

      await waitFor(() => {
        expect(mockAuthFunctions.signInWithGoogle).toHaveBeenCalled();
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('successfully completes guest login - 成功完成訪客登入', async () => {
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

  describe('Error Handling - 錯誤處理', () => {
    test('handles Firebase authentication errors gracefully - 優雅地處理 Firebase 認證錯誤', async () => {
      const user = userEvent.setup();
      
      mockAuthFunctions.checkExistingProviders.mockResolvedValue(['password']);
      mockAuthFunctions.signInWithEmail.mockRejectedValue({
        code: 'auth/invalid-credential',
        message: 'Invalid credentials'
      });
      
      render(<LoginPage />);

      // Progress to password step and attempt login - 進入密碼步驟並嘗試登入
      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      await waitFor(() => {
        expect(screen.getByLabelText('密碼')).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText('密碼');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(screen.getByRole('button', { name: '登入' }));

      // Should show error message - 應該顯示錯誤訊息
      await waitFor(() => {
        expect(screen.getByText('密碼錯誤，請重新輸入。')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States - 載入狀態', () => {
    test('shows loading state during email checking - 在檢查電子郵件期間顯示載入狀態', async () => {
      const user = userEvent.setup();
      
      // Mock delayed response - 模擬延遲響應
      let resolvePromise: (value: string[]) => void;
      const promise = new Promise<string[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockAuthFunctions.checkExistingProviders.mockReturnValue(promise);
      
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('電子郵件地址');
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: '下一步' }));

      // Should show loading state - 應該顯示載入狀態
      expect(screen.getByText('檢查中...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '檢查中...' })).toBeDisabled();

      // Resolve the promise - 解決 promise
      act(() => {
        resolvePromise!([]);
      });

      await waitFor(() => {
        expect(screen.queryByText('檢查中...')).not.toBeInTheDocument();
      });
    });
  });
});

export {}; 