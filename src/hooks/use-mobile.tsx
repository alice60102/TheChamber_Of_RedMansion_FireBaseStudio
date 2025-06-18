/**
 * @fileOverview Custom hook for responsive design and mobile device detection.
 * 
 * This hook provides a way to detect whether the current viewport is considered
 * "mobile" based on screen width. It uses the matchMedia API for efficient
 * listening to viewport changes and provides reactive updates when the screen
 * size changes (e.g., when rotating device or resizing browser window).
 * 
 * Used throughout the application for:
 * - Responsive UI component rendering
 * - Mobile-specific interaction patterns
 * - Touch vs mouse interface adaptations
 * - Layout adjustments for smaller screens
 */

// Import React for hooks and state management
import * as React from "react"

/**
 * Mobile breakpoint threshold in pixels
 * 
 * Screens smaller than this width are considered mobile devices.
 * Based on common responsive design practices where 768px is the
 * typical tablet/mobile boundary (matching Tailwind CSS 'md' breakpoint).
 */
const MOBILE_BREAKPOINT = 768

/**
 * Custom hook to detect mobile viewport
 * 
 * Uses the matchMedia API to efficiently listen for viewport changes
 * and determine if the current screen size should be considered mobile.
 * The hook handles SSR compatibility and provides reactive updates.
 * 
 * @returns {boolean} True if the current viewport is mobile-sized (< 768px)
 * 
 * @example
 * function ResponsiveComponent() {
 *   const isMobile = useIsMobile();
 *   
 *   return (
 *     <div>
 *       {isMobile ? (
 *         <MobileNavigation />
 *       ) : (
 *         <DesktopNavigation />
 *       )}
 *     </div>
 *   );
 * }
 */
export function useIsMobile() {
  // State to track mobile status, initially undefined for SSR compatibility
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  /**
   * Effect to set up viewport monitoring
   * 
   * Creates a MediaQueryList to efficiently listen for viewport changes
   * and updates the mobile state accordingly. Uses matchMedia for
   * performance benefits over window resize listeners.
   */
  React.useEffect(() => {
    // Create media query list for mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Callback function to update mobile state when viewport changes
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add listener for media query changes (efficient viewport monitoring)
    mql.addEventListener("change", onChange)
    
    // Set initial mobile state based on current viewport
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Cleanup: remove listener when component unmounts
    return () => mql.removeEventListener("change", onChange)
  }, []) // Empty dependency array - this effect runs once on mount

  // Convert to boolean (handle undefined state during SSR)
  return !!isMobile
}
