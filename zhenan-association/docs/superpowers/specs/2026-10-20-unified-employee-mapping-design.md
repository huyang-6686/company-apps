# Unified Employee ID Mapping

## Goal

Provide a tenant-scoped identity contract that can join Feishu and Yuguang identifiers to the formal unified employee ID required by task, notification, and deep-link integrations.

## Data model

`person.unified_employee_id` is nullable during staged migration, but must be non-empty when a mapping is created or updated. A composite unique constraint on `(tenant_id, unified_employee_id)` prevents duplicate identities within a tenant while allowing the same external identifier in different tenants. Existing Feishu and Yuguang IDs remain independently nullable and unique as currently defined.

## Service contract

The mapping service accepts a tenant ID, unified employee ID, and optional Feishu/Yuguang IDs. It trims values, rejects missing unified IDs and cross-tenant identity collisions, and returns a normalized mapping object. It does not call external APIs or write to the database; persistence and external synchronization remain integration-layer responsibilities.

## Verification

Tests cover normalization, required unified ID, tenant-scoped identity shape, and rejection of conflicting external IDs. Schema generation and the existing test, typecheck, lint, and build commands remain required.
