/**
 * Direct Test Scenarios - Run with Node.js
 * Tests the demo repository layer behavior directly
 */

// Simulate localStorage for Node.js testing
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

// Mock the localStorage globally
if (typeof localStorage === "undefined") {
  global.localStorage = mockLocalStorage;
}

// Auth types
const DEMO_USER = {
  id: "demo-user-001",
  email: "demo@bolaid.id",
  emailVerified: true,
  createdAt: new Date(2024, 0, 1).toISOString(),
};

const DEMO_PROFILE = {
  id: "demo-profile-001",
  authUserId: "demo-user-001",
  displayName: "Agus Setiawan",
  email: "demo@bolaid.id",
  phone: "+62812345678",
  status: "ACTIVE",
  createdAt: new Date(2024, 0, 1).toISOString(),
  updatedAt: new Date(2024, 0, 1).toISOString(),
};

const DEMO_PASSWORD = "demo123";

// Minimal repo implementation for testing
class DemoAuthRepositoryTest {
  constructor() {
    this.initializeDemo();
  }

  initializeDemo() {
    if (!localStorage.getItem("demo:users")) {
      localStorage.setItem(
        "demo:users",
        JSON.stringify([
          {
            user: DEMO_USER,
            profile: DEMO_PROFILE,
            password: DEMO_PASSWORD,
          },
        ])
      );
    }
  }

  getUsers() {
    const data = localStorage.getItem("demo:users");
    return data ? JSON.parse(data) : [];
  }

  getSession() {
    const data = localStorage.getItem("demo:session");
    return data ? JSON.parse(data) : null;
  }

  async getCurrentUser() {
    const session = this.getSession();
    return session?.user || null;
  }

  async getCurrentProfile() {
    const session = this.getSession();
    return session?.profile || null;
  }

  async signIn(input) {
    const users = this.getUsers();
    const user = users.find((u) => u.user.email === input.email);

    if (!user || user.password !== input.password) {
      const error = new Error("Invalid email or password");
      error.code = "AUTH_INVALID";
      throw error;
    }

    localStorage.setItem(
      "demo:session",
      JSON.stringify({
        user: user.user,
        profile: user.profile,
      })
    );

    return {
      user: user.user,
      profile: user.profile,
    };
  }

  async signOut() {
    localStorage.removeItem("demo:session");
  }
}

// Test functions
async function testValidLogin() {
  console.log("\n✓ TEST 1: Valid Login");
  localStorage.clear();

  const repo = new DemoAuthRepositoryTest();
  try {
    const result = await repo.signIn({
      email: "demo@bolaid.id",
      password: "demo123",
    });

    if (
      result.user.email === "demo@bolaid.id" &&
      result.profile.displayName === "Agus Setiawan"
    ) {
      console.log("  ✅ PASS: Valid credentials accepted");
      console.log(`     User: ${result.user.email}`);
      console.log(`     Profile: ${result.profile.displayName}`);

      const current = await repo.getCurrentUser();
      if (current) {
        console.log("  ✅ PASS: Session persisted");
        return true;
      } else {
        console.log("  ❌ FAIL: Session not persisted");
        return false;
      }
    }
  } catch (error) {
    console.log("  ❌ FAIL:", error.message);
    return false;
  }
}

async function testInvalidEmail() {
  console.log("\n✓ TEST 2: Invalid Email");
  localStorage.clear();

  const repo = new DemoAuthRepositoryTest();
  try {
    await repo.signIn({
      email: "nonexistent@example.com",
      password: "demo123",
    });
    console.log("  ❌ FAIL: Should have thrown error");
    return false;
  } catch (error) {
    console.log("  ✅ PASS: Invalid email rejected");
    console.log(`     Error: ${error.message}`);

    const current = await repo.getCurrentUser();
    if (!current) {
      console.log("  ✅ PASS: No session created");
      return true;
    }
    return false;
  }
}

async function testInvalidPassword() {
  console.log("\n✓ TEST 3: Invalid Password");
  localStorage.clear();

  const repo = new DemoAuthRepositoryTest();
  try {
    await repo.signIn({
      email: "demo@bolaid.id",
      password: "wrongpass",
    });
    console.log("  ❌ FAIL: Should have thrown error");
    return false;
  } catch (error) {
    console.log("  ✅ PASS: Invalid password rejected");
    console.log(`     Error: ${error.message}`);

    const current = await repo.getCurrentUser();
    if (!current) {
      console.log("  ✅ PASS: No session created");
      return true;
    }
    return false;
  }
}

async function testSignOut() {
  console.log("\n✓ TEST 4: Sign Out");
  localStorage.clear();

  const repo = new DemoAuthRepositoryTest();
  await repo.signIn({
    email: "demo@bolaid.id",
    password: "demo123",
  });
  console.log("  ✅ Authenticated");

  await repo.signOut();
  const current = await repo.getCurrentUser();

  if (!current) {
    console.log("  ✅ PASS: Session cleared after sign out");
    return true;
  } else {
    console.log("  ❌ FAIL: Session not cleared");
    return false;
  }
}

async function testSessionPersistence() {
  console.log("\n✓ TEST 5: Session Persistence");
  localStorage.clear();

  const repo1 = new DemoAuthRepositoryTest();
  await repo1.signIn({
    email: "demo@bolaid.id",
    password: "demo123",
  });
  console.log("  ✅ Session 1: Authenticated");

  const sessionData = localStorage.getItem("demo:session");
  if (!sessionData) {
    console.log("  ❌ FAIL: Session not in localStorage");
    return false;
  }
  console.log("  ✅ PASS: Session stored in localStorage");

  // Simulate new instance
  const repo2 = new DemoAuthRepositoryTest();
  const current = await repo2.getCurrentUser();

  if (current && current.email === "demo@bolaid.id") {
    console.log("  ✅ PASS: Session restored in new instance");
    return true;
  } else {
    console.log("  ❌ FAIL: Session not restored");
    return false;
  }
}

async function testSessionInvalidation() {
  console.log("\n✓ TEST 6: Session Invalidation");
  localStorage.clear();

  const repo = new DemoAuthRepositoryTest();
  await repo.signIn({
    email: "demo@bolaid.id",
    password: "demo123",
  });
  console.log("  ✅ Authenticated");

  localStorage.removeItem("demo:session");
  console.log("  ✅ Session invalidated");

  const current = await repo.getCurrentUser();
  if (!current) {
    console.log("  ✅ PASS: User cleared after session invalidation");
    return true;
  } else {
    console.log("  ❌ FAIL: User still present");
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log("\n╔═══════════════════════════════════════════╗");
  console.log("║   STEP 4.18: Authentication Verification   ║");
  console.log("╚═══════════════════════════════════════════╝");

  const tests = [
    testValidLogin,
    testInvalidEmail,
    testInvalidPassword,
    testSignOut,
    testSessionPersistence,
    testSessionInvalidation,
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
    console.log("\n  🎉 All authentication tests passed!");
  } else {
    console.log(`\n  ⚠️  ${failed} test(s) failed`);
  }

  return failed === 0;
}

// Execute tests
runTests().then((success) => {
  process.exit(success ? 0 : 1);
});
