import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Copilot Training Shop",
  description: "GitHub Copilot 研修用のミニECサイト",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            ☕ Copilot Training Shop
          </Link>
          <nav>
            <Link href="/cart">カートを見る</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
