export type MemberUnitRequestContext = {
  tenantId: string;
  actions: ReadonlySet<string>;
};

export const MEMBER_UNIT_READ_ACTION = "membership.units.read";

export type RequestContextProvider = (
  request: Request,
) => Promise<MemberUnitRequestContext | null>;

export function createFailClosedRequestContextProvider(): RequestContextProvider {
  return async () => null;
}
