export const REMINDER_AMOUNT_MODES = [
  ["PENDING", "Valor pendente integral"],
  ["FIXED", "Valor fixo"]
] as const;

export type ReminderAmountModeValue = (typeof REMINDER_AMOUNT_MODES)[number][0];

type ReminderMessageInput = {
  amount: number;
  dueDateLabel: string;
  message?: string | null;
  projectName: string;
  shareUrl?: string | null;
};

function singleLine(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function buildReminderMessage(input: ReminderMessageInput) {
  const note = input.message?.trim();
  const shareUrl = input.shareUrl?.trim();
  const amount = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(input.amount);
  const lines = [
    "*→ Lembrete de Pagamento*",
    "",
    `> *Projeto: →* ${singleLine(input.projectName)}`,
    `> *Valor: →* *R$* ${amount}`,
    `> *Vencimento/Lembrete: →* ${singleLine(input.dueDateLabel)}`
  ];

  if (note) {
    lines.push("", singleLine(note));
  }

  if (shareUrl) {
    lines.push(
      "",
      "Você pode acompanhar os detalhes do projeto pelo link abaixo: ↓",
      singleLine(shareUrl)
    );
  }

  return lines.join("\n");
}
