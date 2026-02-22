export const PERSIAN_MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

const toEnglishDigits = (value) => {
  let out = String(value);
  for (let i = 0; i < PERSIAN_DIGITS.length; i += 1) {
    out = out.replaceAll(PERSIAN_DIGITS[i], String(i));
  }
  return out;
};

/**
 * تبدیل تاریخ میلادی به شمسی با Intl
 * @param {Date} date
 * @returns {{ year: number, month: number, day: number }}
 */
function gregorianToJalali(date = new Date()) {
  const formatted = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);

  const [yearStr, monthStr, dayStr] = toEnglishDigits(formatted).split("/");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if ([year, month, day].some(Number.isNaN)) {
    throw new Error(`Invalid Jalali date output: ${formatted}`);
  }

  return { year, month, day };
}

/**
 * سال و ماه شمسی امروز
 * @returns {{ year: number, month: number, monthLabel: string }}
 */
export function getCurrentShamsiPeriod() {
  const { year, month } = gregorianToJalali(new Date());
  return {
    year,
    month,
    monthLabel: `${PERSIAN_MONTH_NAMES[month - 1]} ${year}`,
  };
}

export default getCurrentShamsiPeriod;
