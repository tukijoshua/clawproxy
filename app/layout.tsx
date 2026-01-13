import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kreos.agency - Ship Products 10x Faster with AI",
  description: "We design, build, and launch products in 7-14 days using Claude Code. AI-powered development that's 10x faster than traditional agencies.",
  keywords: ["product development", "AI development", "Claude Code", "rapid prototyping", "MVP development"],
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
