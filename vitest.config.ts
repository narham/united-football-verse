import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    // Legacy standalone scripts (*-simple.test.js, auth-verification.test.ts) are
    // node scripts that call process.exit — they are executed separately, not by vitest.
    include: ["src/**/*.test.ts"],
    exclude: ["**/node_modules/**", "src/__tests__/auth-verification.test.ts"],
    globals: false,
  },
});
