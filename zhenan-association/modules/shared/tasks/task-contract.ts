export const taskTypes = ["daily", "business", "project"] as const;
export type TaskType = (typeof taskTypes)[number];

export type TaskContractInput = {
  tenantId: string;
  taskId: string;
  taskType: TaskType;
  sourceApplicationId: string;
  publisherUnifiedEmployeeId: string;
  recipientUnifiedEmployeeIds: string[];
  title: string;
};

export type TaskContract = TaskContractInput & {
  recipientUnifiedEmployeeIds: string[];
  idempotencyKey: string;
  status: "draft";
  acceptanceStatus: "pending";
  retryCount: 0;
  failureReason: null;
};

function required(name: string, value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) throw new Error(`${name} is required`);
  return normalized;
}

export function createTaskContract(input: TaskContractInput): TaskContract {
  if (!taskTypes.includes(input.taskType)) {
    throw new Error("unsupported task type");
  }

  const tenantId = required("tenant ID", input.tenantId);
  const taskId = required("task ID", input.taskId);
  const sourceApplicationId = required("source application ID", input.sourceApplicationId);
  const publisherUnifiedEmployeeId = required("publisher unified employee ID", input.publisherUnifiedEmployeeId);
  const title = required("task title", input.title);
  const recipients = [...new Set(input.recipientUnifiedEmployeeIds.map((id) => id.trim()).filter(Boolean))];
  if (recipients.length === 0) throw new Error("at least one recipient is required");

  return {
    tenantId,
    taskId,
    taskType: input.taskType,
    sourceApplicationId,
    publisherUnifiedEmployeeId,
    recipientUnifiedEmployeeIds: recipients,
    title,
    idempotencyKey: `${tenantId}:${sourceApplicationId}:${taskId}`,
    status: "draft",
    acceptanceStatus: "pending",
    retryCount: 0,
    failureReason: null,
  };
}
