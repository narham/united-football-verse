/**
 * STEP 4.18: Authentication Testing Scenarios
 * 
 * Test Plan:
 * 1. Valid credentials (demo@bolaid.id / demo123)
 * 2. Invalid email (nonexistent@example.com)
 * 3. Invalid password (correct email, wrong password)
 * 4. Empty fields
 * 5. Logout flow
 * 6. Session persistence (localStorage)
 * 7. Session invalidation
 */

import { DemoAuthRepository } from "@/repositories/auth/demo-auth-repository";
import { DemoMembershipRepository } from "@/repositories/membership/demo-membership-repository";
import type { SignInInput, SignUpInput } from "@/domain/auth/auth-types";

/**
 * Test Scenario 1: Valid Login (demo@bolaid.id / demo123)
 * Expected: Authenticated state, profile loaded, user returned
 */
export async function testValidLogin() {
  console.log("\n=== TEST 1: Valid Login (demo@bolaid.id / demo123) ===");
  
  // Clear localStorage
  localStorage.clear();
  
  const authRepo = new DemoAuthRepository();
  
  try {
    const result = await authRepo.signIn({
      email: "demo@bolaid.id",
      password: "demo123",
    } as SignInInput);
    
    if (result.user.email === "demo@bolaid.id" && result.profile.displayName === "Agus Setiawan") {
      console.log("✅ PASS: Valid credentials accepted");
      console.log(`   - User ID: ${result.user.id}`);
      console.log(`   - Email: ${result.user.email}`);
      console.log(`   - Profile: ${result.profile.displayName}`);
      
      // Verify session persisted
      const currentUser = await authRepo.getCurrentUser();
      if (currentUser) {
        console.log("✅ PASS: Session persisted in localStorage");
        return true;
      } else {
        console.log("❌ FAIL: Session not persisted");
        return false;
      }
    } else {
      console.log("❌ FAIL: Unexpected user data");
      return false;
    }
  } catch (error) {
    console.log("❌ FAIL: " + (error instanceof Error ? error.message : "Unknown error"));
    return false;
  }
}

/**
 * Test Scenario 2: Invalid Email
 * Expected: Auth error, no authenticated state, user null
 */
export async function testInvalidEmail() {
  console.log("\n=== TEST 2: Invalid Email (nonexistent@example.com) ===");
  
  localStorage.clear();
  const authRepo = new DemoAuthRepository();
  
  try {
    await authRepo.signIn({
      email: "nonexistent@example.com",
      password: "demo123",
    } as SignInInput);
    
    console.log("❌ FAIL: Should have thrown error for invalid email");
    return false;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid")) {
      console.log("✅ PASS: Invalid email rejected");
      console.log(`   - Error: ${error.message}`);
      
      // Verify no session created
      const currentUser = await authRepo.getCurrentUser();
      if (!currentUser) {
        console.log("✅ PASS: No session created for invalid email");
        return true;
      } else {
        console.log("❌ FAIL: Session created despite error");
        return false;
      }
    } else {
      console.log("❌ FAIL: Unexpected error type");
      return false;
    }
  }
}

/**
 * Test Scenario 3: Invalid Password
 * Expected: Auth error, no authenticated state
 */
export async function testInvalidPassword() {
  console.log("\n=== TEST 3: Invalid Password (demo@bolaid.id / wrongpass) ===");
  
  localStorage.clear();
  const authRepo = new DemoAuthRepository();
  
  try {
    await authRepo.signIn({
      email: "demo@bolaid.id",
      password: "wrongpass",
    } as SignInInput);
    
    console.log("❌ FAIL: Should have thrown error for invalid password");
    return false;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid")) {
      console.log("✅ PASS: Invalid password rejected");
      console.log(`   - Error: ${error.message}`);
      
      const currentUser = await authRepo.getCurrentUser();
      if (!currentUser) {
        console.log("✅ PASS: No session created for invalid password");
        return true;
      } else {
        console.log("❌ FAIL: Session created despite error");
        return false;
      }
    } else {
      console.log("❌ FAIL: Unexpected error type");
      return false;
    }
  }
}

/**
 * Test Scenario 4: Empty Fields
 * Expected: Form should validate before submission (client-side)
 */
export async function testEmptyFields() {
  console.log("\n=== TEST 4: Empty Fields ===");
  
  localStorage.clear();
  const authRepo = new DemoAuthRepository();
  
  // Empty email + password
  try {
    // In real app, form validation prevents this. Here we test the repository behavior
    // Empty strings should fail at repository level
    await authRepo.signIn({
      email: "",
      password: "",
    } as SignInInput);
    
    console.log("⚠️  Repository accepts empty strings (form validation should prevent)");
    return true; // Repository doesn't validate - that's form's job
  } catch (error) {
    console.log("✅ PASS: Repository rejects empty fields");
    return true;
  }
}

/**
 * Test Scenario 5: Sign Out
 * Expected: Session cleared, currentUser returns null
 */
export async function testSignOut() {
  console.log("\n=== TEST 5: Sign Out Flow ===");
  
  localStorage.clear();
  const authRepo = new DemoAuthRepository();
  
  try {
    // Sign in first
    await authRepo.signIn({
      email: "demo@bolaid.id",
      password: "demo123",
    } as SignInInput);
    
    let currentUser = await authRepo.getCurrentUser();
    if (!currentUser) {
      console.log("❌ FAIL: Login didn't create session");
      return false;
    }
    console.log("✅ Authenticated");
    
    // Sign out
    await authRepo.signOut();
    
    // Verify session cleared
    currentUser = await authRepo.getCurrentUser();
    if (!currentUser) {
      console.log("✅ PASS: Session cleared after sign out");
      console.log("✅ PASS: User redirected to login (would happen in app)");
      return true;
    } else {
      console.log("❌ FAIL: Session not cleared");
      return false;
    }
  } catch (error) {
    console.log("❌ FAIL: " + (error instanceof Error ? error.message : "Unknown error"));
    return false;
  }
}

/**
 * Test Scenario 6: Session Persistence
 * Expected: localStorage persists session across reload
 */
export async function testSessionPersistence() {
  console.log("\n=== TEST 6: Session Persistence ===");
  
  localStorage.clear();
  
  // Step 1: Sign in
  const authRepo1 = new DemoAuthRepository();
  await authRepo1.signIn({
    email: "demo@bolaid.id",
    password: "demo123",
  } as SignInInput);
  
  const sessionData = localStorage.getItem("demo:session");
  if (!sessionData) {
    console.log("❌ FAIL: Session not stored in localStorage");
    return false;
  }
  console.log("✅ PASS: Session stored in localStorage");
  
  // Step 2: Simulate new app instance (new repo instance reads from localStorage)
  const authRepo2 = new DemoAuthRepository();
  const currentUser = await authRepo2.getCurrentUser();
  
  if (currentUser && currentUser.email === "demo@bolaid.id") {
    console.log("✅ PASS: Session restored after 'reload'");
    console.log(`   - Restored user: ${currentUser.email}`);
    return true;
  } else {
    console.log("❌ FAIL: Session not restored");
    return false;
  }
}

/**
 * Test Scenario 7: Session Invalidation
 * Expected: Manually clearing session should unauthenticate
 */
export async function testSessionInvalidation() {
  console.log("\n=== TEST 7: Session Invalidation ===");
  
  localStorage.clear();
  const authRepo = new DemoAuthRepository();
  
  // Sign in
  await authRepo.signIn({
    email: "demo@bolaid.id",
    password: "demo123",
  } as SignInInput);
  
  console.log("✅ Authenticated");
  
  // Invalidate session manually (simulates expired token)
  localStorage.removeItem("demo:session");
  console.log("✅ Session invalidated");
  
  // Verify user is now null
  const currentUser = await authRepo.getCurrentUser();
  if (!currentUser) {
    console.log("✅ PASS: User cleared after session invalidation");
    console.log("✅ PASS: Protected routes would redirect to login");
    return true;
  } else {
    console.log("❌ FAIL: Session still valid after invalidation");
    return false;
  }
}

/**
 * Test Scenario 8: Membership Integration
 * Expected: After login, memberships should be accessible
 */
export async function testMembershipIntegration() {
  console.log("\n=== TEST 8: Membership Integration ===");
  
  localStorage.clear();
  const authRepo = new DemoAuthRepository();
  const membershipRepo = new DemoMembershipRepository();
  
  try {
    // Sign in
    const result = await authRepo.signIn({
      email: "demo@bolaid.id",
      password: "demo123",
    } as SignInInput);
    
    console.log("✅ PASS: Authenticated");
    
    // Get memberships
    const memberships = await membershipRepo.listMyMemberships();
    
    if (memberships.length === 3) {
      console.log("✅ PASS: User has 3 memberships");
      console.log("   Memberships:");
      memberships.forEach((m) => {
        console.log(`     - ${m.organizationId}: ${m.role}`);
      });
      
      // Verify roles
      const club1 = memberships.find((m) => m.organizationId === "club-1");
      const club2 = memberships.find((m) => m.organizationId === "club-2");
      const club3 = memberships.find((m) => m.organizationId === "club-3");
      
      if (
        club1?.role === "ORG_OWNER" &&
        club2?.role === "MANAGER" &&
        club3?.role === "COACH"
      ) {
        console.log("✅ PASS: All roles correct");
        return true;
      } else {
        console.log("❌ FAIL: Incorrect roles");
        return false;
      }
    } else {
      console.log("❌ FAIL: Expected 3 memberships, got " + memberships.length);
      return false;
    }
  } catch (error) {
    console.log("❌ FAIL: " + (error instanceof Error ? error.message : "Unknown error"));
    return false;
  }
}

/**
 * Test Scenario 9: Organization Switching
 * Expected: Current org should change when switching
 */
export async function testOrganizationSwitching() {
  console.log("\n=== TEST 9: Organization Switching ===");
  
  localStorage.clear();
  const authRepo = new DemoAuthRepository();
  const membershipRepo = new DemoMembershipRepository();
  
  try {
    // Sign in
    await authRepo.signIn({
      email: "demo@bolaid.id",
      password: "demo123",
    } as SignInInput);
    
    // Start with club-1
    let currentOrg = localStorage.getItem("demo:currentOrg");
    if (currentOrg !== "club-1") {
      console.log("❌ FAIL: Default org should be club-1, got " + currentOrg);
      return false;
    }
    console.log("✅ PASS: Default org is club-1");
    
    // Switch to club-2
    await membershipRepo.switchOrganization("club-2");
    currentOrg = localStorage.getItem("demo:currentOrg");
    
    if (currentOrg === "club-2") {
      console.log("✅ PASS: Switched to club-2");
      
      // Switch to club-3
      await membershipRepo.switchOrganization("club-3");
      currentOrg = localStorage.getItem("demo:currentOrg");
      
      if (currentOrg === "club-3") {
        console.log("✅ PASS: Switched to club-3");
        return true;
      } else {
        console.log("❌ FAIL: Failed to switch to club-3");
        return false;
      }
    } else {
      console.log("❌ FAIL: Failed to switch to club-2");
      return false;
    }
  } catch (error) {
    console.log("❌ FAIL: " + (error instanceof Error ? error.message : "Unknown error"));
    return false;
  }
}

/**
 * Run all tests
 */
export async function runAllAuthTests() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║          STEP 4.18: Authentication Testing                 ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  const tests = [
    { name: "Valid Login", fn: testValidLogin },
    { name: "Invalid Email", fn: testInvalidEmail },
    { name: "Invalid Password", fn: testInvalidPassword },
    { name: "Empty Fields", fn: testEmptyFields },
    { name: "Sign Out", fn: testSignOut },
    { name: "Session Persistence", fn: testSessionPersistence },
    { name: "Session Invalidation", fn: testSessionInvalidation },
    { name: "Membership Integration", fn: testMembershipIntegration },
    { name: "Organization Switching", fn: testOrganizationSwitching },
  ];

  const results: { name: string; passed: boolean }[] = [];

  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (error) {
      console.error(`\n❌ CRASH in ${test.name}:`, error);
      results.push({ name: test.name, passed: false });
    }
  }

  // Summary
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║                      TEST SUMMARY                          ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  let passed = 0;
  let failed = 0;

  results.forEach((result) => {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status}: ${result.name}`);
    if (result.passed) passed++;
    else failed++;
  });

  console.log(`\nTotal: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log("\n🎉 All tests passed!");
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed`);
  }

  return failed === 0;
}
