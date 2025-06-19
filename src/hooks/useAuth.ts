/**
 * @fileOverview Enhanced Authentication Hook for Demo Phase
 * 
 * This hook provides a comprehensive interface for accessing authentication state and
 * performing authentication operations throughout the application. Enhanced for demo
 * phase with Google sign-in and simplified user management.
 * 
 * Key Features:
 * - Centralized authentication state access
 * - Google OAuth integration for social login
 * - Built-in error handling with internationalization
 * - Type-safe authentication operations
 * - Demo-friendly user profile management
 * - Simplified component integration
 * 
 * Demo Enhancements:
 * - Quick Google sign-in for demonstrations
 * - User profile display helpers
 * - Demo account creation utilities
 * - Streamlined authentication flow
 */

"use client"; // Required for React hooks in client components

// Import React hooks for context and state management
import { useContext } from 'react';
// Import Firebase authentication methods
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser 
} from 'firebase/auth';
// Import the AuthContext to access authentication state
import { AuthContext } from '@/context/AuthContext';
// Import Firebase auth instance
import { auth } from '@/lib/firebase';
// Import language hook for error messages
import { useLanguage } from '@/hooks/useLanguage';

/**
 * Enhanced Authentication Hook with Demo Features
 * 
 * This hook provides comprehensive authentication functionality optimized for
 * demonstration purposes. It includes both the existing authentication state
 * access and new methods for Google sign-in and user management.
 * 
 * @returns {object} Object containing:
 *   - user: Current authenticated user (FirebaseUser | null)
 *   - isLoading: Boolean indicating authentication verification state
 *   - signInWithGoogle: Function to authenticate with Google OAuth
 *   - signInWithEmail: Function to authenticate with email/password
 *   - signUpWithEmail: Function to create new account with email/password
 *   - logout: Function to sign out current user
 *   - createDemoUser: Function to create demo account for presentations
 *   - getUserDisplayInfo: Function to get formatted user information
 * 
 * @throws {Error} If used outside of an AuthProvider component
 */
export function useAuth() {
  // Access the authentication context using React's useContext hook
  const context = useContext(AuthContext);
  const { t } = useLanguage();
  
  // Validation: Ensure the hook is used within an AuthProvider
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  /**
   * Google OAuth Sign-In for Demo Phase
   * 
   * Provides one-click Google authentication for easy demonstration.
   * Uses Firebase Google Auth Provider with popup authentication flow.
   * 
   * @returns {Promise<FirebaseUser>} Authenticated user object
   * @throws {Error} Authentication errors with localized messages
   */
  const signInWithGoogle = async (): Promise<FirebaseUser> => {
    try {
      const provider = new GoogleAuthProvider();
      // Add additional OAuth scopes for enhanced user information
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error: any) {
      // Handle specific Google Auth errors with localized messages
      let errorMessage = t('login.errorDefault');
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = t('login.errorPopupClosed');
          break;
        case 'auth/popup-blocked':
          errorMessage = t('login.errorPopupBlocked');
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = t('login.errorCancelled');
          break;
        case 'auth/network-request-failed':
          errorMessage = t('login.errorNetwork');
          break;
      }
      
      console.error("Google sign-in error:", error);
      throw new Error(errorMessage);
    }
  };

  /**
   * Email/Password Sign-In
   * 
   * Standard email and password authentication for existing users.
   * 
   * @param email - User email address
   * @param password - User password
   * @returns {Promise<FirebaseUser>} Authenticated user object
   */
  const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error: any) {
      let errorMessage = t('login.errorDefault');
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = t('login.errorInvalidCredential');
          break;
        case 'auth/too-many-requests':
          errorMessage = t('login.errorTooManyRequests');
          break;
      }
      
      console.error("Email sign-in error:", error);
      throw new Error(errorMessage);
    }
  };

  /**
   * Email/Password Sign-Up
   * 
   * Create new user account with email and password.
   * 
   * @param email - User email address
   * @param password - User password
   * @param displayName - Optional display name for the user
   * @returns {Promise<FirebaseUser>} Newly created user object
   */
  const signUpWithEmail = async (
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<FirebaseUser> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name if provided
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      
      return result.user;
    } catch (error: any) {
      let errorMessage = t('register.errorDefault');
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = t('register.errorEmailInUse');
          break;
        case 'auth/weak-password':
          errorMessage = t('register.errorWeakPassword');
          break;
        case 'auth/invalid-email':
          errorMessage = t('register.errorInvalidEmail');
          break;
      }
      
      console.error("Email sign-up error:", error);
      throw new Error(errorMessage);
    }
  };

  /**
   * User Logout
   * 
   * Signs out the current user and clears authentication state.
   * 
   * @returns {Promise<void>}
   */
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error(t('auth.errorLogout'));
    }
  };

  /**
   * Create Demo User Account
   * 
   * Creates a pre-configured demo account for presentation purposes.
   * Uses a standardized demo email and password for consistency.
   * 
   * @returns {Promise<FirebaseUser>} Demo user object
   */
  const createDemoUser = async (): Promise<FirebaseUser> => {
    const demoEmail = 'demo@redmansion.edu.tw';
    const demoPassword = 'RedMansion2025!';
    const demoDisplayName = '示範用戶 (Demo User)';
    
    try {
      // Try to sign in first (demo user might already exist)
      try {
        return await signInWithEmail(demoEmail, demoPassword);
      } catch {
        // If sign-in fails, create new demo user
        return await signUpWithEmail(demoEmail, demoPassword, demoDisplayName);
      }
    } catch (error) {
      console.error("Demo user creation error:", error);
      throw new Error(t('demo.errorCreateUser'));
    }
  };

  /**
   * Get Formatted User Display Information
   * 
   * Extracts and formats user information for display purposes.
   * Handles cases where user information might be incomplete.
   * 
   * @param user - Firebase user object (optional, defaults to current user)
   * @returns {object} Formatted user display information
   */
  const getUserDisplayInfo = (user?: FirebaseUser) => {
    const currentUser = user || context.user;
    
    if (!currentUser) {
      return {
        displayName: t('user.guest'),
        email: '',
        photoURL: '',
        initials: 'G',
        isDemo: false,
        provider: 'none'
      };
    }

    const displayName = currentUser.displayName || 
                       currentUser.email?.split('@')[0] || 
                       t('user.anonymous');
    
    const initials = displayName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);

    const isDemo = currentUser.email === 'demo@redmansion.edu.tw';
    
    // Determine authentication provider
    const provider = currentUser.providerData[0]?.providerId || 'email';
    
    return {
      displayName,
      email: currentUser.email || '',
      photoURL: currentUser.photoURL || '',
      initials,
      isDemo,
      provider: provider.includes('google') ? 'google' : 'email',
      uid: currentUser.uid
    };
  };

  // Return the complete authentication interface
  return {
    // Original context values
    ...context,
    
    // Enhanced authentication methods for demo phase
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    createDemoUser,
    getUserDisplayInfo
  };
}
