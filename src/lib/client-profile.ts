export type TaxIdKind = "CPF" | "CNPJ";

export type TaxIdFeedback = {
  kind: TaxIdKind;
  valid: boolean;
};

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatTaxId(value: string) {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatPhone(value: string) {
  const rawDigits = onlyDigits(value);
  const digits = (rawDigits.startsWith("55") && rawDigits.length > 11
    ? rawDigits.slice(2)
    : rawDigits
  ).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function hasRepeatedDigits(value: string) {
  return /^(\d)\1+$/.test(value);
}

export function isValidCpf(value: string) {
  const digits = onlyDigits(value);
  const knownInvalid = new Set(["01234567890", "12345678909"]);

  if (digits.length !== 11 || hasRepeatedDigits(digits) || knownInvalid.has(digits)) {
    return false;
  }

  const calculateDigit = (length: number) => {
    const sum = digits
      .slice(0, length)
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === Number(digits[9]) && calculateDigit(10) === Number(digits[10]);
}

export function isValidCnpj(value: string) {
  const digits = onlyDigits(value);

  if (digits.length !== 14 || hasRepeatedDigits(digits)) {
    return false;
  }

  const calculateDigit = (base: string, weights: number[]) => {
    const sum = base
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateDigit(
    `${digits.slice(0, 12)}${firstDigit}`,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  );

  return firstDigit === Number(digits[12]) && secondDigit === Number(digits[13]);
}

export function getTaxIdFeedback(value: string): TaxIdFeedback | null {
  const digits = onlyDigits(value);

  if (!digits) {
    return null;
  }

  if (digits.length <= 11) {
    return {
      kind: "CPF",
      valid: isValidCpf(digits)
    };
  }

  return {
    kind: "CNPJ",
    valid: isValidCnpj(digits)
  };
}

export function calculateAge(value: string, today = new Date()) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const birthDate = new Date(year, month - 1, day);

  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day ||
    birthDate > today
  ) {
    return null;
  }

  let age = today.getFullYear() - year;
  const birthdayHasPassed =
    today.getMonth() > month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() >= day);

  if (!birthdayHasPassed) {
    age -= 1;
  }

  return age;
}
