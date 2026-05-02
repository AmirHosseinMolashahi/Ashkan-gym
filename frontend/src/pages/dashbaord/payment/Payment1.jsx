import React, { useEffect, useMemo, useState } from "react";
import { UilCalendarAlt, UilArrowLeft } from "@iconscout/react-unicons";
import style from "./Payment.module.scss";
import api from "../../../hooks/api";
import {
  getCurrentShamsiPeriod,
  PERSIAN_MONTH_NAMES,
} from "../../../hooks/shamsiDate";
import toPersianDigits from "../../../hooks/convertNumber";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const { year: defaultYear, month: defaultMonth } = getCurrentShamsiPeriod();

  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const monthLabel = useMemo(
    () => `${PERSIAN_MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`,
    [selectedMonth, selectedYear]
  );

  // 📦 گرفتن کل دیتا از بک‌اند
  useEffect(() => {
    let cancel = false;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(
          `/payment/coach/invoices/dashboard/?year=${selectedYear}&month=${selectedMonth}`
        );

        if (!cancel) setDashboard(res.data);
      } catch (err) {
        if (!cancel) {
          setError(err.response?.data?.detail || "خطا در دریافت اطلاعات");
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      cancel = true;
    };
  }, [selectedYear, selectedMonth]);

  const summary = dashboard?.summary || {};
  const courses = dashboard?.courses || [];

  const yearOptions = useMemo(() => {
    const y = getCurrentShamsiPeriod().year;
    return [y, y - 1].map((yr) => ({
      value: yr,
      label: toPersianDigits(String(yr)),
    }));
  }, []);

  if (error && !dashboard) {
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
      {/* HEADER */}
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

      {/* LOADING */}
      {loading && !dashboard?.length ? (
        <p className={style.loading}>در حال بارگذاری...</p>
      ) : (
        <>
          {/* SUMMARY */}
          <div className={style.summaryGrid}>
            <div className={style.summaryCard}>
              <p>مجموع مورد انتظار</p>
              <h3>
                {toPersianDigits(
                  (summary.total_expected || 0).toLocaleString()
                )}{" "}
                تومان
              </h3>
            </div>

            <div className={style.summaryCard}>
              <p>دریافتی</p>
              <h3>
                {toPersianDigits((summary.collected || 0).toLocaleString())} تومان
              </h3>
            </div>

            <div className={style.summaryCard}>
              <p>در انتظار</p>
              <h3>
                {toPersianDigits((summary.pending || 0).toLocaleString())} تومان
              </h3>
            </div>

            <div className={style.summaryCard}>
              <p>معوق</p>
              <h3>
                {toPersianDigits((summary.overdue || 0).toLocaleString())} تومان
              </h3>
            </div>
          </div>

          {/* COURSES */}
          <section className={style.classesSection}>
            <h3>کلاس‌ها</h3>

            <div className={style.classList}>
              {courses.map((course) => (
                <article key={course.id} className={style.classRow}>
                  <div>
                    <h4>
                      {course.title}{" "}
                      {course.active ? (
                        <span className={style.good}>فعال</span>
                      ) : (
                        <span className={style.danger}>غیرفعال</span>
                      )}
                    </h4>

                    <p>
                      مربی: {course.coach?.full_name} –{" "}
                      {toPersianDigits(String(course.athletes))} ورزشکار
                    </p>
                  </div>

                  <div className={style.actions}>
                    <span className={style.stateBadge}>
                      وضعیت از بک‌اند
                    </span>

                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/payment/courses/${course.id}?year=${selectedYear}&month=${selectedMonth}`
                        )
                      }
                    >
                      جزئیات <UilArrowLeft />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Payment;