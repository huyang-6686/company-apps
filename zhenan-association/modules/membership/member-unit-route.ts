import { listMemberUnits, type MemberUnitReader, type MemberUnitStatus } from "./member-unit-contract";
import { MEMBER_UNIT_READ_ACTION, type MemberUnitRequestContext } from "../shared/auth/request-context";

export type MemberUnitRouteDependencies = {
  context: MemberUnitRequestContext | null;
  reader: MemberUnitReader;
};

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function parseInteger(value: string | null, name: string): number | undefined {
  if (value === null) return undefined;
  if (!/^(0|[1-9]\d*)$/.test(value)) throw new Error(`Invalid ${name}`);
  return Number(value);
}

export async function handleMemberUnitRequest(
  request: Request,
  dependencies: MemberUnitRouteDependencies,
): Promise<Response> {
  if (!dependencies.context?.tenantId?.trim()) {
    return json({ error: "authentication required" }, 401);
  }
  if (!dependencies.context.actions.has(MEMBER_UNIT_READ_ACTION)) {
    return json({ error: "forbidden" }, 403);
  }

  const url = new URL(request.url);
  if (url.searchParams.has("tenantId")) {
    return json({ error: "tenantId cannot be supplied by the client" }, 400);
  }

  const statusValue = url.searchParams.get("status") || undefined;
  if (statusValue && statusValue !== "active" && statusValue !== "inactive") {
    return json({ error: "invalid status" }, 400);
  }

  try {
    const result = await listMemberUnits(dependencies.reader, {
      tenantId: dependencies.context.tenantId,
      search: url.searchParams.get("search") ?? url.searchParams.get("q") ?? undefined,
      status: statusValue as MemberUnitStatus | undefined,
      limit: parseInteger(url.searchParams.get("limit"), "limit"),
      offset: parseInteger(url.searchParams.get("offset"), "offset"),
    });

    return json(result, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    if (message === "Tenant ID is required") return json({ error: "authentication required" }, 401);
    if (message.startsWith("Invalid ") || message.includes("too long")) {
      return json({ error: message }, 400);
    }

    return json({ error: "member unit query unavailable" }, 503);
  }
}
