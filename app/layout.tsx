import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClawProxy - Stop Burning Money on AI Agents",
  description: "ClawProxy sits between OpenClaw and the API. It routes every request to the cheapest model that can handle it. Same results. 70% less spend.",
  keywords: ["AI proxy", "OpenClaw", "cost optimization", "smart routing", "AI agents", "API proxy"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
