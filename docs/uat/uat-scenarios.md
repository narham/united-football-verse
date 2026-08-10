# Phase 5 UAT: Detailed Test Scenarios

**Document:** uat-scenarios.md  
**Purpose:** Step-by-step execution guide for all 30 test scenarios  
**Format:** Each test includes: Objective, Steps, Expected Results, Verification Checklist  

---

## TEST 01: CLUB CONTEXT SWITCHING

**Objective:** Verify club context is properly maintained and switching shows/hides club-specific data.

### Setup
1. Open application: `http://localhost:5173/`
2. Verify you're on Dashboard (`/`)
3. Current club should be: **SSB Garuda Muda**

### Steps

#### Part A: Verify Current Club Context
1. Look for club name display (header or sidebar)
2. Verify visible: Current club name
3. Verify visible: Current season
4. Verify visible: Player count
5. Verify visible: Team count
6. Verify visible: Training count
7. Verify visible: Upcoming matches
8. Verify visible: Finance balance

**Expected:** All context elements display for current club

#### Part B: Switch Club (if supported)
1. Look for club selector in UI
2. If not visible, note: "Feature not implemented in demo"
3. If visible:
   - Click club selector
   - Choose different club
   - Verify dashboard updates

**Expected:**
- Dashboard changes
- Player list changes to club's roster
- Team list changes to club's teams
- Training changes to club's schedule
- Finance changes to club's balance

#### Part C: Switch Back
1. Select original club
2. Verify original data restored

**Expected:** Exact same state as Part A

### Verification Checklist
- [ ] Club name visible on dashboard
- [ ] Season name visible on dashboard
- [ ] Player count matches roster
- [ ] Team count matches team list
- [ ] Finance balance matches transaction total
- [ ] No cross-club data leakage
- [ ] All context elements synchronized

### Result
- **PASS / FAIL**
- **Issues Found:** (if any)
- **Notes:**

---

## TEST 02: SEASON CONTEXT & ACTIVATION

**Objective:** Verify season creation, activation, and context switching works without data leakage.

### Prerequisites
- Logged in as Agus Setiawan
- On dashboard

### Steps

#### Part A: Navigate to Season Management
1. Navigate to: `/musim` (or Season route if exists)
2. Look for season list
3. Verify current season marked as ACTIVE

**Expected:** Current season (2026) shows as active

#### Part B: Create New Season
1. Click: "Create Season" / "Add Season"
2. Create season:
   - Name: **2027**
   - Year: **2027**
   - Status: Leave as default (INACTIVE)
3. Submit

**Expected:**
- Dialog shows loading state
- Success feedback
- New season appears in list as INACTIVE

#### Part C: Activate New Season
1. In season list, find 2027
2. Click: "Set Active" / "Activate"
3. Confirm action

**Expected:**
- 2027 becomes ACTIVE
- 2026 becomes INACTIVE/ARCHIVED
- Dashboard context changes to 2027
- Team context changes to 2027
- Competition list updates to 2027 competitions

#### Part D: Verify Data Isolation
1. On dashboard, verify:
   - Season selector shows 2027
   - Training list changes (empty or 2027 training only)
   - Matches list changes
2. Switch back to 2026
3. Verify original training/matches return

**Expected:** No cross-season data leakage

### Verification Checklist
- [ ] Season creation works
- [ ] New season appears in list
- [ ] Season activation works
- [ ] Only ONE active season
- [ ] Previous active season becomes inactive
- [ ] Dashboard updates to new season context
- [ ] No data from other seasons visible
- [ ] Browser refresh maintains active season

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 03: CREATE PLAYER

**Objective:** Verify player creation workflow with Football ID generation and roster consistency.

### Prerequisites
- On dashboard
- Ready to create test player

### Steps

#### Part A: Open Player Creation Form
1. Navigate to: `/pemain`
2. Look for: "Tambah Pemain" / "Add Player" button
3. Click button

**Expected:** Dialog opens with form fields

#### Part B: Fill Player Form
1. Fill form:
   - **Name:** Bima Pratama
   - **DOB:** 2012-05-10
   - **Position:** FW
   - **Number:** 9
   - **Team:** U-15 Garuda Muda
   - **Status:** ACTIVE
2. Look for required fields (marked with *)
3. Verify all required fields have values

**Expected:** Form accepts all inputs

#### Part C: Submit Form
1. Click: "Create" / "Save" / "Submit"
2. Observe dialog behavior

**Expected:**
- Dialog enters loading state
- Button shows loading indicator
- Form becomes disabled

#### Part D: Verify Creation
1. Dialog closes
2. Toast/notification shows: "Player created successfully"
3. Look for Bima in player list

**Expected:**
- Bima appears in roster
- Roster count increased by 1
- Bima has generated Football ID visible

#### Part E: Verify Dashboard Update
1. Navigate back to dashboard (`/`)
2. Check player count stat card
3. Verify count increased by 1

**Expected:** Dashboard player count +1

### Verification Checklist
- [ ] Dialog opens on click
- [ ] Form has all expected fields
- [ ] Form validation works
- [ ] Submit button shows loading state
- [ ] Dialog closes after success
- [ ] Success notification shows
- [ ] Player appears in roster
- [ ] Roster count increased
- [ ] Dashboard player count increased
- [ ] Player has Football ID
- [ ] Activity log entry created
- [ ] Notification generated

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 04: FOOTBALL ID IMMUTABILITY

**Objective:** Verify Football ID is generated, visible, immutable, and copyable.

### Prerequisites
- Bima Pratama exists from TEST 03
- On player list

### Steps

#### Part A: Find Football ID
1. Find Bima in roster
2. Click on Bima to open detail page
3. Look for Football ID display

**Expected:** Football ID visible (format: FID-YYYY-CLUB-NNNN or similar)

#### Part B: Verify Football ID Format
1. Copy Football ID value
2. Verify format:
   - Unique
   - Consistent format
   - Readable

**Expected:** Football ID follows convention

#### Part C: Try to Edit Football ID
1. On detail page, look for edit button/form
2. Click edit
3. Try to modify Football ID field

**Expected:** 
- Football ID field is READ-ONLY
- Not editable
- Grayed out or disabled

#### Part D: Copy Football ID
1. Look for "Copy" button next to Football ID
2. If exists, click it

**Expected:**
- Football ID copied to clipboard
- Success feedback shown
- Toast confirms: "Copied to clipboard"

### Verification Checklist
- [ ] Football ID is visible
- [ ] Football ID is unique
- [ ] Football ID has consistent format
- [ ] Football ID is NOT editable
- [ ] Copy button exists (if applicable)
- [ ] Copy button works
- [ ] Success feedback appears

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 05: PLAYER SEARCH

**Objective:** Verify search finds players by name, Football ID, and handles empty results gracefully.

### Prerequisites
- Bima Pratama exists
- On player list

### Steps

#### Part A: Search by Name
1. Find search input field
2. Type: "Bima"
3. Observe results

**Expected:**
- Bima appears in results
- Results count = 1 (or includes Bima)
- Only Bima shown

#### Part B: Search by Football ID
1. Clear search
2. Copy Bima's Football ID
3. Paste into search
4. Type first few characters: "BID-" or "FID-"

**Expected:** Bima appears in results using Football ID

#### Part C: Search Invalid Value
1. Clear search
2. Type: "InvalidXYZ123"

**Expected:**
- No results
- Professional empty state displayed
- Helpful message like: "No players found"
- Option to clear search

#### Part D: Search Partial Name
1. Clear search
2. Type: "Bi"

**Expected:** Bima appears (partial match works)

#### Part E: Clear Search
1. Click: Clear button OR delete all text
2. Observe results

**Expected:** Full roster restored (all players visible)

### Verification Checklist
- [ ] Search finds player by name
- [ ] Search finds player by Football ID
- [ ] Search handles partial matches
- [ ] Invalid search shows empty state
- [ ] Empty state has helpful message
- [ ] Clear button restores full roster
- [ ] Search is case-insensitive (if applicable)
- [ ] Search response is instant/fast

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 06: PLAYER FILTER

**Objective:** Verify filters combine correctly for Position, Status, and Team.

### Prerequisites
- Multiple players exist (demo data + Bima)
- On player list

### Steps

#### Part A: Single Filter - Position
1. Find filter controls
2. Set: Position = FW
3. Observe results

**Expected:**
- Only FW players show
- All other positions hidden
- Roster count decreases

#### Part B: Add Filter - Status
1. Keep Position = FW
2. Add: Status = ACTIVE
3. Observe results

**Expected:**
- FW players + ACTIVE status
- Inactive FW players hidden
- Results combine correctly

#### Part C: Add Filter - Team
1. Keep Position = FW, Status = ACTIVE
2. Add: Team = U-15
3. Observe results

**Expected:**
- All 3 filters work together
- Results: FW + ACTIVE + U-15
- Other combinations hidden

#### Part D: Reset Filters
1. Click: "Reset" or "Clear Filters"
2. Observe results

**Expected:** Full roster restored (all players visible)

#### Part E: Test Mobile Filter Sheet
1. Resize browser to mobile width (375px)
2. Look for filter button
3. Click filter button
4. Filter sheet/modal appears

**Expected:**
- Filters in mobile-friendly format
- Same filtering results as desktop
- Filters apply correctly

### Verification Checklist
- [ ] Position filter works alone
- [ ] Status filter works alone
- [ ] Team filter works alone
- [ ] Filters combine correctly
- [ ] Reset clears all filters
- [ ] Filtered roster count accurate
- [ ] Mobile filter sheet exists
- [ ] Mobile filters produce same results
- [ ] No crashes when combining filters

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 07: PLAYER EDIT

**Objective:** Verify player data updates persist across all related screens without losing Football ID.

### Prerequisites
- Bima exists with Number 9
- On player list or detail

### Steps

#### Part A: Open Edit Dialog
1. Navigate to Bima's detail page (`/pemain/[id]`)
2. Click: "Edit" button
3. Edit form opens

**Expected:** Form populated with current values

#### Part B: Modify Player Data
1. Change: Number from 9 to 10
2. Do NOT change Football ID, Name, or Status
3. Leave other fields unchanged
4. Click: "Save" / "Update"

**Expected:**
- Dialog shows loading state
- Save succeeds
- Success toast appears
- Dialog closes

#### Part C: Verify Update on Detail Page
1. Still on detail page
2. Refresh page (Ctrl+F5)
3. Verify: Number = 10
4. Verify: Football ID unchanged
5. Verify: Name unchanged

**Expected:** Changes persist after refresh

#### Part D: Verify Update on Roster
1. Navigate back to roster (`/pemain`)
2. Find Bima
3. Verify: Number = 10
4. Verify: Name still Bima Pratama

**Expected:** Roster shows updated data

#### Part E: Verify Dashboard Activity
1. Navigate to Activity page (`/aktivitas`)
2. Look for entry: "Bima Pratama updated"
3. Activity should show: timestamp, actor, action, entity

**Expected:** Activity log includes edit action

### Verification Checklist
- [ ] Edit dialog opens with current data
- [ ] Form fields editable
- [ ] Save button shows loading
- [ ] Dialog closes after save
- [ ] Success notification shown
- [ ] Detail page reflects changes
- [ ] Changes persist after refresh
- [ ] Roster shows updated data
- [ ] Football ID unchanged
- [ ] Activity log includes edit
- [ ] No data corruption

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 08: PLAYER DEACTIVATION

**Objective:** Verify deactivating player removes from active filter and updates related screens.

### Prerequisites
- Bima Pratama exists as ACTIVE
- On player roster

### Steps

#### Part A: Deactivate Player
1. Find Bima in roster
2. Click: Options / Menu / "More actions"
3. Select: "Deactivate" / "Change Status to Inactive"
4. Confirm action

**Expected:**
- Confirmation dialog appears
- After confirm: success notification
- Bima disappears from current view (if filtered to ACTIVE)

#### Part B: Verify Status Changed
1. Navigate to Bima's detail page
2. Verify: Status = INACTIVE

**Expected:** Status field shows INACTIVE

#### Part C: Test Active Filter
1. Go to roster
2. Set Filter: Status = ACTIVE
3. Observe results

**Expected:** Bima NOT in results (he's INACTIVE now)

#### Part D: Test Inactive Filter
1. Set Filter: Status = INACTIVE
2. Observe results

**Expected:** Bima appears in INACTIVE list

#### Part E: Verify Dashboard Update
1. Go to dashboard
2. Check active player count
3. Verify count decreased by 1

**Expected:** Active player count reflects change

### Verification Checklist
- [ ] Deactivate option visible
- [ ] Confirmation dialog appears
- [ ] Action succeeds
- [ ] Roster updates
- [ ] Detail page shows INACTIVE status
- [ ] Filters updated (no longer in ACTIVE list)
- [ ] Now appears in INACTIVE list
- [ ] Dashboard player count updated
- [ ] Activity log includes deactivation

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 09: PLAYER DELETE

**Objective:** Verify player deletion works, requires confirmation, updates all related screens, and returns 404 when accessing deleted player.

### Prerequisites
- At least 1 test player exists (Bima, now INACTIVE)
- On player roster

### Steps

#### Part A: Delete Player
1. Find test player (Bima)
2. Click: Options / Menu / "More actions"
3. Select: "Delete" / "Remove Player"

**Expected:** Confirmation dialog appears

#### Part B: Cancel Delete
1. Confirmation shows: "Are you sure? This action cannot be undone."
2. Click: "Cancel"

**Expected:** Dialog closes, player still exists

#### Part C: Confirm Delete
1. Open delete again
2. Click: "Delete" / "Confirm"

**Expected:**
- Loading state
- Dialog closes
- Success notification: "Player deleted successfully"
- Player disappears from roster

#### Part D: Verify Roster Updated
1. Still on roster page
2. Search for Bima

**Expected:** Bima not found

#### Part E: Verify Dashboard Updated
1. Go to dashboard
2. Total player count decreased

**Expected:** Player count -1

#### Part F: Access Deleted Player URL
1. Manually navigate to: `/pemain/[bima-id]`
2. Replace [bima-id] with Bima's actual ID if you remember

**Expected:**
- 404 Not Found page
- Professional error state
- No blank screen
- No runtime error in console

#### Part G: Verify Activity Log
1. Go to Activity (`/aktivitas`)
2. Look for: "Player deleted" or "Bima deleted"

**Expected:** Activity includes deletion

### Verification Checklist
- [ ] Delete option visible
- [ ] Confirmation dialog appears
- [ ] Cancel works
- [ ] Confirm deletes
- [ ] Roster updated
- [ ] Dashboard updated
- [ ] Deleted URL returns 404
- [ ] No blank screen on 404
- [ ] No console errors
- [ ] Activity log includes deletion
- [ ] No orphaned records

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 10: STAFF MANAGEMENT

**Objective:** Verify staff creation, editing, deactivation, and deletion work with same patterns as players.

### Prerequisites
- On Staff page (`/staf`)

### Steps

#### Part A: Create Staff
1. Click: "Add Staff" / "Tambah Staff"
2. Create:
   - Name: **Ahmad Wijaya**
   - Role: **Head Coach**
   - Status: **ACTIVE**
3. Submit

**Expected:**
- Staff created
- Appears in list
- Activity generated
- Notification shown

#### Part B: Edit Staff
1. Find Ahmad
2. Click: Edit
3. Change Role: **Assistant Coach**
4. Save

**Expected:**
- Role updated
- Persists after refresh
- Activity logged

#### Part C: Deactivate Staff
1. Find Ahmad
2. Deactivate
3. Confirm

**Expected:**
- Status = INACTIVE
- Removed from ACTIVE filter
- Activity logged

#### Part D: Delete Staff
1. Delete Ahmad
2. Confirm

**Expected:**
- Removed from list
- Activity logged
- 404 on direct URL

### Verification Checklist
- [ ] Create works
- [ ] Edit works
- [ ] Deactivate works
- [ ] Delete works
- [ ] All changes persist
- [ ] All changes logged
- [ ] No orphaned relationships
- [ ] Dashboard team counts accurate

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 11: TEAM MANAGEMENT

**Objective:** Verify team creation, player assignment, coach assignment, and relationship integrity.

### Prerequisites
- Players exist
- Staff exists
- On Team page (`/tim`)

### Steps

#### Part A: Create Team
1. Click: "Add Team" / "Buat Tim"
2. Create:
   - Name: **U-13 Development**
   - Age Group: **U-13**
   - Season: **2026**
3. Submit

**Expected:** Team created and appears in list

#### Part B: Assign Coach
1. Open team detail
2. Assign staff:
   - Head Coach: **Ahmad Wijaya**
3. Save

**Expected:** Coach assigned and shown on detail

#### Part C: Assign Players
1. On team detail, find "Add Player" section
2. Assign 3 players from roster
3. Verify: Players now show on team

**Expected:** Team roster includes assigned players

#### Part D: Verify Dashboard
1. Go to dashboard
2. Team count increased
3. Team detail card shows players

**Expected:** Dashboard reflects new team

#### Part E: Remove Player from Team
1. Go to team detail
2. Remove 1 player
3. Confirm

**Expected:**
- Player removed from team
- Player NOT deleted
- Player still exists in roster
- Player appears as available for other teams

#### Part F: Verify Player Still Exists
1. Go to roster (`/pemain`)
2. Search for removed player
3. Should find player

**Expected:** Player exists, just not in U-13 anymore

### Verification Checklist
- [ ] Team creation works
- [ ] Coach assignment works
- [ ] Player assignment works
- [ ] Player removal doesn't delete player
- [ ] Dashboard shows team
- [ ] No data loss
- [ ] Relationships maintained
- [ ] Activity logged for all changes

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 12: TRAINING MANAGEMENT

**Objective:** Verify training session creation, editing, deletion, and relationship to teams/players.

### Prerequisites
- Teams exist with players
- On Training page (`/latihan`)

### Steps

#### Part A: Create Training
1. Click: "Add Training" / "Tambah Sesi"
2. Create:
   - Name: **Tactical Training**
   - Team: **U-15 Garuda Muda**
   - Date: **Future date (tomorrow or later)**
   - Time: **16:00**
   - Location: **Garuda Field**
   - Coach: **Ahmad Wijaya**
   - Type: **Tactical**
3. Submit

**Expected:**
- Training created
- Appears in schedule
- Dashboard upcoming training updates

#### Part B: Verify Dashboard Update
1. Go to dashboard
2. Check "Upcoming Training" section
3. New training should appear

**Expected:** Training count updated, training visible

#### Part C: Edit Training
1. Open training detail
2. Change: Time to 17:00
3. Save

**Expected:**
- Time updated
- All references updated
- No duplicate training

#### Part D: Delete Training
1. On training detail, click: "Delete"
2. Confirm

**Expected:**
- Confirmation dialog
- Training removed
- Dashboard updated
- Activity logged

### Verification Checklist
- [ ] Create works
- [ ] Training appears in schedule
- [ ] Dashboard updates
- [ ] Edit works
- [ ] All details update
- [ ] Delete works with confirmation
- [ ] Dashboard updates after delete
- [ ] No orphaned records
- [ ] Activity logged

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 13: ATTENDANCE MARKING

**Objective:** Verify attendance can be marked, persists, and updates training statistics.

### Prerequisites
- Training session exists
- Session date is today or past (so you can mark attendance)
- On Training detail page

### Steps

#### Part A: Open Attendance
1. On training detail, find attendance section
2. Should show list of assigned players

**Expected:** All team players listed with status options

#### Part B: Mark Attendance
1. Mark:
   - 17 players: PRESENT
   - 2 players: LATE
   - 1 player: EXCUSED
   - 0 players: ABSENT
2. Save

**Expected:**
- All statuses show loading
- Success notification
- Attendance summary updates

#### Part C: Verify Attendance Persists
1. Refresh page
2. Attendance marks still show

**Expected:** Attendance data persists

#### Part D: Verify Training Statistics
1. On training detail, check stats:
   - Present: 17
   - Late: 2
   - Excused: 1
   - Absent: 0
2. Verify totals calculate correctly

**Expected:** Stats match marked attendance

#### Part E: Verify Activity
1. Go to Activity page
2. Look for attendance-related entries

**Expected:** Activity shows attendance marking

### Verification Checklist
- [ ] Attendance marks visible
- [ ] All status options work
- [ ] Save works
- [ ] Attendance persists
- [ ] Statistics update
- [ ] Math is correct (no double counting)
- [ ] Activity logged
- [ ] No orphaned attendance records

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 14: COMPETITION MANAGEMENT

**Objective:** Verify competition creation and structure (fixtures, standings, squad, stats).

### Prerequisites
- Season exists (2026)
- Teams exist
- On Competition page (`/kompetisi`)

### Steps

#### Part A: Create Competition
1. Click: "Add Competition" / "Buat Kompetisi"
2. Create:
   - Name: **Makassar Youth Cup 2027**
   - Type: **Tournament** or **League**
   - Age Group: **U-15**
   - Season: **2026**
   - Status: **UPCOMING**
3. Submit

**Expected:** Competition created and visible

#### Part B: Open Competition Detail
1. Click on Makassar Youth Cup
2. Verify sections visible:
   - Overview
   - Fixtures
   - Results
   - Standings
   - Squad
   - Statistics

**Expected:** All main sections present (may be empty)

#### Part C: Verify Dashboard Integration
1. Go to dashboard
2. Competition count updated
3. Competitions section shows Makassar Youth Cup

**Expected:** Dashboard reflects new competition

### Verification Checklist
- [ ] Competition creation works
- [ ] All sections accessible
- [ ] Overview available
- [ ] Fixtures section exists
- [ ] Results section exists
- [ ] Standings section exists
- [ ] Squad section exists
- [ ] Stats section exists
- [ ] Dashboard updated
- [ ] Activity logged

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 15: MATCH CREATION

**Objective:** Verify match creation and integration with team, competition, and dashboard.

### Prerequisites
- Competition exists (Makassar Youth Cup)
- Team exists (U-15 Garuda Muda)
- On Competition detail or Matches section

### Steps

#### Part A: Create Match
1. On competition detail, look for: "Add Match" / "Create Match"
2. Create match:
   - Competition: **Makassar Youth Cup 2027**
   - Team: **U-15 Garuda Muda**
   - Opponent: **Makassar Academy**
   - Venue: **Neutral**
   - Date: **Future date (within season)**
   - Time: **14:00**
3. Submit

**Expected:**
- Match created
- Appears in competition fixtures
- Status: UPCOMING

#### Part B: Verify Dashboard
1. Go to dashboard
2. Check "Upcoming Matches"
3. Match should appear

**Expected:** Match in dashboard upcoming section

#### Part C: Verify Competition Detail
1. Go back to competition
2. Open Fixtures section
3. Match should appear

**Expected:** Match in fixtures list

### Verification Checklist
- [ ] Create works
- [ ] Match appears in fixtures
- [ ] Status = UPCOMING
- [ ] Dashboard shows match
- [ ] Date/time correct
- [ ] Team/opponent correct
- [ ] Activity logged

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 16: MATCH RESULT RECORDING

**Objective:** Verify match result recording and derived values (WIN/DRAW/LOSS are not manually selected).

### Prerequisites
- Match exists in UPCOMING status
- On match detail

### Steps

#### Part A: Record 3-1 Victory
1. On match detail, find "Record Result" or "Add Score"
2. Enter: Team Score = 3, Opponent Score = 1
3. Do NOT manually select WIN/DRAW/LOSS
4. Submit

**Expected:**
- Result recorded
- System derives: Result = WIN
- Match status: COMPLETED
- Dashboard updates

#### Part B: Verify Result Display
1. Refresh page
2. Verify:
   - Score: 3-1
   - Result: WIN (shown with win color/styling)
   - Status: COMPLETED

**Expected:** Result persists and displays correctly

#### Part C: Record Different Result
1. Create another match
2. Enter: Team Score = 2, Opponent Score = 2
3. Submit

**Expected:**
- Result = DRAW
- Status = COMPLETED

#### Part D: Record Loss
1. Create third match
2. Enter: Team Score = 0, Opponent Score = 2
3. Submit

**Expected:**
- Result = LOSS
- Status = COMPLETED

#### Part E: Verify Dashboard
1. Go to dashboard
2. Check match record:
   - Wins: at least 1
   - Draws: at least 1
   - Losses: at least 1

**Expected:** Dashboard record reflects all results

### Verification Checklist
- [ ] Score entry works
- [ ] No manual result selection
- [ ] Win correctly derived (higher score)
- [ ] Draw correctly derived (equal score)
- [ ] Loss correctly derived (lower score)
- [ ] Status changes to COMPLETED
- [ ] Dashboard record updated
- [ ] Activity logged
- [ ] Result persists after refresh

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 17: FINANCE - INCOME & EXPENSE

**Objective:** Verify finance transactions (income/expense) and balance calculation.

### Prerequisites
- On Finance page (`/keuangan`)
- Starting balance known (should be visible)

### Steps

#### Part A: Record Income
1. Click: "Add Transaction" / "Tambah Transaksi"
2. Type: **INCOME**
3. Amount: **Rp 1.000.000**
4. Category: **SPP**
5. Description: **Monthly tuition from players**
6. Submit

**Expected:**
- Transaction recorded
- Appears in transaction list
- Balance increases by Rp 1.000.000
- Status: INCOME with income color styling

#### Part B: Verify Dashboard Balance
1. Go to dashboard
2. Finance section shows updated balance
3. Verify: Balance = Previous + Rp 1.000.000

**Expected:** Dashboard balance reflects income

#### Part C: Record Expense
1. Back on finance page
2. Click: "Add Transaction"
3. Type: **EXPENSE**
4. Amount: **Rp 250.000**
5. Category: **Equipment**
6. Description: **Purchase training cones**
7. Submit

**Expected:**
- Transaction recorded
- Appears in list
- Balance decreases by Rp 250.000
- Status: EXPENSE with expense color styling

#### Part D: Verify Balance Calculation
1. Check balance display
2. Calculate manually:
   - Starting: (shown)
   - + Income: Rp 1.000.000
   - - Expense: Rp 250.000
   - = Expected balance
3. Verify displayed balance = calculated

**Expected:** Balance formula correct

#### Part E: Verify Activity
1. Go to Activity page
2. See both transactions logged

**Expected:** Activity includes both transactions

### Verification Checklist
- [ ] Income transaction works
- [ ] Expense transaction works
- [ ] Income increases balance
- [ ] Expense decreases balance
- [ ] Color coding correct
- [ ] Dashboard updates
- [ ] Balance calculation correct
- [ ] No double counting
- [ ] Activity logged
- [ ] Transactions persist

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 18: FINANCE - EDIT & RECALCULATION

**Objective:** Verify editing transaction amount recalculates balance without double counting.

### Prerequisites
- Income and expense from TEST 17 exist
- Balance calculated correctly

### Steps

#### Part A: Edit Expense Amount
1. On finance page, find the Rp 250.000 expense
2. Click: Edit
3. Change amount: Rp 250.000 → Rp 300.000
4. Save

**Expected:**
- Expense amount updates
- Balance recalculates
- Balance decreases by additional Rp 50.000

#### Part B: Verify Balance Recalculation
1. Check new balance
2. Formula should be:
   - Original balance
   - + Rp 1.000.000 income
   - - Rp 300.000 expense (NEW amount)
   - = New expected balance
3. Verify displayed balance matches

**Expected:** Balance correct after edit

#### Part C: Verify No Double Counting
1. After edit, verify:
   - Transaction count still 2 (not 3)
   - No old Rp 250.000 record
   - No new Rp 300.000 record (just one updated)
   - Only Rp 300.000 shown

**Expected:** Original transaction modified, not duplicated

#### Part D: Verify Dashboard
1. Go to dashboard
2. Balance reflects edit

**Expected:** Dashboard shows updated balance

#### Part E: Verify Activity
1. Go to Activity
2. See: "Transaction edited" or similar entry

**Expected:** Activity logs edit action

### Verification Checklist
- [ ] Edit works
- [ ] Amount updates
- [ ] Balance recalculates
- [ ] No double counting
- [ ] No duplicate records
- [ ] Dashboard updates
- [ ] Activity logged
- [ ] Math is correct
- [ ] Persist after refresh

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 19: NOTIFICATIONS

**Objective:** Verify notification system shows unread count, mark as read, and updates across UI.

### Prerequisites
- Multiple activities have occurred (player created, match recorded, transaction added, etc.)
- On Notifications page (`/notifikasi`)

### Steps

#### Part A: Check Notification Badge
1. Look at header/app bar
2. Find notification bell icon
3. Check if badge shows unread count

**Expected:** Badge shows number > 0

#### Part B: Open Notifications Page
1. Navigate to `/notifikasi`
2. See notification list
3. Find unread notifications (typically with different styling)

**Expected:** List shows notifications with unread indicator

#### Part C: Mark Single as Read
1. Find unread notification
2. Click notification or click: "Mark as read"

**Expected:**
- Notification marked as read
- Styling changes
- Badge count decreases by 1

#### Part D: Mark All as Read
1. Look for: "Mark all as read" button
2. Click

**Expected:**
- All notifications marked as read
- Badge count = 0
- All styling changes to read

#### Part E: Delete Notification
1. Find a read notification
2. Look for: Delete / X / Remove option
3. Click

**Expected:**
- Notification removed
- List updates

#### Part F: Test Filters
1. Look for filter options: UNREAD, READ, ALL
2. Click: UNREAD

**Expected:** Only unread notifications shown

3. Click: READ

**Expected:** Only read notifications shown

4. Click: ALL

**Expected:** All notifications shown

### Verification Checklist
- [ ] Notification badge visible
- [ ] Badge shows correct count
- [ ] Notifications page accessible
- [ ] Mark as read works
- [ ] Badge updates after mark
- [ ] Mark all as read works
- [ ] Delete works
- [ ] Filters work correctly
- [ ] No notifications lost

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 20: ACTIVITY LOG

**Objective:** Verify activity log captures all mutations with proper audit trail.

### Prerequisites
- Multiple mutations performed (player create, edit, delete, training, match, finance)
- On Activity page (`/aktivitas`)

### Steps

#### Part A: Check Activity Log Exists
1. Navigate to `/aktivitas`
2. Verify page loads
3. Activity list should show multiple entries

**Expected:** Activity page displays with entries

#### Part B: Verify Activity Entry Format
1. For each activity entry, verify contains:
   - **Actor:** Who performed action (e.g., "Agus Setiawan")
   - **Action:** What was done (e.g., "created", "updated", "deleted")
   - **Entity:** What was affected (e.g., "Player: Bima Pratama")
   - **Timestamp:** When action occurred

**Expected:** All fields present and accurate

#### Part C: Verify Expected Activities
1. Look for entries:
   - Player created (Bima Pratama)
   - Player edited (number change)
   - Player deleted
   - Training created
   - Match result recorded
   - Transaction created
   - Finance edited

**Expected:** All mutations logged

#### Part D: Check Timestamp Accuracy
1. Pick recent activity
2. Verify timestamp is recent
3. Timestamp format should be readable (e.g., "2 hours ago" or "14:30")

**Expected:** Timestamps are accurate and readable

### Verification Checklist
- [ ] Activity page accessible
- [ ] Entries display with all fields
- [ ] Actor information correct
- [ ] Action descriptions clear
- [ ] Entity names correct
- [ ] Timestamps accurate
- [ ] Recent activities appear first
- [ ] Old activities still exist
- [ ] No spam/duplicate entries

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 21: COMMAND PALETTE

**Objective:** Verify command palette opens, searches, and performs actual actions (not just suggestions).

### Prerequisites
- On any page

### Steps

#### Part A: Open Command Palette
1. Press: **Ctrl + K** (Windows/Linux) or **Cmd + K** (Mac)
2. Observe behavior

**Expected:**
- Palette opens as overlay/modal
- Search input focused
- Shows available commands

#### Part B: Search: "Go to Players"
1. Type: "Players" or "Go to Players"
2. See matching command

**Expected:** Command appears in list

3. Press: Enter or click command

**Expected:** Navigate to `/pemain` (Player roster)

#### Part C: Open Palette Again
1. Press: Ctrl/Cmd + K
2. Type: "Go to Training"
3. Execute

**Expected:** Navigate to `/latihan`

#### Part D: Test Action Commands
1. Open palette
2. Search: "Add Player" or "Create Player"
3. Execute

**Expected:**
- Player creation dialog opens
- Palette closes
- Ready to create player

#### Part E: Test Multiple Commands
1. Open palette
2. Try:
   - "Go to Competition"
   - "Go to Finance"
   - "Add Training"
   - "Add Match"

**Expected:** Each command performs actual action/navigation

#### Part F: Close Palette
1. Press: Escape
2. Palette closes

**Expected:** Graceful close

### Verification Checklist
- [ ] Palette opens on Ctrl/Cmd + K
- [ ] Search works
- [ ] Commands appear
- [ ] Navigation commands work
- [ ] Action commands work (open forms)
- [ ] Escape closes palette
- [ ] No errors on command execution
- [ ] Commands are descriptive

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 22: GLOBAL SEARCH

**Objective:** Verify global search finds entities across categories and navigates to detail.

### Prerequisites
- Bima Pratama exists
- Multiple teams, competitions exist
- On any page

### Steps

#### Part A: Open Global Search
1. Look for search icon/input in header
2. Click to open global search
3. Search input should focus

**Expected:** Search input active and ready

#### Part B: Search Player by Name
1. Type: "Bima"
2. Observe results

**Expected:**
- Category: PLAYER
- Bima Pratama appears
- Might also show other results

#### Part C: Navigate to Player Detail
1. Click on Bima in results

**Expected:** Navigate to `/pemain/[bima-id]` - Bima's detail page

#### Part D: Search and Navigate to Team
1. Open search again
2. Search for team name (e.g., "Garuda")
3. Click result

**Expected:** Navigate to team detail

#### Part E: Search and Navigate to Competition
1. Search: "Makassar"
2. Click competition result

**Expected:** Navigate to competition detail

#### Part F: Search Invalid Value
1. Search: "InvalidXYZ123"

**Expected:**
- No results
- Professional empty state
- Message: "No results found"

#### Part G: Search by Partial Match
1. Search: "Mak"

**Expected:** Matches "Makassar Youth Cup" (partial match works)

### Verification Checklist
- [ ] Search input accessible
- [ ] Results appear while typing
- [ ] Results grouped by category
- [ ] Player results work
- [ ] Team results work
- [ ] Competition results work
- [ ] Staff results work (if applicable)
- [ ] Empty state when no results
- [ ] Navigation works correctly
- [ ] Partial matches work

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 23: PERSISTENCE

**Objective:** Verify all changes persist across browser refreshes and application restarts.

### Prerequisites
- Before test: Note the current state (player count, balance, etc.)

### Steps

#### Part A: Create New Entities
1. Create:
   - 1 new player
   - 1 new training session
   - 1 new transaction
   - 1 new match
2. Record details (names, amounts, scores)

**Expected:** All created and visible

#### Part B: Browser Refresh
1. Refresh page: Ctrl + R / F5
2. Check all created entities still visible

**Expected:** All changes persist

#### Part C: Navigate Away and Back
1. Navigate to different route
2. Return to previous route
3. Verify created data still there

**Expected:** State maintained

#### Part D: Close and Reopen Tab
1. Close browser tab
2. Reopen application (or simply reload if you didn't close it)
3. Navigate to relevant pages
4. Verify data still exists

**Expected:** Data persists

#### Part E: Hard Refresh
1. Press: Ctrl + Shift + R (force cache clear)
2. Verify data still visible

**Expected:** Persists even with cache clear

### Verification Checklist
- [ ] Player created and persists
- [ ] Training created and persists
- [ ] Transaction created and persists
- [ ] Match created and persists
- [ ] Dashboard counts updated and persist
- [ ] Balance updated and persists
- [ ] Activity logged and persists
- [ ] Data survives browser refresh
- [ ] Data survives navigation away/back
- [ ] Data survives application restart

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 24: RESET DEMO DATA

**Objective:** Verify reset functionality removes UAT modifications and restores original demo dataset.

### Prerequisites
- UAT modifications exist (player created, training added, transactions, etc.)
- Navigate to Settings page (`/pengaturan`)

### Steps

#### Part A: Locate Reset Option
1. On Settings page
2. Look for: "Reset Demo Data" / "Reset to Demo" / "Restore Default Data"
3. Button should be clearly visible

**Expected:** Reset option found

#### Part B: Click Reset
1. Click reset button

**Expected:** Confirmation dialog appears

#### Part C: Review Confirmation
1. Confirmation should state:
   - "All local modifications will be removed"
   - "Original demo dataset will be restored"
   - "This action cannot be undone"

**Expected:** Clear warning message

#### Part D: Cancel Reset
1. Click: "Cancel"

**Expected:**
- Dialog closes
- Nothing changed
- Modifications still exist

#### Part E: Perform Reset
1. Open reset again
2. Click: "Reset" / "Confirm"

**Expected:**
- Loading state
- Success notification
- Page refreshes

#### Part F: Verify Reset Complete
1. Go to Player roster
2. Verify: Bima (created during UAT) is gone
3. Go to Finance
4. Verify: Test transaction (created during UAT) is gone
5. Go to Training
6. Verify: Test training (created during UAT) is gone
7. Check Activity log
8. Verify: UAT activities are gone

**Expected:** All modifications removed, original demo data restored

#### Part G: Verify Original Data
1. Verify original demo players still exist (FID-YYYY-CLUB-NNNN)
2. Verify original training sessions still exist
3. Verify original matches still exist
4. Verify original finance records still exist

**Expected:** Original demo dataset intact

### Verification Checklist
- [ ] Reset option visible
- [ ] Confirmation dialog appears
- [ ] Cancel works
- [ ] Reset removes created player
- [ ] Reset removes created training
- [ ] Reset removes created transaction
- [ ] Reset removes UAT activities
- [ ] Original demo data restored
- [ ] Original players intact
- [ ] Original training intact
- [ ] Original competitions intact
- [ ] Dashboard shows original counts

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 25: ERROR PATHS - 404 HANDLING

**Objective:** Verify invalid entity IDs return professional 404 errors without crashes.

### Prerequisites
- Browser console open (to check for JS errors)

### Steps

#### Part A: Invalid Player ID
1. Manually navigate to: `/pemain/invalid-id-12345`
2. Observe page

**Expected:**
- Professional 404 error page
- Error message: "Player not found"
- No blank screen
- No "undefined" values
- No runtime errors in console

#### Part B: Invalid Competition ID
1. Navigate to: `/kompetisi/invalid-id-12345`

**Expected:** Same 404 behavior

#### Part C: Invalid Match ID
1. Navigate to: `/match/invalid-id-12345` (or route if exists)

**Expected:** Same 404 behavior

#### Part D: Invalid Finance ID
1. Navigate to: `/keuangan/invalid-id-12345`

**Expected:** Same 404 behavior

#### Part E: Verify Error Page Features
1. Error page should have:
   - Clear message: "Not Found"
   - HTTP status: 404 (if displayed)
   - Button to return home or go back
2. Click: "Back" or "Home"

**Expected:** Navigation works, returns to valid page

### Verification Checklist
- [ ] Invalid player ID returns 404
- [ ] Invalid competition ID returns 404
- [ ] Invalid match ID returns 404
- [ ] Invalid finance ID returns 404
- [ ] Error messages clear
- [ ] No blank screen
- [ ] No undefined values
- [ ] No console errors
- [ ] Back/Home button works
- [ ] UI doesn't break

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 26: FORM VALIDATION

**Objective:** Verify all forms validate inputs and prevent invalid submissions.

### Prerequisites
- Access to various form pages (player create, training, finance, etc.)

### Steps

#### Part A: Submit Empty Form
1. Open player creation form
2. Click: "Create" without entering anything

**Expected:**
- Inline validation errors appear
- Form does NOT submit
- Errors highlight required fields

#### Part B: Invalid Amount (Negative)
1. On finance form, enter:
   - Amount: **-5000**
2. Try to submit

**Expected:**
- Error: "Amount must be positive"
- Form doesn't submit

#### Part C: Invalid Date (Past)
1. On training form, try to create:
   - Date: **2020-01-01** (far in past)
2. Submit

**Expected:**
- Error or warning
- Form may reject or show warning

#### Part D: Duplicate Number
1. Try to create player with number already used
2. Submit

**Expected:**
- Error: "Number already in use" or similar
- Form doesn't submit

#### Part E: Empty Required Field
1. Fill most fields but leave one required field empty
2. Submit

**Expected:**
- Error on required field
- Clear message: "This field is required"

#### Part F: Invalid Text Format
1. On date field, enter: "not a date"
2. Try to submit

**Expected:**
- Error: "Invalid date format"
- Form rejects

### Verification Checklist
- [ ] Empty form validation works
- [ ] Required field validation works
- [ ] Negative amount rejected
- [ ] Duplicate number rejected
- [ ] Invalid date format rejected
- [ ] Invalid text in number field rejected
- [ ] Error messages clear
- [ ] Form doesn't submit with errors
- [ ] Errors persist until fixed
- [ ] User can correct and resubmit

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 27: DOUBLE SUBMIT PREVENTION

**Objective:** Verify clicking submit multiple times creates only one record.

### Prerequisites
- On player creation form
- Ready to create player

### Steps

#### Part A: Fill Form
1. Create:
   - Name: **Test Double Submit**
   - Position: **FW**
   - Other required fields

**Expected:** Form filled correctly

#### Part B: Click Submit Multiple Times
1. Click: "Create" button
2. Immediately click again (5+ times rapidly)

**Expected:**
- First click: Button disables, loading state appears
- Subsequent clicks: No effect (button disabled)

#### Part C: Wait for Completion
1. Dialog closes
2. Success notification appears

**Expected:** Only ONE player created

#### Part D: Verify Single Record
1. Go to player roster
2. Search: "Test Double Submit"

**Expected:**
- Exactly ONE record found
- NO duplicates
- No "Test Double Submit #1", "Test Double Submit #2"

### Verification Checklist
- [ ] Submit button disables on first click
- [ ] Multiple clicks have no effect
- [ ] Loading state shows
- [ ] Form doesn't submit twice
- [ ] Only one record created
- [ ] No duplicates in system

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 28: MOBILE RESPONSIVE CRUD (3 Breakpoints)

**Objective:** Verify all CRUD operations work on mobile breakpoints without overflow or cutoff.

### Prerequisites
- Browser DevTools available (for viewport resizing)

### Steps

#### Part A: Test at 375px (Mobile Small)
1. Set viewport: **375px width**
2. For each operation:
   - Create player
   - Edit player
   - Delete player
   - Filter roster
   - Search player
   - Use dialogs
   - Use bottom sheets

**Expected:**
- No horizontal scrolling
- All buttons visible and clickable
- Forms readable
- No text cutoff
- Dialogs fit screen
- Touch targets ≥44px

#### Part B: Test at 768px (Tablet)
1. Set viewport: **768px width**
2. Repeat CRUD operations

**Expected:** Similar to 375px, but with more comfortable spacing

#### Part C: Test at 1280px (Desktop)
1. Set viewport: **1280px width**
2. Repeat CRUD operations

**Expected:** Full layout works with proper spacing

#### Part D: Specific Mobile Tests
1. **Filtering on mobile:**
   - Filter sheet opens
   - Applies correctly
   - Closes without issues

2. **Search on mobile:**
   - Search input usable
   - Results scrollable
   - No overflow

3. **Dialogs on mobile:**
   - Dialog fits viewport
   - Close button accessible
   - Form fields accessible

4. **Tables on mobile:**
   - Table scrollable horizontally if needed
   - No crucial content hidden
   - Swipe to scroll works

### Verification Checklist
- [ ] 375px: No horizontal scroll
- [ ] 375px: All buttons clickable
- [ ] 375px: Forms readable
- [ ] 375px: Touch targets ≥44px
- [ ] 768px: Responsive spacing
- [ ] 1280px: Full layout works
- [ ] Mobile filter sheet works
- [ ] Mobile search works
- [ ] Dialogs fit mobile
- [ ] Tables scrollable on mobile
- [ ] No content cutoff

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 29: DARK MODE CRUD

**Objective:** Verify all CRUD workflows work in dark mode with sufficient contrast and no visual issues.

### Prerequisites
- Toggle dark mode available in settings or system

### Steps

#### Part A: Switch to Dark Mode
1. Open Settings (`/pengaturan`)
2. Find: "Appearance" / "Dark Mode" setting
3. Set to: **Dark**
4. Observe theme change

**Expected:**
- UI switches to dark theme
- Background dark
- Text light/readable
- Dialogs visible
- Buttons visible

#### Part B: Create Player in Dark Mode
1. On roster page
2. Create player:
   - Name: **Dark Mode Test**
   - Position: **FW**
3. Submit

**Expected:**
- Dialog opens clearly
- Form readable
- Submit button visible
- Success notification visible

#### Part C: Edit Player in Dark Mode
1. Find player
2. Edit
3. Change a field
4. Save

**Expected:**
- Edit dialog readable
- Form fields visible
- No contrast issues

#### Part D: Test All UI Components
1. In dark mode, check:
   - **Dialogs:** Readable, button visible
   - **Forms:** Labels visible, inputs clear
   - **Dropdowns:** Options readable
   - **Tables:** Text readable, rows distinguishable
   - **Badges:** Colors distinguishable
   - **Buttons:** All colors readable
   - **Empty States:** Message clear
   - **Error States:** Error color visible and distinct
   - **Toasts:** Notifications readable
   - **Sidebars:** Navigation items readable

**Expected:** All components readable with good contrast

#### Part E: Switch to Light Mode
1. Set appearance to: **Light**
2. Verify components still readable

**Expected:** Light mode works correctly

#### Part F: Switch to System
1. Set appearance to: **System**
2. Observe follows system preference

**Expected:** Theme matches device settings

### Verification Checklist
- [ ] Dark mode toggle works
- [ ] Theme switches properly
- [ ] Text readable in dark mode
- [ ] Dialog text readable
- [ ] Button text readable
- [ ] Form labels visible
- [ ] Badges distinguishable
- [ ] Error messages visible
- [ ] Toasts visible
- [ ] No unreadable text
- [ ] Contrast ratio acceptable (WCAG AA)
- [ ] Create/Edit/Delete work in dark mode
- [ ] Light mode still works
- [ ] System preference respects system setting

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

## TEST 30: ACCESSIBILITY - Keyboard Navigation & Screen Reader

**Objective:** Verify application is navigable with keyboard only and screen reader compatible.

### Prerequisites
- Keyboard available
- Screen reader available (optional but recommended: NVDA, JAWS, or built-in)

### Steps

#### Part A: Keyboard Navigation - Tab Through Form
1. On player creation form
2. Press: **Tab** repeatedly
3. Focus should move through:
   - Form fields
   - Buttons
   - All interactive elements

**Expected:** Focus visible (ring or indicator) on all elements

#### Part B: Submit with Keyboard
1. Tab to: Submit button
2. Press: **Enter**
3. Form submits

**Expected:** Form submits via keyboard

#### Part C: Dialog Focus Trap
1. Dialog open
2. Tab through dialog elements
3. After last element, Tab should return to first dialog element
4. Should NOT tab to background

**Expected:** Focus trapped in dialog

#### Part D: Close Dialog with Keyboard
1. Open dialog
2. Press: **Escape**
3. Dialog closes

**Expected:** Escape closes dialog

#### Part E: Dropdown Navigation
1. Open dropdown
2. Press: **Arrow Down**
3. Options should navigate

**Expected:** Arrow keys navigate options

#### Part F: Test ARIA Labels
1. Using browser DevTools or screen reader
2. Inspect interactive elements
3. Verify ARIA labels present:
   - Buttons have aria-label
   - Form fields have labels
   - Dialogs have aria-label
   - Tables have proper semantic HTML

**Expected:** All labels present

#### Part G: Screen Reader (if available)
1. Enable screen reader (NVDA, etc.)
2. Navigate page
3. All content should be announced:
   - Headings
   - Buttons
   - Form labels
   - List items
   - Links

**Expected:** No content skipped

#### Part H: No Keyboard Traps
1. Navigate through entire app with Tab
2. Should never get stuck
3. Should always be able to reach all features

**Expected:** No dead ends

### Verification Checklist
- [ ] Tab navigation works
- [ ] Focus visible on all elements
- [ ] Enter submits forms
- [ ] Escape closes dialogs
- [ ] Arrow keys navigate dropdowns
- [ ] Focus trap in dialogs
- [ ] ARIA labels present
- [ ] Headings semantic
- [ ] Form labels associated
- [ ] Button labels descriptive
- [ ] Screen reader reads all content
- [ ] No keyboard traps
- [ ] No dead ends for keyboard-only users

### Result
- **PASS / FAIL**
- **Issues Found:**
- **Notes:**

---

**End of Test Scenarios Document**

Each test should be executed step-by-step, with results recorded. See uat-results.md for results tracking.
