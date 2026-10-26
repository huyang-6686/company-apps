import { describe, expect, it } from "vitest";
import {
  createRobotConfig,
  type RobotConfigInput,
} from "../../modules/shared/integration/robot-config";

const baseInput: RobotConfigInput = {
  tenantId: "tenant-1",
  applicationId: "app-1",
  robotId: "bot-1",
  provider: "feishu",
  secretRef: "secret://feishu/bot-1",
  enabled: true,
};

describe("source application robot config", () => {
  it("normalizes a valid enabled configuration", () => {
    expect(createRobotConfig({ ...baseInput, applicationId: " app-1 " })).toEqual({
      ...baseInput,
      applicationId: "app-1",
    });
  });

  it("rejects configurations without tenant, application, or robot identifiers", () => {
    expect(() => createRobotConfig({ ...baseInput, tenantId: " " })).toThrow("tenant ID is required");
    expect(() => createRobotConfig({ ...baseInput, applicationId: " " })).toThrow("application ID is required");
    expect(() => createRobotConfig({ ...baseInput, robotId: " " })).toThrow("robot ID is required");
  });

  it("rejects plaintext secrets and disabled sending configs", () => {
    expect(() => createRobotConfig({ ...baseInput, secretRef: "raw-secret" })).toThrow("secret reference is required");
    expect(() => createRobotConfig({ ...baseInput, enabled: false })).toThrow("robot configuration must be enabled");
  });
});
