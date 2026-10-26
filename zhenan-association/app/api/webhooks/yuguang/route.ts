import { db } from "../../../../db";
import { webhookEvent } from "../../../../db/schema";
import {
  handleWebhookRequest,
  type WebhookRouteStore,
} from "../../../../modules/shared/integration/webhook-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const provider = "yuguang";

const store: WebhookRouteStore = {
  async insertOrGet(envelope) {
    const inserted = await db
      .insert(webhookEvent)
      .values({
        provider: envelope.provider,
        eventId: envelope.eventId,
        eventType: envelope.eventType,
        payload: envelope.payload,
      })
      .onConflictDoNothing({
        target: [webhookEvent.provider, webhookEvent.eventId],
      })
      .returning({ id: webhookEvent.id });

    return { created: inserted.length === 1 };
  },
};

export async function POST(request: Request) {
  return handleWebhookRequest(request, {
    provider,
    secret: process.env.YUGUANG_WEBHOOK_SECRET ?? "",
    signatureHeader: process.env.YUGUANG_WEBHOOK_SIGNATURE_HEADER ?? "x-webhook-signature",
    store,
  });
}
