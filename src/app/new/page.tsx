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
  const commentRef = React.useRef<HTMLInputElement | null>(null);
  const isRollingBackRef = React.useRef<boolean>(false);
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
          tuple.history.roundMarks.push(tempMarks.current ?? 0);
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

  function cancelRound() {
    isRollingBackRef.current = true;
    setPractice((current) => {
      if(!isRollingBackRef.current) {
        return current;
      }
      isRollingBackRef.current = false;
      const tuples = getTargetTuples(current).reverse();
      for(const tuple of tuples) {
        if(tuple.history.roundMarks.length > 0) {
          console.log('cancelling round : ', tuple);
          const lastRoundMark = tuple.history.roundMarks[tuple.history.roundMarks.length-1];
          const lastRoundDarts = Math.min(3, tuple.history.darts);
          tuple.history.marks -= lastRoundMark;
          tuple.history.darts -= lastRoundDarts;
          tuple.history.roundMarks.splice(-1, 1); // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
          tempMarks.current = lastRoundMark;
          tempDarts.current = lastRoundDarts;
          forceRerender();
          break;
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
    if(commentRef?.current !== null && commentRef.current.value.length > 0) {
      practice.comment = commentRef.current.value;
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
          <fieldset style={{width: '100%'}}>
            <legend>次のターゲット : {currentTarget.name}</legend>
            <div style={{textAlign: 'center', marginBottom: '2em'}}>
              <span
                style={{fontSize: '300%', border: '1px dashed black', padding: '0.2rem'}}>{currentTarget.name}</span>
              <div style={{display: 'inline-block', width: '2rem'}}></div>
              残り
              <span style={{fontSize: '300%'}}>{FINISH_THRESHOLD - currentTarget.history.marks}</span>
              マーク
            </div>

            <dl style={{margin: '1rem auto'}}>
              <dt>マーク数</dt>
              <dd>
                {
                  getPossibleMarksForThisRound(practice).map((value, index) => {
                    return (
                      <label key={'radio-' + index} style={{margin: '0.2rem'}}>
                        <input type="radio" name="marks" value={value} onChange={changeTempMarks}
                               checked={tempMarks.current === value}/>
                        {value}
                      </label>
                    );
                  })
                }
              </dd>
            </dl>
            <dl style={{margin: '1rem auto'}}>
              <dt>要した本数</dt>
              <dd>
                {
                  getPossibleDartsForThisRound(practice, tempMarks.current).map((value, index) => {
                    return (
                      <label key={'radio-' + index} style={{margin: '0.2rem'}}>
                        <input type="radio" name="darts" value={value} onChange={changeTempDarts}
                               checked={tempDarts.current === value}/>
                        {value}
                      </label>
                    );
                  })
                }

              </dd>
            </dl>
            <div style={{display: 'flex', justifyContent: 'space-around'}}>
              <button
                onClick={updatePractice}
                disabled={tempMarks?.current === null || tempDarts?.current === null}
                style={{fontSize: '200%'}}
              >
                ラウンド登録
              </button>
              <button
                onClick={cancelRound}
                disabled={practice.target20.darts <= 0 || tempMarks?.current !== null}
              >
                直前のラウンドを<br/>取り消し
              </button>
            </div>
          </fieldset>
        )
      }
      <fieldset>
        <legend>今回の練習全体のコメント</legend>
        <p>
          セッティングやコンディション等
        </p>
        <input type="text" ref={commentRef} className={styles.commentField}/>
      </fieldset>
      <div className={styles.ctas}>
        <button onClick={saveAndFinish}>保存して終了</button>
        <button onClick={pauseAndReturn}>練習を中断(後で再開)</button>
        <button onClick={destroyAndReturn}>記録を破棄する</button>
      </div>
    </>
  );
}
