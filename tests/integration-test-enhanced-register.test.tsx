/**
 * @fileOverview Integration Test for Enhanced Registration Flow
 * 
 * This test suite validates the enhanced registration functionality with email checking.
 * Covers the bug fixes implemented for immediate email validation during multi-step registration.
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import RegisterPage from '@/app/register/page';
import { useLanguage } from '@/hooks/useLanguage';
import { auth } from '@/lib/firebase';
import { fetchSignInMethodsForEmail, createUserWithEmailAndPassword } from 'firebase/auth';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock useLanguage hook
jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: jest.fn(),
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  fetchSignInMethodsForEmail: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => (
    <select onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

// Mock icons
jest.mock('lucide-react', () => ({
  ScrollText: () => <div data-testid="scroll-text">ScrollText</div>,
  ArrowLeft: () => <div data-testid="arrow-left">ArrowLeft</div>,
  ArrowRight: () => <div data-testid="arrow-right">ArrowRight</div>,
  AlertTriangle: () => <div data-testid="alert-triangle">AlertTriangle</div>,
}));

// Mock Link component
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock React Hook Form Controller
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  Controller: ({ render }: any) => {
    const field = { onChange: jest.fn(), value: '' };
    return render({ field });
  },
}));

const mockFetchSignInMethodsForEmail = fetchSignInMethodsForEmail as jest.MockedFunction<typeof fetchSignInMethodsForEmail>;
const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>;

describe('Enhanced Registration Flow - Email Checking Bug Fix', () => {
  const mockPush = jest.fn();
  const mockT = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Setup language translations
    (useLanguage as jest.Mock).mockReturnValue({
      t: mockT,
    });

    // Default translation responses
    mockT.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        'register.joinApp': '加入紅樓慧讀',
        'register.step1Description': '創建您的帳戶，開啟智能閱讀新體驗',
        'register.step2Description': '告訴我們更多關於您的學習背景',
        'register.step3Description': '告訴我們您的閱讀興趣',
        'register.step4Description': '設定您的學習目標',
        'register.firstNameLabel': '請輸入姓氏',
        'register.lastNameLabel': '請輸入名字',
        'register.emailLabel': '電子郵件',
        'register.passwordLabel': '密碼 (至少6位)',
        'register.learningBackgroundLabel': '您的古典文學基礎？',
        'register.readingInterestsLabel': '您對什麼主題感興趣？',
        'register.learningGoalsLabel': '您的學習目標？',
        'buttons.next': '下一步',
        'buttons.previous': '上一步',
        'register.checkingEmail': '檢查電子郵件...',
        'register.createAndStart': '創建帳戶並開始學習',
        'register.errorEmailExistsEmailOnly': '此電子郵件已註冊。請前往登入頁面使用現有帳戶登入。',
        'register.errorEmailExistsGoogleOnly': '此電子郵件已透過 Google 帳戶註冊。請使用 Google 登入，或前往登入頁面。',
        'register.errorEmailExistsMultipleProviders': '此電子郵件已註冊並連結了多個登入方式。請前往登入頁面使用現有帳戶登入。',
        'register.errorEmailExistsOtherProvider': '此電子郵件已透過其他方式註冊。請前往登入頁面使用現有帳戶登入。',
        'register.errorEmailCheckFailed': '檢查電子郵件時發生錯誤，請稍後再試。',
        'register.errorTitle': '註冊錯誤',
        'register.errors.firstNameRequired': '姓氏不能為空',
        'register.errors.lastNameRequired': '名字不能為空',
        'register.errors.emailInvalid': '請輸入有效的電子郵件地址',
        'register.errors.passwordMinLength': '密碼長度至少為6位',
        'placeholders.emailExample': 'your@example.com',
        'register.alreadyHaveAccount': '已經有帳戶了?',
        'buttons.login': '登入',
      };
      return translations[key] || key;
    });
  });

  describe('Critical Bug Fix: Email Checking on Step 1', () => {
    test('FIXED: Should block progression when email already exists with password auth', async () => {
      const user = userEvent.setup();
      
      // Mock email already registered with password
      mockFetchSignInMethodsForEmail.mockResolvedValue(['password']);
      
      render(<RegisterPage />);
      
      // Fill out step 1 form
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'existing@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      // Try to proceed to next step
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      // Should call email check
      await waitFor(() => {
        expect(mockFetchSignInMethodsForEmail).toHaveBeenCalledWith(auth, 'existing@example.com');
      });
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('此電子郵件已註冊。請前往登入頁面使用現有帳戶登入。')).toBeInTheDocument();
      });
      
      // Critical: Should NOT progress to step 2
      expect(screen.getByText('創建您的帳戶，開啟智能閱讀新體驗')).toBeInTheDocument();
      expect(screen.queryByText('告訴我們更多關於您的學習背景')).not.toBeInTheDocument();
    });

    test('FIXED: Should progress when email is available', async () => {
      const user = userEvent.setup();
      
      // Mock email available
      mockFetchSignInMethodsForEmail.mockResolvedValue([]);
      
      render(<RegisterPage />);
      
      // Fill out step 1 form
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'available@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      // Try to proceed to next step
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      // Should call email check
      await waitFor(() => {
        expect(mockFetchSignInMethodsForEmail).toHaveBeenCalledWith(auth, 'available@example.com');
      });
      
      // Should progress to step 2
      await waitFor(() => {
        expect(screen.getByText('告訴我們更多關於您的學習背景')).toBeInTheDocument();
      });
      
      // Should NOT be on step 1 anymore
      expect(screen.queryByText('創建您的帳戶，開啟智能閱讀新體驗')).not.toBeInTheDocument();
    });

    test('FIXED: Should show loading state during email check', async () => {
      const user = userEvent.setup();
      
      // Create a promise that we can control
      let resolveEmailCheck: (value: string[]) => void;
      const emailCheckPromise = new Promise<string[]>((resolve) => {
        resolveEmailCheck = resolve;
      });
      
      mockFetchSignInMethodsForEmail.mockReturnValue(emailCheckPromise);
      
      render(<RegisterPage />);
      
      // Fill out step 1 form
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      // Click next step button
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('檢查電子郵件...')).toBeInTheDocument();
      });
      
      // Button should be disabled during loading
      const checkingButton = screen.getByRole('button', { name: /檢查電子郵件/i });
      expect(checkingButton).toBeDisabled();
      
      // Resolve the email check
      resolveEmailCheck!([]);
      
      // Should eventually progress to step 2
      await waitFor(() => {
        expect(screen.getByText('告訴我們更多關於您的學習背景')).toBeInTheDocument();
      });
    });

    test('FIXED: Should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock network error
      mockFetchSignInMethodsForEmail.mockRejectedValue(new Error('Network error'));
      
      render(<RegisterPage />);
      
      // Fill out step 1 form
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      // Try to proceed to next step
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('檢查電子郵件時發生錯誤，請稍後再試。')).toBeInTheDocument();
      });
      
      // Should NOT progress to step 2
      expect(screen.getByText('創建您的帳戶，開啟智能閱讀新體驗')).toBeInTheDocument();
      expect(screen.queryByText('告訴我們更多關於您的學習背景')).not.toBeInTheDocument();
    });
  });

  describe('Enhanced Multi-Step Navigation', () => {
    beforeEach(() => {
      // Setup successful email check for navigation tests
      mockFetchSignInMethodsForEmail.mockResolvedValue([]);
    });

    test('Should navigate through all 4 steps with valid data', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />);
      
      // Step 1: Basic information
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'valid@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'validpassword123');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      // Step 2: Learning background
      await waitFor(() => {
        expect(screen.getByText('告訴我們更多關於您的學習背景')).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      // Step 3: Reading interests  
      await waitFor(() => {
        expect(screen.getByText('告訴我們您的閱讀興趣')).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      // Step 4: Learning goals
      await waitFor(() => {
        expect(screen.getByText('設定您的學習目標')).toBeInTheDocument();
      });
      
      // Final step should show create account button
      expect(screen.getByRole('button', { name: /創建帳戶並開始學習/i })).toBeInTheDocument();
    });

    test('Should allow backward navigation while preserving form data', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />);
      
      // Complete step 1
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'valid@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'validpassword123');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      // Navigate to step 2
      await waitFor(() => {
        expect(screen.getByText('告訴我們更多關於您的學習背景')).toBeInTheDocument();
      });
      
      // Go back to step 1
      await user.click(screen.getByRole('button', { name: /上一步/i }));
      
      await waitFor(() => {
        expect(screen.getByText('創建您的帳戶，開啟智能閱讀新體驗')).toBeInTheDocument();
      });
      
      // Form data should be preserved
      expect(screen.getByDisplayValue('測試')).toBeInTheDocument();
      expect(screen.getByDisplayValue('用戶')).toBeInTheDocument();
      expect(screen.getByDisplayValue('valid@example.com')).toBeInTheDocument();
    });
  });

  describe('Error Recovery Scenarios', () => {
    test('Should clear previous errors when trying different email', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />);
      
      // First attempt with existing email
      mockFetchSignInMethodsForEmail.mockResolvedValueOnce(['password']);
      
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'existing@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      // Should show error
      await waitFor(() => {
        expect(screen.getByText('此電子郵件已註冊。請前往登入頁面使用現有帳戶登入。')).toBeInTheDocument();
      });
      
      // Second attempt with available email
      mockFetchSignInMethodsForEmail.mockResolvedValueOnce([]);
      
      // Clear and type new email
      const emailInput = screen.getByLabelText('電子郵件');
      await user.clear(emailInput);
      await user.type(emailInput, 'available@example.com');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      // Should clear error and proceed
      await waitFor(() => {
        expect(screen.queryByText('此電子郵件已註冊。請前往登入頁面使用現有帳戶登入。')).not.toBeInTheDocument();
        expect(screen.getByText('告訴我們更多關於您的學習背景')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation Integration', () => {
    test('Should validate required fields before email checking', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />);
      
      // Try to proceed without filling required fields
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('姓氏不能為空')).toBeInTheDocument();
        expect(screen.getByText('名字不能為空')).toBeInTheDocument();
        expect(screen.getByText('請輸入有效的電子郵件地址')).toBeInTheDocument();
        expect(screen.getByText('密碼長度至少為6位')).toBeInTheDocument();
      });
      
      // Should NOT call email check
      expect(mockFetchSignInMethodsForEmail).not.toHaveBeenCalled();
    });

    test('Should validate email format before availability check', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />);
      
      // Fill valid data except invalid email
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'invalid-email-format');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'validpassword123');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      // Should show email format error
      await waitFor(() => {
        expect(screen.getByText('請輸入有效的電子郵件地址')).toBeInTheDocument();
      });
      
      // Should NOT call email availability check
      expect(mockFetchSignInMethodsForEmail).not.toHaveBeenCalled();
    });
  });
}); 