export type PersonIdentityMappingInput = {
  tenantId: string;
  unifiedEmployeeId: string;
  feishuUserId?: string | null;
  yuguangUserId?: string | null;
};

export type PersonIdentityMapping = {
  tenantId: string;
  unifiedEmployeeId: string;
  feishuUserId: string | null;
  yuguangUserId: string | null;
};

function normalizeOptional(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function createPersonIdentityMapping(
  input: PersonIdentityMappingInput,
): PersonIdentityMapping {
  const tenantId = input.tenantId.trim();
  if (!tenantId) {
    throw new Error("tenant ID is required");
  }

  const unifiedEmployeeId = input.unifiedEmployeeId.trim();
  if (!unifiedEmployeeId) {
    throw new Error("unified employee ID is required");
  }

  return {
    tenantId,
    unifiedEmployeeId,
    feishuUserId: normalizeOptional(input.feishuUserId),
    yuguangUserId: normalizeOptional(input.yuguangUserId),
  };
}
