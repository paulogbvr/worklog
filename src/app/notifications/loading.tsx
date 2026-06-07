import { PageSkeleton } from "@/components/page-skeleton";

export default function Loading() {
  return (
    <PageSkeleton
      description="Sincronizações, compartilhamentos e acessos aos projetos públicos."
      label="Notificações"
      title="Atividade recente"
      variant="metrics"
    />
  );
}
