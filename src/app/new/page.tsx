'use client';

import styles from "@/app/page.module.css";
import Link from "next/link";
import React from "react";
import {createBlankPractice, TargetHistory, Practice, getTargetTuples} from "@/models";

const mprFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const FINISH_THRESHOLD = 10;

function renderTargetHistory(his: TargetHistory) {
  const done = (his.marks >= FINISH_THRESHOLD) ? '✅' : '';
  const started = (his.darts > 0);
  const mpr = started ? mprFormatter.format(his.marks / his.darts / 3.0) : '-';

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
  const mpr = (sumDarts > 0) ? mprFormatter.format(sumMarks / sumDarts / 3.0) : '-';

  return (
    <>
      {done}
      {sumMarks}marks / {sumDarts}本 → {mpr}MPR
    </>
  );
}

function currentTarget(p: Practice) {
  const tuples = getTargetTuples(p);
  for(const tuple of tuples) {
    if(tuple.history.marks < FINISH_THRESHOLD) {
      return tuple;
    }
  }
  return null;
}

export default function Home() {
  const [practice, setPractice] = React.useState(createBlankPractice());
  const current = currentTarget(practice);
  return (
    <>
      <h2>練習を記録する</h2>
      <div className={styles.ctas}>
        <Link href="/new" className={styles.primary}>新規の練習</Link>
      </div>
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
        current === null ? <></> : (
          <fieldset>
            <legend>現在のターゲット : {current.name}</legend>
          </fieldset>
        )
      }
    </>
  );
}
