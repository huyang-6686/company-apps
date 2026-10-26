import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const visited = new Set<string>();
const forbidden = new Set<string>();

function walk(file: string) {
  const absolute = resolve(file);
  if (visited.has(absolute)) return;
  visited.add(absolute);
  const source = readFileSync(absolute, "utf8");
  for (const match of source.matchAll(/(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g)) {
    const specifier = match[1];
    if (/^(?:drizzle-orm|pg)(?:\/|$)/.test(specifier) || /(?:^|\/)db(?:\/|$)/.test(specifier)) {
      forbidden.add(`${absolute}: ${specifier}`);
      continue;
    }
    if (specifier.startsWith(".")) {
      const base = resolve(dirname(absolute), specifier);
      const target = [base, `${base}.ts`, `${base}.tsx`, resolve(base, "index.ts")]
        .find((candidate) => {
          try { readFileSync(candidate); return true; } catch { return false; }
        });
      if (target) walk(target);
    }
  }
}

describe("demo member unit dependency boundary", () => {
  it("does not import db, drizzle-orm or pg transitively", () => {
    walk("app/api/demo/membership/units/route.ts");
    expect([...forbidden]).toEqual([]);
  });
});
