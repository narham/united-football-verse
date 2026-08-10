# Mobile Responsive Testing Guide

## Overview

This guide helps verify that bolaID Football OS works correctly at all breakpoints and on mobile devices.

---

## Breakpoint Definitions

| Breakpoint | Size | Device | Usage |
|---|---|---|---|
| **xs** | 320px | iPhone SE | Smallest phones |
| **sm** | 375px-430px | iPhone 12-14+ | Standard phones |
| **md** | 768px | iPad | Tablets (portrait) |
| **lg** | 1024px | iPad Pro | Tablets (landscape) |
| **xl** | 1280px | Laptop | Desktop |
| **2xl** | 1536px | Wide desktop | Ultra-wide monitors |

---

## Testing Methodology

### 1. Browser DevTools Testing

```javascript
// Chrome DevTools - Set specific viewport widths
// Device list includes: iPhone SE, iPhone 12, iPhone 14 Pro, iPad, iPad Pro, etc.

// Or set custom width:
// DevTools → Toggle device toolbar (Ctrl+Shift+M)
// → Dimensions dropdown → Edit → Set width to: 375, 430, 768, 1024, 1280
```

### 2. Physical Device Testing

**Phones to Test:**
- iPhone SE (375×667px)
- iPhone 12/13 (390×844px)
- iPhone 14 Pro Max (430×932px)
- Samsung Galaxy S20 (360×800px)
- Tablet (iPad Air: 768×1024px)

---

## Route-by-Route Testing Checklist

### 1. Dashboard (`/`)

**Mobile (375px):**
- [ ] Welcome banner text is readable (not truncated)
- [ ] Quick action buttons stack vertically
- [ ] Stat cards display as single column
- [ ] Activity and performance sections are scrollable
- [ ] Finance section is not cut off
- [ ] Sidebar collapses to icon-only mode

**Tablet (768px):**
- [ ] Layout switches to 2-column grid
- [ ] Stat cards show 2 columns
- [ ] Sidebar shows labels again
- [ ] All text is readable without horizontal scroll

**Desktop (1280px+):**
- [ ] Full layout displays correctly
- [ ] All sections visible at once
- [ ] No horizontal scrolling

---

### 2. Player Roster (`/pemain`)

**Mobile (375px):**
- [ ] Search bar is full-width
- [ ] Position/status filters stack vertically
- [ ] Player cards display one per row
- [ ] Player number badge is visible
- [ ] Name and status are readable
- [ ] No horizontal scroll

**Tablet (768px):**
- [ ] Filters display horizontally
- [ ] Player cards show 2 columns
- [ ] Tap targets are 44px minimum

**Desktop (1280px+):**
- [ ] Table view shows (not cards)
- [ ] All columns visible
- [ ] Proper hover states

---

### 3. Player Detail (`/pemain/$id`)

**Mobile (375px):**
- [ ] Back button is easy to tap (44px+)
- [ ] Player header text is readable
- [ ] Profile card stacks properly
- [ ] Statistics cards show one per column
- [ ] Tables show cards instead of table format
- [ ] Stats table scrolls horizontally if needed

**Tablet (768px):**
- [ ] Profile information visible
- [ ] 2-column layout for statistics
- [ ] Tab navigation works

**Desktop:**
- [ ] Multi-column layout works
- [ ] All stats visible at once

---

### 4. Training Schedule (`/latihan`)

**Mobile (375px):**
- [ ] Welcome banner text is visible
- [ ] Attendance cards show properly
- [ ] Focus theme section displays well
- [ ] Weekly schedule renders single-column
- [ ] Training session cards are readable

**Tablet:**
- [ ] Training sessions show 2 columns
- [ ] Attendance info is clear

**Desktop:**
- [ ] Full layout displays
- [ ] Training schedule in grid format

---

### 5. Finance (`/keuangan`)

**Mobile (375px):**
- [ ] Health banner text is readable
- [ ] Financial status is prominent
- [ ] KPI cards stack vertically
- [ ] Transaction list shows cards
- [ ] Transaction amounts are visible
- [ ] Filter tags work properly

**Tablet:**
- [ ] KPI cards show 2-3 columns
- [ ] Transaction list is readable

**Desktop:**
- [ ] Full dashboard layout works
- [ ] Transaction table is visible

---

### 6. Competitions (`/kompetisi`)

**Mobile (375px):**
- [ ] Competition cards are single column
- [ ] Match information is readable
- [ ] Status badges show properly
- [ ] No horizontal scroll

**Tablet:**
- [ ] Competition cards show 2 columns
- [ ] All information visible

**Desktop:**
- [ ] Full layout displays
- [ ] Proper spacing maintained

---

### 7. Settings (`/pengaturan`)

**Mobile (375px):**
- [ ] Form labels are clear
- [ ] Input fields are full-width
- [ ] Buttons are full-width or stacked
- [ ] Form is scrollable

**Tablet:**
- [ ] Form shows in 2-column layout
- [ ] Inputs have proper width

**Desktop:**
- [ ] Form displays with good spacing
- [ ] Sidebar visible

---

## Key Mobile Interactions to Test

### Touch Targets
- [ ] All buttons are at least 44×44px
- [ ] Links are easily tappable
- [ ] No tiny touch targets
- [ ] Proper spacing between interactive elements

### Sidebar Navigation
- [ ] Sidebar collapses on mobile
- [ ] Hamburger menu works
- [ ] Navigation links are tap-friendly
- [ ] Mobile drawer opens/closes smoothly

### Responsive Tables
- [ ] Tables convert to cards on mobile
- [ ] Table data is not cut off
- [ ] Horizontal scroll works if needed
- [ ] All information is accessible

### Forms
- [ ] Input fields expand to full width on mobile
- [ ] Labels are visible above inputs
- [ ] Error messages don't cause layout shift
- [ ] Focus states are visible

### Modals & Dialogs
- [ ] Modals fit within viewport
- [ ] Close button is easily tappable
- [ ] Content is scrollable if tall
- [ ] Backdrop is visible

### Dropdowns & Menus
- [ ] Dropdown lists fit in viewport
- [ ] Options are tap-friendly
- [ ] Scroll works if list is long
- [ ] Keyboard navigation works

---

## Orientation Testing

### Portrait Mode (375×667px)
- [ ] Layout stacks vertically
- [ ] Text is readable
- [ ] All content is accessible
- [ ] No horizontal scroll

### Landscape Mode (667×375px)
- [ ] Layout doesn't break
- [ ] Text remains readable
- [ ] Sidebar may need to collapse further
- [ ] Navigation is still accessible

---

## Performance Testing

### Mobile Performance
```bash
# Test with slow 3G simulation
# Chrome DevTools → Network tab → Throttle to "Slow 3G"

# Expected metrics:
# - First Contentful Paint (FCP): < 3s
# - Largest Contentful Paint (LCP): < 4.5s
# - Cumulative Layout Shift (CLS): < 0.1
```

---

## Accessibility Testing on Mobile

### Touch & Keyboard Navigation
- [ ] Can navigate entire app with touch
- [ ] Tab key works on mobile browsers
- [ ] Focus indicator is visible
- [ ] Escape key closes modals

### Screen Reader Testing
- [ ] VoiceOver (iOS) works
- [ ] TalkBack (Android) works
- [ ] All text is announced
- [ ] Form labels are associated

### Text Sizing
- [ ] Text is readable at 14px minimum
- [ ] Line height is adequate (1.5 minimum)
- [ ] Long words don't break layout
- [ ] Text zoom works (200% minimum)

---

## Common Mobile Issues to Watch For

### Layout Issues
- ❌ Horizontal scroll on mobile
- ❌ Overlapping text or elements
- ❌ Content cut off on edges
- ❌ Fixed width elements breaking layout

### Touch Issues
- ❌ Touch targets < 44px
- ❌ Hover states blocking interaction
- ❌ Double-tap zoom interfering
- ❌ Scrolling performance issues

### Viewport Issues
- ❌ Missing viewport meta tag
- ❌ No-scale viewport preventing zoom
- ❌ Incorrect initial-scale
- ❌ Width mismatch on orientation change

### Text Issues
- ❌ Text too small to read
- ❌ Insufficient contrast
- ❌ Text cut off by safe areas
- ❌ Line height too tight

---

## Testing Commands

### Chrome DevTools
```javascript
// Test specific viewport
// Menu → More tools → Sensors → Emulate CSS media feature prefers-color-scheme
// Also test dark mode: Menu → Rendering → Emulate CSS media feature prefers-color-scheme

// Test touch events
// Menu → More tools → Sensors → Enable "Emulate touch events"

// Test slow network
// Network tab → Throttle dropdown → Slow 3G
```

### Firefox DevTools
```javascript
// Responsive Design Mode: Ctrl+Shift+M
// Device preset or custom size
// Test orientation changes
```

---

## Automated Testing Points

### Playwright/Cypress Testing
```javascript
// Example mobile breakpoint tests
test("mobile layout (375px)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  // Assertions here
});

test("sidebar collapses on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  const sidebar = page.locator('[data-testid="sidebar"]');
  await expect(sidebar).toHaveClass("collapsed");
});
```

---

## Verification Checklist

- [ ] All 15 routes tested at 375px
- [ ] All 15 routes tested at 768px
- [ ] All 15 routes tested at 1280px
- [ ] No horizontal scrolling at any breakpoint
- [ ] Touch targets >= 44px
- [ ] Text readable without zoom
- [ ] Navigation accessible on all sizes
- [ ] Dark mode works on mobile
- [ ] Sidebar responsive behavior correct
- [ ] Modals/drawers fit viewport
- [ ] Forms are usable
- [ ] Performance acceptable (< 4.5s LCP)
- [ ] Accessibility maintained (WCAG A minimum)
- [ ] Orientation changes handled
- [ ] Safe area respected on notched devices

---

## Success Criteria

✅ **Mobile (375px):**
- All content visible without horizontal scroll
- Touch targets >= 44px
- Text readable without zoom
- Navigation easily accessible

✅ **Tablet (768px):**
- Layout optimized for tablet
- Grid layouts show 2 columns where appropriate
- Touch-friendly spacing maintained

✅ **Desktop (1280px+):**
- Full layouts displayed
- Proper use of screen real estate
- Sidebar shows full navigation

✅ **Cross-Device:**
- Orientation changes work smoothly
- Dark mode works at all breakpoints
- Accessibility maintained everywhere
- Performance is acceptable

---

## Notes for Developers

### Useful Tailwind Breakpoint Classes
```html
<!-- Hide on mobile, show on desktop -->
<div class="hidden sm:block">Desktop only</div>

<!-- Show on mobile, hide on desktop -->
<div class="sm:hidden">Mobile only</div>

<!-- Responsive font sizing -->
<h1 class="text-2xl sm:text-3xl md:text-4xl">Title</h1>

<!-- Responsive spacing -->
<div class="p-2 sm:p-4 md:p-6">Content</div>

<!-- Responsive grid columns -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
  <!-- Cards -->
</div>
```

### Safe Area Considerations
```css
/* For notched devices (iPhone X+) */
.content {
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
  padding-top: max(1rem, env(safe-area-inset-top));
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

---

## Resources

- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [WCAG 2.1: Responsive Design](https://www.w3.org/WAI/test-evaluate/overview/)
- [Tailwind CSS: Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Apple: iPhone Notch Safe Area](https://developer.apple.com/news/?id=12egk2r1)

