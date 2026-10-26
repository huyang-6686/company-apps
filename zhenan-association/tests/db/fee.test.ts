import { describe, expect, it } from "vitest";
import { feeBill, feePayment, feeStandard } from "../../db/schema/fee";

describe("membership fee schema", () => {
  it("defines fee standards with tenant, tier, year, amount and effective date", () => {
    expect(feeStandard.tenantId).toBeDefined();
    expect(feeStandard.tier).toBeDefined();
    expect(feeStandard.year).toBeDefined();
    expect(feeStandard.amount).toBeDefined();
    expect(feeStandard.effectiveFrom).toBeDefined();
  });

  it("defines one annual bill per member unit with due and paid amounts", () => {
    expect(feeBill.tenantId).toBeDefined();
    expect(feeBill.memberUnitId).toBeDefined();
    expect(feeBill.year).toBeDefined();
    expect(feeBill.amountDue).toBeDefined();
    expect(feeBill.amountPaid).toBeDefined();
    expect(feeBill.dueDate).toBeDefined();
    expect(feeBill.status).toBeDefined();
  });

  it("records payments with voucher metadata", () => {
    expect(feePayment.tenantId).toBeDefined();
    expect(feePayment.memberUnitId).toBeDefined();
    expect(feePayment.amount).toBeDefined();
    expect(feePayment.paidAt).toBeDefined();
    expect(feePayment.voucherMetadata).toBeDefined();
  });
});
