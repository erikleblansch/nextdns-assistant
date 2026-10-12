import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextDNS Assistant",
  description: "Manage your NextDNS profile and explore logs from ChatGPT.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
