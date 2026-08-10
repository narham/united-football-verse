/**
 * Keyboard Navigation & Focus State Styles
 * Comprehensive accessibility enhancements for better keyboard navigation
 */

/**
 * Standard focus ring classes for all interactive elements
 * Usage: Add to className of any interactive element (buttons, links, inputs, etc.)
 */
export const focusRing = 
  "focus:outline-none focus:ring-2 focus:ring-field focus:ring-offset-2 focus:ring-offset-background transition-shadow";

/**
 * Focus ring for dark backgrounds (adjusts offset color)
 */
export const focusRingDark = 
  "focus:outline-none focus:ring-2 focus:ring-field focus:ring-offset-1 transition-shadow";

/**
 * Focus ring for compact elements (smaller offset)
 */
export const focusRingCompact = 
  "focus:outline-none focus:ring-2 focus:ring-field focus:ring-offset-0 transition-shadow";

/**
 * Visible focus indicator for low vision users
 * Usage: Add `visible-focus` class via data-attr or conditional className
 */
export const visibleFocusStyles = `
  .visible-focus:focus {
    outline: 3px solid var(--color-field);
    outline-offset: 2px;
  }
`;

/**
 * Skip links utility — helps keyboard users jump to main content
 * Place at top of layout, hide with sr-only, show on focus
 */
export function getSkipLinkStyles(): string {
  return `
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #111;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 100;
    }
    
    .skip-link:focus {
      top: 0;
    }
  `;
}

/**
 * Keyboard navigation hints for users
 * Show when user first uses keyboard (detected via Tab key)
 */
export interface KeyboardHint {
  key: string;
  description: string;
  scope?: "global" | "page" | "element";
}

export const globalKeyboardHints: KeyboardHint[] = [
  { key: "Tab", description: "Navigasi antar elemen", scope: "global" },
  { key: "Shift + Tab", description: "Navigasi mundur", scope: "global" },
  { key: "Enter", description: "Aktifkan tombol atau link", scope: "global" },
  { key: "Escape", description: "Tutup dialog atau menu", scope: "global" },
  { key: "Space", description: "Aktifkan checkbox atau radio button", scope: "global" },
];

export const pageKeyboardHints: Record<string, KeyboardHint[]> = {
  "pemain": [
    { key: "Ctrl + F", description: "Cari pemain", scope: "page" },
    { key: "Enter", description: "Buka profil pemain", scope: "page" },
  ],
  "latihan": [
    { key: "Left/Right", description: "Navigasi antar minggu", scope: "page" },
  ],
  "keuangan": [
    { key: "Ctrl + F", description: "Cari transaksi", scope: "page" },
  ],
};

/**
 * ARIA announcer helper for dynamic updates
 * Use with aria-live regions to announce changes to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  // Create a temporary aria-live region
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.setAttribute("class", "sr-only");
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement is read (typically 1-2 seconds)
  setTimeout(() => announcement.remove(), 3000);
}

/**
 * Focus visible indicator
 * Modern way to show focus states (replaces :focus with :focus-visible)
 */
export const focusVisible = 
  "focus-visible:outline-2 focus-visible:outline-field focus-visible:outline-offset-2";

/**
 * Enhanced button focus styles
 */
export const buttonFocusStyles = 
  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-field focus:ring-offset-background transition-all";

/**
 * Form input focus styles
 */
export const inputFocusStyles = 
  "focus:outline-none focus:ring-2 focus:ring-field focus:ring-offset-1 transition-shadow";

/**
 * Keyboard-specific hover state (only show on keyboard navigation, not mouse)
 * Usage: Apply :focus-visible instead of :hover for keyboard-only styles
 */
export const keyboardOnlyHover = 
  "@media (prefers-reduced-motion: no-preference) { \n" +
  "  .keyboard-only-hover:focus-visible { opacity: 0.8; transform: scale(1.02); } \n" +
  "}";
