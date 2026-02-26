import React, { useMemo, useEffect, useState } from "react";
import { UilCalendarAlt, UilArrowLeft } from "@iconscout/react-unicons";
import style from "./Payment.module.scss";
import api from "../../../hooks/api";
import { getCurrentShamsiPeriod, PERSIAN_MONTH_NAMES } from "../../../hooks/shamsiDate";
import toPersianDigits from "../../../hooks/convertNumber";
import { useNavigate } from "react-router-dom";

const getStateFromInvoices = (invoices) => {
  if (!invoices.length) return { stateLabel: "بدون صورتحساب", stateType: "neutral" };
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const paidCount = invoices.filter((i) => i.remaining_amount === 0 || i.status === "paid").length;
  const totalCount = invoices.length;
  const hasOverdue = invoices.some(
    (i) => i.remaining_amount > 0 && i.due_date && i.due_date < today
  );
  if (hasOverdue) return { stateLabel: "سررسید گذشته", stateType: "danger" };
  if (paidCount === totalCount) return { stateLabel: "همه پرداخت شده", stateType: "good" };
  if (paidCount > 0) return { stateLabel: "بخشی پرداخت نشده", stateType: "warning" };
  return { stateLabel: "پرداخت نشده", stateType: "warning" };
};

const Payment = () => {
  const { year: defaultYear, month: defaultMonth,} = getCurrentShamsiPeriod();

  const [courses, setCourses] = useState([]);
  const [invoicesByCourse, setInvoicesByCourse] = useState({});
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const monthLabel = useMemo(
    () => `${PERSIAN_MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`,
    [selectedMonth, selectedYear]
  );

  useEffect(() => {
    let cancelled = false;
    const fetchCourses = async () => {
      try {
        setError(null);
        const res = await api.get("/training/courses/");
        if (!cancelled) setCourses(res.data || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || "خطا در بارگذاری کلاس‌ها");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCourses();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!courses.length) {
      setInvoicesByCourse({});
      return;
    }
    let cancelled = false;
    setLoading(true);
    const fetchInvoices = async () => {
      try {
        const results = await Promise.allSettled(
          courses.map(async (c) => {
            const res = await api.get(
              `/payment/coach/invoices/?course_id=${c.id}&year=${selectedYear}&month=${selectedMonth}`
            );
            return { courseId: c.id, invoices: res.data || [] };
          })
        );

        if (!cancelled) {
          const map = {};
          results.forEach((result, index) => {
            const courseId = courses[index].id;
            if (result.status === "fulfilled") {
              map[courseId] = result.value.invoices;
            } else {
              map[courseId] = [];
            }
          });
          setInvoicesByCourse(map);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || "خطا در بارگذاری صورتحساب‌ها");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchInvoices();
    return () => { cancelled = true; };
  }, [courses, selectedYear, selectedMonth]);

  const classRows = useMemo(() => {
    return courses.map((course) => {
      const invoices = invoicesByCourse[course.id] || [];
      const total = invoices.length;
      const paid = invoices.filter(
        (i) => i.remaining_amount === 0 || i.status === "paid"
      ).length;
      const pendingAmount = invoices.reduce((acc, i) => acc + (i.remaining_amount || 0), 0);
      const totalExpected = invoices.reduce((acc, i) => acc + (i.amount || 0), 0);
      const collected = invoices.reduce((acc, i) => acc + (i.paid_amount || 0), 0);
      const { stateLabel, stateType } = getStateFromInvoices(invoices);
      return {
        id: course.id,
        title: course.title,
        active: course.is_active,
        coach: course.coach,
        schedule: course.schedule || "—",
        athletes: course.enrollment_count ?? 0,
        month: monthLabel,
        paid,
        total,
        pendingAmount,
        totalExpected,
        collected,
        stateLabel,
        stateType,
      };
    });
  }, [courses, invoicesByCourse, monthLabel]);

  const summary = useMemo(() => {
    const totalExpected = classRows.reduce((acc, item) => acc + item.totalExpected, 0);
    const pending = classRows.reduce((acc, item) => acc + item.pendingAmount, 0);
    const collected = classRows.reduce((acc, item) => acc + item.collected, 0);
    const overdue = classRows.reduce((acc, item) => {
      const invoices = invoicesByCourse[item.id] || [];
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const sum = invoices
        .filter((i) => i.remaining_amount > 0 && i.due_date && i.due_date < today)
        .reduce((a, i) => a + (i.remaining_amount || 0), 0);
      return acc + sum;
    }, 0);
    const collectedPercent = totalExpected > 0 ? Math.round((collected / totalExpected) * 100) : 0;
    const pendingAthletes = classRows.reduce((acc, item) => acc + (item.total - item.paid), 0);

    return {
      totalExpected,
      collected,
      pending,
      overdue,
      collectedPercent,
      pendingAthletes,
    };
  }, [classRows, invoicesByCourse]);

  const yearOptions = useMemo(() => {
    const y = getCurrentShamsiPeriod().year;
    return [y, y - 1].map((yr) => ({ value: yr, label: toPersianDigits(String(yr)) }));
  }, []);

  if (error && !courses.length) {
    return (
      <div className={style.paymentPage}>
        <div className={style.header}>
          <h2>نمای کلی پرداخت مربی</h2>
        </div>
        <p className={style.errorMessage}>{error}</p>
      </div>
    );
  }

  return (
    <div className={style.paymentPage}>
      <div className={style.header}>
        <div className={style.titleWrap}>
          <h2>نمای کلی پرداخت مربی</h2>
          <p>
            پرداخت‌های هر کلاس را ببین و وضعیت پرداخت ورزشکارها را در ماه انتخاب‌شده بررسی کن.
          </p>
        </div>
        <div className={style.monthSelectWrap}>
          <select
            className={style.monthBadge}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            aria-label="انتخاب ماه"
          >
            {PERSIAN_MONTH_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <select
            className={style.monthBadge}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            aria-label="انتخاب سال"
          >
            {yearOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className={style.monthBadge}>
            <UilCalendarAlt size="16" />
            ماه انتخاب‌شده: {toPersianDigits(monthLabel)}
          </span>
        </div>
      </div>

      {loading && !classRows.length ? (
        <p className={style.loading}>در حال بارگذاری...</p>
      ) : (
        <>
          <div className={style.summaryGrid}>
            <article className={style.summaryCard}>
              <p className={style.cardTitle}>مجموع مورد انتظار</p>
              <h3>{toPersianDigits(summary.totalExpected.toLocaleString())} تومان</h3>
              <p className={style.subtle}>همه کلاس‌ها – {toPersianDigits(monthLabel)}</p>
            </article>

            <article className={style.summaryCard}>
              <p className={style.cardTitle}>دریافتی</p>
              <h3>{toPersianDigits(summary.collected.toLocaleString())} تومان</h3>
              <div className={`${style.miniBadge} ${style.good}`}>
                {toPersianDigits(String(summary.collectedPercent))}٪ دریافت شده
              </div>
            </article>

            <article className={style.summaryCard}>
              <p className={style.cardTitle}>در انتظار</p>
              <h3>{toPersianDigits(summary.pending.toLocaleString())} تومان</h3>
              <div className={`${style.miniBadge} ${style.warning}`}>
                {toPersianDigits(String(summary.pendingAthletes))} ورزشکار در انتظار پرداخت
              </div>
            </article>

            <article className={style.summaryCard}>
              <p className={style.cardTitle}>معوق</p>
              <h3>{toPersianDigits(summary.overdue.toLocaleString())} تومان</h3>
              <div className={`${style.miniBadge} ${style.danger}`}>نیازمند پیگیری</div>
            </article>
          </div>

          <section className={style.classesSection}>
            <h3>کلاس‌های من</h3>
            <p className={style.sectionDescription}>
              یک کلاس را انتخاب کن تا صفحه جداگانه لیست ورزشکارها و وضعیت پرداخت ماه انتخاب‌شده
              نمایش داده شود.
            </p>

            <div className={style.classList}>
              {classRows?.map((item) => (
                <article key={item.id} className={style.classRow}>
                  <div className={style.classInfo}>
                    <div className={style.classTitle}>
                      <h4>{item.title} </h4> <span className={`${style.badge} ${item.active ? style.good : style.danger}`}>{item.active ? 'فعال' : 'غیر فعال'}</span>
                    </div>
                    <div className={style.classCoach}>
                      <h5>مربی: {item.coach.full_name}</h5>
                    </div>
                    <p>
                      {item.schedule} – {toPersianDigits(String(item?.athletes))} ورزشکار
                    </p>
                    <div className={style.rowMeta}>
                      <span>
                        {toPersianDigits(String(item?.paid ?? 0))} / {toPersianDigits(String(item?.total ?? 0))} پرداخت شده
                         - 
                        {toPersianDigits(item?.pendingAmount.toLocaleString())} تومان در انتظار
                      </span>
                    </div>
                  </div>

                  <div className={style.actions}>
                    <span className={`${style.stateBadge} ${style[item.stateType]}`}>
                      {item.stateLabel}
                    </span>
                    {item.active && (
                      <button
                        type="button"
                        onClick={() => 
                          navigate(
                            `/dashboard/payment/courses/${item.id}?year=${selectedYear}&month=${selectedMonth}`
                          )
                        }
                        >
                          صفحه پرداخت ورزشکارها<UilArrowLeft />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {classRows.length === 0 && !loading && (
              <p className={style.footerNote}>کلاسی برای نمایش وجود ندارد.</p>
            )}
            {classRows.length > 0 && (
              <p className={style.footerNote}>
                روی هر کلاس بزن تا وارد صفحه جزئیات پرداخت ورزشکارها برای ماه انتخاب‌شده شوی.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Payment;
