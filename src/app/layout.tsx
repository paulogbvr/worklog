import type { Metadata } from "next";
import "./globals.css";

const title = "WorkLog — Controle de horas e pagamentos";
const description =
  "Acompanhe horas trabalhadas, projetos, pagamentos e valores pendentes com integração WakaTime.";
const url = "https://worklog-projects.vercel.app/";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  applicationName: "WorkLog",
  title,
  description,
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "256x256" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" }
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }]
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "WorkLog",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WorkLog — Controle de horas e pagamentos"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
