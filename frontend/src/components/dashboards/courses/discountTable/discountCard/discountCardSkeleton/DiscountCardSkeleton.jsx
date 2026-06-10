import styles from "./DiscountCardSkeleton.module.scss";

const DiscountCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={`${styles.bone} ${styles.boneAvatar}`} />
        <div className={styles.info}>
          <div className={`${styles.bone} ${styles.boneName}`} />
          <div className={`${styles.bone} ${styles.boneId}`} />
        </div>
        <div className={styles.btnContainer}>
          <div className={`${styles.bone} ${styles.boneBtn}`} />
          <div className={`${styles.bone} ${styles.boneBtn}`} />
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
    </div>
  );
};

const DiscountCardsSkeleton = ({ count = 4 }) => {
  return (
    <div className={styles.discountCard}>
      {Array.from({ length: count }).map((_, i) => (
        <DiscountCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default DiscountCardsSkeleton;