import { describe, expect, it } from "vitest";
import {
  DEFAULT_FORM_LINK_TTL_DAYS,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS_PER_SUBMISSION,
  createFormToken,
  createTokenDigest,
  getDefaultFormExpiry,
  isFormLinkActive,
  validateAttachmentBatch,
} from "../../modules/membership/external-form";

describe("external membership form rules", () => {
  it("uses the confirmed public-form limits", () => {
    expect(DEFAULT_FORM_LINK_TTL_DAYS).toBe(7);
    expect(MAX_ATTACHMENT_BYTES).toBe(20 * 1024 * 1024);
    expect(MAX_ATTACHMENTS_PER_SUBMISSION).toBe(10);
  });

  it("stores only a stable digest of the public token", () => {
    expect(createFormToken()).toHaveLength(43);
    expect(createTokenDigest("example-token")).toBe(createTokenDigest("example-token"));
    expect(createTokenDigest("example-token")).not.toBe("example-token");
    expect(createTokenDigest("example-token")).toHaveLength(64);
  });

  it("calculates the default expiry from the confirmed seven-day window", () => {
    const now = new Date("2026-10-20T00:00:00.000Z");
    expect(getDefaultFormExpiry(now).toISOString()).toBe("2026-10-27T00:00:00.000Z");
  });

  it("rejects oversized files and batches over the confirmed limit", () => {
    expect(validateAttachmentBatch([{ sizeBytes: MAX_ATTACHMENT_BYTES }])).toEqual({ ok: true });
    expect(validateAttachmentBatch([{ sizeBytes: MAX_ATTACHMENT_BYTES + 1 }])).toEqual({
      ok: false,
      reason: "file_too_large",
    });
    expect(validateAttachmentBatch(Array.from({ length: MAX_ATTACHMENTS_PER_SUBMISSION + 1 }, () => ({ sizeBytes: 1 })))).toEqual({
      ok: false,
      reason: "too_many_files",
    });
  });

  it("rejects expired, revoked and locked links", () => {
    const now = new Date("2026-10-20T00:00:00.000Z");
    expect(isFormLinkActive({ expiresAt: new Date("2026-10-21T00:00:00.000Z") }, now)).toBe(true);
    expect(isFormLinkActive({ expiresAt: new Date("2026-10-19T23:59:59.000Z") }, now)).toBe(false);
    expect(isFormLinkActive({ expiresAt: new Date("2026-10-21T00:00:00.000Z"), revokedAt: now }, now)).toBe(false);
    expect(isFormLinkActive({ expiresAt: new Date("2026-10-21T00:00:00.000Z"), lockedAt: now }, now)).toBe(false);
  });
});
