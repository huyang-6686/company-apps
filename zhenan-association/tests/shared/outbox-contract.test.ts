import { describe, expect, it } from "vitest";
import {
  createOutboxEvent,
  type OutboxEventInput,
} from "../../modules/shared/worker/outbox-contract";

const baseInput: OutboxEventInput = {
  tenantId: "tenant-1",
  eventType: "notification.dispatch",
  aggregateType: "notification",
  aggregateId: "n-1",
  idempotencyKey: "tenant-1:notification:n-1",
  payload: { notificationId: "n-1" },
};

describe("outbox event contract", () => {
  it("creates a pending event with an executable timestamp", () => {
    const event = createOutboxEvent(baseInput);
    expect(event).toMatchObject({
      ...baseInput,
      status: "pending",
      attemptCount: 0,
      lastError: null,
    });
    expect(event.availableAt).toBeInstanceOf(Date);
  });

  it("requires a stable idempotency key and aggregate identity", () => {
    expect(() => createOutboxEvent({ ...baseInput, idempotencyKey: " " }))
      .toThrow("idempotency key is required");
    expect(() => createOutboxEvent({ ...baseInput, aggregateId: " " }))
      .toThrow("aggregate ID is required");
  });

  it("rejects empty payloads", () => {
    expect(() => createOutboxEvent({ ...baseInput, payload: {} }))
      .toThrow("payload is required");
  });
});
