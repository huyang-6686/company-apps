import { handleMemberUnitRequest } from "../../../../../modules/membership/member-unit-route";
import { createDemoMemberUnitReader, DEMO_TENANT_ID } from "../../../../../modules/membership/member-unit-demo-reader";
import { isDemoModeEnabled } from "../../../../../modules/membership/demo-mode";
import { MEMBER_UNIT_READ_ACTION } from "../../../../../modules/shared/auth/request-context";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Demo-only API: serves synthetic data through the shared request handler.
// The formal route (app/api/membership/units/route.ts) is intentionally not
// touched and keeps its fail-closed 401 behavior.
export async function GET(request: Request) {
  if (!isDemoModeEnabled()) {
    return Response.json({ error: "not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  return handleMemberUnitRequest(request, {
    context: {
      tenantId: DEMO_TENANT_ID,
      actions: new Set([MEMBER_UNIT_READ_ACTION]),
    },
    reader: createDemoMemberUnitReader(),
  });
}

