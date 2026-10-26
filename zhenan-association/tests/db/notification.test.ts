import { describe, it, expect } from "vitest";
import { notificationEvent, notificationLog } from "../../db/schema/notification";

describe("notification_log table schema", () => {
  it("has required columns", () => {
    expect(notificationLog.id).toBeDefined();
    expect(notificationLog.channel).toBeDefined();
    expect(notificationLog.status).toBeDefined();
  });
});

describe("notification_event table schema", () => {
  it("has event, recipient, deep-link, and retry columns", () => {
    expect(notificationEvent.eventId).toBeDefined();
    expect(notificationEvent.eventType).toBeDefined();
    expect(notificationEvent.recipientUnifiedEmployeeId).toBeDefined();
    expect(notificationEvent.deepLink).toBeDefined();
    expect(notificationEvent.attemptCount).toBeDefined();
  });
});
