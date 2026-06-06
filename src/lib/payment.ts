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

type PaymentMessageInput = {
  amount: number;
  date: string;
  methodLabel?: string | null;
  note?: string | null;
  projectName: string;
  shareUrl?: string | null;
};

function singleLine(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function buildPaymentMessage(input: PaymentMessageInput) {
  const methodLabel = input.methodLabel?.trim();
  const note = input.note?.trim();
  const shareUrl = input.shareUrl?.trim();
  const amount = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(input.amount);
  const lines = [
    "*→ Pagamento Registrado com Sucesso!* 💸",
    "",
    `> *Projeto: →* ${singleLine(input.projectName)}`,
    `> _*${singleLine(input.date)}*_`,
    ""
  ];

  lines.push(`*Valor: →* *R$* ${amount}`);

  if (methodLabel) {
    lines.push(`*Forma de pagamento: →* ${singleLine(methodLabel)}`);
  }

  if (note) {
    lines.push(`*Observação: →* ${note}`);
  }

  if (shareUrl) {
    // O link fica sozinho na última linha e sem formatação de código para que
    // o WhatsApp gere a prévia/imagem do compartilhamento normalmente.
    lines.push(
      "",
      "*Você pode acompanhar todas as atualizações do projeto pelo link abaixo:* ↓",
      singleLine(shareUrl)
    );
  }

  return lines.join("\n");
}
