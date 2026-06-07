import { PageSkeleton } from "@/components/page-skeleton";

export default function Loading() {
  return (
    <PageSkeleton
      description="Registre entradas e acompanhe o saldo financeiro de cada projeto."
      label="Pagamentos"
      title="Recebimentos"
      variant="metrics"
    />
  );
}
