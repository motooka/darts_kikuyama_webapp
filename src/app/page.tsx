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
      <p>※まだ開発中です。予告なく仕様やデザインが変わったり、過去のデータが消えたりすることがあります。</p>
      <div className={styles.ctas}>
        <Link href="/new" className={styles.primary}>{ongoing===null ? '新規の練習' : '練習の再開'}</Link>
      </div>
      <div style={{overflowX: 'scroll', width: 'calc(100vw - 64px)'}}>
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
