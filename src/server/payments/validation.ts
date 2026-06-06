import { PaymentMethod } from "@prisma/client";

export type PaymentInput = {
  amount: number;
  method: PaymentMethod;
  note: string | null;
  paidAt: Date;
  projectId: string;
  receipt: File | null;
  removeReceipt: boolean;
};

function optionalText(value: FormDataEntryValue | unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parsePaidAt(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseMethod(value: unknown) {
  return Object.values(PaymentMethod).includes(value as PaymentMethod)
    ? (value as PaymentMethod)
    : null;
}

export async function readPaymentInput(request: Request): Promise<PaymentInput> {
  const contentType = request.headers.get("content-type") ?? "";
  let values: Record<string, FormDataEntryValue | unknown>;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    values = Object.fromEntries(formData.entries());
  } else {
    values = (await request.json()) as Record<string, unknown>;
  }

  const projectId = optionalText(values.projectId);
  const amount = Number(values.amount);
  const paidAt = parsePaidAt(values.paidAt);
  const method = parseMethod(values.method ?? PaymentMethod.OTHER);
  const receipt = values.receipt instanceof File && values.receipt.size > 0
    ? values.receipt
    : null;

  if (!projectId) {
    throw new Error("Selecione o projeto do pagamento.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Informe um valor de pagamento maior que zero.");
  }

  if (!paidAt) {
    throw new Error("Informe uma data de pagamento válida.");
  }

  if (!method) {
    throw new Error("Selecione uma forma de pagamento válida.");
  }

  return {
    amount,
    method,
    note: optionalText(values.note),
    paidAt,
    projectId,
    receipt,
    removeReceipt: values.removeReceipt === "true" || values.removeReceipt === true
  };
}
