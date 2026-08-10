import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Mobile-optimized page layout wrapper
 * Ensures proper spacing and responsive behavior on all breakpoints
 */

interface ResponsivePageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function ResponsivePageLayout({
  title,
  subtitle,
  children,
  actions,
  className,
}: ResponsivePageLayoutProps) {
  return (
    <div className={cn(
      "flex flex-col min-h-screen bg-background",
      className
    )}>
      {/* Header Section - Responsive */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-3 sm:px-4 md:px-6 py-4 md:py-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Responsive padding */}
      <main className="flex-1 px-3 sm:px-4 md:px-6 py-4 md:py-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

/**
 * Mobile card grid layout
 * Switches from horizontal scroll to vertical stacking on mobile
 */

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: "1" | "2" | "3" | "4";
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = "3",
  gap = "md",
  className,
}: ResponsiveGridProps) {
  const colClass = {
    "1": "grid-cols-1",
    "2": "sm:grid-cols-2 lg:grid-cols-2",
    "3": "sm:grid-cols-2 lg:grid-cols-3",
    "4": "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  const gapClass = {
    "sm": "gap-2",
    "md": "gap-3 sm:gap-4",
    "lg": "gap-4 sm:gap-6",
  }[gap];

  return (
    <div className={cn(
      "grid grid-cols-1",
      colClass,
      gapClass,
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Touch-friendly button spacing for mobile
 * Ensures 44x44px minimum touch target on mobile
 */
export const touchTargetClass = 
  "h-10 min-w-10 sm:h-9 sm:min-w-9";

export const touchPaddingClass = 
  "px-4 py-3 sm:px-3 sm:py-2";

/**
 * Mobile-first spacing scale
 * Use these for consistent mobile-optimized spacing
 */
export const mobileSpacingScale = {
  xs: "p-2 sm:p-3",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5 md:p-6",
  lg: "p-5 sm:p-6 md:p-8",
  xl: "p-6 sm:p-8 md:p-10",
} as const;

/**
 * Mobile-friendly typography scale
 * Responsive font sizes for better readability
 */
export const mobileTypography = {
  h1: "text-2xl sm:text-3xl md:text-4xl font-bold",
  h2: "text-xl sm:text-2xl md:text-3xl font-bold",
  h3: "text-lg sm:text-xl md:text-2xl font-semibold",
  body: "text-sm sm:text-base leading-relaxed",
  caption: "text-xs sm:text-sm text-muted-foreground",
} as const;

/**
 * Safe area padding for notched devices
 * Use on top-level layout wrapper
 */
export const safeAreaClass = 
  "supports-[padding-safe-inline]:px-[max(1rem,env(safe-area-inset-right))] " +
  "supports-[padding-safe-inline]:px-[max(1rem,env(safe-area-inset-left))]";

/**
 * Hide on mobile/show on desktop utility
 */
export function hideOnMobile(className?: string) {
  return cn("hidden sm:block", className);
}

export function showOnMobile(className?: string) {
  return cn("sm:hidden", className);
}

/**
 * Responsive container for data tables
 * Shows horizontal scroll on mobile, full table on desktop
 */
interface ResponsiveTableContainerProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTableContainer({
  children,
  className,
}: ResponsiveTableContainerProps) {
  return (
    <div className={cn(
      "w-full overflow-x-auto rounded-lg border border-border",
      className
    )}>
      <div className="min-w-full">
        {children}
      </div>
    </div>
  );
}
