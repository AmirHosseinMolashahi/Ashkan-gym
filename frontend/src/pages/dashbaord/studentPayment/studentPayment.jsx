import React, { useMemo, useState, useEffect } from "react";
import { UilCalendarAlt, UilCreditCard } from "@iconscout/react-unicons";
import api from "../../../hooks/api";
import { getCurrentShamsiPeriod, PERSIAN_MONTH_NAMES } from "../../../hooks/shamsiDate";
import toPersianDigits from "../../../hooks/convertNumber";
import style from "./studentPayment.module.scss";

const toFaDate = (dateStr) => {
  if (!dateStr) return "بدون سررسید";
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};

const isOverdue = (item) => {
  if (!item.due_date) return false;
  const today = new Date().toISOString().slice(0, 10);
  return item.remaining_amount > 0 && item.due_date < today;
};

const statusInfo = (item) => {
  if (isOverdue(item)) return { label: "معوق", className: "overdue" };
  if (item.status === "paid") return { label: "پرداخت‌شده", className: "paid" };
  if (item.status === "partially_paid") return { label: "نیمه‌پرداخت", className: "pending" };
  return { label: "پرداخت‌نشده", className: "pending" };
};

const formatPrice = (v) => `${toPersianDigits((v || 0).toLocaleString("en-US"))} تومان`;

const studentPayment = () => {
  const { year: defaultYear, month: defaultMonth } = getCurrentShamsiPeriod();

  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [invoices, setInvoices] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [invoiceRes, classesRes] = await Promise.all([
          api.get(`/payment/me/invoices/?year=${selectedYear}&month=${selectedMonth}`),
          api.get("/training/my-classes/"),
        ]);

        console.log(invoiceRes.data)

        setInvoices(invoiceRes.data || []);
        setMyClasses(classesRes.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  const classMap = useMemo(() => {
    const map = {};
    myClasses.forEach((enroll) => {
      // ساختار API: enrollment.course.id
      map[enroll.course?.id] = enroll.course;
    });
    return map;
  }, [myClasses]);

  const rows = useMemo(() => {
    return invoices.map((inv) => {
      const course = classMap[inv.course_id];
      const st = statusInfo(inv);

      return {
        ...inv,
        statusLabel: st.label,
        statusClass: st.className,
        courseTitle: inv.course_title || course?.title || "بدون عنوان",
        schedule: course?.schedule || "برنامه ثبت نشده",
        coachName: course?.coach?.full_name || "نامشخص",
      };
    });
  }, [invoices, classMap]);

  const summary = useMemo(() => {
    const totalBilled = rows.reduce((s, i) => s + (i.amount || 0), 0);
    const totalPaid = rows.reduce((s, i) => s + (i.paid_amount || 0), 0);
    const outstanding = rows.reduce((s, i) => s + (i.remaining_amount || 0), 0);

    return {
      totalBilled,
      totalPaid,
      outstanding,
      activeCount: rows.length,
      paidCount: rows.filter((i) => i.status === "paid").length,
      dueCount: rows.filter((i) => i.remaining_amount > 0).length,
    };
  }, [rows]);

  const yearOptions = [defaultYear, defaultYear - 1];

  return (
  <section className={style.paymentPage}>
    <header className={style.header}>
      <div>
        <h2>پرداخت‌های من</h2>
        <p>نمایش شهریه کلاس‌ها و وضعیت پرداخت شما</p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <select
          className={style.monthBadge}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          aria-label="انتخاب ماه"
        >
          {PERSIAN_MONTH_NAMES.map((m, idx) => (
            <option key={m} value={idx + 1}>
              {m}
            </option>
          ))}
        </select>

        <select
          className={style.monthBadge}
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          aria-label="انتخاب سال"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {toPersianDigits(String(y))}
            </option>
          ))}
        </select>

        <span className={style.monthBadge}>
          <UilCalendarAlt size={16} />
          {PERSIAN_MONTH_NAMES[selectedMonth - 1]} {toPersianDigits(String(selectedYear))}
        </span>
      </div>
    </header>

    <div className={style.summaryGrid}>
      <article className={style.summaryCard}>
        <p className={style.cardTitle}>کل صورتحساب</p>
        <h3>{formatPrice(summary.totalBilled)}</h3>
        <span className={style.cardBadge}>
          {toPersianDigits(String(summary.activeCount))} کلاس
        </span>
      </article>

      <article className={style.summaryCard}>
        <p className={style.cardTitle}>جمع پرداخت‌شده</p>
        <h3>{formatPrice(summary.totalPaid)}</h3>
        <span className={`${style.cardBadge} ${style.success}`}>
          {toPersianDigits(String(summary.paidCount))} مورد تسویه
        </span>
      </article>

      <article className={`${style.summaryCard} ${style.warningCard}`}>
        <p className={style.cardTitle}>مانده قابل پرداخت</p>
        <h3>{formatPrice(summary.outstanding)}</h3>
        <span className={`${style.cardBadge} ${style.danger}`}>
          {toPersianDigits(String(summary.dueCount))} مورد در انتظار
        </span>
      </article>
    </div>

    <section className={style.tableWrap}>
      <div className={style.tableHead}>
        <span>اطلاعات کلاس</span>
        <span>وضعیت پرداخت</span>
        <span>مبلغ</span>
        <span>عملیات</span>
      </div>

      <div className={style.tableBody}>
        {loading ? (
          <div className={style.row}>در حال بارگذاری...</div>
        ) : rows.length === 0 ? (
          <div className={style.row}>برای این ماه صورتحسابی پیدا نشد.</div>
        ) : (
          rows.map((item, index) => (
            <article className={style.row} key={item.id}>
              <div className={style.classInfo}>
                <div className={style.classIcon}>{toPersianDigits(String(index + 1))}</div>
                <div>
                  <h4>{item.courseTitle}</h4>
                  <p>
                    {item.schedule} - مربی: {item.coachName}
                  </p>
                </div>
              </div>

              <div>
                <span className={`${style.statusBadge} ${style[item.statusClass]}`}>
                  {item.statusLabel}
                </span>
              </div>

              <div className={style.amountCol}>
                <strong>{formatPrice(item.amount)}</strong>
                { item.status === "paid" ? (
                  <small>سررسید: {toFaDate(item.payments[0].paid_at)}</small>
                ) : (
                  <small>سررسید: {toFaDate(item.due_date)}</small>
                )}
              </div>

              <div className={style.actions}>
                {item.status === "paid" ? (
                  <button type="button" className={style.outlineBtn}>
                    <UilCreditCard size={14} />
                    پرداخت شده
                  </button>
                ) : (
                  <button
                    type="button"
                    className={item.statusClass === "overdue" ? style.dangerBtn : style.primaryBtn}
                    disabled
                    title="فعلاً API پرداخت ورزشکار پیاده‌سازی نشده"
                  >
                    <UilCreditCard size={14} />
                    پرداخت الان
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  </section>
);


};

export default studentPayment;
