import { receiveWebhook, type WebhookIngressResult } from "./webhook-ingress";

export type WebhookRouteStore = {
  insertOrGet(envelope: Extract<WebhookIngressResult, { accepted: true }>["envelope"]): Promise<{
    created: boolean;
  }>;
};

export type WebhookRouteConfig = {
  provider: string;
  secret: string;
  store: WebhookRouteStore;
  signatureHeader?: string;
};

export async function handleWebhookRequest(
  request: Request,
  config: WebhookRouteConfig,
): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get(config.signatureHeader ?? "x-webhook-signature") ?? "";
  const ingress = receiveWebhook({
    rawBody,
    signature,
    secret: config.secret,
    provider: config.provider,
  });

  if (!ingress.accepted) {
    return Response.json({ error: ingress.reason }, { status: ingress.statusCode });
  }

  try {
    const result = await config.store.insertOrGet(ingress.envelope);
    return Response.json({ accepted: true, duplicate: !result.created }, { status: 202 });
  } catch {
    return Response.json({ error: "webhook persistence unavailable" }, { status: 503 });
  }
}
