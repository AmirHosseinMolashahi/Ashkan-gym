import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../../../hooks/api";
import toPersianDigits from "../../../../hooks/convertNumber";
import {
  PERSIAN_MONTH_NAMES,
  getCurrentShamsiPeriod,
} from "../../../../hooks/shamsiDate";
import style from "./PaymentAthletes.module.scss";
import { UilArrowRight } from "@iconscout/react-unicons";

const getTodayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
};

const formatMoney = (value) =>
  `${toPersianDigits(String(Number(value || 0).toLocaleString()))} تومان`;

const formatDateFa = (dateStr) => {
  if (!dateStr) return "بدون سررسید";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("fa-IR");
};

const getRowState = (row) => {
  const today = getTodayISO();
  const remaining = Number(row.remaining_amount || 0);

  if (remaining <= 0 || row.status === "paid") {
    return { key: "paid", label: "پرداخت شده" };
  }

  if (row.due_date && row.due_date < today) {
    return { key: "overdue", label: "معوق" };
  }

  return { key: "pending", label: "در انتظار" };
};

const PaymentAthletes = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();

  const current = getCurrentShamsiPeriod();
  const year = Number(searchParams.get("year")) || current.year;
  const month = Number(searchParams.get("month")) || current.month;

  const [rows, setRows] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  const [methodByInvoice, setMethodByInvoice] = useState({});
  const [searchText, setSearchText] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all"); // all | paid | unpaid


  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const [invoiceRes, courseRes] = await Promise.all([
          api.get(
            `/payment/coach/invoices/?course_id=${courseId}&year=${year}&month=${month}`
          ),
          api.get(`/training/courses/detail/${courseId}/`),
        ]);

        if (cancelled) return;

        const fetchedRows = invoiceRes.data || [];
        setRows(fetchedRows);
        setMethodByInvoice(
          Object.fromEntries(fetchedRows.map((r) => [r.id, "cash"]))
        );
        setCourseTitle(courseRes.data?.title || "کلاس");
      } catch (e) {
        if (!cancelled) {
          setError("خطا در بارگذاری اطلاعات پرداخت ورزشکارها");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [courseId, year, month]);

  const monthLabel = `${PERSIAN_MONTH_NAMES[month - 1]} ${year}`;

  const summary = useMemo(() => {
    const totalExpected = rows.reduce((a, r) => a + Number(r.amount || 0), 0);
    const collected = rows.reduce((a, r) => a + Number(r.paid_amount || 0), 0);
    const pending = rows.reduce(
      (a, r) => a + Number(r.remaining_amount || 0),
      0
    );
    const pendingCount = rows.filter((r) => getRowState(r).key !== "paid").length;

    return {
      athleteCount: rows.length,
      totalExpected,
      collected,
      pending,
      pendingCount,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return rows.filter((row) => {
      const state = getRowState(row);

      const matchesFilter =
        paymentFilter === "all"
          ? true
          : paymentFilter === "paid"
          ? state.key === "paid"
          : state.key !== "paid";

      const name = (row.student_name || "").toLowerCase();
      const nationalId = String(row.student_national_id || "").toLowerCase();

      const matchesSearch =
        q === "" || name.includes(q) || nationalId.includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [rows, searchText, paymentFilter]);

  const handleMarkPaid = async (invoiceId) => {
    try {
      setUpdatingId(invoiceId);
      const method = methodByInvoice[invoiceId] || "cash";

      const res = await api.patch(`/payment/coach/invoices/${invoiceId}/`, {
        status: "paid",
        payment_method: method,
      });

      setRows((prev) => prev.map((r) => (r.id === invoiceId ? res.data : r)));
    } catch (e) {
      alert("ثبت پرداخت انجام نشد.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemind = (row) => {
    alert(`یادآوری برای ${row.student_name} ارسال شد (دمو).`);
  };

  const handleRemindAll = () => {
    const list = rows.filter((r) => getRowState(r).key !== "paid");
    alert(`یادآوری برای ${list.length} ورزشکار ارسال شد (دمو).`);
  };

  if (loading) return <div className={style.page}>در حال بارگذاری...</div>;
  if (error) return <div className={style.page}>{error}</div>;

  return (
    <div className={style.page}>
      <button className={style.backBtn} onClick={() => navigate("/dashboard/payment")}>
        <UilArrowRight />بازگشت به نمای کلی پرداخت
      </button>

      <div className={style.topRow}>
        <div>
          <h2 className={style.title}>{courseTitle}</h2>
          <p className={style.subtitle}>
            {toPersianDigits(String(summary.athleteCount))} ورزشکار
          </p>
        </div>

        <div className={style.monthTag}>{toPersianDigits(monthLabel)}</div>
      </div>

      <div className={style.summaryGrid}>
        <article className={style.card}>
          <p className={style.cardLabel}>مجموع مورد انتظار</p>
          <h3>{formatMoney(summary.totalExpected)}</h3>
          <span className={style.subtle}>
            {toPersianDigits(String(summary.athleteCount))} ورزشکار
          </span>
        </article>

        <article className={style.card}>
          <p className={style.cardLabel}>دریافت شده</p>
          <h3>{formatMoney(summary.collected)}</h3>
          <span className={`${style.badge} ${style.paid}`}>
            {toPersianDigits(
              String(rows.filter((r) => getRowState(r).key === "paid").length)
            )}{" "}
            پرداخت شده
          </span>
        </article>

        <article className={style.card}>
          <p className={style.cardLabel}>در انتظار</p>
          <h3>{formatMoney(summary.pending)}</h3>
          <span className={`${style.badge} ${style.pending}`}>
            {toPersianDigits(String(summary.pendingCount))} پرداخت نشده
          </span>
        </article>

        <article className={`${style.card} ${style.actionCard}`}>
          <p className={style.cardLabel}>نیازمند اقدام</p>
          <h3>{toPersianDigits(String(summary.pendingCount))} ورزشکار در انتظار</h3>
          <button className={style.primaryBtn} onClick={handleRemindAll}>
            یادآوری به همه
          </button>
        </article>
      </div>

      <div className={style.filtersBar}>
        <input
          className={style.searchInput}
          type="text"
          placeholder="جستجوی ورزشکار (نام یا کد ملی)..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <select
          className={style.filterSelect}
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="paid">فقط پرداخت‌شده</option>
          <option value="unpaid">فقط پرداخت‌نشده</option>
        </select>
      </div>

      <div className={style.tableWrap}>
        <div className={style.tableHead}>
          <span>ورزشکار</span>
          <span>وضعیت پرداخت</span>
          <span>مبلغ</span>
          <span>عملیات</span>
        </div>

        {filteredRows.map((row) => {
          const state = getRowState(row);

          return (
            <div className={style.tableRow} key={row.id}>
              <div className={style.athleteCell}>
                <div className={style.avatar}>
                  {row.student_profile_picture ? (
                    <img src={row.student_profile_picture} alt={row.student_name} />
                  ) : (
                    <span>{row.student_name?.slice(0, 1) || "و"}</span>
                  )}
                </div>
                <div>
                  <p className={style.name}>{row.student_name}</p>
                  <p className={style.emailLike}>{row.student_national_id || "—"}</p>
                </div>
              </div>

              <div>
                <span className={`${style.badge} ${style[state.key]}`}>{state.label}</span>
              </div>

              <div>
                <p className={style.amount}>{formatMoney(row.amount)}</p>
                <p className={style.dateText}>
                  {state.key === "paid"
                    ? formatDateFa(row.updated_at?.slice(0, 10))
                    : `سررسید: ${formatDateFa(row.due_date)}`}
                </p>
                <p className={style.dateText}>
                  روش پرداخت: {row.last_payment_method_label || "—"}
                </p>
              </div>

              <div className={style.actions}>
                {state.key === "paid" ? (
                  <button className={style.ghostBtn}>رسید</button>
                ) : (
                  <>
                    <select
                      className={style.methodSelect}
                      value={methodByInvoice[row.id] || "cash"}
                      onChange={(e) =>
                        setMethodByInvoice((prev) => ({
                          ...prev,
                          [row.id]: e.target.value,
                        }))
                      }
                    >
                      <option value="cash">نقدی</option>
                      <option value="pos">کارت‌خوان</option>
                      <option value="transfer">کارت‌به‌کارت/واریز</option>
                      <option value="online">آنلاین</option>
                    </select>
                    <button className={style.ghostBtn} onClick={() => handleRemind(row)}>
                      یادآوری
                    </button>
                    <button
                      className={style.primaryBtn}
                      onClick={() => handleMarkPaid(row.id)}
                      disabled={updatingId === row.id}
                    >
                      {updatingId === row.id ? "..." : "ثبت پرداخت"}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {filteredRows.length === 0 && <p className={style.empty}>موردی با این فیلتر/جستجو پیدا نشد.</p>}
      </div>
    </div>
  );
};

export default PaymentAthletes;
