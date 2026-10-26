import { describe, expect, it } from "vitest";
import {
  authorizeDeepLink,
  type DeepLinkAuthorizationInput,
} from "../../modules/shared/permissions/deep-link";

const baseInput: DeepLinkAuthorizationInput = {
  tenantId: "tenant-1",
  unifiedEmployeeId: "emp-001",
  resourceCode: "task:read",
  action: "read",
  binding: { tenantId: "tenant-1", unifiedEmployeeId: "emp-001", resourceCode: "task:read", action: "read" },
};

describe("deep-link authorization", () => {
  it("allows a matching tenant, employee, resource, and action", () => {
    expect(authorizeDeepLink(baseInput)).toEqual({ allowed: true });
  });

  it("denies missing permission context by default", () => {
    expect(authorizeDeepLink({ ...baseInput, binding: undefined })).toEqual({
      allowed: false,
      reason: "permission context missing",
    });
  });

  it("denies tenant or action mismatches", () => {
    expect(authorizeDeepLink({
      ...baseInput,
      binding: { ...baseInput.binding!, tenantId: "tenant-2" },
    })).toEqual({ allowed: false, reason: "permission denied" });
  });
});
