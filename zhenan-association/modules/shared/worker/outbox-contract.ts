export type OutboxEventInput = {
  tenantId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  availableAt?: Date;
};

export type OutboxEvent = OutboxEventInput & {
  availableAt: Date;
  status: "pending";
  attemptCount: 0;
  lastError: null;
};

function required(name: string, value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) throw new Error(`${name} is required`);
  return normalized;
}

export function createOutboxEvent(input: OutboxEventInput): OutboxEvent {
  if (Object.keys(input.payload).length === 0) {
    throw new Error("payload is required");
  }
  return {
    tenantId: required("tenant ID", input.tenantId),
    eventType: required("event type", input.eventType),
    aggregateType: required("aggregate type", input.aggregateType),
    aggregateId: required("aggregate ID", input.aggregateId),
    idempotencyKey: required("idempotency key", input.idempotencyKey),
    payload: input.payload,
    availableAt: input.availableAt ?? new Date(),
    status: "pending",
    attemptCount: 0,
    lastError: null,
  };
}
