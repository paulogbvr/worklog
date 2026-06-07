import { PageSkeleton } from "@/components/page-skeleton";

export default function Loading() {
  return (
    <PageSkeleton
      description="Organize clientes, tarifas, repositórios e links somente leitura."
      label="Projetos"
      title="Configuração e cobrança"
      variant="metrics"
    />
  );
}
