import { createHash, randomBytes } from "node:crypto";

export const DEFAULT_FORM_LINK_TTL_DAYS = 7;
export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_SUBMISSION = 10;

export type FormLinkLifecycle = {
  expiresAt: Date;
  revokedAt?: Date | null;
  lockedAt?: Date | null;
};

export type AttachmentCandidate = {
  sizeBytes: number;
};

export type AttachmentBatchValidation =
  | { ok: true }
  | { ok: false; reason: "file_too_large" | "too_many_files" };

export function createFormToken(): string {
  return randomBytes(32).toString("base64url");
}

export function createTokenDigest(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

export function getDefaultFormExpiry(now = new Date()): Date {
  const ttlMilliseconds = DEFAULT_FORM_LINK_TTL_DAYS * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() + ttlMilliseconds);
}

export function validateAttachmentBatch(files: AttachmentCandidate[]): AttachmentBatchValidation {
  if (files.length > MAX_ATTACHMENTS_PER_SUBMISSION) {
    return { ok: false, reason: "too_many_files" };
  }

  if (files.some((file) => file.sizeBytes > MAX_ATTACHMENT_BYTES)) {
    return { ok: false, reason: "file_too_large" };
  }

  return { ok: true };
}

export function isFormLinkActive(link: FormLinkLifecycle, now = new Date()): boolean {
  return link.expiresAt > now && !link.revokedAt && !link.lockedAt;
}
