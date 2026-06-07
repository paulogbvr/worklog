import { PageSkeleton } from "@/components/page-skeleton";

export default function Loading() {
  return (
    <PageSkeleton
      description="Dados necessários para vincular projetos e acompanhar cobrança."
      label="Clientes"
      title="Relacionamentos ativos"
      variant="metrics"
    />
  );
}
