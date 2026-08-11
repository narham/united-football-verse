/**
 * PHASE 6 STEP 5 — Architectural Bypass Guard
 *
 * Production ROUTES must consume repositories through the repository context,
 * never import domain datasets from src/lib/demo-data.ts.
 *
 * Pure utility helpers (formatRupiah, usia, seasonStatsTotal, matchResult,
 * DEFAULT_CLUB_ID) and TYPE-only imports remain allowed: they are contract
 * helpers, not a data source.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROUTES_DIR = join(process.cwd(), "src/routes");

/** Named exports that are pure helpers / contract constants, not datasets. */
const ALLOWED_HELPERS = new Set([
  "formatRupiah",
  "usia",
  "seasonStatsTotal",
  "teamStatTotals",
  "matchResult",
  "DEFAULT_CLUB_ID",
]);

/** Datasets that constitute an architectural bypass when imported in a route. */
const FORBIDDEN_DATASETS = [
  "players",
  "trainingSessions",
  "matches",
  "competitions",
  "transactions",
  "clubs",
  "club",
  "identityDocuments",
  "staff",
  "teams",
  "seasons",
];

function routeFiles(): string[] {
  return readdirSync(ROUTES_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => join(ROUTES_DIR, f));
}

function demoImports(source: string): { typeOnly: boolean; names: string[] }[] {
  const re = /import\s+(type\s+)?\{([^}]*)\}\s+from\s+["']@\/lib\/demo-data["']/g;
  const out: { typeOnly: boolean; names: string[] }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    out.push({
      typeOnly: Boolean(m[1]),
      names: m[2]
        .split(",")
        .map((n) => n.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0])
        .filter(Boolean),
    });
  }
  return out;
}

describe("routes do not bypass the repository layer", () => {
  it("/kompetisi has no demo-data dependency at all", () => {
    const src = readFileSync(join(ROUTES_DIR, "kompetisi.tsx"), "utf8");
    expect(src).not.toContain("@/lib/demo-data");
    expect(src).toContain("useCompetitions");
  });

  it("/kompetisi/$id has no demo-data dependency", () => {
    const src = readFileSync(join(ROUTES_DIR, "kompetisi.$id.tsx"), "utf8");
    expect(src).not.toContain("@/lib/demo-data");
  });

  it("no route imports a demo dataset (helpers/types allowed)", () => {
    const violations: string[] = [];
    for (const file of routeFiles()) {
      const src = readFileSync(file, "utf8");
      for (const imp of demoImports(src)) {
        if (imp.typeOnly) continue;
        for (const name of imp.names) {
          if (ALLOWED_HELPERS.has(name)) continue;
          if (FORBIDDEN_DATASETS.includes(name)) {
            violations.push(`${file.split("/").pop()} → ${name}`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
