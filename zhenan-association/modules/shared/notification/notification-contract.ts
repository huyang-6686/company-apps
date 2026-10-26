export const notificationEventTypes = ["created", "updated", "expired"] as const;
export type NotificationEventType = (typeof notificationEventTypes)[number];

export type NotificationDeepLink = {
  href: string;
  resourceCode: string;
  action: string;
};

export type NotificationEventInput = {
  tenantId: string;
  eventId: string;
  eventType: NotificationEventType;
  sourceApplicationId: string;
  recipientUnifiedEmployeeId: string;
  title: string;
  body: string;
  deepLink?: NotificationDeepLink;
  expiresAt?: Date | null;
};

export type NotificationEvent = Omit<NotificationEventInput, "deepLink"> & {
  deepLink: NotificationDeepLink;
  idempotencyKey: string;
  status: "pending";
  attemptCount: 0;
};

function required(name: string, value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(`${name} is required`);
  }
  return normalized;
}

export function createNotificationEvent(input: NotificationEventInput): NotificationEvent {
  if (!notificationEventTypes.includes(input.eventType)) {
    throw new Error("unsupported notification event type");
  }

  const deepLink = input.deepLink;
  if (!deepLink) {
    throw new Error("deep link is required");
  }

  return {
    tenantId: required("tenant ID", input.tenantId),
    eventId: required("event ID", input.eventId),
    eventType: input.eventType,
    sourceApplicationId: required("source application ID", input.sourceApplicationId),
    recipientUnifiedEmployeeId: required("recipient unified employee ID", input.recipientUnifiedEmployeeId),
    title: required("notification title", input.title),
    body: required("notification body", input.body),
    deepLink: {
      href: required("deep link href", deepLink.href),
      resourceCode: required("deep link resource code", deepLink.resourceCode),
      action: required("deep link action", deepLink.action),
    },
    expiresAt: input.expiresAt ?? null,
    idempotencyKey: `${input.sourceApplicationId.trim()}:${input.eventId.trim()}`,
    status: "pending",
    attemptCount: 0,
  };
}
