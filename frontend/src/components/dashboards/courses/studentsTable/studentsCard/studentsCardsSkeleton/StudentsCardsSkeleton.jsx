import styles from "./StudentsCardsSkeleton.module.scss";

const StudentsCardsSkeleton = ({ rows = 5 }) => {
  return (
    <div className={styles.cardsContainer}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className={styles.card}>

          {/* header */}
          <div className={styles.cardHeader}>
            <div className={`${styles.skAvatar} ${styles.pulse}`} />
            <div className={styles.skInfo}>
              <div className={`${styles.skName} ${styles.pulse}`} />
              <div className={`${styles.skNationalId} ${styles.pulse}`} />
            </div>
            <div className={`${styles.skPhone} ${styles.pulse}`} />
            <div className={`${styles.skActionBtn} ${styles.pulse}`} />
          </div>

          {/* info row */}
          <div className={styles.cardInfo}>
            <div className={`${styles.skBadge} ${styles.pulse}`} />
            <div className={`${styles.skBadge} ${styles.pulse}`} style={{ width: '70px' }} />
            <div className={`${styles.skBadge} ${styles.pulse}`} style={{ width: '90px' }} />
          </div>

        </div>
      ))}
    </div>
  );
};

export default StudentsCardsSkeleton;