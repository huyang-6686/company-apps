import { describe, it, expect } from "vitest";
import { person } from "../../db/schema/person";

describe("person table schema", () => {
  it("has required columns", () => {
    expect(person.id).toBeDefined();
    expect(person.tenantId).toBeDefined();
    expect(person.unifiedEmployeeId).toBeDefined();
    expect(person.displayName).toBeDefined();
    expect(person.isActive).toBeDefined();
  });
});
