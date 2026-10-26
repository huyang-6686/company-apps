import { describe, it, expect } from "vitest";
import { memberUnit } from "../../db/schema/member-unit";

describe("member_unit table schema", () => {
  it("has required columns", () => {
    expect(memberUnit.id).toBeDefined();
    expect(memberUnit.tenantId).toBeDefined();
    expect(memberUnit.name).toBeDefined();
    expect(memberUnit.category).toBeDefined();
    expect(memberUnit.creditCode).toBeDefined();
    expect(memberUnit.creditCode.isUnique).toBe(true);
  });
});
