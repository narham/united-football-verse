/**
 * Dark Mode Testing & Verification Utilities
 * Helps identify dark mode issues and ensure consistent styling
 */

/**
 * Dark mode color contrast checker
 * Verifies WCAG AA compliance (4.5:1 for text, 3:1 for graphics)
 */

interface ColorValue {
  r: number;
  g: number;
  b: number;
}

interface ContrastResult {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  level: "fail" | "AA" | "AAA";
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): ColorValue | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance per WCAG spec
 */
function getLuminance(rgb: ColorValue): number {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function checkContrast(
  foreground: string,
  background: string
): ContrastResult {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) {
    return {
      ratio: 0,
      wcagAA: false,
      wcagAAA: false,
      level: "fail",
    };
  }

  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: parseFloat(ratio.toFixed(2)),
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
    level: ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "fail",
  };
}

/**
 * Dark mode color palette verification
 * Checks if semantic tokens work in both light and dark modes
 */
export const darkModeColorTests = {
  // Semantic field color (primary accent)
  field: {
    light: { fg: "#ffffff", bg: "#22c55e" }, // light text on field background
    dark: { fg: "#ffffff", bg: "#22c55e" }, // same field color in dark mode
    notes: "Primary accent - should be bright enough in both modes",
  },

  // Energetic color (attention/secondary accent)
  energetic: {
    light: { fg: "#ffffff", bg: "#84cc16" },
    dark: { fg: "#1a1a1a", bg: "#a3e635" },
    notes: "Secondary accent - may need adjustment for dark mode readability",
  },

  // Win/Success color
  win: {
    light: { fg: "#ffffff", bg: "#22c55e" },
    dark: { fg: "#ffffff", bg: "#22c55e" },
    notes: "Success indication - green",
  },

  // Loss/Danger color
  loss: {
    light: { fg: "#ffffff", bg: "#ef4444" },
    dark: { fg: "#ffffff", bg: "#ef4444" },
    notes: "Error/danger indication - red",
  },

  // Draw/Warning color
  draw: {
    light: { fg: "#ffffff", bg: "#f59e0b" },
    dark: { fg: "#ffffff", bg: "#f59e0b" },
    notes: "Warning indication - amber",
  },

  // Text on background
  foreground: {
    light: { fg: "#111827", bg: "#ffffff" },
    dark: { fg: "#f5f5f5", bg: "#0a0a0a" },
    notes: "Main text color",
  },

  // Muted foreground text
  mutedForeground: {
    light: { fg: "#6b7280", bg: "#ffffff" },
    dark: { fg: "#a3a3a3", bg: "#0a0a0a" },
    notes: "Secondary text color",
  },

  // Card background
  card: {
    light: { fg: "#111827", bg: "#ffffff" },
    dark: { fg: "#f5f5f5", bg: "#1a1a1a" },
    notes: "Card/container background",
  },

  // Border color
  border: {
    light: { fg: "#111827", bg: "#e5e7eb" },
    dark: { fg: "#f5f5f5", bg: "#2d2d2d" },
    notes: "Border/divider lines",
  },
};

/**
 * Dark mode testing checklist
 */
export const darkModeChecklist = [
  {
    category: "Navigation",
    items: [
      "Sidebar is readable in dark mode",
      "Active link indicator is visible",
      "Icons are visible (not same color as background)",
      "Badges show proper contrast",
      "Breadcrumbs are readable",
    ],
  },
  {
    category: "Content Areas",
    items: [
      "Page headings are readable",
      "Body text has sufficient contrast",
      "Links are distinguishable",
      "Cards have visible borders",
      "Form inputs are accessible",
    ],
  },
  {
    category: "Data Visualization",
    items: [
      "Table text is readable",
      "Row hover states are visible",
      "Status badges show proper colors",
      "Charts/graphs are visible",
      "Icons maintain visibility",
    ],
  },
  {
    category: "Interactive Elements",
    items: [
      "Buttons have proper contrast",
      "Focus rings are visible",
      "Hover states are apparent",
      "Disabled states are distinguishable",
      "Tooltips are readable",
    ],
  },
  {
    category: "Alerts & Notifications",
    items: [
      "Error states are clear (not just red)",
      "Success messages are visible",
      "Warning banners are readable",
      "Info alerts show proper styling",
      "Dismiss buttons are accessible",
    ],
  },
  {
    category: "Responsive Behavior",
    items: [
      "Mobile layout works in dark mode",
      "Drawer/modal is readable",
      "Dropdown menus are visible",
      "Sheet components have good contrast",
      "Modals have visible backdrop",
    ],
  },
];

/**
 * Common dark mode issues to watch for
 */
export const darkModeCommonIssues = [
  {
    issue: "Hardcoded colors in Tailwind classes",
    example: "bg-blue-500 instead of bg-field",
    fix: "Replace with semantic token classes from tailwind config",
    severity: "high",
  },
  {
    issue: "Light-only emoji or icons",
    example: "Dark emoji that doesn't work on dark backgrounds",
    fix: "Use icon fonts or SVGs that adapt to current text color",
    severity: "medium",
  },
  {
    issue: "Insufficient text contrast in dark mode",
    example: "Gray text on dark gray background",
    fix: "Use darker text colors in dark mode (lighter shades)",
    severity: "high",
  },
  {
    issue: "Border colors not visible",
    example: "Light borders invisible on light dark mode backgrounds",
    fix: "Use border-border class which adapts to theme",
    severity: "medium",
  },
  {
    issue: "Images or screenshots with light backgrounds",
    example: "Screenshots looking wrong against dark background",
    fix: "Use CSS invert() filter or provide dark variants",
    severity: "low",
  },
  {
    issue: "Transparency values making elements invisible",
    example: "opacity-50 making elements too faint",
    fix: "Increase opacity or use color-specific opacity",
    severity: "medium",
  },
];

/**
 * Dark mode test routes
 * Routes that should be tested in dark mode
 */
export const darkModeTestRoutes = [
  "/", // Dashboard
  "/pemain", // Player roster (tables)
  "/pemain/FID-2026-GRD-0001", // Player detail
  "/latihan", // Training (cards)
  "/kompetisi", // Competitions (cards)
  "/keuangan", // Finance (status indicators)
  "/pengaturan", // Settings (forms)
  "/notifikasi", // Notifications (alerts)
  "/aktivitas", // Activity (feed)
];

/**
 * Dark mode verification script (for browser console)
 * Helps identify elements that might have dark mode issues
 */
export const darkModeDebugScript = `
// Dark Mode Debug Script
// Run in browser console to identify potential dark mode issues

console.log("🌙 Dark Mode Debug Report");
console.log("========================");

// Check for hardcoded colors
const hardcodedColors = document.querySelectorAll('[style*="color:"], [style*="background:"]');
console.log(\`Found \${hardcodedColors.length} elements with inline color styles\`);
hardcodedColors.forEach((el, i) => {
  if (i < 5) console.log("  -", el.outerHTML.substring(0, 100));
});

// Check text contrast
const bodyText = document.querySelectorAll('p, span, a, button');
let lowContrastCount = 0;
bodyText.forEach((el) => {
  const color = window.getComputedStyle(el).color;
  const bg = window.getComputedStyle(el).backgroundColor;
  // Simple check - not perfect but helps identify issues
  if (color === bg) lowContrastCount++;
});
console.log(\`Elements with potential contrast issues: \${lowContrastCount}\`);

// Check for invisible borders
const borderedElements = document.querySelectorAll('[style*="border"], .border');
console.log(\`Elements with borders: \${borderedElements.length}\`);

console.log("💡 Tip: Check for:");
console.log("  - Text readability");
console.log("  - Icon visibility");
console.log("  - Border visibility");
console.log("  - Form input clarity");
`;
