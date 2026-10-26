import { getRetryDecision } from "./retry-policy";

export type OutboxStatus = "pending" | "processing" | "succeeded" | "retry" | "dead_letter";

export type OutboxRuntimeEvent = {
  status: OutboxStatus;
  attemptCount: number;
  availableAt: Date;
  lastError: string | null;
};

export type OutboxTransitionResult = OutboxRuntimeEvent | { status: "not_ready" };

export function claimOutboxEvent(event: OutboxRuntimeEvent, now: Date): OutboxTransitionResult {
  if (event.status !== "pending" && event.status !== "retry") {
    return { status: "not_ready" };
  }
  if (event.availableAt.getTime() > now.getTime()) {
    return { status: "not_ready" };
  }
  return { ...event, status: "processing" };
}

export function completeOutboxEvent(event: OutboxRuntimeEvent): OutboxRuntimeEvent {
  if (event.status !== "processing") {
    throw new Error("only processing events can be completed");
  }
  return { ...event, status: "succeeded", lastError: null };
}

export function failOutboxEvent(
  event: OutboxRuntimeEvent,
  error: string,
  now: Date,
): OutboxRuntimeEvent {
  if (event.status !== "processing") {
    throw new Error("only processing events can fail");
  }
  const normalizedError = error.trim();
  if (!normalizedError) {
    throw new Error("failure reason is required");
  }

  const decision = getRetryDecision({ attemptCount: event.attemptCount, now });
  return decision.status === "retry"
    ? {
        ...event,
        status: "retry",
        attemptCount: decision.attemptCount,
        availableAt: decision.nextAttemptAt,
        lastError: normalizedError,
      }
    : {
        ...event,
        status: "dead_letter",
        attemptCount: decision.attemptCount,
        lastError: normalizedError,
      };
}
