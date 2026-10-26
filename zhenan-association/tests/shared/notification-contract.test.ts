import { describe, expect, it } from "vitest";
import {
  createNotificationEvent,
  type NotificationEventInput,
} from "../../modules/shared/notification/notification-contract";

const baseInput: NotificationEventInput = {
  tenantId: "tenant-1",
  eventId: "evt-1",
  eventType: "created",
  sourceApplicationId: "app-1",
  recipientUnifiedEmployeeId: "emp-001",
  title: "任务提醒",
  body: "请处理待办事项",
  deepLink: {
    href: "/tasks/123",
    resourceCode: "task:read",
    action: "read",
  },
};

describe("notification event contract", () => {
  it("normalizes a valid event and derives an idempotency key", () => {
    expect(createNotificationEvent(baseInput)).toMatchObject({
      ...baseInput,
      idempotencyKey: "app-1:evt-1",
      status: "pending",
      attemptCount: 0,
    });
  });

  it("accepts only created, updated, and expired events", () => {
    expect(() =>
      createNotificationEvent({ ...baseInput, eventType: "deleted" as never }),
    ).toThrow("unsupported notification event type");
  });

  it("requires a permission-aware deep link", () => {
    expect(() =>
      createNotificationEvent({ ...baseInput, deepLink: undefined }),
    ).toThrow("deep link is required");
  });
});
