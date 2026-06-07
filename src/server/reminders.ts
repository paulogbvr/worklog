import { NotificationCategory, NotificationType, ReminderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/server/dashboard/summary";

const TIME_ZONE = "America/Sao_Paulo";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: TIME_ZONE
  }).format(date);
}

// Reminders do not auto-send anything to the client. When a reminder reaches its
// due date we only create an internal notification so the admin remembers to
// charge — the actual WhatsApp/copy action stays manual.
export async function syncDuePaymentReminders() {
  try {
    const now = new Date();
    const dueReminders = await prisma.paymentReminder.findMany({
      select: {
        amountMode: true,
        dueDate: true,
        fixedAmount: true,
        id: true,
        project: {
          select: {
            fixedPrice: true,
            id: true,
            name: true,
            payments: {
              select: {
                amount: true
              }
            }
          }
        }
      },
      where: {
        dueDate: {
          lte: now
        },
        notifiedDueAt: null,
        status: ReminderStatus.ACTIVE
      }
    });

    for (const reminder of dueReminders) {
      const received = reminder.project.payments.reduce(
        (total, payment) => total + Number(payment.amount),
        0
      );
      const pending = reminder.project.fixedPrice
        ? Math.max(0, Number(reminder.project.fixedPrice) - received)
        : 0;
      const amount =
        reminder.amountMode === "FIXED" && reminder.fixedAmount
          ? Number(reminder.fixedAmount)
          : pending;
      const amountLabel =
        amount > 0 ? `${formatCurrency(amount)} para cobrar` : "pagamento a cobrar";

      await prisma.$transaction([
        prisma.notification.create({
          data: {
            category: NotificationCategory.IMPORTANT,
            message: `Projeto ${reminder.project.name} — ${amountLabel} (lembrete de ${formatDate(reminder.dueDate)}).`,
            projectId: reminder.project.id,
            title: "Lembrete de pagamento",
            type: NotificationType.PAYMENT_REMINDER_DUE
          }
        }),
        prisma.paymentReminder.update({
          data: {
            notifiedDueAt: now
          },
          where: {
            id: reminder.id
          }
        })
      ]);
    }
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error && typeof error.code === "string"
        ? error.code
        : error instanceof Error
          ? error.name
          : "unknown";

    console.error(`[reminders] due sync failed (${code})`);
  }
}
