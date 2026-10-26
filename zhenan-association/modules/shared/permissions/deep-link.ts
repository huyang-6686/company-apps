export type DeepLinkPermissionBinding = {
  tenantId: string;
  unifiedEmployeeId: string;
  resourceCode: string;
  action: string;
};

export type DeepLinkAuthorizationInput = {
  tenantId: string;
  unifiedEmployeeId: string;
  resourceCode: string;
  action: string;
  binding?: DeepLinkPermissionBinding;
};

export type DeepLinkAuthorizationResult =
  | { allowed: true }
  | { allowed: false; reason: "permission context missing" | "permission denied" };

export function authorizeDeepLink(
  input: DeepLinkAuthorizationInput,
): DeepLinkAuthorizationResult {
  if (!input.binding) {
    return { allowed: false, reason: "permission context missing" };
  }

  const matches = [
    input.tenantId,
    input.unifiedEmployeeId,
    input.resourceCode,
    input.action,
  ].every((value) => value.trim().length > 0);
  if (!matches) {
    return { allowed: false, reason: "permission denied" };
  }

  const allowed =
    input.binding.tenantId === input.tenantId &&
    input.binding.unifiedEmployeeId === input.unifiedEmployeeId &&
    input.binding.resourceCode === input.resourceCode &&
    input.binding.action === input.action;

  return allowed ? { allowed: true } : { allowed: false, reason: "permission denied" };
}
