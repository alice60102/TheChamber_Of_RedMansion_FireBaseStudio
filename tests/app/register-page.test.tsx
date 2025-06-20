import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import RegisterPage from '@/app/register/page';
import { useLanguage } from '@/hooks/useLanguage';
import { auth } from '@/lib/firebase';
import { fetchSignInMethodsForEmail } from 'firebase/auth';

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
  fetchSignInMethodsForEmail: jest.fn(),
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

// Mock React Hook Form Controller component
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  Controller: ({ render }: any) => {
    const field = { onChange: jest.fn(), value: '' };
    return render({ field });
  },
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ScrollText: () => <div data-testid="scroll-text-icon">ScrollText</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  ArrowRight: () => <div data-testid="arrow-right-icon">ArrowRight</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">AlertTriangle</div>,
}));

// Mock UI components
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, defaultValue }: any) => (
    <div data-testid="select">
      <select onChange={(e) => onValueChange?.(e.target.value)} defaultValue={defaultValue}>
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

const mockFetchSignInMethodsForEmail = fetchSignInMethodsForEmail as jest.MockedFunction<typeof fetchSignInMethodsForEmail>;

// Mock console.log to test debug logging
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

describe('Register Page - Enhanced Email Checking', () => {
  const mockPush = jest.fn();
  const mockTranslate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = mockConsoleLog;
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useLanguage as jest.Mock).mockReturnValue({
      t: mockTranslate,
    });

    mockTranslate.mockImplementation((key: string) => {
      const translations: { [key: string]: string } = {
        'register.joinApp': '加入紅樓慧讀',
        'register.step1Description': '創建您的帳戶，開啟智能閱讀新體驗',
        'register.step2Description': '告訴我們更多關於您的學習背景',
        'register.step3Description': '告訴我們您的閱讀興趣',
        'register.step4Description': '設定您的學習目標',
        'register.firstNameLabel': '請輸入姓氏',
        'register.firstNamePlaceholder': '姓氏',
        'register.lastNameLabel': '請輸入名字',
        'register.lastNamePlaceholder': '名字',
        'register.emailLabel': '電子郵件',
        'register.passwordLabel': '密碼 (至少6位)',
        'register.learningBackgroundLabel': '您的古典文學基礎？ (選填)',
        'register.learningBackgroundPlaceholder': '請選擇您的程度',
        'register.readingInterestsLabel': '您對什麼主題感興趣？',
        'register.readingInterestsPlaceholder': '例如：詩詞、人物關係、歷史背景等',
        'register.learningGoalsLabel': '您的學習目標？',
        'register.learningGoalsPlaceholder': '例如：提升文學素養、準備考試等',
        'buttons.next': '下一步',
        'buttons.previous': '上一步',
        'register.checkingEmail': '檢查電子郵件...',
        'register.createAndStart': '創建帳戶並開始學習',
        'register.creatingAccount': '創建帳戶中...',
        'register.errorEmailExistsEmailOnly': '此電子郵件已註冊。請前往登入頁面使用現有帳戶登入。',
        'register.errorEmailExistsGoogleOnly': '此電子郵件已透過 Google 帳戶註冊。請使用 Google 登入，或前往登入頁面。',
        'register.errorEmailExistsMultipleProviders': '此電子郵件已註冊並連結了多個登入方式。請前往登入頁面使用現有帳戶登入。',
        'register.errorEmailExistsOtherProvider': '此電子郵件已透過其他方式註冊。請前往登入頁面使用現有帳戶登入。',
        'register.errorEmailCheckFailed': '檢查電子郵件時發生錯誤，請稍後再試。',
        'register.errorTitle': '註冊錯誤',
        'placeholders.emailExample': 'your@example.com',
        'register.errors.firstNameRequired': '姓氏不能為空',
        'register.errors.lastNameRequired': '名字不能為空',
        'register.errors.emailInvalid': '請輸入有效的電子郵件地址',
        'register.errors.passwordMinLength': '密碼長度至少為6位',
        'register.alreadyHaveAccount': '已經有帳戶了?',
        'buttons.login': '登入',
        'register.bgOptionBeginner': '初學者',
        'register.bgOptionIntermediate': '中級',
        'register.bgOptionAdvanced': '高級',
        'register.bgOptionExpert': '專家',
      };
      return translations[key] || key;
    });
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe('Basic Form Rendering', () => {
    it('should render registration form with all required fields', async () => {
      render(<RegisterPage />);
      
      expect(screen.getByText('加入紅樓慧讀')).toBeInTheDocument();
      expect(screen.getByText('創建您的帳戶，開啟智能閱讀新體驗')).toBeInTheDocument();
      
      expect(screen.getByLabelText('請輸入姓氏')).toBeInTheDocument();
      expect(screen.getByLabelText('請輸入名字')).toBeInTheDocument();
      expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
      expect(screen.getByLabelText('密碼 (至少6位)')).toBeInTheDocument();
      
      expect(screen.getByRole('button', { name: /下一步/i })).toBeInTheDocument();
    });

    it('should show step descriptions correctly', async () => {
      render(<RegisterPage />);
      
      // Step 1 description
      expect(screen.getByText('創建您的帳戶，開啟智能閱讀新體驗')).toBeInTheDocument();
    });
  });

  describe('Enhanced Email Availability Checking', () => {
    it('should proceed to next step when email is available', async () => {
      const user = userEvent.setup();
      
      mockFetchSignInMethodsForEmail.mockResolvedValue([]);
      
      render(<RegisterPage />);
      
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'newuser@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      await waitFor(() => {
        expect(mockFetchSignInMethodsForEmail).toHaveBeenCalledWith(auth, 'newuser@example.com');
      });
      
      await waitFor(() => {
        expect(screen.getByText('告訴我們更多關於您的學習背景')).toBeInTheDocument();
      });

      // Check debug logging
      expect(mockConsoleLog).toHaveBeenCalledWith('Checking email availability for:', 'newuser@example.com');
      expect(mockConsoleLog).toHaveBeenCalledWith('Starting email availability check for:', 'newuser@example.com');
      expect(mockConsoleLog).toHaveBeenCalledWith('Sign-in methods found:', []);
      expect(mockConsoleLog).toHaveBeenCalledWith('Email is available for registration');
      expect(mockConsoleLog).toHaveBeenCalledWith('Email is available, proceeding to next step');
    });

    it('should block step progression when email is already registered with password', async () => {
      const user = userEvent.setup();
      
      mockFetchSignInMethodsForEmail.mockResolvedValue(['password']);
      
      render(<RegisterPage />);
      
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'existing@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      await waitFor(() => {
        expect(screen.getByText('此電子郵件已註冊。請前往登入頁面使用現有帳戶登入。')).toBeInTheDocument();
      });

      // Ensure we stay on step 1
      expect(screen.getByText('創建您的帳戶，開啟智能閱讀新體驗')).toBeInTheDocument();
      expect(screen.queryByText('告訴我們更多關於您的學習背景')).not.toBeInTheDocument();

      // Check debug logging
      expect(mockConsoleLog).toHaveBeenCalledWith('Email is already registered. Google provider:', false, 'Email provider:', true);
      expect(mockConsoleLog).toHaveBeenCalledWith('Email is not available, blocking step progression');
    });

    it('should show Google-specific error when email is registered with Google', async () => {
      const user = userEvent.setup();
      
      mockFetchSignInMethodsForEmail.mockResolvedValue(['google.com']);
      
      render(<RegisterPage />);
      
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'google@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      await waitFor(() => {
        expect(screen.getByText('此電子郵件已透過 Google 帳戶註冊。請使用 Google 登入，或前往登入頁面。')).toBeInTheDocument();
      });

      // Ensure we stay on step 1
      expect(screen.getByText('創建您的帳戶，開啟智能閱讀新體驗')).toBeInTheDocument();

      // Check debug logging
      expect(mockConsoleLog).toHaveBeenCalledWith('Email is already registered. Google provider:', true, 'Email provider:', false);
    });

    it('should show multiple providers error when email has both Google and password', async () => {
      const user = userEvent.setup();
      
      mockFetchSignInMethodsForEmail.mockResolvedValue(['google.com', 'password']);
      
      render(<RegisterPage />);
      
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'multi@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      await waitFor(() => {
        expect(screen.getByText('此電子郵件已註冊並連結了多個登入方式。請前往登入頁面使用現有帳戶登入。')).toBeInTheDocument();
      });

      // Check debug logging
      expect(mockConsoleLog).toHaveBeenCalledWith('Email is already registered. Google provider:', true, 'Email provider:', true);
    });

    it('should show other provider error for unknown providers', async () => {
      const user = userEvent.setup();
      
      mockFetchSignInMethodsForEmail.mockResolvedValue(['facebook.com']);
      
      render(<RegisterPage />);
      
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'facebook@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      await waitFor(() => {
        expect(screen.getByText('此電子郵件已透過其他方式註冊。請前往登入頁面使用現有帳戶登入。')).toBeInTheDocument();
      });

      // Check debug logging
      expect(mockConsoleLog).toHaveBeenCalledWith('Email is already registered. Google provider:', false, 'Email provider:', false);
    });

    it('should show loading state while checking email and disable button', async () => {
      const user = userEvent.setup();
      
      let resolveEmailCheck: (value: string[]) => void;
      const emailCheckPromise = new Promise<string[]>((resolve) => {
        resolveEmailCheck = resolve;
      });
      
      mockFetchSignInMethodsForEmail.mockReturnValue(emailCheckPromise);
      
      render(<RegisterPage />);
      
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      await waitFor(() => {
        expect(screen.getByText('檢查電子郵件...')).toBeInTheDocument();
      });
      
      const checkingButton = screen.getByRole('button', { name: /檢查電子郵件/i });
      expect(checkingButton).toBeDisabled();
      
      // Resolve the promise to complete the test
      resolveEmailCheck!([]);
      
      await waitFor(() => {
        expect(screen.getByText('告訴我們更多關於您的學習背景')).toBeInTheDocument();
      });
    });

    it('should handle network errors during email checking and block progression', async () => {
      const user = userEvent.setup();
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockFetchSignInMethodsForEmail.mockRejectedValue(new Error('Network error'));
      
      render(<RegisterPage />);
      
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      await waitFor(() => {
        expect(screen.getByText('檢查電子郵件時發生錯誤，請稍後再試。')).toBeInTheDocument();
      });

      // Ensure we stay on step 1
      expect(screen.getByText('創建您的帳戶，開啟智能閱讀新體驗')).toBeInTheDocument();
      expect(screen.queryByText('告訴我們更多關於您的學習背景')).not.toBeInTheDocument();

      mockConsoleError.mockRestore();
    });
  });

  describe('Multi-Step Form Navigation', () => {
    beforeEach(async () => {
      // Helper to complete step 1 successfully
      mockFetchSignInMethodsForEmail.mockResolvedValue([]);
    });

    it('should navigate through all 4 steps correctly', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />);
      
      // Step 1: Basic info
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'newuser@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
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
      
      expect(screen.getByRole('button', { name: /創建帳戶並開始學習/i })).toBeInTheDocument();
    });

    it('should allow navigation back to previous steps', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />);
      
      // Complete step 1
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'newuser@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
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
      
      // Verify form values are preserved
      expect(screen.getByDisplayValue('測試')).toBeInTheDocument();
      expect(screen.getByDisplayValue('用戶')).toBeInTheDocument();
      expect(screen.getByDisplayValue('newuser@example.com')).toBeInTheDocument();
    });

    it('should not show previous button on step 1', async () => {
      render(<RegisterPage />);
      
      expect(screen.queryByRole('button', { name: /上一步/i })).not.toBeInTheDocument();
    });

    it('should show different button text on final step', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />);
      
      // Navigate to step 4 (skipping validation by mocking steps)
      // This is a shortcut for testing - in real usage, user must complete each step
      const steps = [1, 2, 3, 4];
      for (let step = 1; step < 4; step++) {
        if (step === 1) {
          // Complete step 1 with email check
          await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
          await user.type(screen.getByLabelText('請輸入名字'), '用戶');
          await user.type(screen.getByLabelText('電子郵件'), 'newuser@example.com');
          await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
        }
        
        await user.click(screen.getByRole('button', { name: /下一步/i }));
        await waitFor(() => {
          // Wait for step transition
        });
      }
      
      // On step 4, should see create account button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /創建帳戶並開始學習/i })).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should not proceed to email checking if form validation fails', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />);
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      await waitFor(() => {
        expect(screen.getByText('姓氏不能為空')).toBeInTheDocument();
        expect(screen.getByText('名字不能為空')).toBeInTheDocument();
        expect(screen.getByText('請輸入有效的電子郵件地址')).toBeInTheDocument();
        expect(screen.getByText('密碼長度至少為6位')).toBeInTheDocument();
      });
      
      expect(mockFetchSignInMethodsForEmail).not.toHaveBeenCalled();
    });

    it('should validate email format before checking availability', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />);
      
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'invalid-email');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      await waitFor(() => {
        expect(screen.getByText('請輸入有效的電子郵件地址')).toBeInTheDocument();
      });
      
      expect(mockFetchSignInMethodsForEmail).not.toHaveBeenCalled();
    });

    it('should validate password minimum length', async () => {
      const user = userEvent.setup();
      
      render(<RegisterPage />);
      
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'test@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), '123');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      await waitFor(() => {
        expect(screen.getByText('密碼長度至少為6位')).toBeInTheDocument();
      });
      
      expect(mockFetchSignInMethodsForEmail).not.toHaveBeenCalled();
    });
  });

  describe('Error State Management', () => {
    it('should clear previous errors when starting new email check', async () => {
      const user = userEvent.setup();
      
      // First attempt - email already exists
      mockFetchSignInMethodsForEmail.mockResolvedValueOnce(['password']);
      
      render(<RegisterPage />);
      
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'existing@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      await waitFor(() => {
        expect(screen.getByText('此電子郵件已註冊。請前往登入頁面使用現有帳戶登入。')).toBeInTheDocument();
      });
      
      // Second attempt - change email to available one
      mockFetchSignInMethodsForEmail.mockResolvedValueOnce([]);
      
      await user.clear(screen.getByLabelText('電子郵件'));
      await user.type(screen.getByLabelText('電子郵件'), 'newemail@example.com');
      
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      // Should clear error and proceed to step 2
      await waitFor(() => {
        expect(screen.queryByText('此電子郵件已註冊。請前往登入頁面使用現有帳戶登入。')).not.toBeInTheDocument();
        expect(screen.getByText('告訴我們更多關於您的學習背景')).toBeInTheDocument();
      });
    });

    it('should maintain error state when email check fails and user tries again', async () => {
      const user = userEvent.setup();
      
      mockFetchSignInMethodsForEmail.mockResolvedValue(['password']);
      
      render(<RegisterPage />);
      
      await user.type(screen.getByLabelText('請輸入姓氏'), '測試');
      await user.type(screen.getByLabelText('請輸入名字'), '用戶');
      await user.type(screen.getByLabelText('電子郵件'), 'existing@example.com');
      await user.type(screen.getByLabelText('密碼 (至少6位)'), 'password123');
      
      // First attempt
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      await waitFor(() => {
        expect(screen.getByText('此電子郵件已註冊。請前往登入頁面使用現有帳戶登入。')).toBeInTheDocument();
      });
      
      // Try again with same email
      await user.click(screen.getByRole('button', { name: /下一步/i }));
      
      await waitFor(() => {
        expect(screen.getByText('此電子郵件已註冊。請前往登入頁面使用現有帳戶登入。')).toBeInTheDocument();
      });
      
      // Should still be on step 1
      expect(screen.getByText('創建您的帳戶，開啟智能閱讀新體驗')).toBeInTheDocument();
    });
  });
}); 