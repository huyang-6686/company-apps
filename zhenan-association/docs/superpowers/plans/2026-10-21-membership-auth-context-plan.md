# Membership Query Auth Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a replaceable, fail-closed request-context and permission boundary for the formal member-unit read API without inventing an external identity protocol.

**Architecture:** The route handler will authorize a server-supplied `MemberUnitRequestContext` containing a tenant and the `membership.units.read` action. The formal Next route will obtain context through a default provider that returns `null` until a verified Feishu/Yuguang adapter is supplied; the demo route will keep its isolated synthetic context. The database reader remains responsible only for tenant-scoped reads.

**Tech Stack:** Next.js 15, TypeScript, Vitest, Drizzle/PostgreSQL reader.

---

### Task 1: Add the request-context contract and failing authorization tests

**Files:**
- Create: `modules/shared/auth/request-context.ts`
- Modify: `modules/membership/member-unit-route.ts`
- Modify: `tests/membership/member-unit-route.test.ts`

- [ ] **Step 1: Write failing tests for missing and insufficient context**

Add tests that call `handleMemberUnitRequest` with `context: null`, with a tenant but no `membership.units.read` action, and with the read action. Expect 401, 403, and 200 respectively; assert the reader is not called for 401/403.

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run: `npm test -- tests/membership/member-unit-route.test.ts --reporter=dot`

Expected: FAIL because the context contract and authorization checks do not yet exist.

- [ ] **Step 3: Implement the minimal context contract**

Define `MemberUnitRequestContext`, `MEMBER_UNIT_READ_ACTION`, `RequestContextProvider`, and `createFailClosedRequestContextProvider()` in `modules/shared/auth/request-context.ts`. Update the handler dependency to accept `context: MemberUnitRequestContext | null`, reject null as `{ error: "authentication required" }` with 401, reject a missing action as `{ error: "forbidden" }` with 403, and pass only `context.tenantId` into `listMemberUnits`.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- tests/membership/member-unit-route.test.ts --reporter=dot`

Expected: PASS, including the existing query-validation and client-tenant rejection cases.

### Task 2: Wire the formal route through the fail-closed provider

**Files:**
- Modify: `app/api/membership/units/route.ts`
- Modify: `tests/membership/member-unit-route.test.ts`

- [ ] **Step 1: Add a provider contract test**

Assert that `createFailClosedRequestContextProvider()(request)` resolves to `null`, and that the formal `GET` route still returns 401 without a configured verified adapter.

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run: `npm test -- tests/membership/member-unit-route.test.ts --reporter=dot`

Expected: FAIL until the route calls the provider and passes its result to the handler.

- [ ] **Step 3: Wire the route without trusting request headers**

Export a module-level `requestContextProvider` initialized by `createFailClosedRequestContextProvider()`. In `GET`, await the provider and call `handleMemberUnitRequest` with that context and the existing Drizzle reader. Do not parse tenant or permission values from query parameters or arbitrary client headers.

- [ ] **Step 4: Run focused and formal API regression tests**

Run: `npm test -- tests/membership/member-unit-route.test.ts tests/membership/member-unit-demo-route.test.ts --reporter=dot`

Expected: PASS; formal API remains 401 and Demo API remains isolated and functional.

### Task 3: Update the isolated Demo adapter and complete regression verification

**Files:**
- Modify: `app/api/demo/membership/units/route.ts`
- Modify: `tests/membership/member-unit-demo-route.test.ts`
- Modify: `.project-board/state.json`
- Modify: `.project-board/board.md`
- Modify: `.project-board/events.jsonl`
- Modify: `.project-board/handoff.md`

- [ ] **Step 1: Pass an explicit synthetic context to the Demo handler**

Use `{ tenantId: "demo-tenant", actions: new Set([MEMBER_UNIT_READ_ACTION]) }` only inside the Demo route; retain the `DEMO_MODE` gate and synthetic reader.

- [ ] **Step 2: Run the complete verification suite**

Run:

```powershell
npm test -- --reporter=dot
npx tsc --noEmit
npm run lint
npm run build
```

Expected: all commands pass; no production or LAN deployment is performed.

- [ ] **Step 3: Record the stage-5 evidence**

Update the project board and handoff with exact command results, the unchanged formal 401 boundary, the fact that no external identity adapter is configured, and the remaining prerequisite: verified Feishu/Yuguang context contract plus test account before enabling real access.

