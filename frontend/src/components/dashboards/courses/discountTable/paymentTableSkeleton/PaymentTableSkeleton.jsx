import styles from "./PaymentTableSkeleton.module.scss";

const PaymentRowSkeleton = ({ index }) => {
  return (
    <tr className={styles.skeletonRow}>
      <td>
        <div className={`${styles.bone} ${styles.boneIndex}`} />
      </td>
      <td>
        <div className={styles.studentSkeleton}>
          <div className={`${styles.bone} ${styles.boneAvatar}`} />
          <div className={styles.studentInfo}>
            <div className={`${styles.bone} ${styles.boneName}`} />
            <div className={`${styles.bone} ${styles.boneId}`} />
          </div>
        </div>
      </td>
      <td>
        <div className={`${styles.bone} ${styles.boneDueDate}`} />
      </td>
      <td>
        <div className={`${styles.bone} ${styles.boneIcon}`} />
      </td>
      <td>
        <div className={`${styles.bone} ${styles.boneAmount}`} />
      </td>
      <td>
        <div className={`${styles.bone} ${styles.boneReason}`} />
      </td>
      <td>
        <div className={styles.btnContainer}>
          <div className={`${styles.bone} ${styles.boneEditBtn}`} />
        </div>
      </td>
    </tr>
  );
};

const PaymentTableSkeleton = ({ rows = 5 }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ردیف</th>
            <th>ورزشکار</th>
            <th>تاریخ سررسید</th>
            <th>تخفیف</th>
            <th>مبلغ پرداختی</th>
            <th>علت تخفیف</th>
            <th>تغییرات</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <PaymentRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTableSkeleton;