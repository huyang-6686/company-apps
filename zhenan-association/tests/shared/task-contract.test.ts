import { describe, expect, it } from "vitest";
import {
  createTaskContract,
  type TaskContractInput,
} from "../../modules/shared/tasks/task-contract";

const baseInput: TaskContractInput = {
  tenantId: "tenant-1",
  taskId: "task-1",
  taskType: "project",
  sourceApplicationId: "app-1",
  publisherUnifiedEmployeeId: "emp-publisher",
  recipientUnifiedEmployeeIds: ["emp-001", "emp-002"],
  title: "整理项目材料",
};

describe("task contract", () => {
  it("normalizes recipients and derives a tenant-scoped idempotency key", () => {
    expect(createTaskContract({
      ...baseInput,
      recipientUnifiedEmployeeIds: [" emp-001 ", "emp-001", "emp-002"],
    })).toMatchObject({
      taskType: "project",
      recipientUnifiedEmployeeIds: ["emp-001", "emp-002"],
      idempotencyKey: "tenant-1:app-1:task-1",
      status: "draft",
      acceptanceStatus: "pending",
      retryCount: 0,
    });
  });

  it("accepts only daily, business, and project task types", () => {
    expect(() => createTaskContract({ ...baseInput, taskType: "personal" as never }))
      .toThrow("unsupported task type");
  });

  it("requires at least one named recipient", () => {
    expect(() => createTaskContract({ ...baseInput, recipientUnifiedEmployeeIds: [] }))
      .toThrow("at least one recipient is required");
  });
});
