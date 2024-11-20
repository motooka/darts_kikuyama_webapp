'use client';

import styles from "./page.module.css";
import Link from "next/link";
import React from 'react';
import {
  TargetHistory,
  Practice,
  loadOngoingPracticeFromStorage, loadPracticesFromStorage
} from '@/models';
import {formatMPR, formatYMDHM} from "@/app/utils";

function renderTargetCell(t: TargetHistory) {
  const mpr = formatMPR(t.marks, t.darts);
  return (
    <>
      <span className={styles.historiesTableMark}>{t.darts}本</span>
      <span className={styles.historiesTableMpr}>{mpr}MPR</span>
    </>
  );
}

export default function Home() {
  const [ongoing, setOngoing] = React.useState<Practice|null>(null);
  const [practices, setPractices] = React.useState<Practice[]>([]);
  React.useEffect(() => {
    setOngoing(loadOngoingPracticeFromStorage());
    setPractices(loadPracticesFromStorage());
  }, []);

  return (
    <>
      <p>
        「菊池山口練習法」は、各クリケットナンバー（20〜15, Bull）で10マークを出すのにかかった本数を記録していく、という練習法です。
        <span style={{fontSize: '70%', opacity: '0.6'}}>（似たような練習法は昔からあったような気もしますが、きちんと記録していきましょうという点が昔のものとの違いだろうと捉えています。）</span>
        <br/>
        本家の解説動画は <a href="https://youtu.be/Ve37QZhcwsQ" target="_blank" rel="noopener">https://youtu.be/Ve37QZhcwsQ</a> をご覧下さい。
      </p>
      <p>※まだ開発中です。予告なく仕様やデザインが変わったり、過去のデータが消えたりすることがあります。</p>
      <div className={styles.ctas}>
        <Link href="/new" className={styles.primary}>{ongoing === null ? '新規の練習' : '練習の再開'}</Link>
      </div>
      <div style={{overflowX: 'scroll', width: 'calc(100vw - 64px)', maxWidth: '600px'}}>
        <h2>直近10練習の記録</h2>
        {
          practices.length <= 0 ? <p>過去の記録はありません</p> : (
            <table>
              <thead>
              <tr>
                <th>開始</th>
                <th>20</th>
                <th>19</th>
                <th>18</th>
                <th>17</th>
                <th>16</th>
                <th>15</th>
                <th>Bull</th>
                <th style={{minWidth: '10rem', width: '10rem'}}>コメント</th>
              </tr>
              </thead>
              <tbody>
              {
                practices.slice(-10).reverse().map((practice, index) => {
                  return (
                    <tr key={index}>
                      <td>{formatYMDHM(practice.startYMD, practice.startHMS)}</td>
                      <td>{renderTargetCell(practice.target20)}</td>
                      <td>{renderTargetCell(practice.target19)}</td>
                      <td>{renderTargetCell(practice.target18)}</td>
                      <td>{renderTargetCell(practice.target17)}</td>
                      <td>{renderTargetCell(practice.target16)}</td>
                      <td>{renderTargetCell(practice.target15)}</td>
                      <td>{renderTargetCell(practice.targetBull)}</td>
                      <td style={{
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        wordBreak: 'break-all'
                      }}>{practice.comment ?? ''}</td>
                    </tr>
                  );
                })
              }
              </tbody>
            </table>
          )
        }
      </div>
      <div>
        <h2>日ごとの推移</h2>
        <p>後で作ります…</p>
      </div>
    </>
  );
}
