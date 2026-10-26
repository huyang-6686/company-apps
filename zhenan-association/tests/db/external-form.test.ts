import { describe, expect, it } from "vitest";
import {
  externalFormAttachment,
  externalFormLink,
  externalFormSubmission,
} from "../../db/schema/external-form";

describe("external membership form schema", () => {
  it("stores a digest and lifecycle controls for public links", () => {
    expect(externalFormLink.tokenDigest).toBeDefined();
    expect(externalFormLink.expiresAt).toBeDefined();
    expect(externalFormLink.revokedAt).toBeDefined();
    expect(externalFormLink.lockedAt).toBeDefined();
    expect(externalFormLink.failedAttempts).toBeDefined();
    expect(externalFormLink.rateLimitWindowStartedAt).toBeDefined();
  });

  it("supports idempotent submissions without requiring a member unit first", () => {
    expect(externalFormSubmission.linkId).toBeDefined();
    expect(externalFormSubmission.submissionNo).toBeDefined();
    expect(externalFormSubmission.memberUnitId).toBeDefined();
    expect(externalFormSubmission.payload).toBeDefined();
    expect(externalFormSubmission.status).toBeDefined();
  });

  it("keeps attachment scanning and archive state as metadata", () => {
    expect(externalFormAttachment.submissionId).toBeDefined();
    expect(externalFormAttachment.storageKey).toBeDefined();
    expect(externalFormAttachment.sizeBytes).toBeDefined();
    expect(externalFormAttachment.scanStatus).toBeDefined();
    expect(externalFormAttachment.archiveStatus).toBeDefined();
    expect(externalFormAttachment.retainUntil).toBeDefined();
  });
});
