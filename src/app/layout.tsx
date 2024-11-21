import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import styles from "@/app/page.module.css";

import {buildInfo} from "@/buildInfo";

export const metadata: Metadata = {
  title: "菊池山口練習法🎯 記録アプリ",
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
        <h1>菊池山口練習法🎯 記録アプリ</h1>
      </header>
      <main className={styles.main}>
        {children}
      </main>
      <div style={{flexGrow: 1}}></div>
      <footer className={styles.footer}>
        <p>
          バグ報告や機能要望などは、一般の皆様はTwitter(X)の
          <a href="https://x.com/t_motooka" rel="noopener" target="_blank">@t_motooka</a>
          へ。
          プログラマの皆様は
          <a href="https://github.com/motooka/darts_kikuyama_webapp/" target="_blank" rel="noopener">GitHub : motooka/darts_kikuyama_webapp</a>
          で。
        </p>
        <div>
          copyright &copy;
          <a
            href="https://www.tmotooka.com/"
            target="_blank"
            rel="noopener"
          >T.MOTOOKA</a>
        </div>
        <div>
          build version <code>{buildInfo.built}</code>
        </div>
      </footer>
    </div>
    </body>
    </html>
  );
}
