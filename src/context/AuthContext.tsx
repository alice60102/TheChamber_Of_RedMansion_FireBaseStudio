
/**
 * @fileOverview Authentication Context Provider for the Red Mansion platform.
 * 
 * This context manages user authentication state throughout the application using Firebase Auth.
 * It provides:
 * - Current user state (logged in user or null)
 * - Loading state during authentication checks
 * - Automatic state synchronization with Firebase authentication
 * - Loading UI during initial authentication verification
 * 
 * The context wraps the entire application and makes authentication data
 * available to all child components without prop drilling.
 */

"use client"; // Required for client-side React hooks and Firebase auth

// Import Firebase authentication types and functions
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
// Import React types and hooks for context management
import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
// Import configured Firebase auth instance
import { auth } from '@/lib/firebase';
// Import UI component for loading state display
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Type definition for the authentication context value
 * 
 * Defines the shape of data available to components that consume this context
 */
interface AuthContextType {
  user: FirebaseUser | null; // Current authenticated user or null if not logged in
  isLoading: boolean; // True during initial authentication check or state changes
}

/**
 * Authentication Context
 * 
 * Provides authentication state to the entire application.
 * Default values ensure the context works even before the provider is initialized.
 */
export const AuthContext = createContext<AuthContextType>({
  user: null, // Default to no user
  isLoading: true, // Default to loading state
});

/**
 * Props for the AuthProvider component
 */
interface AuthProviderProps {
  children: ReactNode; // Child components that will receive auth context
}

/**
 * Authentication Provider Component
 * 
 * This component wraps the entire application and provides authentication state
 * to all child components. It:
 * - Manages user authentication state with React hooks
 * - Listens for Firebase auth state changes automatically
 * - Shows loading UI during initial authentication verification
 * - Provides the context value to all child components
 * 
 * @param children - Child components that will receive the auth context
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // State to store the current authenticated user (null if not logged in)
  const [user, setUser] = useState<FirebaseUser | null>(null);
  // State to track whether we're still checking authentication status
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Effect to set up Firebase auth state listener
   * 
   * Uses Firebase's onAuthStateChanged to automatically detect when:
   * - User logs in
   * - User logs out
   * - Authentication state is restored from previous session
   * - Authentication expires or fails
   */
  useEffect(() => {
    // Set up listener for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // Update user state (null if logged out)
      setIsLoading(false); // Authentication check complete
    });

    // Cleanup function: unsubscribe from listener when component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array - this effect runs once on mount

  /**
   * Loading state UI
   * 
   * Displays a full-screen loading interface with skeleton components
   * while Firebase verifies authentication status. This prevents flash
   * of unauthenticated content and provides better user experience.
   */
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 p-8 rounded-lg shadow-xl bg-card w-full max-w-md">
          <Skeleton className="h-12 w-1/2 mx-auto" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  /**
   * Provider component that makes authentication state available to all children
   * 
   * The value object contains the current user and loading state,
   * which can be accessed by any child component using the useAuth hook.
   */
  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
