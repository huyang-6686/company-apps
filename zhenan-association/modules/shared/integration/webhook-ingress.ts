import {
  createWebhookEnvelope,
  verifyWebhookSignature,
  type WebhookEnvelope,
  type WebhookEventType,
} from "./webhook-contract";

export type WebhookIngressInput = {
  rawBody: string;
  signature: string;
  secret: string;
  provider: string;
};

export type WebhookIngressResult =
  | { accepted: true; statusCode: 202; envelope: WebhookEnvelope }
  | { accepted: false; statusCode: 400 | 401; reason: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function receiveWebhook(input: WebhookIngressInput): WebhookIngressResult {
  if (!verifyWebhookSignature(input.rawBody, input.signature, input.secret)) {
    return { accepted: false, statusCode: 401, reason: "invalid webhook signature" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(input.rawBody);
  } catch {
    return { accepted: false, statusCode: 400, reason: "invalid webhook payload" };
  }

  if (!isRecord(parsed) || !isRecord(parsed.payload)) {
    return { accepted: false, statusCode: 400, reason: "invalid webhook payload" };
  }

  try {
    const envelope = createWebhookEnvelope({
      provider: input.provider,
      eventId: typeof parsed.eventId === "string" ? parsed.eventId : "",
      eventType: parsed.eventType as WebhookEventType,
      payload: parsed.payload,
    });
    return { accepted: true, statusCode: 202, envelope };
  } catch (error) {
    return {
      accepted: false,
      statusCode: 400,
      reason: error instanceof Error ? error.message : "invalid webhook payload",
    };
  }
}
