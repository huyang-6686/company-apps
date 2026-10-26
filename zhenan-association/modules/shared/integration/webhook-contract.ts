import { createHmac, timingSafeEqual } from "node:crypto";

export const webhookEventTypes = [
  "notification.created",
  "notification.updated",
  "notification.expired",
] as const;
export type WebhookEventType = (typeof webhookEventTypes)[number];

export type WebhookEnvelopeInput = {
  provider: string;
  eventId: string;
  eventType: WebhookEventType;
  payload: Record<string, unknown>;
};

export type WebhookEnvelope = WebhookEnvelopeInput & {
  idempotencyKey: string;
  status: "queued";
  retryCount: 0;
};

function required(name: string, value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) throw new Error(`${name} is required`);
  return normalized;
}

export function createWebhookEnvelope(input: WebhookEnvelopeInput): WebhookEnvelope {
  if (!webhookEventTypes.includes(input.eventType)) {
    throw new Error("unsupported webhook event type");
  }
  const provider = required("webhook provider", input.provider);
  const eventId = required("webhook event ID", input.eventId);
  return {
    provider,
    eventId,
    eventType: input.eventType,
    payload: input.payload,
    idempotencyKey: `${provider}:${eventId}`,
    status: "queued",
    retryCount: 0,
  };
}

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const actualBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}
