// CourseCardSkeleton.jsx
import styles from './CourseCardSkeleton.module.scss';

const CourseCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.titleLine} />
        <div className={styles.badgeLine} />
      </div>
      <div className={styles.body}>
        <div className={styles.infoRow}>
          <div className={styles.infoIcon} />
          <div className={styles.infoText} />
        </div>
        <div className={styles.infoRow}>
          <div className={styles.infoIcon} />
          <div className={styles.infoText} />
        </div>
        <div className={styles.attendanceSection}>
          <div className={styles.attendanceHeader}>
            <div className={styles.attendancePercent} />
            <div className={styles.attendanceLabel} />
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} />
          </div>
        </div>
        <div className={styles.stats}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.stat}>
              <div className={styles.statIcon} />
              <div className={styles.statWrapper}>
                <div className={styles.statCount} />
                <div className={styles.statLabel} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton;