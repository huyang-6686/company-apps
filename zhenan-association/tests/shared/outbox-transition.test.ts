import { describe, expect, it } from "vitest";
import {
  claimOutboxEvent,
  completeOutboxEvent,
  failOutboxEvent,
  type OutboxRuntimeEvent,
} from "../../modules/shared/worker/outbox-transition";

const now = new Date("2026-10-20T06:00:00.000Z");
const baseEvent: OutboxRuntimeEvent = {
  status: "pending",
  attemptCount: 0,
  availableAt: now,
  lastError: null,
};

describe("outbox worker transitions", () => {
  it("claims an available pending event for processing", () => {
    expect(claimOutboxEvent(baseEvent, now)).toEqual({
      status: "processing",
      attemptCount: 0,
      availableAt: now,
      lastError: null,
    });
  });

  it("does not claim an event before its available time", () => {
    expect(claimOutboxEvent({ ...baseEvent, availableAt: new Date("2026-10-20T06:01:00.000Z") }, now))
      .toEqual({ status: "not_ready" });
  });

  it("marks processing success and schedules retryable failures", () => {
    expect(completeOutboxEvent({ ...baseEvent, status: "processing" })).toEqual({
      status: "succeeded",
      attemptCount: 0,
      availableAt: now,
      lastError: null,
    });
    expect(failOutboxEvent({ ...baseEvent, status: "processing" }, "network error", now))
      .toEqual({
        status: "retry",
        attemptCount: 1,
        availableAt: new Date("2026-10-20T06:01:00.000Z"),
        lastError: "network error",
      });
  });
});
