import { describe, expect, it } from "vitest";
import { createTokenDigest, REQUIRED_FORM_LINK_STATUS } from "../../modules/membership/external-form-service";
import { REQUIRED_ATTACHMENT_KINDS } from "../../modules/membership/external-form-submission";
import { submitExternalForm, type ExternalFormSubmissionStore } from "../../modules/membership/external-form-service";

const now = new Date("2026-10-20T00:00:00.000Z");
const draft = {
  submissionNo: "SUB-001",
  payload: { companyName: "示例单位" },
  attachments: REQUIRED_ATTACHMENT_KINDS.map((kind) => ({ kind, sizeBytes: 1 })),
};

function createStore(overrides: Partial<ExternalFormSubmissionStore> = {}): ExternalFormSubmissionStore {
  return {
    findLinkByTokenDigest: async () => ({
      id: "link-1",
      tenantId: "tenant-1",
      status: REQUIRED_FORM_LINK_STATUS,
      expiresAt: new Date("2026-10-21T00:00:00.000Z"),
    }),
    getOrCreateSubmission: async (input) => ({
      created: true,
      submission: {
        id: "submission-1",
        tenantId: input.tenantId,
        linkId: input.linkId,
        submissionNo: input.submissionNo,
        status: "submitted",
        payload: input.payload,
      },
    }),
    ...overrides,
  };
}

describe("external membership form submission service", () => {
  it("looks up links by digest and creates a valid submission", async () => {
    let observedDigest = "";
    const store = createStore({
      findLinkByTokenDigest: async (digest) => {
        observedDigest = digest;
        return {
          id: "link-1",
          tenantId: "tenant-1",
          status: REQUIRED_FORM_LINK_STATUS,
          expiresAt: new Date("2026-10-21T00:00:00.000Z"),
        };
      },
    });

    const result = await submitExternalForm({ token: "raw-token", draft, now, store });

    expect(observedDigest).toBe(createTokenDigest("raw-token"));
    expect(result).toMatchObject({ ok: true, status: 201, replayed: false });
  });

  it("returns the existing record when the store reports an idempotent replay", async () => {
    const store = createStore({
      getOrCreateSubmission: async () => ({
        created: false,
        submission: {
          id: "submission-existing",
          tenantId: "tenant-1",
          linkId: "link-1",
          submissionNo: "SUB-001",
          status: "submitted",
          payload: draft.payload,
        },
      }),
    });

    const result = await submitExternalForm({ token: "raw-token", draft, now, store });

    expect(result).toMatchObject({
      ok: true,
      status: 200,
      replayed: true,
      submission: { id: "submission-existing" },
    });
  });

  it("rejects inactive links before validating or persisting a submission", async () => {
    let persisted = false;
    const store = createStore({
      findLinkByTokenDigest: async () => ({
        id: "link-1",
        tenantId: "tenant-1",
        status: REQUIRED_FORM_LINK_STATUS,
        expiresAt: new Date("2026-10-19T00:00:00.000Z"),
      }),
      getOrCreateSubmission: async () => {
        persisted = true;
        throw new Error("must not persist");
      },
    });

    const result = await submitExternalForm({ token: "raw-token", draft, now, store });

    expect(result).toEqual({ ok: false, status: 404, reason: "invalid_or_expired_link" });
    expect(persisted).toBe(false);
  });
});
