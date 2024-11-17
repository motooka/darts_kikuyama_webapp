'use client';

import styles from '@/app/page.module.css';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
  createBlankPractice,
  TargetHistory,
  Practice,
  getTargetTuples,
  writeOngoingPracticeToStorage,
  loadOngoingPracticeFromStorage, appendPracticeToStorage, clearOngoingPracticeOnStorage
} from '@/models';
import {formatMPR} from "@/app/utils";

const FINISH_THRESHOLD = 10;

function renderTargetHistory(his: TargetHistory) {
  const done = (his.marks >= FINISH_THRESHOLD) ? '✅' : '';
  const started = (his.darts > 0);
  const mpr = formatMPR(his.marks, his.darts);

  if(!started) {
    return <>未挑戦</>;
  }

  return (
    <>
      {done}
      {his.marks}marks / {his.darts}本 → {mpr}MPR
    </>
  );
}

function renderSummary(p: Practice) {
  let sumDarts = 0;
  let sumMarks = 0;
  let allDone = true;
  const tuples = getTargetTuples(p);
  for(const tuple of tuples) {
    sumDarts += tuple.history.darts;
    sumMarks += tuple.history.marks;
    if(tuple.history.marks < FINISH_THRESHOLD) {
      allDone = false;
    }
  }
  const done = allDone ? '✅' : '';
  const mpr = formatMPR(sumMarks, sumDarts);

  return (
    <>
      {done}
      {sumMarks}marks / {sumDarts}本 → {mpr}MPR
    </>
  );
}

function getCurrentTarget(p: Practice) {
  const tuples = getTargetTuples(p);
  for(const tuple of tuples) {
    if(tuple.history.marks < FINISH_THRESHOLD) {
      return tuple;
    }
  }
  return null;
}

function getCurrentRoundDartsLeft(p: Practice) {
  const tuples = getTargetTuples(p);
  let totalDarts = 0;
  for(const tuple of tuples) {
    totalDarts += tuple.history.darts;
    if(tuple.history.marks < FINISH_THRESHOLD) {
      return 3 - (totalDarts % 3);
    }
  }
  // 全部終わってる
  return 0;
}

function getMaxMarksPerDart(targetName: string): number {
  return targetName.toLowerCase() === 'bull' ? 2 : 3;
}

function getPossibleMarksForThisRound(p: Practice): number[] {
  const current = getCurrentTarget(p);
  if(current===null) {
    return [];
  }
  const maxMarksPerDart = getMaxMarksPerDart(current.name);
  const marksLeft = FINISH_THRESHOLD - current.history.marks;
  const dartsLeft = getCurrentRoundDartsLeft(p);
  const maxMarks = Math.min(dartsLeft*maxMarksPerDart, marksLeft-1+maxMarksPerDart);
  return [0,1,2,3,4,5,6,7,8,9].filter((value) => value<=maxMarks);
}

function getPossibleDartsForThisRound(p: Practice, tempMarks: number | null): number[] {
  const current = getCurrentTarget(p);
  if(current===null) {
    return [];
  }
  if(tempMarks===null) {
    return [0];
  }
  const remain = FINISH_THRESHOLD - current.history.marks;
  if(remain <= 0) {
    return [];
  }
  const maxMarksPerDart = getMaxMarksPerDart(current.name);
  const max = getCurrentRoundDartsLeft(p);
  const min = (remain<=tempMarks) ? Math.ceil(tempMarks / maxMarksPerDart) : max;
  const result: number[] = [];
  for(let i=min; i<=max; i++) {
    result.push(i);
  }
  return result;
}

export default function Home() {
  const router = useRouter();
  const [practice, setPractice] = React.useState(createBlankPractice());
  const tempMarks = React.useRef<number|null>(null);
  const tempDarts = React.useRef<number|null>(null);
  const [, setForceRerender] = React.useState<number>(0);
  const currentTarget = getCurrentTarget(practice);

  React.useEffect(()=>{
    const ongoing = loadOngoingPracticeFromStorage();
    if(ongoing) {
      setPractice(ongoing);
    }
  }, []);

  function forceRerender() {
    // TODO: これはReactの精神に反するものなので、無くても動くように頑張るべし。
    setForceRerender((current) => current+1);
  }

  function changeTempMarks(event: React.ChangeEvent<HTMLInputElement>) {
    const newMarksInt = Number(event.target.value);
    tempMarks.current = newMarksInt;
    const possibleDartsForThisRound = getPossibleDartsForThisRound(practice, newMarksInt);
    if(possibleDartsForThisRound.length === 1) {
      tempDarts.current = possibleDartsForThisRound[0];
    }
    else if(possibleDartsForThisRound.includes(tempDarts.current ?? 0)) {
      // 何もしない
    }
    else if(possibleDartsForThisRound.length > 1) {
      tempDarts.current = possibleDartsForThisRound[0];
    }
    else {
      tempDarts.current = null;
    }
    forceRerender();
  }

  function changeTempDarts(event: React.ChangeEvent<HTMLInputElement>) {
    tempDarts.current = Number(event.target.value);
    forceRerender();
  }

  function updatePractice() {
    setPractice((current) => {
      if(tempMarks.current === null) {
        return current;
      }
      const tuples = getTargetTuples(current);
      for(const tuple of tuples) {
        if(tuple.history.marks < FINISH_THRESHOLD) {
          tuple.history.marks += tempMarks.current ?? 0;
          tuple.history.darts += tempDarts.current ?? 3;
          tempMarks.current = null;
          tempDarts.current = 3;
          forceRerender();
          writeOngoingPracticeToStorage(current);
          return current;
        }
      }
      writeOngoingPracticeToStorage(current);
      return current;
    });
  }

  function saveAndFinish() {
    if(currentTarget !== null) {
      if(!confirm('まだBullまで投げ切っていませんが、ここで終了して記録に残しても良いですか？')) {
        return;
      }
    }
    appendPracticeToStorage(practice);
    clearOngoingPracticeOnStorage();
    router.push('/');
  }
  function pauseAndReturn() {
    router.push('/');
  }
  function destroyAndReturn() {
    if(!confirm('本当に、この練習の記録を消しても良いのですか？')) {
      return;
    }
    clearOngoingPracticeOnStorage();
    router.push('/');
  }

  return (
    <>
      <h2>練習を記録する</h2>
      <ul>
        <li>20 : {renderTargetHistory(practice.target20)}</li>
        <li>19 : {renderTargetHistory(practice.target19)}</li>
        <li>18 : {renderTargetHistory(practice.target18)}</li>
        <li>17 : {renderTargetHistory(practice.target17)}</li>
        <li>16 : {renderTargetHistory(practice.target16)}</li>
        <li>15 : {renderTargetHistory(practice.target15)}</li>
        <li>Bull : {renderTargetHistory(practice.targetBull)}</li>
        <li>全体 : {renderSummary(practice)}</li>
      </ul>
      {
        currentTarget === null ? <></> : (
          <fieldset>
            <legend>ターゲット : {currentTarget.name}</legend>
            <dl>
              <dt>マーク数</dt>
              <dd>
                {
                  getPossibleMarksForThisRound(practice).map((value, index) => {
                    return (
                      <label key={'radio-'+index}>
                        <input type="radio" name="marks" value={value} onChange={changeTempMarks} checked={tempMarks.current===value}/>
                        {value}
                      </label>
                    );
                  })
                }
              </dd>
              <dt>要した本数</dt>
              <dd>
                {
                  getPossibleDartsForThisRound(practice, tempMarks.current).map((value, index) => {
                    return (
                      <label key={'radio-'+index}>
                        <input type="radio" name="darts" value={value} onChange={changeTempDarts} checked={tempDarts.current===value}/>
                        {value}
                      </label>
                    );
                  })
                }

              </dd>
            </dl>
            <button onClick={updatePractice}>更新</button>
          </fieldset>
        )
      }
      <div className={styles.ctas}>
        <button onClick={saveAndFinish}>保存して終了</button>
        <button onClick={pauseAndReturn}>練習を中断(後で再開)</button>
        <button onClick={destroyAndReturn}>記録を破棄する</button>
      </div>
    </>
  );
}
