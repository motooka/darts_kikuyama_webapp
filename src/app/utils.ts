const mprFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function padZero(num: number, len: number): string {
  return String(num).padStart(len, '0');
}

export function formatMPR(marks: number, darts: number): string {
  if(darts <= 0) {
    return '-';
  }
  return mprFormatter.format(marks / (darts / 3.0));
}

export function formatYMD(ymd: number): string {
  const year = Math.floor(ymd/10000);
  const month = padZero(Math.floor((ymd%10000) / 100), 2);
  const day = padZero(ymd%100, 2);
  return `${year}/${month}/${day}`;
}

export function formatHM(hms: number): string {
  const hour = padZero(Math.floor(hms/10000), 2);
  const minute = padZero(Math.floor((hms%10000) / 100), 2);
  return `${hour}:${minute}`;
}

export function formatYMDHM(ymd: number, hms: number): string {
  return `${formatYMD(ymd)} ${formatHM(hms)}`;
}
