import { describe, expect, it } from "vitest";
import {
  REQUIRED_ATTACHMENT_KINDS,
  createSubmissionIdempotencyKey,
  validateExternalFormSubmission,
} from "../../modules/membership/external-form-submission";

const requiredAttachments = REQUIRED_ATTACHMENT_KINDS.map((kind) => ({
  kind,
  sizeBytes: 1,
}));

describe("external membership form submission contract", () => {
  it("requires the five confirmed membership documents", () => {
    expect(
      validateExternalFormSubmission({
        submissionNo: "SUB-001",
        payload: { companyName: "示例单位" },
        attachments: requiredAttachments,
      }),
    ).toEqual({ ok: true });

    expect(
      validateExternalFormSubmission({
        submissionNo: "SUB-002",
        payload: {},
        attachments: requiredAttachments.slice(0, -1),
      }),
    ).toEqual({
      ok: false,
      reason: "missing_required_attachment",
      attachmentKind: REQUIRED_ATTACHMENT_KINDS.at(-1),
    });
  });

  it("rejects blank submission numbers before persistence", () => {
    expect(
      validateExternalFormSubmission({
        submissionNo: "  ",
        payload: {},
        attachments: requiredAttachments,
      }),
    ).toEqual({ ok: false, reason: "submission_no_required" });
  });

  it("creates a stable tenant-scoped idempotency key", () => {
    expect(createSubmissionIdempotencyKey("tenant-1", " SUB-001 ")).toBe("tenant-1:SUB-001");
    expect(createSubmissionIdempotencyKey("tenant-1", "SUB-001")).toBe(
      createSubmissionIdempotencyKey("tenant-1", " SUB-001 "),
    );
    expect(createSubmissionIdempotencyKey("tenant-2", "SUB-001")).not.toBe(
      createSubmissionIdempotencyKey("tenant-1", "SUB-001"),
    );
  });

  it("returns the attachment limit reason from the shared validator", () => {
    expect(
      validateExternalFormSubmission({
        submissionNo: "SUB-003",
        payload: {},
        attachments: [
          ...requiredAttachments,
          ...Array.from({ length: 6 }, (_, index) => ({ kind: `extra-${index}`, sizeBytes: 1 })),
        ],
      }),
    ).toEqual({ ok: false, reason: "too_many_files" });
  });
});
