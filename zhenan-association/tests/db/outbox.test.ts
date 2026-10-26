import { describe, expect, it } from "vitest";
import { outboxEvent } from "../../db/schema/outbox";

describe("outbox_event table schema", () => {
  it("has aggregate, idempotency, payload, and scheduling columns", () => {
    expect(outboxEvent.aggregateType).toBeDefined();
    expect(outboxEvent.aggregateId).toBeDefined();
    expect(outboxEvent.idempotencyKey).toBeDefined();
    expect(outboxEvent.payload).toBeDefined();
    expect(outboxEvent.availableAt).toBeDefined();
  });
});
