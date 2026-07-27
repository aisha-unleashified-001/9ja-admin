import type { VendorSignup } from "../types/api";

export type VendorPaymentStatusLabel = "Paid" | "Not Paid";

/**
 * Read payment fields from a vendor signup payload.
 * Supports camelCase / snake_case and a few alternate backend keys.
 */
export function getVendorPaymentFields(signup: VendorSignup): {
  paymentStatus: unknown;
  paymentMethod: unknown;
} {
  const raw = signup as unknown as Record<string, unknown>;
  const nestedPayment =
    (raw.payment as Record<string, unknown> | undefined) ??
    (raw.registrationPayment as Record<string, unknown> | undefined) ??
    (raw.registration_payment as Record<string, unknown> | undefined) ??
    null;

  const paymentStatus =
    signup.paymentStatus ??
    raw.payment_status ??
    raw.isPaid ??
    raw.is_paid ??
    raw.registrationPaymentStatus ??
    raw.registration_payment_status ??
    raw.paymentConfirmed ??
    raw.payment_confirmed ??
    nestedPayment?.status ??
    nestedPayment?.paymentStatus ??
    nestedPayment?.payment_status ??
    null;

  const paymentMethod =
    signup.paymentMethod ??
    raw.payment_method ??
    raw.registrationPaymentMethod ??
    raw.registration_payment_method ??
    raw.paymentType ??
    raw.payment_type ??
    nestedPayment?.method ??
    nestedPayment?.paymentMethod ??
    nestedPayment?.payment_method ??
    null;

  return { paymentStatus, paymentMethod };
}

export function normalizeVendorPaymentStatus(
  value: unknown
): VendorPaymentStatusLabel {
  if (value === null || value === undefined || value === "") {
    return "Not Paid";
  }

  if (typeof value === "boolean") {
    return value ? "Paid" : "Not Paid";
  }

  const normalized = String(value).trim().toLowerCase().replace(/[_-]+/g, " ");

  if (
    ["1", "true", "yes", "paid", "confirmed", "success", "successful"].includes(
      normalized
    )
  ) {
    return "Paid";
  }

  if (
    [
      "0",
      "false",
      "no",
      "unpaid",
      "not paid",
      "pending",
      "failed",
      "none",
    ].includes(normalized)
  ) {
    return "Not Paid";
  }

  if (normalized.includes("not paid") || normalized.includes("unpaid")) {
    return "Not Paid";
  }

  if (normalized === "paid" || normalized.endsWith(" paid")) {
    return "Paid";
  }

  return "Not Paid";
}

export function formatVendorPaymentMethod(
  value: unknown,
  paymentStatus?: unknown
): string {
  const status = normalizeVendorPaymentStatus(paymentStatus);

  if (value === null || value === undefined || String(value).trim() === "") {
    return status === "Paid" ? "N/A" : "Not Paid";
  }

  const normalized = String(value).trim().toLowerCase().replace(/[_-]+/g, " ");

  if (
    ["not paid", "unpaid", "none", "n/a", "na", "null"].includes(normalized)
  ) {
    return "Not Paid";
  }

  if (normalized === "cash") {
    return "Cash";
  }

  if (
    [
      "transfer",
      "card",
      "transfer/card",
      "transfer card",
      "card/transfer",
      "card transfer",
      "bank transfer",
      "banktransfer",
    ].includes(normalized) ||
    (normalized.includes("transfer") && normalized.includes("card"))
  ) {
    return "Transfer/card";
  }

  if (normalized.includes("transfer")) {
    return "Transfer/card";
  }

  if (normalized.includes("card")) {
    return "Transfer/card";
  }

  // Preserve readable API values (e.g. already "Transfer/card")
  const trimmed = String(value).trim();
  if (trimmed.includes("/")) {
    return trimmed
      .split("/")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("/");
  }

  return trimmed
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
