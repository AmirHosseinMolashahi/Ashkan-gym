import styles from "./StudentTableSkeleton.module.scss";

const StudentRowSkeleton = () => {
  return (
    <div className={styles.tableRow}>

      <div className={styles.athleteCell}>
        <div className={`${styles.bone} ${styles.boneAvatar}`} />
        <div className={styles.athleteInfo}>
          <div className={`${styles.bone} ${styles.boneName}`} />
          <div className={`${styles.bone} ${styles.boneNationalId}`} />
        </div>
      </div>

      <div className={styles.paymentStatus}>
        <div className={`${styles.bone} ${styles.boneBadge}`} />
        <div className={`${styles.bone} ${styles.boneNotified}`} />
      </div>

      <div className={styles.amountCell}>
        <div className={`${styles.bone} ${styles.boneAmount}`} />
        <div className={`${styles.bone} ${styles.boneDate}`} />
        <div className={`${styles.bone} ${styles.boneDate}`} />
      </div>

      <div className={styles.changeInvoice}>
        <div className={`${styles.bone} ${styles.boneChangeBtn}`} />
      </div>

      <div className={styles.actions}>
        <div className={`${styles.bone} ${styles.boneSelect}`} />
        <div className={`${styles.bone} ${styles.boneGhostBtn}`} />
        <div className={`${styles.bone} ${styles.bonePrimaryBtn}`} />
      </div>

    </div>
  );
};

const StudentTableSkeleton = ({ rows = 5 }) => {
  return (
    <div className={styles.tableWrap}>
      <div className={styles.tableHead}>
        <span>ورزشکار</span>
        <span>وضعیت پرداخت</span>
        <span>مبلغ</span>
        <span>تغییرات</span>
        <span>عملیات</span>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <StudentRowSkeleton key={i} />
      ))}
    </div>
  );
};

export default StudentTableSkeleton;