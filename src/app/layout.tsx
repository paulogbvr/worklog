import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkLog",
  description: "Acompanhamento de horas, projetos, pagamentos e valores pendentes."
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
