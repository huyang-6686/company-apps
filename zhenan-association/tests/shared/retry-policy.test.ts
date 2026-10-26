import { describe, expect, it } from "vitest";
import {
  getRetryDecision,
  isReplayableStatus,
} from "../../modules/shared/worker/retry-policy";

const now = new Date("2026-10-20T06:00:00.000Z");

describe("worker retry policy", () => {
  it("uses exponential backoff for retryable attempts", () => {
    expect(getRetryDecision({ attemptCount: 0, now })).toEqual({
      status: "retry",
      attemptCount: 1,
      nextAttemptAt: new Date("2026-10-20T06:01:00.000Z"),
    });
    expect(getRetryDecision({ attemptCount: 1, now })).toEqual({
      status: "retry",
      attemptCount: 2,
      nextAttemptAt: new Date("2026-10-20T06:02:00.000Z"),
    });
  });

  it("moves an event to dead letter at the retry limit", () => {
    expect(getRetryDecision({ attemptCount: 3, now })).toEqual({
      status: "dead_letter",
      attemptCount: 3,
    });
  });

  it("only allows queued and retry statuses to be replayed", () => {
    expect(isReplayableStatus("queued")).toBe(true);
    expect(isReplayableStatus("retry")).toBe(true);
    expect(isReplayableStatus("dead_letter")).toBe(false);
    expect(isReplayableStatus("succeeded")).toBe(false);
  });
});
