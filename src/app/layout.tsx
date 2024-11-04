import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "菊池山口練習法(ダーツ) 記録アプリ",
  description: "練習がんばろう",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
