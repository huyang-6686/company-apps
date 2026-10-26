import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { receiveWebhook } from "../../modules/shared/integration/webhook-ingress";

const secret = "test-secret";
const body = JSON.stringify({
  eventId: "evt-1",
  eventType: "notification.created",
  payload: { notificationId: "n-1" },
});
const signature = createHmac("sha256", secret).update(body).digest("hex");

describe("webhook ingress", () => {
  it("accepts a signed notification and returns 202", () => {
    const result = receiveWebhook({
      rawBody: body,
      signature,
      secret,
      provider: "yuguang",
    });
    expect(result.accepted).toBe(true);
    if (result.accepted) {
      expect(result.statusCode).toBe(202);
      expect(result.envelope.idempotencyKey).toBe("yuguang:evt-1");
    }
  });

  it("rejects an invalid signature with 401", () => {
    expect(receiveWebhook({ rawBody: body, signature: "bad", secret, provider: "yuguang" }))
      .toEqual({ accepted: false, statusCode: 401, reason: "invalid webhook signature" });
  });

  it("rejects malformed or unsupported payloads with 400", () => {
    const malformedSignature = createHmac("sha256", secret).update("{").digest("hex");
    expect(receiveWebhook({ rawBody: "{", signature: malformedSignature, secret, provider: "yuguang" }))
      .toEqual({ accepted: false, statusCode: 400, reason: "invalid webhook payload" });
    const unsupportedBody = JSON.stringify({ eventId: "evt-2", eventType: "task.created", payload: {} });
    const unsupportedSignature = createHmac("sha256", secret).update(unsupportedBody).digest("hex");
    expect(receiveWebhook({ rawBody: unsupportedBody, signature: unsupportedSignature, secret, provider: "yuguang" }))
      .toEqual({ accepted: false, statusCode: 400, reason: "unsupported webhook event type" });
  });
});
