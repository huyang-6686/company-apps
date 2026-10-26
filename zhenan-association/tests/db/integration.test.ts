import { describe, expect, it } from "vitest";
import { integrationConfig } from "../../db/schema/integration";

describe("integration_config table schema", () => {
  it("has tenant, provider, external identity, and secret reference columns", () => {
    expect(integrationConfig.tenantId).toBeDefined();
    expect(integrationConfig.provider).toBeDefined();
    expect(integrationConfig.externalId).toBeDefined();
    expect(integrationConfig.secretRef).toBeDefined();
    expect(integrationConfig.isEnabled).toBeDefined();
  });
});
