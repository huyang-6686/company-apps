import {
  validateAttachmentBatch,
  type AttachmentCandidate,
  type AttachmentBatchValidation,
} from "./external-form";

export const REQUIRED_ATTACHMENT_KINDS = [
  "business_license",
  "qualification_permit",
  "legal_representative_identity",
  "legal_representative_resume",
  "membership_application",
] as const;

export type ExternalFormAttachmentDraft = AttachmentCandidate & {
  kind: string;
};

export type ExternalFormSubmissionDraft = {
  submissionNo: string;
  payload: Record<string, unknown>;
  attachments: ExternalFormAttachmentDraft[];
};

export type ExternalFormSubmissionValidation =
  | { ok: true }
  | { ok: false; reason: "submission_no_required" }
  | { ok: false; reason: "file_too_large" | "too_many_files" }
  | { ok: false; reason: "missing_required_attachment"; attachmentKind: string };

export function createSubmissionIdempotencyKey(tenantId: string, submissionNo: string): string {
  return `${tenantId.trim()}:${submissionNo.trim()}`;
}

export function validateExternalFormSubmission(
  draft: ExternalFormSubmissionDraft,
): ExternalFormSubmissionValidation {
  if (!draft.submissionNo.trim()) {
    return { ok: false, reason: "submission_no_required" };
  }

  const attachmentValidation: AttachmentBatchValidation = validateAttachmentBatch(draft.attachments);
  if (!attachmentValidation.ok) {
    return attachmentValidation;
  }

  const suppliedKinds = new Set(draft.attachments.map((attachment) => attachment.kind));
  const missingKind = REQUIRED_ATTACHMENT_KINDS.find((kind) => !suppliedKinds.has(kind));
  if (missingKind) {
    return { ok: false, reason: "missing_required_attachment", attachmentKind: missingKind };
  }

  return { ok: true };
}
