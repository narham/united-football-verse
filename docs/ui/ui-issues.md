# UI Issues Report

**Generated:** 2026-08-09  
**Priority:** P0 (Blocking) | P1 (Major UX) | P2 (Polish) | P3 (Nice-to-have)

---

## P0 Issues (Blocking)
**Total:** 0  
✅ No blocking issues found.

---

## P1 Issues (Major UX Concerns)
**Total:** 3

### 1. Competition Cards Lack Clickability Affordance
**Severity:** P1  
**Route:** `/kompetisi`  
**Component:** Competition card grid  
**Description:**  
Competition cards are clickable (link to `/kompetisi/$id`) but provide no visual indication that they are interactive. Users may not discover the detail view.

**Current State:**
```tsx
<Link to="/kompetisi/$id" ... className="block ...">
  <article className="rounded-xl border border-border bg-card p-4 ...">
    {/* content */}
  </article>
</Link>
```

**Problem:**
- No arrow or visual cue
- No hover effect distinguishing from non-interactive cards
- No cursor: pointer signal

**Recommended Fix:**
- Add ChevronRight icon on hover
- Add subtle background color change on hover
- Ensure cursor: pointer style

**Effort:** Low (10 min)  
**Impact:** Medium (usability)

---

### 2. Settings Privacy & Demo Mode Section Redundant with System Info
**Severity:** P1  
**Route:** `/pengaturan`  
**Component:** "Privacy & Demo Mode" section + "System" section  
**Description:**  
Two sections explain demo mode and backend status with overlapping language, causing confusion about what is demo vs. real functionality.

**Current State:**
- Privacy & Demo Mode section: "Status fitur dan batasan data"
- System Info section: Explicit demo labels and backend status

**Problem:**
- Redundant messaging
- User confusion about scope
- Visual clutter

**Recommended Fix:**
- Merge demo mode explanation into system info
- Remove "Privacy & Demo Mode" section or make it data privacy-only (when backend is ready)
- Centralize all "demo mode" disclaimers in system info

**Effort:** Low (5 min)  
**Impact:** Medium (clarity)

---

### 3. Non-Functional Action Buttons Appear Active
**Severity:** P1  
**Routes:** `/pemain` (Tambah Pemain), `/latihan` (Tambah Sesi)  
**Component:** Button elements  
**Description:**  
Buttons labeled "Tambah Pemain" and "Tambah Sesi" are visually active but have no onClick handler, creating expectation mismatch.

**Current State:**
```tsx
<Button className="gap-1.5 bg-field text-field-foreground hover:opacity-90">
  <UserPlus className="h-4 w-4" /> Tambah Pemain
</Button>
```

**Problem:**
- Button appears clickable and is clickable, but does nothing
- No user feedback on action failure
- Suggests broken functionality

**Recommended Fix:**
- Disable buttons: `<Button disabled ...>`
- Add tooltip: "Fitur ini memerlukan koneksi backend"
- Change cursor to not-allowed on disabled state (built-in)

**Effort:** Low (5 min)  
**Impact:** Medium (clarity)

---

## P2 Issues (Minor/Polish)
**Total:** 5

### 1. Card Padding Inconsistency
**Severity:** P2  
**Routes:** Multiple (Finance, Dashboard, Stats)  
**Description:**  
Some card components use `p-3.5` while others use `p-4`, creating visual inconsistency.

**Locations:**
- FinanceSummary cards: `p-4`
- Dashboard KPI cards: `p-4`
- Some custom card blocks: `p-3.5`

**Recommended Fix:**  
Standardize all cards to `p-4` (4 units = 16px).

**Effort:** Low (5 min)  
**Impact:** Low (polish)

---

### 2. Dashboard Stat Card Borders Vary by Type
**Severity:** P2  
**Route:** `/`  
**Component:** StatCard KPI grid  
**Description:**  
Stat cards have different border colors (field/30, energetic/30, win/30, loss/30), creating visual noise. Consider more subtle borders.

**Recommended Fix:**
- Option A: Use uniform `border-border` for all stat cards
- Option B: Use very subtle tints (border-field/10 instead of /30)
- Option C: Remove borders entirely and rely on background color

**Effort:** Low (5 min)  
**Impact:** Low (visual polish)

---

### 3. Small Icon Contrast in Dark Mode
**Severity:** P2  
**Routes:** Multiple  
**Description:**  
Very small icons (h-3 w-3) in some badges have marginal color contrast in dark mode.

**Example:** Status indicator dots in player cards  

**Recommended Fix:**
- Increase icon size from h-3 w-3 to h-4 w-4 where used for semantic meaning
- Add slight text-shadow or use a slightly brighter color in dark mode

**Effort:** Low (10 min)  
**Impact:** Low (accessibility edge case)

---

### 4. Mobile Dashboard Layout Could Improve Space
**Severity:** P2  
**Route:** `/` (mobile view)  
**Description:**  
On small screens (375px), dashboard sections stack vertically with long scroll. Could collapse less critical sections (bottom finance summary, competition list).

**Current:** 6 sections stacked  
**Opportunity:** Collapsible sections or tabbed interface

**Recommended Fix:**  
Not urgent; acceptable for demo. Enhancement for refinement phase.

**Status:** Defer to optional refinement

---

### 5. Command Palette Mobile Trigger Unclear
**Severity:** P2  
**Route:** Global (header)  
**Component:** CommandPalette  
**Description:**  
Command palette displays "Ctrl+K" shortcut hint, not applicable on mobile devices.

**Recommended Fix:**
- Show "Tap to search" label on mobile
- Hide "Ctrl+K" on mobile view

**Effort:** Low (5 min)  
**Impact:** Low (UX clarity)

---

## P3 Issues (Nice-to-have)
**Total:** 3

### 1. Sidebar Section Dividers
Could add visual dividers between sidebar groups (Overview, Organization, Operations, Communication, System) for better scannability.

### 2. Loading Skeleton Animations
For future backend integration, add optional loading skeleton states using `DefaultLoadingState`.

### 3. Form Validation Examples
Settings page could show inline validation examples for future backend integration.

---

## Summary Table

| Issue | Priority | Route(s) | Component | Effort | Impact | Status |
|---|---|---|---|---|---|---|
| Competition card clickability | P1 | `/kompetisi` | Card | Low | Medium | **RECOMMENDED FIX** |
| Settings redundancy | P1 | `/pengaturan` | Section | Low | Medium | **RECOMMENDED FIX** |
| Non-functional buttons | P1 | `/pemain`, `/latihan` | Button | Low | Medium | **RECOMMENDED FIX** |
| Card padding inconsistency | P2 | Multiple | Card | Low | Low | Optional |
| Dashboard card borders | P2 | `/` | Stat Card | Low | Low | Optional |
| Icon contrast dark mode | P2 | Multiple | Badge | Low | Low | Optional |
| Mobile dashboard space | P2 | `/` | Layout | Medium | Low | Defer |
| Command palette mobile | P2 | Global | Header | Low | Low | Optional |
| Sidebar dividers | P3 | Global | Sidebar | Low | Low | Nice-to-have |
| Skeleton animations | P3 | Multiple | Component | Medium | Low | Future |
| Form validation examples | P3 | `/pengaturan` | Form | Medium | Low | Future |

---

## Recommended Fix Priority

1. ✅ **P1.1:** Add clickability affordance to competition cards
2. ✅ **P1.2:** Tighten settings privacy section
3. ✅ **P1.3:** Disable non-functional buttons with tooltips
4. ⭐ **P2.1:** Normalize card padding (quick win)
5. ⭐ **P2.2:** Fix dashboard card borders (quick win)
6. ⭐ **P2.3:** Improve icon contrast (accessibility)
