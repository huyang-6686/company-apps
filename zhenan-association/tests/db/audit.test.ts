import { describe, it, expect } from "vitest";
import { auditEvent } from "../../db/schema/audit";

describe("audit_event table schema", () => {
  it("has required columns", () => {
    expect(auditEvent.id).toBeDefined();
    expect(auditEvent.traceId).toBeDefined();
    expect(auditEvent.action).toBeDefined();
    expect(auditEvent.resourceType).toBeDefined();
    expect(auditEvent.summary).toBeDefined();
  });
});
