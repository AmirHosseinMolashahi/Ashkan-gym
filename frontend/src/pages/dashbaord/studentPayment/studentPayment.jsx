import React, { useMemo, useState, useEffect } from "react";
import { UilCalendarAlt, UilCreditCard } from "@iconscout/react-unicons";
import api from "../../../hooks/api";
import { getCurrentShamsiPeriod, PERSIAN_MONTH_NAMES } from "../../../hooks/shamsiDate";
import toPersianDigits from "../../../hooks/convertNumber";
import style from "./studentPayment.module.scss";
import SummaryCardsSkeleton from "./skeletonLoading/summaryCardsSkeleton/SummaryCardsSkeleton";
import BackButton from "../../../components/dashboards/backButton/BackButton";
import InvoiceTableSkeleton from "./skeletonLoading/invoiceTableSkeleton/InvoiceTableSkeleton";

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
  const [summary, setSummary] = useState({})
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/payment/me/invoices/?year=${selectedYear}&month=${selectedMonth}`)
        console.log(res.data)
        setInvoices(res.data.results || []);
        setSummary(res.data.summary);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  const yearOptions = [defaultYear, defaultYear - 1];

  return (
  <section className={style.paymentPage}>
    <BackButton route={'/dashboard'} title={'بازگشت'} />
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

    {loading === true ? (
      <SummaryCardsSkeleton />
    ) : (
      <div className={style.summaryGrid}>
        <div className={style.summaryRow}>
          <article className={style.summaryCard}>
            <p className={style.cardTitle}>کل صورتحساب</p>
            <h3>{formatPrice(summary.total_invoiced)}</h3>
            <span className={style.cardBadge}>
              {toPersianDigits(String(summary.count))} کلاس
            </span>
          </article>

          <article className={style.summaryCard}>
            <p className={style.cardTitle}>جمع پرداخت‌شده</p>
            <h3>{formatPrice(summary.total_paid)}</h3>
            <span className={`${style.cardBadge} ${style.success}`}>
              {toPersianDigits(String(summary.total_paid_count))} مورد تسویه
            </span>
          </article>
        </div>

        <article className={`${style.summaryCard} ${style.warningCard}`}>
          <p className={style.cardTitle}>مانده قابل پرداخت</p>
          <h3>{formatPrice(summary.total_remaining)}</h3>
          <span className={`${style.cardBadge} ${style.danger}`}>
            {toPersianDigits(String(summary.total_remaining_count))} مورد در انتظار
          </span>
        </article>
      </div>
    )}
    
    <div className={style.tabelLabel}>
      <h3>جزئیات پرداخت</h3>
      <p>وضعیت پرداخت شهریه کلاس های این ماه</p>
    </div>
    {loading === true ? (
      <InvoiceTableSkeleton />
    ) : (
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
          ) : invoices.length === 0 ? (
            <div className={style.row}>برای این ماه صورتحسابی پیدا نشد.</div>
          ) : (
            invoices.map((item, index) => (
              <article className={style.row} key={item.id}>
                <div className={style.classInfo}>
                  <div className={style.classIcon}>{toPersianDigits(String(index + 1))}</div>
                  <div>
                    <div className={style.classTitle}>
                      <h4>{item.course.title}</h4>
                      <span>مربی: {item.course.coach.full_name}</span>
                    </div>
                    <p>
                      {item.course.schedule}
                    </p>
                  </div>
                </div>

                <div className={style.column}>
                  <div>
                    <span className={`${style.statusBadge} ${style[statusInfo(item).className]}`}>
                      {statusInfo(item).label}
                    </span>
                  </div>

                  <div className={style.amountCol}>
                    <p>مبلغ</p>
                    <strong>{formatPrice(item.final_amount)}</strong>
                    { item.status === "paid" ? (
                      <small>پرداخت شده: {toFaDate(item.payments[0].paid_at)}</small>
                    ) : (
                      <small>سررسید: {toFaDate(item.final_due_date)}</small>
                    )}
                  </div>
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
    )}
  </section>
);


};

export default studentPayment;
