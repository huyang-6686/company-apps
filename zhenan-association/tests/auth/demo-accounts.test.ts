import { beforeEach, describe, expect, it } from "vitest";
import { DEMO_TEST_ACCOUNTS, authenticateDemoAccount } from "../../modules/shared/auth/demo-accounts";

describe("local demo accounts", () => {
  beforeEach(() => { process.env.DEMO_MODE = "true"; });
  it("provides the five agreed test identities", () => {
    expect(DEMO_TEST_ACCOUNTS.map((account) => account.username)).toEqual([
      "founder",
      "finance",
      "project-lead",
      "project-member-1",
      "project-member-2",
    ]);
  });

  it("authenticates a local account without accepting an invalid password", () => {
    expect(authenticateDemoAccount("founder", "DemoFounder-2026")?.role).toBe("创始人");
    expect(authenticateDemoAccount("founder", "wrong-password")).toBeNull();
  });
});
