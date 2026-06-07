import { PageSkeleton } from "@/components/page-skeleton";

export default function Loading() {
  return (
    <PageSkeleton
      description="Registre trabalho fora do editor em um ou mais intervalos."
      label="Operações"
      title="Tempo dedicado"
      variant="list"
    />
  );
}
