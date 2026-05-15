import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "AZ-204 Prep — Microsoft Azure Developer Associate",
  description:
    "Interactive AZ-204 exam preparation: 100+ questions across all five domains, practice and exam simulator, flashcards, and detailed explanations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen gradient-bg">
        <Providers>
          <Nav />
          <main className="container py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
