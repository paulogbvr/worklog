import {
  calculateAge,
  formatPhone,
  getTaxIdFeedback,
  onlyDigits
} from "@/lib/client-profile";
import { isClientStatusValue } from "@/lib/client-status";

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseBirthDate(value: unknown) {
  const text = optionalText(value);

  if (!text) {
    return { date: null, valid: true };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || calculateAge(text) === null) {
    return { date: null, valid: false };
  }

  return {
    date: new Date(`${text}T00:00:00.000Z`),
    valid: true
  };
}

export function parseClientInput(body: Record<string, unknown>) {
  const name = optionalText(body.name);

  if (!name) {
    return {
      error: "Informe o nome do cliente.",
      ok: false as const
    };
  }

  const email = optionalText(body.email);

  if (email && !isValidEmail(email)) {
    return {
      error: "Informe um email válido.",
      ok: false as const
    };
  }

  const taxIdText = optionalText(body.taxId);
  const taxId = taxIdText ? onlyDigits(taxIdText) : null;
  const taxIdFeedback = taxIdText ? getTaxIdFeedback(taxIdText) : null;

  if (taxIdFeedback && !taxIdFeedback.valid) {
    return {
      error: `${taxIdFeedback.kind} inválido.`,
      ok: false as const
    };
  }

  const birthDate = parseBirthDate(body.birthDate);

  if (!birthDate.valid) {
    return {
      error: "Informe uma data de nascimento válida.",
      ok: false as const
    };
  }

  const phone = optionalText(body.phone);
  const statusText = optionalText(body.status);
  const status = statusText && isClientStatusValue(statusText) ? statusText : null;

  return {
    data: {
      address: optionalText(body.address),
      birthDate: birthDate.date,
      email,
      name,
      notes: optionalText(body.notes),
      phone: phone ? formatPhone(phone) : null,
      status,
      taxId
    },
    ok: true as const
  };
}
