import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  handleWebhookRequest,
  type WebhookRouteStore,
} from "../../modules/shared/integration/webhook-route";

const secret = "route-test-secret";

function makeRequest(body: string, signature = createSignature(body)) {
  return new Request("https://example.test/api/webhooks/yuguang", {
    method: "POST",
    headers: { "x-webhook-signature": signature },
    body,
  });
}

function createSignature(body: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function createStore(): WebhookRouteStore {
  const keys = new Set<string>();
  return {
    async insertOrGet(envelope) {
      const key = `${envelope.provider}:${envelope.eventId}`;
      if (keys.has(key)) return { created: false };
      keys.add(key);
      return { created: true };
    },
  };
}

describe("webhook route adapter", () => {
  it("accepts a valid request and reports whether the event was newly queued", async () => {
    const response = await handleWebhookRequest(
      makeRequest(JSON.stringify({
        eventId: "evt-route-1",
        eventType: "notification.created",
        payload: { notificationId: "n-1" },
      })),
      { provider: "yuguang", secret, store: createStore() },
    );

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ accepted: true, duplicate: false });
  });

  it("returns duplicate true when the store already contains the event", async () => {
    const store = createStore();
    const body = JSON.stringify({
      eventId: "evt-route-2",
      eventType: "notification.updated",
      payload: { notificationId: "n-2" },
    });

    await handleWebhookRequest(makeRequest(body), { provider: "yuguang", secret, store });
    const replay = await handleWebhookRequest(makeRequest(body), { provider: "yuguang", secret, store });

    expect(replay.status).toBe(202);
    await expect(replay.json()).resolves.toEqual({ accepted: true, duplicate: true });
  });

  it("rejects invalid signatures without calling the store", async () => {
    let calls = 0;
    const store: WebhookRouteStore = {
      async insertOrGet() {
        calls += 1;
        return { created: true };
      },
    };

    const response = await handleWebhookRequest(
      makeRequest("{}", "invalid-signature"),
      { provider: "yuguang", secret, store },
    );

    expect(response.status).toBe(401);
    expect(calls).toBe(0);
  });

  it("returns a client error for invalid JSON", async () => {
    const response = await handleWebhookRequest(
      makeRequest("not-json"),
      { provider: "yuguang", secret, store: createStore() },
    );

    expect(response.status).toBe(400);
  });

  it("returns service unavailable when persistence fails", async () => {
    const store: WebhookRouteStore = {
      async insertOrGet() {
        throw new Error("database unavailable");
      },
    };

    const response = await handleWebhookRequest(
      makeRequest(JSON.stringify({
        eventId: "evt-route-3",
        eventType: "notification.expired",
        payload: { notificationId: "n-3" },
      })),
      { provider: "yuguang", secret, store },
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "webhook persistence unavailable" });
  });
});
