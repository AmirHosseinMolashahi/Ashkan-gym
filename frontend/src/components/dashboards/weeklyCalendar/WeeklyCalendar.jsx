import { useState, useRef, useEffect } from 'react';
import styles from './WeeklyCalendar.module.scss';
import toPersianDigits from '../../../hooks/convertNumber';

const MONTH_NAMES = [
  'فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
  'مهر','آبان','آذر','دی','بهمن','اسفند'
];
const DAY_NAMES = ['د','س','چ','پ','ج','ش','ی'];

function toJalali(gy, gm, gd) {
  gy -= 1600; gm -= 1; gd -= 1;
  let g_d_no = 365*gy + Math.floor((gy+3)/4) - Math.floor((gy+99)/100) + Math.floor((gy+399)/400);
  for (let i = 0; i < gm; i++)
    g_d_no += [31,28+((gy+1600)%4===0&&((gy+1600)%100!==0||(gy+1600)%400===0)?1:0),31,30,31,30,31,31,30,31,30,31][i];
  g_d_no += gd;
  let j_d_no = g_d_no - 79;
  let j_np = Math.floor(j_d_no / 12053); j_d_no %= 12053;
  let jy = 979 + 33*j_np + 4*Math.floor(j_d_no/1461); j_d_no %= 1461;
  if (j_d_no >= 366) { jy += Math.floor((j_d_no-1)/365); j_d_no = (j_d_no-1)%365; }
  let i = 0;
  for (; i < 11 && j_d_no >= [31,31,31,31,31,31,30,30,30,30,30][i]; i++)
    j_d_no -= [31,31,31,31,31,31,30,30,30,30,30][i];
  return [jy, i+1, j_d_no+1];
}

function jalaliDow(jy, jm, jd) {
  const [gy, gm, gd] = jalaliToGregorianClean(jy, jm, jd);
  return new Date(gy, gm - 1, gd).getDay(); // مستقیم index میده
}

function jalaliToGregorianClean(jy, jm, jd) {
  let gy, leap, march;
  jy = jy - 979;
  jm = jm - 1;
  let j_day = 365 * jy + Math.floor(jy / 4) * 8 + Math.floor((jy % 4 + 3) / 4);
  j_day += 29 * jm + Math.floor((jm + 1) / 6);
  j_day += jd - 1;
  let g_year = 1600;
  let g_day = j_day + 79;
  g_year += 400 * Math.floor(g_day / 146097); g_day %= 146097;
  let isLeap = true;
  if (g_day >= 36525) {
    g_day--;
    g_year += 100 * Math.floor(g_day / 36524); g_day %= 36524;
    if (g_day >= 365) g_day++;
    else isLeap = false;
  }
  g_year += 4 * Math.floor(g_day / 1461); g_day %= 1461;
  if (g_day >= 366) {
    isLeap = false;
    g_day--;
    g_year += Math.floor(g_day / 365); g_day %= 365;
  }
  const gMonths = [31,28+( isLeap?1:0),31,30,31,30,31,31,30,31,30,31];
  let gm = 0;
  for (; gm < 12; gm++) {
    if (g_day < gMonths[gm]) break;
    g_day -= gMonths[gm];
  }
  return [g_year, gm + 1, g_day + 1];
}

function monthLen(y, m) {
  if (m <= 6) return 31;
  if (m <= 11) return 30;
  const leapYears = [1,5,9,13,17,22,26,30];
  return leapYears.includes(y % 33) ? 30 : 29;
}

function getTodayJalali() {
  const d = new Date();
  return toJalali(d.getFullYear(), d.getMonth()+1, d.getDate());
}

export default function WeeklyCalendar({ taskDates = [], onDaySelect }) {
  const [today] = useState(() => getTodayJalali());
  const [jy, setJy] = useState(today[0]);
  const [jm, setJm] = useState(today[1]);
  const [activeDay, setActiveDay] = useState(today[2]);
  const scrollRef = useRef(null);
  const activeCellRef = useRef(null);

  // taskDates: آرایه‌ای از رشته "1405/03/12"
  const taskDaySet = new Set(
    taskDates.map(d => {
      const [y, m, day] = d.split('/').map(Number);
      if (y === jy && m === jm) return day;
      return null;
    }).filter(Boolean)
  );

  const len = monthLen(jy, jm);

  useEffect(() => {
    if (activeCellRef.current) {
      activeCellRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeDay, jm, jy]);

  const prevMonth = () => {
    if (jm === 1) { setJy(y => y-1); setJm(12); }
    else setJm(m => m-1);
    setActiveDay(1);
  };

  const nextMonth = () => {
    if (jm === 12) { setJy(y => y+1); setJm(1); }
    else setJm(m => m+1);
    setActiveDay(1);
  };

  const handleSelect = (d) => {
    setActiveDay(d);
    onDaySelect?.(`${jy}/${String(jm).padStart(2,'0')}/${String(d).padStart(2,'0')}`);
  };

  const isToday = (d) => today[0]===jy && today[1]===jm && today[2]===d;

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={prevMonth}>‹</button>
        <span className={styles.monthLabel}>{MONTH_NAMES[jm-1]} {toPersianDigits(jy)}</span>
        <button className={styles.navBtn} onClick={nextMonth}>›</button>
      </div>

      <div className={styles.daysRow} ref={scrollRef}>
        {Array.from({ length: len }, (_, i) => i + 1).map(d => {
          const dow = jalaliDow(jy, jm, d);
          const isActive = d === activeDay;
          const hasTask = taskDaySet.has(d);

          return (
            <div
              key={d}
              ref={isActive ? activeCellRef : null}
              className={`${styles.dayCell} ${isActive ? styles.active : ''} ${isToday(d) ? styles.today : ''}`}
              onClick={() => handleSelect(d)}
            >
              <span className={styles.dayName}>{DAY_NAMES[dow]}</span>
              <span className={styles.dayNum}>{toPersianDigits(d)}</span>
              <span className={`${styles.dot} ${hasTask ? styles.dotVisible : ''}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}