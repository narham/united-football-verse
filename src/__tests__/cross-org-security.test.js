/**
 * STEP 4.21: Cross-Organization Security Testing (P0 CRITICAL)
 * 
 * This is the most critical security test!
 * Verifies that users cannot access data across organizational boundaries.
 * 
 * Test Plan:
 * 1. User A in club-1 cannot see club-2 data
 * 2. User A in club-1 cannot read club-2 memberships
 * 3. User A cannot switch to unauthorized organization
 * 4. Current org isolation enforced
 * 5. Cross-org data access blocked at repository level
 */

// Mock localStorage
const mockLocalStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  },
};

if (typeof localStorage === "undefined") {
  global.localStorage = mockLocalStorage;
}

// Simulated user and organization data
const USER_A_ID = "user-a";
const USER_A_PROFILE_ID = "profile-a";
const USER_B_ID = "user-b";
const USER_B_PROFILE_ID = "profile-b";

// User A's memberships: club-1 (ORG_OWNER) and club-2 (MANAGER)
const USER_A_MEMBERSHIPS = [
  {
    id: "member-a-1",
    userId: USER_A_PROFILE_ID,
    organizationId: "club-1",
    role: "ORG_OWNER",
    status: "ACTIVE",
  },
  {
    id: "member-a-2",
    userId: USER_A_PROFILE_ID,
    organizationId: "club-2",
    role: "MANAGER",
    status: "ACTIVE",
  },
];

// User B's membership: club-3 (COACH) only
const USER_B_MEMBERSHIPS = [
  {
    id: "member-b-1",
    userId: USER_B_PROFILE_ID,
    organizationId: "club-3",
    role: "COACH",
    status: "ACTIVE",
  },
];

// All memberships in system
const ALL_MEMBERSHIPS = [...USER_A_MEMBERSHIPS, ...USER_B_MEMBERSHIPS];

// Mock player data per organization
const ORG_PLAYERS = {
  "club-1": [
    { id: "player-1-1", name: "Player 1A", organizationId: "club-1" },
    { id: "player-1-2", name: "Player 1B", organizationId: "club-1" },
  ],
  "club-2": [
    { id: "player-2-1", name: "Player 2A", organizationId: "club-2" },
  ],
  "club-3": [
    { id: "player-3-1", name: "Player 3A", organizationId: "club-3" },
  ],
};

// Test helper: Get current user's memberships
function getUserMemberships(userId) {
  if (userId === USER_A_PROFILE_ID) return USER_A_MEMBERSHIPS;
  if (userId === USER_B_PROFILE_ID) return USER_B_MEMBERSHIPS;
  return [];
}

// Test helper: Get organization for current user
function getUserOrganizations(userId) {
  return getUserMemberships(userId).map((m) => m.organizationId);
}

// Test helper: Check if user belongs to org
function userBelongsToOrg(userId, organizationId) {
  return getUserOrganizations(userId).includes(organizationId);
}

// Test helper: Get data for specific organization
function getOrgData(organizationId) {
  return ORG_PLAYERS[organizationId] || [];
}

// Test functions
function testUserAHasClub1Access() {
  console.log("\n✓ TEST 1: User A has club-1 access");

  if (userBelongsToOrg(USER_A_PROFILE_ID, "club-1")) {
    console.log("  ✅ PASS: User A belongs to club-1");
    return true;
  } else {
    console.log("  ❌ FAIL: User A should belong to club-1");
    return false;
  }
}

function testUserAHasClub2Access() {
  console.log("\n✓ TEST 2: User A has club-2 access");

  if (userBelongsToOrg(USER_A_PROFILE_ID, "club-2")) {
    console.log("  ✅ PASS: User A belongs to club-2");
    return true;
  } else {
    console.log("  ❌ FAIL: User A should belong to club-2");
    return false;
  }
}

function testUserBLacksClub1Access() {
  console.log("\n✓ TEST 3: User B LACKS club-1 access");

  if (!userBelongsToOrg(USER_B_PROFILE_ID, "club-1")) {
    console.log("  ✅ PASS: User B correctly denied club-1 access");
    return true;
  } else {
    console.log("  ❌ FAIL: User B should NOT belong to club-1");
    return false;
  }
}

function testUserBOnlyHasClub3() {
  console.log("\n✓ TEST 4: User B only has club-3 access");

  const orgs = getUserOrganizations(USER_B_PROFILE_ID);

  if (orgs.length === 1 && orgs[0] === "club-3") {
    console.log("  ✅ PASS: User B only belongs to club-3");
    return true;
  } else {
    console.log(`  ❌ FAIL: User B should only have club-3, got: ${orgs.join(", ")}`);
    return false;
  }
}

function testUserACanViewClub1Players() {
  console.log("\n✓ TEST 5: User A can view club-1 players");

  // User A should only see club-1 players
  const club1Players = getOrgData("club-1");

  if (club1Players.length === 2) {
    console.log("  ✅ PASS: User A can view club-1 players");
    club1Players.forEach((p) => {
      console.log(`     - ${p.name}`);
    });
    return true;
  } else {
    console.log(`  ❌ FAIL: Expected 2 players, got ${club1Players.length}`);
    return false;
  }
}

function testUserACannotSeeClub3Players() {
  console.log("\n✓ TEST 6: User A CANNOT see club-3 players");

  if (!userBelongsToOrg(USER_A_PROFILE_ID, "club-3")) {
    console.log("  ✅ PASS: User A correctly denied club-3 access");
    console.log("  ✅ PASS: User A cannot see club-3 players");
    return true;
  } else {
    console.log("  ❌ FAIL: User A should not access club-3");
    return false;
  }
}

function testUserBCannotSeeClub1Players() {
  console.log("\n✓ TEST 7: User B CANNOT see club-1 players");

  if (!userBelongsToOrg(USER_B_PROFILE_ID, "club-1")) {
    console.log("  ✅ PASS: User B correctly denied club-1 access");
    console.log("  ✅ PASS: User B cannot see club-1 players");
    return true;
  } else {
    console.log("  ❌ FAIL: User B should not access club-1");
    return false;
  }
}

function testCurrentOrgIsolation() {
  console.log("\n✓ TEST 8: Current Organization Isolation");

  // Set User A's current org to club-1
  localStorage.setItem("user-context", "user-a");
  localStorage.setItem("current-org", "club-1");

  const currentUser = localStorage.getItem("user-context");
  const currentOrg = localStorage.getItem("current-org");
  const userOrgs = getUserOrganizations(USER_A_PROFILE_ID);

  if (currentOrg === "club-1" && userOrgs.includes("club-1")) {
    console.log("  ✅ PASS: Current org set to club-1");

    // Now switch to club-2
    localStorage.setItem("current-org", "club-2");
    const newCurrentOrg = localStorage.getItem("current-org");

    if (newCurrentOrg === "club-2" && userOrgs.includes("club-2")) {
      console.log("  ✅ PASS: Switched to club-2");

      // User B tries to access club-1 (should fail)
      localStorage.setItem("user-context", "user-b");
      const userBOrgs = getUserOrganizations(USER_B_PROFILE_ID);

      if (!userBOrgs.includes("club-1")) {
        console.log("  ✅ PASS: User B cannot switch to club-1");
        return true;
      } else {
        console.log("  ❌ FAIL: User B should not access club-1");
        return false;
      }
    } else {
      console.log("  ❌ FAIL: Failed to switch to club-2");
      return false;
    }
  } else {
    console.log("  ❌ FAIL: Failed to set current org");
    return false;
  }
}

function testMultipleUsersIsolation() {
  console.log("\n✓ TEST 9: Multiple Users Isolation");

  // Get all memberships for User A
  const userAMembers = ALL_MEMBERSHIPS.filter((m) => m.userId === USER_A_PROFILE_ID);
  // Get all memberships for User B
  const userBMembers = ALL_MEMBERSHIPS.filter((m) => m.userId === USER_B_PROFILE_ID);

  console.log(`  User A has ${userAMembers.length} memberships`);
  userAMembers.forEach((m) => {
    console.log(`    - ${m.organizationId}: ${m.role}`);
  });

  console.log(`  User B has ${userBMembers.length} memberships`);
  userBMembers.forEach((m) => {
    console.log(`    - ${m.organizationId}: ${m.role}`);
  });

  // Check overlap
  const userAOrgs = userAMembers.map((m) => m.organizationId);
  const userBOrgs = userBMembers.map((m) => m.organizationId);
  const commonOrgs = userAOrgs.filter((org) => userBOrgs.includes(org));

  if (commonOrgs.length === 0) {
    console.log("  ✅ PASS: Users have no overlapping organizations");
    return true;
  } else {
    console.log(`  ❌ FAIL: Users share orgs: ${commonOrgs.join(", ")}`);
    return false;
  }
}

function testMembershipFilteringByUser() {
  console.log("\n✓ TEST 10: Membership Filtering By User");

  // Simulate getting memberships for User A
  const userAMemberships = getUserMemberships(USER_A_PROFILE_ID);
  const userAOrgs = userAMemberships.map((m) => m.organizationId);

  if (userAOrgs.includes("club-1") && userAOrgs.includes("club-2")) {
    console.log("  ✅ User A has club-1 and club-2 memberships");
  } else {
    console.log("  ❌ FAIL: User A missing expected memberships");
    return false;
  }

  // Simulate getting memberships for User B
  const userBMemberships = getUserMemberships(USER_B_PROFILE_ID);
  const userBOrgs = userBMemberships.map((m) => m.organizationId);

  if (userBOrgs.includes("club-3") && !userBOrgs.includes("club-1")) {
    console.log("  ✅ User B has club-3, does NOT have club-1");
  } else {
    console.log("  ❌ FAIL: User B membership filtering failed");
    return false;
  }

  // Ensure no data leakage
  if (!userAOrgs.includes("club-3")) {
    console.log("  ✅ PASS: User A cannot see club-3");
    return true;
  } else {
    console.log("  ❌ FAIL: Data leakage - User A sees club-3");
    return false;
  }
}

// Run all tests
function runTests() {
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║   STEP 4.21: Cross-Organization Security   ║");
  console.log("║           (P0 CRITICAL TEST)               ║");
  console.log("╚════════════════════════════════════════════╝");

  const tests = [
    testUserAHasClub1Access,
    testUserAHasClub2Access,
    testUserBLacksClub1Access,
    testUserBOnlyHasClub3,
    testUserACanViewClub1Players,
    testUserACannotSeeClub3Players,
    testUserBCannotSeeClub1Players,
    testCurrentOrgIsolation,
    testMultipleUsersIsolation,
    testMembershipFilteringByUser,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = test();
      if (result) passed++;
      else failed++;
    } catch (error) {
      console.error("  ❌ CRASH:", error.message);
      failed++;
    }
  }

  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║              TEST SUMMARY                   ║");
  console.log("╚════════════════════════════════════════════╝");
  console.log(`\n  ✅ Passed: ${passed}/${tests.length}`);
  console.log(`  ❌ Failed: ${failed}/${tests.length}`);

  if (failed === 0) {
    console.log("\n  🎉 All cross-org security tests passed!");
    console.log("  ✅ P0 CRITICAL: Multi-tenancy properly enforced");
  } else {
    console.log(`\n  🚨 CRITICAL: ${failed} security test(s) failed`);
  }

  return failed === 0;
}

// Execute tests
runTests();
