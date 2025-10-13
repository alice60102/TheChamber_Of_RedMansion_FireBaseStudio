/**
 * @fileOverview Enhanced Authentication Hook
 * 
 * This hook provides a comprehensive interface for accessing authentication state and
 * performing authentication operations throughout the application.
 * 
 * Key Features:
 * - Centralized authentication state access
 * - Google OAuth integration for social login
 * - Built-in error handling with internationalization
 * - Type-safe authentication operations
 * - User profile management
 * - Simplified component integration
 * 
 * Features:
 * - Google sign-in for social authentication
 * - User profile display helpers
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
  signInAnonymously,
  type User as FirebaseUser 
} from 'firebase/auth';
// Import the AuthContext to access authentication state
import { AuthContext } from '@/context/AuthContext';
// Import Firebase auth instance
import { auth } from '@/lib/firebase';
// Import language hook for error messages
import { useLanguage } from '@/hooks/useLanguage';

/**
 * Enhanced Authentication Hook
 * 
 * This hook provides comprehensive authentication functionality including
 * authentication state access and methods for Google sign-in and user management.
 * 
 * @returns {object} Object containing:
 *   - user: Current authenticated user (FirebaseUser | null)
 *   - isLoading: Boolean indicating authentication verification state
 *   - signInWithGoogle: Function to authenticate with Google OAuth
 *   - signInWithEmail: Function to authenticate with email/password
 *   - signUpWithEmail: Function to create new account with email/password
 *   - signInAsGuest: Function for guest login
 *   - logout: Function to sign out current user
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
   * Anonymous Sign-In (Guest Login)
   * 
   * Provides a way for users to access the application without creating an account.
   * Uses Firebase's anonymous authentication.
   * 
   * @returns {Promise<FirebaseUser>} Authenticated anonymous user object
   * @throws {Error} Authentication errors with localized messages
   */
  const signInAsGuest = async (): Promise<FirebaseUser> => {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error: any) {
      console.error("Anonymous sign-in error:", error);
      // Provide a generic error message for guest login failure
      throw new Error(t('login.errorGuest'));
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
        provider: 'none',
        uid: ''
      };
    }

    // Handle anonymous users specifically for better display logic
    if (currentUser.isAnonymous) {
      return {
        displayName: t('user.redMansionGuest'),
        email: '',
        photoURL: '',
        initials: '客',
        isDemo: false,
        provider: 'anonymous',
        uid: currentUser.uid
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

    // No longer checking for demo users - all users are regular users
    const isDemo = false;
    
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

  // Return all authentication methods and state
  // Now includes user level profile and refresh functionality
  return {
    user: context.user,
    userProfile: context.userProfile,  // User level profile with XP data
    isLoading: context.isLoading,
    refreshUserProfile: context.refreshUserProfile,  // Refresh profile after XP awards
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    logout,
    getUserDisplayInfo
  };
}
