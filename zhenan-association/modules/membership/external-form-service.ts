import {
  createTokenDigest,
  isFormLinkActive,
  type FormLinkLifecycle,
} from "./external-form";
import {
  validateExternalFormSubmission,
  type ExternalFormSubmissionDraft,
} from "./external-form-submission";

export { createTokenDigest } from "./external-form";

export const REQUIRED_FORM_LINK_STATUS = "active" as const;

export type ExternalFormLinkRecord = FormLinkLifecycle & {
  id: string;
  tenantId: string;
  status: string;
};

export type ExternalFormSubmissionRecord = {
  id: string;
  tenantId: string;
  linkId: string;
  submissionNo: string;
  status: string;
  payload: Record<string, unknown>;
};

export type ExternalFormSubmissionPersistenceInput = {
  tenantId: string;
  linkId: string;
  submissionNo: string;
  payload: Record<string, unknown>;
  attachments: ExternalFormSubmissionDraft["attachments"];
};

export type ExternalFormSubmissionStore = {
  findLinkByTokenDigest(tokenDigest: string): Promise<ExternalFormLinkRecord | null>;
  getOrCreateSubmission(input: ExternalFormSubmissionPersistenceInput): Promise<{
    created: boolean;
    submission: ExternalFormSubmissionRecord;
  }>;
};

export type SubmitExternalFormInput = {
  token: string;
  draft: ExternalFormSubmissionDraft;
  now?: Date;
  store: ExternalFormSubmissionStore;
};

export type SubmitExternalFormResult =
  | {
      ok: false;
      status: 404;
      reason: "invalid_or_expired_link";
    }
  | ({ ok: false; status: 422 } & Exclude<ReturnType<typeof validateExternalFormSubmission>, { ok: true }>)
  | {
      ok: true;
      status: 200 | 201;
      replayed: boolean;
      submission: ExternalFormSubmissionRecord;
    };

export async function submitExternalForm({
  token,
  draft,
  now = new Date(),
  store,
}: SubmitExternalFormInput): Promise<SubmitExternalFormResult> {
  const link = await store.findLinkByTokenDigest(createTokenDigest(token));
  if (!link || link.status !== REQUIRED_FORM_LINK_STATUS || !isFormLinkActive(link, now)) {
    return { ok: false, status: 404, reason: "invalid_or_expired_link" };
  }

  const validation = validateExternalFormSubmission(draft);
  if (!validation.ok) {
    if (validation.reason === "missing_required_attachment") {
      return {
        ok: false,
        status: 422,
        reason: validation.reason,
        attachmentKind: validation.attachmentKind,
      };
    }

    return { ok: false, status: 422, reason: validation.reason };
  }

  const persisted = await store.getOrCreateSubmission({
    tenantId: link.tenantId,
    linkId: link.id,
    submissionNo: draft.submissionNo.trim(),
    payload: draft.payload,
    attachments: draft.attachments,
  });

  return {
    ok: true,
    status: persisted.created ? 201 : 200,
    replayed: !persisted.created,
    submission: persisted.submission,
  };
}
