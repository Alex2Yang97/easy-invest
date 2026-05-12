export function ymOf(isoDay: string): string {
  return isoDay.slice(0, 7);
}

export function addMonth(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map((s) => parseInt(s, 10));
  const nm = m === 12 ? 1 : m + 1;
  const ny = m === 12 ? y + 1 : y;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}

export function firstWeekdayOf(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map((s) => parseInt(s, 10));
  const d = new Date(Date.UTC(y, m - 1, 1));
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) {
    d.setUTCDate(d.getUTCDate() + 1);
  }
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${String(m).padStart(2, "0")}-${dd}`;
}
