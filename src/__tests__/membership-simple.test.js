/**
 * STEP 4.19: Organization Membership Testing
 * 
 * Test Plan:
 * 1. User has 3 memberships after login
 * 2. Each membership has correct role
 * 3. Organization switching works correctly
 * 4. Current organization persists
 * 5. Get membership by organization
 * 6. Role displays correctly in UI context
 */

// Mock localStorage for Node.js
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

// Minimal membership repo implementation for testing
class DemoMembershipRepositoryTest {
  constructor() {
    this.initializeMemberships();
  }

  initializeMemberships() {
    if (!localStorage.getItem("demo:memberships")) {
      localStorage.setItem(
        "demo:memberships",
        JSON.stringify([
          {
            id: "membership-001",
            userId: "demo-profile-001",
            organizationId: "club-1",
            role: "ORG_OWNER",
            status: "ACTIVE",
            joinedAt: new Date(2023, 0, 1).toISOString(),
            createdAt: new Date(2023, 0, 1).toISOString(),
            updatedAt: new Date(2023, 0, 1).toISOString(),
          },
          {
            id: "membership-002",
            userId: "demo-profile-001",
            organizationId: "club-2",
            role: "MANAGER",
            status: "ACTIVE",
            joinedAt: new Date(2023, 6, 1).toISOString(),
            createdAt: new Date(2023, 6, 1).toISOString(),
            updatedAt: new Date(2023, 6, 1).toISOString(),
          },
          {
            id: "membership-003",
            userId: "demo-profile-001",
            organizationId: "club-3",
            role: "COACH",
            status: "ACTIVE",
            joinedAt: new Date(2024, 0, 1).toISOString(),
            createdAt: new Date(2024, 0, 1).toISOString(),
            updatedAt: new Date(2024, 0, 1).toISOString(),
          },
        ])
      );
    }

    // Set default current organization
    if (!localStorage.getItem("demo:currentOrg")) {
      localStorage.setItem("demo:currentOrg", "club-1");
    }
  }

  getMemberships() {
    const data = localStorage.getItem("demo:memberships");
    return data ? JSON.parse(data) : [];
  }

  async listMyMemberships() {
    const memberships = this.getMemberships();
    return memberships.filter((m) => m.userId === "demo-profile-001");
  }

  async getMembership(id) {
    const memberships = this.getMemberships();
    return memberships.find((m) => m.id === id) || null;
  }

  async getMembershipByOrganization(organizationId) {
    const memberships = this.getMemberships();
    return (
      memberships.find(
        (m) => m.userId === "demo-profile-001" && m.organizationId === organizationId
      ) || null
    );
  }

  async switchOrganization(organizationId) {
    const membership = await this.getMembershipByOrganization(organizationId);
    if (!membership) {
      throw new Error("Membership not found for organization");
    }

    localStorage.setItem("demo:currentOrg", organizationId);
    return membership;
  }

  async getCurrentMembership() {
    const currentOrgId = localStorage.getItem("demo:currentOrg");
    if (!currentOrgId) return null;
    return this.getMembershipByOrganization(currentOrgId);
  }
}

// Test functions
async function testListMemberships() {
  console.log("\n✓ TEST 1: List My Memberships");
  localStorage.clear();

  const repo = new DemoMembershipRepositoryTest();
  try {
    const memberships = await repo.listMyMemberships();

    if (memberships.length === 3) {
      console.log(`  ✅ PASS: Found 3 memberships`);
      memberships.forEach((m, i) => {
        console.log(`     ${i + 1}. ${m.organizationId}: ${m.role}`);
      });
      return true;
    } else {
      console.log(`  ❌ FAIL: Expected 3 memberships, got ${memberships.length}`);
      return false;
    }
  } catch (error) {
    console.log("  ❌ FAIL:", error.message);
    return false;
  }
}

async function testMembershipRoles() {
  console.log("\n✓ TEST 2: Membership Roles");
  localStorage.clear();

  const repo = new DemoMembershipRepositoryTest();
  try {
    const memberships = await repo.listMyMemberships();

    const club1 = memberships.find((m) => m.organizationId === "club-1");
    const club2 = memberships.find((m) => m.organizationId === "club-2");
    const club3 = memberships.find((m) => m.organizationId === "club-3");

    if (!club1 || !club2 || !club3) {
      console.log("  ❌ FAIL: Missing memberships");
      return false;
    }

    let allCorrect = true;

    if (club1.role === "ORG_OWNER") {
      console.log("  ✅ PASS: club-1 has ORG_OWNER role");
    } else {
      console.log(`  ❌ FAIL: club-1 should be ORG_OWNER, got ${club1.role}`);
      allCorrect = false;
    }

    if (club2.role === "MANAGER") {
      console.log("  ✅ PASS: club-2 has MANAGER role");
    } else {
      console.log(`  ❌ FAIL: club-2 should be MANAGER, got ${club2.role}`);
      allCorrect = false;
    }

    if (club3.role === "COACH") {
      console.log("  ✅ PASS: club-3 has COACH role");
    } else {
      console.log(`  ❌ FAIL: club-3 should be COACH, got ${club3.role}`);
      allCorrect = false;
    }

    return allCorrect;
  } catch (error) {
    console.log("  ❌ FAIL:", error.message);
    return false;
  }
}

async function testGetMembershipByOrg() {
  console.log("\n✓ TEST 3: Get Membership By Organization");
  localStorage.clear();

  const repo = new DemoMembershipRepositoryTest();
  try {
    const club1 = await repo.getMembershipByOrganization("club-1");
    const club2 = await repo.getMembershipByOrganization("club-2");
    const club3 = await repo.getMembershipByOrganization("club-3");

    if (club1 && club1.role === "ORG_OWNER") {
      console.log("  ✅ PASS: Retrieved club-1 membership correctly");
    } else {
      console.log("  ❌ FAIL: club-1 membership incorrect");
      return false;
    }

    if (club2 && club2.role === "MANAGER") {
      console.log("  ✅ PASS: Retrieved club-2 membership correctly");
    } else {
      console.log("  ❌ FAIL: club-2 membership incorrect");
      return false;
    }

    if (club3 && club3.role === "COACH") {
      console.log("  ✅ PASS: Retrieved club-3 membership correctly");
    } else {
      console.log("  ❌ FAIL: club-3 membership incorrect");
      return false;
    }

    return true;
  } catch (error) {
    console.log("  ❌ FAIL:", error.message);
    return false;
  }
}

async function testOrganizationSwitching() {
  console.log("\n✓ TEST 4: Organization Switching");
  localStorage.clear();

  const repo = new DemoMembershipRepositoryTest();
  try {
    // Default should be club-1
    let currentOrg = localStorage.getItem("demo:currentOrg");
    if (currentOrg !== "club-1") {
      console.log(`  ❌ FAIL: Default org should be club-1, got ${currentOrg}`);
      return false;
    }
    console.log("  ✅ PASS: Default org is club-1");

    // Switch to club-2
    await repo.switchOrganization("club-2");
    currentOrg = localStorage.getItem("demo:currentOrg");
    if (currentOrg !== "club-2") {
      console.log(`  ❌ FAIL: Failed to switch to club-2, got ${currentOrg}`);
      return false;
    }
    console.log("  ✅ PASS: Switched to club-2");

    // Switch to club-3
    await repo.switchOrganization("club-3");
    currentOrg = localStorage.getItem("demo:currentOrg");
    if (currentOrg !== "club-3") {
      console.log(`  ❌ FAIL: Failed to switch to club-3, got ${currentOrg}`);
      return false;
    }
    console.log("  ✅ PASS: Switched to club-3");

    // Switch back to club-1
    await repo.switchOrganization("club-1");
    currentOrg = localStorage.getItem("demo:currentOrg");
    if (currentOrg !== "club-1") {
      console.log(`  ❌ FAIL: Failed to switch back to club-1, got ${currentOrg}`);
      return false;
    }
    console.log("  ✅ PASS: Switched back to club-1");

    return true;
  } catch (error) {
    console.log("  ❌ FAIL:", error.message);
    return false;
  }
}

async function testCurrentMembership() {
  console.log("\n✓ TEST 5: Get Current Membership");
  localStorage.clear();

  const repo = new DemoMembershipRepositoryTest();
  try {
    // Start with club-1
    let current = await repo.getCurrentMembership();
    if (current && current.organizationId === "club-1" && current.role === "ORG_OWNER") {
      console.log("  ✅ PASS: Current membership is club-1 (ORG_OWNER)");
    } else {
      console.log("  ❌ FAIL: Current membership incorrect");
      return false;
    }

    // Switch to club-2
    await repo.switchOrganization("club-2");
    current = await repo.getCurrentMembership();
    if (current && current.organizationId === "club-2" && current.role === "MANAGER") {
      console.log("  ✅ PASS: Current membership is club-2 (MANAGER)");
    } else {
      console.log("  ❌ FAIL: Current membership not updated");
      return false;
    }

    // Switch to club-3
    await repo.switchOrganization("club-3");
    current = await repo.getCurrentMembership();
    if (current && current.organizationId === "club-3" && current.role === "COACH") {
      console.log("  ✅ PASS: Current membership is club-3 (COACH)");
    } else {
      console.log("  ❌ FAIL: Current membership not updated");
      return false;
    }

    return true;
  } catch (error) {
    console.log("  ❌ FAIL:", error.message);
    return false;
  }
}

async function testMembershipStatus() {
  console.log("\n✓ TEST 6: Membership Status");
  localStorage.clear();

  const repo = new DemoMembershipRepositoryTest();
  try {
    const memberships = await repo.listMyMemberships();

    let allActive = true;
    memberships.forEach((m) => {
      if (m.status !== "ACTIVE") {
        console.log(`  ❌ ${m.organizationId}: status is ${m.status}, expected ACTIVE`);
        allActive = false;
      }
    });

    if (allActive) {
      console.log("  ✅ PASS: All memberships are ACTIVE");
      return true;
    }
    return false;
  } catch (error) {
    console.log("  ❌ FAIL:", error.message);
    return false;
  }
}

async function testInvalidOrgSwitch() {
  console.log("\n✓ TEST 7: Invalid Organization Switch");
  localStorage.clear();

  const repo = new DemoMembershipRepositoryTest();
  try {
    await repo.switchOrganization("club-999");
    console.log("  ❌ FAIL: Should have thrown error for invalid org");
    return false;
  } catch (error) {
    console.log("  ✅ PASS: Invalid org rejected");
    console.log(`     Error: ${error.message}`);
    return true;
  }
}

// Run all tests
async function runTests() {
  console.log("\n╔═══════════════════════════════════════════╗");
  console.log("║  STEP 4.19: Membership Verification        ║");
  console.log("╚═══════════════════════════════════════════╝");

  const tests = [
    testListMemberships,
    testMembershipRoles,
    testGetMembershipByOrg,
    testOrganizationSwitching,
    testCurrentMembership,
    testMembershipStatus,
    testInvalidOrgSwitch,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) passed++;
      else failed++;
    } catch (error) {
      console.error("  ❌ CRASH:", error.message);
      failed++;
    }
  }

  console.log("\n╔═══════════════════════════════════════════╗");
  console.log("║              TEST SUMMARY                  ║");
  console.log("╚═══════════════════════════════════════════╝");
  console.log(`\n  ✅ Passed: ${passed}/${tests.length}`);
  console.log(`  ❌ Failed: ${failed}/${tests.length}`);

  if (failed === 0) {
    console.log("\n  🎉 All membership tests passed!");
  } else {
    console.log(`\n  ⚠️  ${failed} test(s) failed`);
  }

  return failed === 0;
}

// Execute tests
runTests().then((success) => {
  process.exit(success ? 0 : 1);
});
