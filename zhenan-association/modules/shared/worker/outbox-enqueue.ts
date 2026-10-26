import { createOutboxEvent, type OutboxEvent, type OutboxEventInput } from "./outbox-contract";

export type StoredOutboxEvent = OutboxEvent & { id: string };

export type OutboxStore = {
  insertOrGet(event: OutboxEvent): Promise<{
    created: boolean;
    event: StoredOutboxEvent;
  }>;
};

export async function enqueueOutboxEvent(
  input: OutboxEventInput,
  store: OutboxStore,
): Promise<{ created: boolean; event: StoredOutboxEvent }> {
  const event = createOutboxEvent(input);
  return store.insertOrGet(event);
}
