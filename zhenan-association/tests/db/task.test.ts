import { describe, expect, it } from "vitest";
import { taskItem } from "../../db/schema/task";

describe("task_item table schema", () => {
  it("has task, recipient, acceptance, and retry columns", () => {
    expect(taskItem.taskId).toBeDefined();
    expect(taskItem.taskType).toBeDefined();
    expect(taskItem.recipientUnifiedEmployeeIds).toBeDefined();
    expect(taskItem.acceptanceStatus).toBeDefined();
    expect(taskItem.retryCount).toBeDefined();
  });
});
