import {formatYMD, formatHM} from '@/app/utils';

export interface TargetHistory {
  marks: number;
  darts: number;
  roundMarks: number[];
}

export interface Practice {
  startYMD: number;
  startHMS: number;
  target20: TargetHistory;
  target19: TargetHistory;
  target18: TargetHistory;
  target17: TargetHistory;
  target16: TargetHistory;
  target15: TargetHistory;
  targetBull: TargetHistory;
  comment?: string;
}

export interface TargetTuple {
  name: string;
  history: TargetHistory;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTargetHistory(obj: any): obj is TargetHistory {
  if(obj === null || typeof obj !== 'object') {
    return false;
  }
  if(
    !obj.hasOwnProperty('marks')
    || !obj.hasOwnProperty('darts')
    || !obj.hasOwnProperty('roundMarks')
  ) {
    return false;
  }
  if(
    typeof obj.marks !== 'number'
    || typeof obj.darts !== 'number'
    || !Array.isArray(obj.roundMarks)
  ) {
    return false;
  }
  const len = obj.roundMarks.length;
  for(let i=0; i<len; i++) {
    if(typeof obj.roundMarks[i] !== 'number') {
      return false;
    }
  }

  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPractice(obj: any) : obj is Practice {
  if(obj === null || typeof obj !== 'object') {
    return false;
  }
  if(
    !obj.hasOwnProperty('startYMD')
    || !obj.hasOwnProperty('startHMS')
    || !obj.hasOwnProperty('target20')
    || !obj.hasOwnProperty('target19')
    || !obj.hasOwnProperty('target18')
    || !obj.hasOwnProperty('target17')
    || !obj.hasOwnProperty('target16')
    || !obj.hasOwnProperty('target15')
    || !obj.hasOwnProperty('targetBull')
  ) {
    return false;
  }
  if(
    typeof obj.startYMD !== 'number'
    || typeof obj.startHMS !== 'number'
    || !isTargetHistory(obj.target20)
    || !isTargetHistory(obj.target19)
    || !isTargetHistory(obj.target18)
    || !isTargetHistory(obj.target17)
    || !isTargetHistory(obj.target16)
    || !isTargetHistory(obj.target15)
    || !isTargetHistory(obj.targetBull)
  ) {
    return false;
  }

  if(
    obj.hasOwnProperty('comment')
    && obj.comment !== null
    && typeof obj.comment !== 'string'
  ) {
    return false;
  }

  return true;
}

export function getTargetTuples(p: Practice): TargetTuple[] {
  return [
    {name: '20', history: p.target20},
    {name: '19', history: p.target19},
    {name: '18', history: p.target18},
    {name: '17', history: p.target17},
    {name: '16', history: p.target16},
    {name: '15', history: p.target15},
    {name: 'Bull', history: p.targetBull},
  ];
}

function createBlankTargetHistory(): TargetHistory {
  return {
    marks: 0,
    darts: 0,
    roundMarks: [],
  };
}

export function createBlankPractice(): Practice {
  const now = new Date();
  const ymd = now.getFullYear()*10000 + (now.getMonth()+1)*100 + now.getDate();
  const hms = now.getHours()*10000 + now.getMinutes()*100 + now.getSeconds();
  return {
    startYMD: ymd,
    startHMS: hms,
    target20: createBlankTargetHistory(),
    target19: createBlankTargetHistory(),
    target18: createBlankTargetHistory(),
    target17: createBlankTargetHistory(),
    target16: createBlankTargetHistory(),
    target15: createBlankTargetHistory(),
    targetBull: createBlankTargetHistory(),
  };
}

function buildCsvLine(fields: (string|number)[]): string {
  return '"' + fields.map((field) => {
    if(typeof field !== 'string') {
      return String(field);
    }
    return field
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/"/g, '""')
      ;
  }).join('","') + '"';
}

export function buildPracticesCsv(ps: Practice[]): string {
  const lines: string[] = ps.map((practice) => {
    const targetTuples = getTargetTuples(practice);
    const totalDarts = targetTuples.reduce((total, tuple) => total + tuple.history.darts, 0);
    return buildCsvLine([
      formatYMD(practice.startYMD),
      formatHM(practice.startHMS),
      practice.target20.darts,
      practice.target19.darts,
      practice.target18.darts,
      practice.target17.darts,
      practice.target16.darts,
      practice.target15.darts,
      practice.targetBull.darts,
      totalDarts - practice.targetBull.darts,
      totalDarts,
      practice.comment ?? '',
    ]);
  });
  lines.splice(0, 0, buildCsvLine(['練習日', '開始時刻', '20', '19', '18', '17', '16', '15', 'Bull', 'Bull以外', '合計', 'コメント']));
  return lines.join("\n");
}

const LOCAL_STORAGE_KEY_ONGOING_PRACTICE = 'darts-kikuyama-ongoingPractice';
const LOCAL_STORAGE_KEY_PRACTICES = 'darts-kikuyama-practices';
export function loadOngoingPracticeFromStorage(): Practice|null {
  const str = window.localStorage.getItem(LOCAL_STORAGE_KEY_ONGOING_PRACTICE);
  if(str===null || str==='') {
    return null;
  }
  try {
    const obj = JSON.parse(str);
    if(isPractice(obj)) {
      return obj;
    }
    else {
      console.log('saved ongoing practice is broken', str);
    }
  }
  catch(e) {
    // JSON Parse Error
    console.error('JSON Parse error in loadOngoingPracticeFromStorage', e);
    return null;
  }
  return null;
}
export function writeOngoingPracticeToStorage(p: Practice): void {
  window.localStorage.setItem(LOCAL_STORAGE_KEY_ONGOING_PRACTICE, JSON.stringify(p));
}
export function clearOngoingPracticeOnStorage(): void {
  window.localStorage.removeItem(LOCAL_STORAGE_KEY_ONGOING_PRACTICE);
}
export function loadPracticesFromStorage(): Practice[] {
  const str = window.localStorage.getItem(LOCAL_STORAGE_KEY_PRACTICES);
  if(str===null) {
    return [];
  }
  try {
    const obj = JSON.parse(str);
    if(Array.isArray(obj)) {
      for(const p of obj) {
        if(!isPractice(p)) {
          return [];
        }
      }
      return obj;
    }
  }
  catch(e) {
    // JSON Parse Error
    console.error('JSON Parse error in loadPracticesFromStorage', e);
    return [];
  }

  // never reaches here
  return [];
}
export function appendPracticeToStorage(p: Practice): void {
  const existing = loadPracticesFromStorage();
  existing.push(p);
  window.localStorage.setItem(LOCAL_STORAGE_KEY_PRACTICES, JSON.stringify(existing));
}
