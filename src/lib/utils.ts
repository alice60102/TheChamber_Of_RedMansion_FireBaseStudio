/**
 * @fileOverview Utility functions for the Red Mansion platform.
 * 
 * This file contains common utility functions used throughout the application.
 * Currently focused on CSS class name management and merging for consistent styling.
 * 
 * The main utility combines clsx (for conditional class names) with tailwind-merge
 * (for resolving Tailwind CSS class conflicts) to provide optimal class name handling.
 */

// Import clsx for conditional class name concatenation
import { clsx, type ClassValue } from "clsx"
// Import tailwind-merge for resolving Tailwind CSS class conflicts
import { twMerge } from "tailwind-merge"

/**
 * Class name utility function (cn)
 * 
 * Combines clsx and tailwind-merge to provide optimal class name handling:
 * - clsx: Handles conditional class names and various input types
 * - tailwind-merge: Intelligently merges Tailwind classes and resolves conflicts
 * 
 * @param inputs - Array of class values (strings, objects, arrays, etc.)
 * @returns Optimized class string with conflicts resolved
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4' (px-2 is overridden)
 * cn('text-red-500', condition && 'text-blue-500') // Conditional classes
 * cn(['base-class', { 'active-class': isActive }]) // Mixed input types
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
