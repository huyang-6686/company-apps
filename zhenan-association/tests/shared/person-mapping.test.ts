import { describe, expect, it } from "vitest";
import {
  createPersonIdentityMapping,
  type PersonIdentityMappingInput,
} from "../../modules/shared/identity/person-mapping";

const baseInput: PersonIdentityMappingInput = {
  tenantId: "tenant-1",
  unifiedEmployeeId: " emp-001 ",
  feishuUserId: " ou_001 ",
  yuguangUserId: " yg_001 ",
};

describe("person identity mapping", () => {
  it("normalizes identity values while retaining the tenant", () => {
    expect(createPersonIdentityMapping(baseInput)).toEqual({
      tenantId: "tenant-1",
      unifiedEmployeeId: "emp-001",
      feishuUserId: "ou_001",
      yuguangUserId: "yg_001",
    });
  });

  it("rejects a missing unified employee ID", () => {
    expect(() =>
      createPersonIdentityMapping({ ...baseInput, unifiedEmployeeId: " " }),
    ).toThrow("unified employee ID is required");
  });

  it("rejects a missing tenant ID", () => {
    expect(() =>
      createPersonIdentityMapping({ ...baseInput, tenantId: "" }),
    ).toThrow("tenant ID is required");
  });
});
