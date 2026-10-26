import { describe, expect, it } from "vitest";
import {
  enqueueOutboxEvent,
  type OutboxStore,
  type StoredOutboxEvent,
} from "../../modules/shared/worker/outbox-enqueue";
import type { OutboxEventInput } from "../../modules/shared/worker/outbox-contract";

const input: OutboxEventInput = {
  tenantId: "tenant-1",
  eventType: "notification.dispatch",
  aggregateType: "notification",
  aggregateId: "n-1",
  idempotencyKey: "tenant-1:notification:n-1",
  payload: { notificationId: "n-1" },
};

function createStore(): OutboxStore {
  const events = new Map<string, StoredOutboxEvent>();
  return {
    async insertOrGet(event) {
      const key = `${event.tenantId}:${event.idempotencyKey}`;
      const existing = events.get(key);
      if (existing) return { created: false, event: existing };
      const stored = { ...event, id: "outbox-1" };
      events.set(key, stored);
      return { created: true, event: stored };
    },
  };
}

describe("outbox enqueue", () => {
  it("creates an event through the atomic store contract", async () => {
    const result = await enqueueOutboxEvent(input, createStore());
    expect(result.created).toBe(true);
    expect(result.event.id).toBe("outbox-1");
    expect(result.event.status).toBe("pending");
  });

  it("returns the existing event for an idempotent replay", async () => {
    const store = createStore();
    const first = await enqueueOutboxEvent(input, store);
    const replay = await enqueueOutboxEvent(input, store);
    expect(first.event).toEqual(replay.event);
    expect(replay.created).toBe(false);
  });
});
