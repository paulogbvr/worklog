export const REMINDER_AMOUNT_MODES = [
  ["PENDING", "Pendente"],
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
  const lines = [
    "*→ Lembrete de Pagamento*",
    "",
    `> *Projeto: →* ${singleLine(input.projectName)}`
  ];

  // The value line is omitted when there is no value to show (e.g. a reminder
  // without a fixed amount).
  if (input.amount > 0) {
    const amount = new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(input.amount);
    lines.push(`> *Valor: →* *R$* ${amount}`);
  }

  lines.push(`> *Vencimento/Lembrete: →* ${singleLine(input.dueDateLabel)}`);

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
