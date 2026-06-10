import styles from "./PaymentCardSkeleton.module.scss";

const PaymentCardSkeleton = () => {
  return (
    <div className={styles.card}>

      <div className={styles.cardHeader}>
        <div className={`${styles.bone} ${styles.boneAvatar}`} />
        <div className={styles.info}>
          <div className={`${styles.bone} ${styles.boneName}`} />
          <div className={`${styles.bone} ${styles.boneNationalId}`} />
        </div>
        <div className={styles.paymentStatus}>
          <div className={`${styles.bone} ${styles.boneBadge}`} />
        </div>
      </div>

      <div className={styles.cardInfo}>
        <ul>
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i}>
              <div className={`${styles.bone} ${styles.boneLabel}`} />
              <div className={`${styles.bone} ${styles.boneValue}`} />
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.cardActions}>
        <div className={`${styles.bone} ${styles.boneChangeBtn}`} />
        <div className={styles.paymentActions}>
          <div className={`${styles.bone} ${styles.boneSelect}`} />
          <div className={`${styles.bone} ${styles.boneGhostBtn}`} />
          <div className={`${styles.bone} ${styles.bonePrimaryBtn}`} />
        </div>
      </div>

    </div>
  );
};

const PaymentCardsSkeleton = ({ count = 4 }) => {
  return (
    <div className={styles.paymentCard}>
      {Array.from({ length: count }).map((_, i) => (
        <PaymentCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default PaymentCardsSkeleton;