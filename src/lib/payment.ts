export const PAYMENT_METHODS = [
  ["PIX", "Pix"],
  ["CREDIT_CARD", "Cartão de crédito"],
  ["TED", "TED"],
  ["CASH", "Dinheiro"],
  ["BOLETO", "Boleto"],
  ["OTHER", "Outro"]
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number][0];

export function getPaymentMethodLabel(method: PaymentMethodValue) {
  return PAYMENT_METHODS.find(([value]) => value === method)?.[1] ?? "Outro";
}
