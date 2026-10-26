export type RobotConfigInput = {
  tenantId: string;
  applicationId: string;
  robotId: string;
  provider: "feishu";
  secretRef: string;
  enabled: boolean;
};

export type RobotConfig = RobotConfigInput;

function required(name: string, value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) throw new Error(`${name} is required`);
  return normalized;
}

export function createRobotConfig(input: RobotConfigInput): RobotConfig {
  const tenantId = required("tenant ID", input.tenantId);
  const applicationId = required("application ID", input.applicationId);
  const robotId = required("robot ID", input.robotId);
  const secretRef = required("secret reference", input.secretRef);
  if (!secretRef.startsWith("secret://")) {
    throw new Error("secret reference is required");
  }
  if (!input.enabled) {
    throw new Error("robot configuration must be enabled");
  }
  return { tenantId, applicationId, robotId, provider: input.provider, secretRef, enabled: true };
}
