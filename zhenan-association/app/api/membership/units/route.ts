import { createDrizzleMemberUnitReader } from "../../../../modules/membership/member-unit-service";
import { handleMemberUnitRequest } from "../../../../modules/membership/member-unit-route";
import { createFailClosedRequestContextProvider } from "../../../../modules/shared/auth/request-context";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requestContextProvider = createFailClosedRequestContextProvider();

export async function GET(request: Request) {
  // Identity and tenant resolution are intentionally fail-closed until the
  // Feishu/Yuguang session adapter is connected to this route.
  return handleMemberUnitRequest(request, {
    context: await requestContextProvider(request),
    reader: createDrizzleMemberUnitReader(),
  });
}
