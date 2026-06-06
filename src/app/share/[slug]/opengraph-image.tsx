import { ImageResponse } from "next/og";
import { getPublicProject } from "@/server/sharing";

export const alt = "Acompanhamento de projeto no WorkLog";
export const contentType = "image/png";
export const size = {
  height: 630,
  width: 1200
};
export const runtime = "nodejs";
export const revalidate = 3600;

export default async function OpenGraphImage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublicProject(slug);

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#090909",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "64px 72px",
          width: "100%"
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
          <div
            style={{
              alignItems: "center",
              background: "#000000",
              border: "1px solid rgba(255,255,255,.16)",
              borderRadius: 12,
              display: "flex",
              fontSize: 28,
              height: 58,
              justifyContent: "center",
              width: 58
            }}
          >
            {"</>"}
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700 }}>WorkLog</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ color: "#79e6b3", display: "flex", fontSize: 22 }}>
            Acompanhamento compartilhado
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: 0,
              lineHeight: 1.05,
              maxWidth: 980
            }}
          >
            {project?.name ?? "Projeto WorkLog"}
          </div>
          <div style={{ color: "rgba(255,255,255,.58)", display: "flex", fontSize: 26 }}>
            {project?.clientName ?? "Horas, valores e pagamentos em um só lugar"}
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,.12)",
            color: "rgba(255,255,255,.52)",
            display: "flex",
            fontSize: 20,
            justifyContent: "space-between",
            paddingTop: 24
          }}
        >
          <span>Tempo real, valor visível</span>
          <span style={{ fontSize: 26, fontWeight: 700 }}>R$</span>
        </div>
      </div>
    ),
    size
  );
}
