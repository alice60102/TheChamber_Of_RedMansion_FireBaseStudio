/**
 * @fileOverview Custom Authentication Hook
 * 
 * This hook provides a convenient interface for accessing authentication state throughout
 * the application. It serves as a bridge between components and the AuthContext, ensuring
 * type safety and proper error handling for authentication-related operations.
 * 
 * Key Features:
 * - Centralized authentication state access
 * - Built-in error handling for misuse outside AuthProvider
 * - Type-safe authentication operations
 * - Simplified component integration
 * 
 * Usage Pattern:
 * - Import and use in any component that needs authentication state
 * - Automatically handles loading states and user information
 * - Throws descriptive errors if used incorrectly
 * 
 * Dependencies:
 * - Requires AuthProvider to be wrapped around the component tree
 * - Integrates with Firebase Authentication service
 * - Works with TypeScript for enhanced type safety
 */

"use client"; // Required for React hooks in client components

// Import React's useContext hook for accessing context
import { useContext } from 'react';
// Import the AuthContext to access authentication state
import { AuthContext } from '@/context/AuthContext';

/**
 * Custom Authentication Hook
 * 
 * This hook provides a safe and convenient way to access authentication state
 * from any component within the application. It includes built-in validation
 * to ensure proper usage within the AuthProvider context.
 * 
 * The hook returns the complete authentication context including:
 * - Current user object (Firebase User | null)
 * - Loading state for authentication verification
 * - Any additional authentication methods from the context
 * 
 * @returns {AuthContextType} Object containing:
 *   - user: Current authenticated user (FirebaseUser | null)
 *     - null when user is not authenticated
 *     - FirebaseUser object when user is authenticated
 *     - Contains properties like uid, email, displayName, etc.
 *   - isLoading: Boolean indicating if authentication is being verified
 *     - true during initial app load while checking auth state
 *     - true during sign-in/sign-out operations
 *     - false when auth state is confirmed
 * 
 * @throws {Error} If used outside of an AuthProvider component
 *   - This prevents runtime errors and ensures proper setup
 *   - Provides clear error message for debugging
 * 
 * @example
 * // Basic usage in a component
 * function MyComponent() {
 *   const { user, isLoading } = useAuth();
 *   
 *   // Handle loading state
 *   if (isLoading) return <div>Loading...</div>;
 *   
 *   // Handle unauthenticated state
 *   if (!user) return <div>Please log in</div>;
 *   
 *   // Render authenticated content
 *   return <div>Welcome, {user.displayName}!</div>;
 * }
 * 
 * @example
 * // Usage with conditional rendering
 * function ProtectedContent() {
 *   const { user, isLoading } = useAuth();
 *   
 *   return (
 *     <>
 *       {isLoading && <LoadingSpinner />}
 *       {!isLoading && !user && <LoginPrompt />}
 *       {!isLoading && user && <DashboardContent />}
 *     </>
 *   );
 * }
 * 
 * @example
 * // Usage for user-specific data
 * function UserProfile() {
 *   const { user } = useAuth();
 *   
 *   if (!user) return null;
 *   
 *   return (
 *     <div>
 *       <h1>{user.displayName || 'Anonymous User'}</h1>
 *       <p>Email: {user.email}</p>
 *       <p>User ID: {user.uid}</p>
 *     </div>
 *   );
 * }
 */
export function useAuth() {
  // Access the authentication context using React's useContext hook
  // This retrieves the current value from the nearest AuthProvider
  const context = useContext(AuthContext);
  
  // Validation: Ensure the hook is used within an AuthProvider
  // This prevents runtime errors and provides clear debugging information
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Return the complete authentication context
  // This includes user state, loading state, and any authentication methods
  return context;
}
