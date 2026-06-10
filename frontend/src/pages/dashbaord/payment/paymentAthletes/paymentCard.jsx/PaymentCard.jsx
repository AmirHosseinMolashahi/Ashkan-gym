import React from 'react'
import styles from './PaymentCard.module.scss';
import { UilImport, UilEye, UilEdit, UilTrashAlt, UilTimes, UilCheck } from '@iconscout/react-unicons'
import toPersianDigits from '../../../../../hooks/convertNumber';
import PaymentCardsSkeleton from './paymentCardSkeleton/PaymentCardSkeleton';

const formatMoney = (value) =>
  `${toPersianDigits(String(Number(value || 0).toLocaleString()))} تومان`;

const formatDateFa = (dateStr) => {
  if (!dateStr) return "بدون سررسید";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("fa-IR");
};

const PaymentCard = ({data, rowState, methodByInvoice, setMethodByInvoice, handleChangeInvoiceModal, handleRemind, handleMarkPaid, updatingId, loading}) => {
  return (
    loading === true ? (
      <PaymentCardsSkeleton />
    ) : (
      <div className={styles.paymentCard}>
        {data.length > 0 ? (
          data.map((item, index) => {
            const state = rowState(item);

            return (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <img src={item.profile_picture} />
                <div className={styles.info}>
                  <strong>
                    {item.student_name}
                  </strong>
                  <p>{item.national_id}</p>
                </div>
                <div className={styles.paymentStatus}>
                  <div className={`${styles.badge} ${styles[state.key]}`}>{state.label}</div>
                </div>
              </div>
              <div className={styles.cardInfo}>
                <ul>
                  <li>
                    <strong>مبلغ پرداختی</strong>
                    <p>{toPersianDigits(item.final_amount)} تومان</p>
                  </li>
                  <li>
                    <strong>تاریخ سررسید</strong>
                    <p>{formatDateFa(item.due_date)}</p>
                  </li>
                  <li>
                    <strong>روش پرداخت</strong>
                    <p>
                      {item.payments[0]?.method_label || "—"}
                    </p>
                  </li>
                  {state.key !== 'paid' ? (
                      <li>
                        <strong>یادآور</strong>
                        <div className={styles.notifiedStatus}>
                          {item.overdue_notified_count ? (
                          `${toPersianDigits(item.overdue_notified_count)} یادآور ارسال شده است`
                        ) : ''}
                        </div>
                        <div className={styles.notifiedDate}>
                          {item.overdue_notified_at ? (
                          `در تاریخ: ${toPersianDigits(item.overdue_notified_at)}`
                        ) : ''}
                        </div>
                      </li>
                    ): ''}
                </ul>
              </div>

              <div className={styles.cardActions}>
                {state.key === "paid" ? (
                <div className={styles.changeInvoice}>
                    <span className={styles.subtle}>امکات تغییر فاکتور نمیباشد</span>
                    <button className={styles.ghostBtn}>رسید</button>
                </div>
                ) : (
                  <div className={styles.actions}>
                    <button className={styles.changeInvoiceBtn} onClick={() => handleChangeInvoiceModal(item)}>
                      <UilEdit /> تغییر فاکتور
                    </button>
                    <div className={styles.paymentActions}>
                      <select
                        className={styles.methodSelect}
                        value={methodByInvoice[item.inv_id] || "cash"}
                        onChange={(e) =>
                          setMethodByInvoice((prev) => ({
                            ...prev,
                            [item.inv_id]: e.target.value,
                          }))
                        }
                      >
                        <option value="cash">نقدی</option>
                        <option value="pos">کارت‌خوان</option>
                        <option value="transfer">کارت‌به‌کارت/واریز</option>
                        <option value="online">آنلاین</option>
                      </select>
                      <button className={styles.ghostBtn} onClick={() => handleRemind(item)}>
                        یادآوری
                      </button>
                      <button
                        className={styles.primaryBtn}
                        onClick={() => handleMarkPaid(item.inv_id)}
                        disabled={updatingId === item.inv_id}
                      >
                        {updatingId === item.inv_id ? "..." : "ثبت پرداخت"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            )
          })
        ) : (
          <p>هیچ دیتایی پیدا نشد!</p>
        )}
      </div>
    )
  )
}

export default PaymentCard;