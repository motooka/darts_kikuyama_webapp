'use client';

import styles from "./page.module.css";
import Link from "next/link";
import React from 'react';
import {
  createBlankPractice,
  TargetHistory,
  Practice,
  getTargetTuples,
  writeOngoingPracticeToStorage,
  loadOngoingPracticeFromStorage, appendPracticeToStorage, loadPracticesFromStorage
} from '@/models';
import {formatMPR, formatYMDHM} from "@/app/utils";

function renderTargetCell(t: TargetHistory) {
  const mpr = formatMPR(t.marks, t.darts);
  return `${t.darts}本 ${mpr}MPR`;
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
      <div className={styles.ctas}>
        <Link href="/new" className={styles.primary}>{ongoing===null ? '新規の練習' : '練習の再開'}</Link>
      </div>
      <div>
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
                <th>B</th>
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
