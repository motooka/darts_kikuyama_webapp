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
}

export interface TargetTuple {
  name: string;
  history: TargetHistory;
}

export function isTargetHistory(obj: any): obj is TargetHistory {
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
    if(typeof obj.marks[i] !== 'number') {
      return false;
    }
  }

  return true;
}

export function isPractice(obj: any) : obj is Practice {
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
