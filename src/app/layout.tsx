import type { Metadata } from "next";
import "./globals.css";

const title = "WorkLog — Controle de horas e pagamentos";
const description =
  "Acompanhe horas trabalhadas, projetos, pagamentos e valores pendentes com integração WakaTime.";
const siteUrl = "https://worklog-projects.vercel.app";
const ogImageUrl = `${siteUrl}/og-worklog-v5.png`;
const ogImageAlt = "WorkLog — Controle real do tempo trabalhado";

const preferenceScript = `
  (() => {
    try {
      const theme = localStorage.getItem("worklog-theme") === "light" ? "light" : "dark";
      const sidebar = localStorage.getItem("worklog-sidebar-state") === "collapsed"
        ? "collapsed"
        : "expanded";
      const root = document.documentElement;
      root.dataset.theme = theme;
      root.dataset.sidebar = sidebar;
      root.style.setProperty("--sidebar-width", sidebar === "collapsed" ? "84px" : "288px");
      root.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.dataset.sidebar = "expanded";
      document.documentElement.style.setProperty("--sidebar-width", "288px");
      document.documentElement.style.colorScheme = "dark";
    }
  })();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "WorkLog",
  title,
  description,
  alternates: {
    canonical: "/"
  },
  icons: {
    apple: [{ url: "/icon-worklog.png", sizes: "512x512", type: "image/png" }],
    icon: [
      { url: "/favicon.ico", sizes: "256x256", type: "image/x-icon" },
      { url: "/icon-worklog.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: ["/favicon.ico"]
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "WorkLog",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: ogImageUrl,
        secureUrl: ogImageUrl,
        type: "image/png",
        width: 1200,
        height: 630,
        alt: ogImageAlt
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [
      {
        url: ogImageUrl,
        secureUrl: ogImageUrl,
        type: "image/png",
        width: 1200,
        height: 630,
        alt: ogImageAlt
      }
    ]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-sidebar="expanded" data-theme="dark" lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferenceScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
