'use client';

import styles from "./page.module.css";
import Link from "next/link";
import React from 'react';
import {
  TargetHistory,
  Practice,
  loadOngoingPracticeFromStorage,
  loadPracticesFromStorage, buildPracticesCsv, getTargetTuples
} from '@/models';
import {formatMPR, formatYMDHM} from "@/app/utils";
import { saveAs } from 'file-saver';

function renderTargetCell(t: Omit<TargetHistory, 'roundMarks'>) {
  const mpr = formatMPR(t.marks, t.darts);
  return (
    <>
      <span className={styles.historiesTableMark}>{t.darts}本</span>
      <span className={styles.historiesTableMpr}>{mpr}MPR</span>
    </>
  );
}

function downloadCSV() {
  console.log('download csv');
  const practices = loadPracticesFromStorage();
  const bomUTF8 = new Uint8Array([0xef, 0xbb, 0xbf]);
  const str = buildPracticesCsv(practices);
  const blob = new Blob([bomUTF8, str], {type: "text/csv;charset=utf-8"})
  saveAs(blob, 'darts-kikuyama.csv');
}

function downloadRawData() {
  console.log('download raw data');
  const practices = loadPracticesFromStorage();
  const strData = JSON.stringify(practices);
  const blob = new Blob([strData], {type: "application/json;charset=utf-8"})
  saveAs(blob, 'darts-kikuyama.json');
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
        ダーツの「菊池山口練習法」は、各クリケットナンバー（20〜15, Bull）で10マークするのにかかった本数を記録していく、という練習法です。
        <br/>
        本家の解説動画は <a href="https://youtu.be/Ve37QZhcwsQ" target="_blank" rel="noopener">https://youtu.be/Ve37QZhcwsQ</a> をご覧下さい。
        <br/>
        このツールは、この練習法を実践するにあたって、記録をサポートするものです。データはサーバ等ではなくて、お使いの端末の中に保存されます。
      </p>
      <p>※まだ開発中です。予告なく仕様やデザインが変わったり、過去のデータが消えたりすることがあります。</p>
      <div className={styles.ctas}>
        <Link href="/new" className={styles.primary}>{ongoing === null ? '新規の練習' : '練習の再開'}</Link>
      </div>
      <div style={{overflowX: 'scroll', width: 'calc(100vw - 64px)', maxWidth: '600px'}}>
        <h2>直近10練習の記録</h2>
        {
          practices.length <= 0 ? <p>過去の記録はありません</p> : (
            <table style={{textAlign: 'center'}}>
              <thead>
              <tr>
                <th>開始</th>
                <th>合計</th>
                <th>20〜15計</th>
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
                  const tuples = getTargetTuples(practice);
                  const totalMarks = tuples.reduce((sum, practice) => {return sum + practice.history.marks}, 0);
                  const totalDarts = tuples.reduce((sum, practice) => {return sum + practice.history.darts}, 0);
                  return (
                    <tr key={index}>
                      <td>{formatYMDHM(practice.startYMD, practice.startHMS)}</td>
                      <td>
                        {renderTargetCell({
                          marks: totalMarks,
                          darts: totalDarts,
                        })}
                      </td>
                      <td>
                        {renderTargetCell({
                          marks: totalMarks - practice.targetBull.marks,
                          darts: totalDarts - practice.targetBull.darts,
                        })}
                      </td>
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
      <div>
        <h2>データのexport</h2>
        <div className={styles.ctas}>
          <button onClick={downloadCSV} disabled={practices.length <= 0}>本数のCSV出力<br/>(Excel等での分析にどうぞ)
          </button>
          <button onClick={downloadRawData} disabled={practices.length <= 0}>生データ(JSON)出力<br/>(分析にはプログラミング技術が必要です)</button>
        </div>
      </div>
    </>
  );
}
