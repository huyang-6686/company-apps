# Member Ledger Demo (会员台账 Demo) Design

Date: 2026-10-21
Stage: 1 需求澄清与设计 (per 《应用开发流程规范-20261021-v1.1》)
Status: approved; implementation remediation in progress
CTX: 未检测

## Goal

Provide a local, read-only demo of the member ledger (会员台账) so staff can evaluate the query, status-filter, pagination, and detail interactions on a LAN test deployment, without touching the formal API, real member data, or production (zast.qlf3.com is the old production and is out of scope for this round).

## Confirmed decisions (user, 2026-10-21, handoff.md 第三节)

1. Demo core flow: 会员台账——查询、状态筛选、分页、详情（只读）。
2. Synthetic data only; the page must visibly mark "演示数据 / 非真实会员". Isolated route `/demo/membership/units`; the formal four-level menu hierarchy is not modified.
3. The formal API `app/api/membership/units/route.ts` stays fail-closed (401) unchanged. Mock data is injected through the existing `MemberUnitReader` interface, fully isolated from the Drizzle data source.
4. Staff testing = local LAN only (same WiFi/wired segment), plaintext HTTP restricted to intranet, no public mapping.
5. No real data in the demo; real data starts only after go-live (from 阶段7 test environment with Feishu login + permissions + backup).

## Current code facts (verified this session, no changes made)

- `modules/membership/member-unit-service.ts` already exports `MemberUnitReader` (`list(query) -> { items, total }`), `MemberUnitRecord`, and `normalizeMemberUnitQuery` (limit default 25, max 100; search max 100 chars; status `active|inactive`).
- `modules/membership/member-unit-route.ts` returns 401 when `tenantId` is null and rejects client-supplied `tenantId`.
- `app/api/membership/units/route.ts` hardcodes `tenantId: null` + Drizzle reader → currently 401 (expected fail-closed boundary).
- `components/membership/member-unit-ledger.tsx` implements search + status filter + pagination (25/page) against `/api/membership/units` via `buildMemberUnitQuery` / `readMemberUnitResponse`.
- Existing tests: `tests/membership/member-unit-{service,route,view-state}.test.ts` etc. (35 files / 96 tests green at 2026-10-21 baseline; not re-run this session).

## Demo design

### Route and pages

- New isolated page: `app/demo/membership/units/page.tsx` (server component shell) reachable by direct URL only. It is NOT added to `modules/workspace/module-pages.ts` / formal navigation, and introduces no 4th-level menu items.
- The page renders a prominent, dismissible-none demo banner: "演示数据 / 非真实会员" (visually distinct, e.g. warning styling), plus a link back to `/workspace`.

### Mock data source

- New module `modules/membership/member-unit-demo-reader.ts`: an in-memory `MemberUnitReader` returning a fixed set of ~40 synthetic member units (fabricated names like "演示单位A01", fake 18-digit credit codes clearly fake such as "91350000DEMO0000XX" pattern, synthetic tiers/fees/contacts, and `DEMO-PHONE-XX` contact labels that are not callable phone numbers). Deterministic (no randomness at request time) so pagination results are stable. Detail lookup uses `getById` rather than fetching a capped page.
- Synthetic records cover both `isActive` states and varied `tier`/`feeAmount`/`contactPerson` null-ness to exercise all view states.
- Data lives only in module memory; no database tables, migrations, or writes are involved.

### API for the demo

- New route `app/api/demo/membership/units/route.ts` calling the same `handleMemberUnitRequest` with `{ tenantId: "demo-tenant", reader: createDemoMemberUnitReader() }`.
- Rationale: reuses the validated request handling (query normalization, 400/401 semantics) while remaining physically separate from the formal route. The formal route file is not modified, and its fail-closed 401 behavior is preserved and asserted by existing tests.
- The demo API responds to the same query contract (`search`, `status`, `limit`, `offset`) as the formal one.
- Request parsing and shared list-query contracts live outside the database-backed service module. The Demo API dependency graph must not include `db`, `drizzle-orm`, or `pg`; database pool creation is lazy.
- Demo pages and API return 404 unless `DEMO_MODE=true`. `npm run start:lan` sets this flag for local LAN testing. Demo page metadata disables indexing and following.

### Detail (只读)

- Ledger rows link to `/demo/membership/units/[id]` (server component) showing all `MemberUnitRecord` fields read-only: name, creditCode, category, tier, feeAmount, contactPerson, contactPhone, isActive. No edit/create/delete actions anywhere in the demo.
- Detail resolves by ID from the same demo reader; unknown IDs use Next.js `notFound()` and render the Demo-specific not-found page with HTTP 404 semantics.

### Client component reuse

- Extract/reuse the existing table+filter logic without changing formal behavior: the demo page wraps the existing `MemberUnitLedger` data flow via a props-injected fetch endpoint (e.g. optional `apiBase` prop defaulting to `/api/membership/units`; demo passes `/api/demo/membership/units`), or a small demo-specific client component that reuses `buildMemberUnitQuery` / `readMemberUnitResponse`. Implementation choice is made in 阶段2 plan; the constraint is that the formal ledger's current behavior and its tests remain unchanged.
- Detail rows marked clickable only in demo context.

## Non-goals / boundaries

- No changes to: formal API route, Drizzle reader, db schema/migrations, formal menu/navigation, permissions, identity adapter.
- No real member data, no external calls (Feishu/Yuguang/DingTalk), no notification/task/outbox integration.
- No production deployment or线上 operations of any kind.
- Demo is not a menu item and not linked from formal pages except explicitly from itself.
- `DEMO_MODE` defaults to disabled; only the local LAN launch script explicitly enables it.

## Security and data boundaries

- Synthetic data only; names/credit codes/phones are fabricated and clearly non-real (verified against real tenant data is impossible by construction—no DB access).
- LAN-only exposure via existing `npm run start:lan` on port 3000; no public mapping, no TLS required for this scope.

## Verification plan (to execute in later stages, not in this spec round)

1. New tests: demo reader returns deterministic synthetic list honoring status/search/limit/offset; demo route passes demo tenant + demo reader; demo banner text present; unknown detail id handled.
2. Existing suite must stay green: `npm test -- --reporter=dot`, `npx tsc --noEmit`, `npm run lint`, `npm run build` (results to be reported only after real runs; none fabricated here).
3. Manual LAN check by staff on `http://192.168.0.101:3000/demo/membership/units`.

## Open items (external, not blocking demo)

- application_id, module owners, unified employee ID / tenant mapping, Yuguang integration params, Feishu bot params — all unverified; demo does not depend on them.

