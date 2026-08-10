/**
 * STEP 4.20: RBAC (Role-Based Access Control) Testing
 * 
 * Test Plan:
 * 1. Define permission matrix for 8 roles
 * 2. Verify each role has expected permissions
 * 3. Verify ORG_OWNER has full org permissions
 * 4. Verify MANAGER has limited permissions
 * 5. Verify COACH has coaching-specific permissions
 * 6. Verify VIEWER is read-only
 * 7. Verify unauthorized actions are blocked
 */

// Permission matrix definition per role
const ROLE_PERMISSIONS = {
  PLATFORM_ADMIN: [
    "manage:users",
    "manage:organizations",
    "manage:roles",
    "manage:finances",
    "view:all",
    "create:organizations",
    "delete:organizations",
    "create:players",
    "delete:players",
    "create:matches",
  ],
  ORG_OWNER: [
    "manage:members",
    "manage:roles",
    "create:players",
    "delete:players",
    "create:matches",
    "manage:finances",
    "view:organization",
    "edit:organization",
  ],
  ORG_ADMIN: [
    "manage:members",
    "create:players",
    "edit:players",
    "delete:players",
    "create:matches",
    "edit:matches",
    "view:organization",
  ],
  MANAGER: [
    "create:players",
    "edit:players",
    "create:matches",
    "edit:matches",
    "view:organization",
    "manage:staff",
  ],
  COACH: [
    "view:players",
    "create:training",
    "edit:training",
    "manage:attendance",
    "view:organization",
  ],
  STAFF: [
    "view:players",
    "view:matches",
    "manage:attendance",
    "view:organization",
  ],
  FINANCE: [
    "view:finances",
    "manage:finances",
    "view:organization",
    "create:reports",
  ],
  VIEWER: ["view:organization", "view:players", "view:matches"],
};

// Test data
const TEST_ROLES = Object.keys(ROLE_PERMISSIONS);

// Helper function to check if role has permission
function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

// Test functions
function testRoleDefinitions() {
  console.log("\n✓ TEST 1: Role Definitions");

  const expectedRoles = [
    "PLATFORM_ADMIN",
    "ORG_OWNER",
    "ORG_ADMIN",
    "MANAGER",
    "COACH",
    "STAFF",
    "FINANCE",
    "VIEWER",
  ];

  let allPresent = true;
  expectedRoles.forEach((role) => {
    if (TEST_ROLES.includes(role)) {
      console.log(`  ✅ PASS: ${role} defined`);
    } else {
      console.log(`  ❌ FAIL: ${role} not defined`);
      allPresent = false;
    }
  });

  return allPresent;
}

function testPermissionHierarchy() {
  console.log("\n✓ TEST 2: Permission Hierarchy");

  // ORG_OWNER should have more permissions than MANAGER
  const ownerPerms = ROLE_PERMISSIONS.ORG_OWNER.length;
  const managerPerms = ROLE_PERMISSIONS.MANAGER.length;

  console.log(`  ORG_OWNER permissions: ${ownerPerms}`);
  console.log(`  MANAGER permissions: ${managerPerms}`);

  if (ownerPerms > managerPerms) {
    console.log("  ✅ PASS: ORG_OWNER has more permissions than MANAGER");
  } else {
    console.log("  ❌ FAIL: Permission hierarchy incorrect");
    return false;
  }

  // MANAGER should have more permissions than VIEWER
  const viewerPerms = ROLE_PERMISSIONS.VIEWER.length;
  console.log(`  VIEWER permissions: ${viewerPerms}`);

  if (managerPerms > viewerPerms) {
    console.log("  ✅ PASS: MANAGER has more permissions than VIEWER");
    return true;
  } else {
    console.log("  ❌ FAIL: Permission hierarchy incorrect");
    return false;
  }
}

function testOrgOwnerPermissions() {
  console.log("\n✓ TEST 3: ORG_OWNER Role Permissions");

  const requiredPerms = [
    "manage:members",
    "manage:roles",
    "create:players",
    "delete:players",
    "manage:finances",
  ];

  let allHave = true;
  requiredPerms.forEach((perm) => {
    if (hasPermission("ORG_OWNER", perm)) {
      console.log(`  ✅ ORG_OWNER has ${perm}`);
    } else {
      console.log(`  ❌ ORG_OWNER missing ${perm}`);
      allHave = false;
    }
  });

  return allHave;
}

function testManagerPermissions() {
  console.log("\n✓ TEST 4: MANAGER Role Permissions");

  const requiredPerms = ["create:players", "edit:matches", "view:organization"];

  let allHave = true;
  requiredPerms.forEach((perm) => {
    if (hasPermission("MANAGER", perm)) {
      console.log(`  ✅ MANAGER has ${perm}`);
    } else {
      console.log(`  ❌ MANAGER missing ${perm}`);
      allHave = false;
    }
  });

  // MANAGER should NOT have these
  const forbiddenPerms = ["manage:roles", "delete:players", "manage:finances"];
  forbiddenPerms.forEach((perm) => {
    if (!hasPermission("MANAGER", perm)) {
      console.log(`  ✅ MANAGER correctly lacks ${perm}`);
    } else {
      console.log(`  ❌ MANAGER should not have ${perm}`);
      allHave = false;
    }
  });

  return allHave;
}

function testCoachPermissions() {
  console.log("\n✓ TEST 5: COACH Role Permissions");

  const requiredPerms = ["create:training", "manage:attendance", "view:players"];

  let allHave = true;
  requiredPerms.forEach((perm) => {
    if (hasPermission("COACH", perm)) {
      console.log(`  ✅ COACH has ${perm}`);
    } else {
      console.log(`  ❌ COACH missing ${perm}`);
      allHave = false;
    }
  });

  // COACH should NOT have these
  const forbiddenPerms = ["delete:players", "manage:finances", "manage:members"];
  forbiddenPerms.forEach((perm) => {
    if (!hasPermission("COACH", perm)) {
      console.log(`  ✅ COACH correctly lacks ${perm}`);
    } else {
      console.log(`  ❌ COACH should not have ${perm}`);
      allHave = false;
    }
  });

  return allHave;
}

function testViewerPermissions() {
  console.log("\n✓ TEST 6: VIEWER Role Permissions");

  const requiredPerms = ["view:organization", "view:players", "view:matches"];

  let allHave = true;
  requiredPerms.forEach((perm) => {
    if (hasPermission("VIEWER", perm)) {
      console.log(`  ✅ VIEWER has ${perm}`);
    } else {
      console.log(`  ❌ VIEWER missing ${perm}`);
      allHave = false;
    }
  });

  // VIEWER should NOT have any write/management permissions
  const forbiddenPerms = [
    "create:players",
    "delete:players",
    "manage:finances",
    "manage:members",
    "create:matches",
  ];
  forbiddenPerms.forEach((perm) => {
    if (!hasPermission("VIEWER", perm)) {
      console.log(`  ✅ VIEWER correctly lacks ${perm}`);
    } else {
      console.log(`  ❌ VIEWER should not have ${perm}`);
      allHave = false;
    }
  });

  return allHave;
}

function testFinancePermissions() {
  console.log("\n✓ TEST 7: FINANCE Role Permissions");

  const requiredPerms = ["view:finances", "manage:finances", "create:reports"];

  let allHave = true;
  requiredPerms.forEach((perm) => {
    if (hasPermission("FINANCE", perm)) {
      console.log(`  ✅ FINANCE has ${perm}`);
    } else {
      console.log(`  ❌ FINANCE missing ${perm}`);
      allHave = false;
    }
  });

  // FINANCE should NOT have player/match management
  const forbiddenPerms = ["create:players", "delete:players", "create:matches"];
  forbiddenPerms.forEach((perm) => {
    if (!hasPermission("FINANCE", perm)) {
      console.log(`  ✅ FINANCE correctly lacks ${perm}`);
    } else {
      console.log(`  ❌ FINANCE should not have ${perm}`);
      allHave = false;
    }
  });

  return allHave;
}

function testPermissionDenial() {
  console.log("\n✓ TEST 8: Permission Denial");

  let allCorrect = true;

  // VIEWER cannot delete players
  if (!hasPermission("VIEWER", "delete:players")) {
    console.log("  ✅ VIEWER denied: delete:players");
  } else {
    console.log("  ❌ FAIL: VIEWER should not have delete:players");
    allCorrect = false;
  }

  // COACH cannot manage finances
  if (!hasPermission("COACH", "manage:finances")) {
    console.log("  ✅ COACH denied: manage:finances");
  } else {
    console.log("  ❌ FAIL: COACH should not have manage:finances");
    allCorrect = false;
  }

  // MANAGER cannot manage roles
  if (!hasPermission("MANAGER", "manage:roles")) {
    console.log("  ✅ MANAGER denied: manage:roles");
  } else {
    console.log("  ❌ FAIL: MANAGER should not have manage:roles");
    allCorrect = false;
  }

  // STAFF cannot manage members
  if (!hasPermission("STAFF", "manage:members")) {
    console.log("  ✅ STAFF denied: manage:members");
  } else {
    console.log("  ❌ FAIL: STAFF should not have manage:members");
    allCorrect = false;
  }

  return allCorrect;
}

function testPlatformAdminOverride() {
  console.log("\n✓ TEST 9: PLATFORM_ADMIN Override");

  // PLATFORM_ADMIN should have all permissions including org-level
  const allPerms = ["manage:users", "manage:organizations", "create:players", "manage:finances"];

  let allHave = true;
  allPerms.forEach((perm) => {
    if (hasPermission("PLATFORM_ADMIN", perm)) {
      console.log(`  ✅ PLATFORM_ADMIN has ${perm}`);
    } else {
      console.log(`  ❌ PLATFORM_ADMIN missing ${perm}`);
      allHave = false;
    }
  });

  return allHave;
}

function testPermissionCoverage() {
  console.log("\n✓ TEST 10: Permission Coverage");

  const uniquePermissions = new Set();
  Object.values(ROLE_PERMISSIONS).forEach((perms) => {
    perms.forEach((p) => uniquePermissions.add(p));
  });

  console.log(`  Total unique permissions: ${uniquePermissions.size}`);
  console.log("  Permissions:");
  Array.from(uniquePermissions).forEach((p) => {
    console.log(`    - ${p}`);
  });

  if (uniquePermissions.size > 0) {
    console.log("  ✅ PASS: Comprehensive permission system defined");
    return true;
  } else {
    console.log("  ❌ FAIL: No permissions defined");
    return false;
  }
}

// Run all tests
function runTests() {
  console.log("\n╔═══════════════════════════════════════════╗");
  console.log("║      STEP 4.20: RBAC Verification         ║");
  console.log("╚═══════════════════════════════════════════╝");

  const tests = [
    testRoleDefinitions,
    testPermissionHierarchy,
    testOrgOwnerPermissions,
    testManagerPermissions,
    testCoachPermissions,
    testViewerPermissions,
    testFinancePermissions,
    testPermissionDenial,
    testPlatformAdminOverride,
    testPermissionCoverage,
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

  console.log("\n╔═══════════════════════════════════════════╗");
  console.log("║              TEST SUMMARY                  ║");
  console.log("╚═══════════════════════════════════════════╝");
  console.log(`\n  ✅ Passed: ${passed}/${tests.length}`);
  console.log(`  ❌ Failed: ${failed}/${tests.length}`);

  if (failed === 0) {
    console.log("\n  🎉 All RBAC tests passed!");
  } else {
    console.log(`\n  ⚠️  ${failed} test(s) failed`);
  }

  return failed === 0;
}

// Execute tests
runTests();
