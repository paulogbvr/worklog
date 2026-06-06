import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#090909",
    description: "Controle real do tempo trabalhado, projetos e pagamentos.",
    display: "standalone",
    icons: [
      {
        sizes: "180x180",
        src: "/apple-icon.png",
        type: "image/png"
      },
      {
        sizes: "512x512",
        src: "/icon-worklog.png",
        type: "image/png"
      }
    ],
    name: "WorkLog",
    short_name: "WorkLog",
    start_url: "/",
    theme_color: "#090909"
  };
}
