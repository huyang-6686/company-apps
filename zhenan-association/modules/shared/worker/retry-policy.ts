export type RetryableStatus = "queued" | "retry" | "dead_letter" | "succeeded";

export type RetryDecisionInput = {
  attemptCount: number;
  now: Date;
  maxAttempts?: number;
};

export type RetryDecision =
  | { status: "retry"; attemptCount: number; nextAttemptAt: Date }
  | { status: "dead_letter"; attemptCount: number };

export function getRetryDecision(input: RetryDecisionInput): RetryDecision {
  const maxAttempts = input.maxAttempts ?? 3;
  if (input.attemptCount >= maxAttempts) {
    return { status: "dead_letter", attemptCount: input.attemptCount };
  }

  const nextAttemptCount = input.attemptCount + 1;
  const delayMinutes = 2 ** input.attemptCount;
  const nextAttemptAt = new Date(input.now.getTime() + delayMinutes * 60_000);
  return { status: "retry", attemptCount: nextAttemptCount, nextAttemptAt };
}

export function isReplayableStatus(status: RetryableStatus): boolean {
  return status === "queued" || status === "retry";
}
