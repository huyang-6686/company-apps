import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  createWebhookEnvelope,
  verifyWebhookSignature,
  type WebhookEnvelopeInput,
} from "../../modules/shared/integration/webhook-contract";

const baseInput: WebhookEnvelopeInput = {
  provider: "yuguang",
  eventId: "evt-1",
  eventType: "notification.created",
  payload: { notificationId: "n-1" },
};

describe("webhook contract", () => {
  it("creates a queued envelope with a provider-scoped idempotency key", () => {
    expect(createWebhookEnvelope(baseInput)).toEqual({
      ...baseInput,
      idempotencyKey: "yuguang:evt-1",
      status: "queued",
      retryCount: 0,
    });
  });

  it("rejects non-notification event types", () => {
    expect(() => createWebhookEnvelope({ ...baseInput, eventType: "task.created" as never }))
      .toThrow("unsupported webhook event type");
  });

  it("verifies HMAC signatures without exposing the secret", () => {
    const payload = JSON.stringify({ ok: true });
    const secret = "test-secret";
    const signature = createHmac("sha256", secret).update(payload).digest("hex");
    expect(verifyWebhookSignature(payload, signature, secret)).toBe(true);
    expect(verifyWebhookSignature(payload, "bad", secret)).toBe(false);
  });
});
