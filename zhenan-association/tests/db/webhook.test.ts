import { describe, expect, it } from "vitest";
import { webhookEvent } from "../../db/schema/webhook";

describe("webhook_event table schema", () => {
  it("has provider, event, queue, and retry columns", () => {
    expect(webhookEvent.provider).toBeDefined();
    expect(webhookEvent.eventId).toBeDefined();
    expect(webhookEvent.eventType).toBeDefined();
    expect(webhookEvent.status).toBeDefined();
    expect(webhookEvent.retryCount).toBeDefined();
  });
});
