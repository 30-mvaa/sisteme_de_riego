import type { Member, Payment, PaymentConcept } from "./types";

/** Fila típica de `members` (snake_case desde pg). */
export function memberFromRow(row: Record<string, unknown>): Member {
  return {
    id: String(row.id),
    cedula: String(row.cedula),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone),
    land: {
      hectares: Number(row.hectares),
      location: String(row.location),
      description: String(row.description),
    },
    createdAt: String(row.created_at),
  };
}

/** Fila típica de `payments` (snake_case desde pg). */
export function paymentFromRow(row: Record<string, unknown>): Payment {
  return {
    id: String(row.id),
    memberId: String(row.member_id),
    memberName: String(row.member_name),
    concept: row.concept as PaymentConcept,
    description: String(row.description),
    amount: Number(row.amount),
    date: String(row.date),
    receiptNumber: String(row.receipt_number),
    createdAt: String(row.created_at),
  };
}
