import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import styles from "@/app/page.module.css";

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
    <div className={styles.page}>
      <header>
        <h1>菊池山口練習法(ダーツ) 記録アプリ</h1>
      </header>
      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div>
          copyright &copy;
          <a
            href="https://www.tmotooka.com/"
            target="_blank"
            // rel="noopener noreferrer"
          >T.MOTOOKA</a>
        </div>
      </footer>
    </div>
    </body>
    </html>
  );
}
