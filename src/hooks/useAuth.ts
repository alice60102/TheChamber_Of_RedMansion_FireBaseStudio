
/**
 * @fileOverview Custom hook for accessing authentication state.
 * 
 * This hook provides a convenient way for components to access the authentication
 * context without directly importing and using useContext. It includes built-in
 * error handling to ensure the hook is used correctly within the AuthProvider.
 * 
 * Usage: const { user, isLoading } = useAuth();
 */

"use client"; // Required for React hooks in client components

// Import React's useContext hook for accessing context
import { useContext } from 'react';
// Import the AuthContext to access authentication state
import { AuthContext } from '@/context/AuthContext';

/**
 * Custom hook for accessing authentication state
 * 
 * This hook provides a safe way to access the authentication context
 * with built-in error handling. It ensures that components using this
 * hook are properly wrapped with an AuthProvider.
 * 
 * @returns {AuthContextType} Object containing:
 *   - user: Current authenticated user (FirebaseUser | null)
 *   - isLoading: Boolean indicating if authentication is being verified
 * 
 * @throws {Error} If used outside of an AuthProvider component
 * 
 * @example
 * function MyComponent() {
 *   const { user, isLoading } = useAuth();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!user) return <div>Please log in</div>;
 *   return <div>Welcome, {user.displayName}!</div>;
 * }
 */
export function useAuth() {
  // Access the authentication context
  const context = useContext(AuthContext);
  
  // Ensure the hook is used within an AuthProvider
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Return the authentication state and methods
  return context;
}
