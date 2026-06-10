// MonthListSkeleton.jsx
import styles from './MonthListSkeleton.module.scss';

const MONTH_COUNT = 6;

const MonthListSkeleton = ({ count = MONTH_COUNT }) => (
  <div className={styles.monthList}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.monthItem}>
        <div className={styles.info}>
          <div className={styles.title} />
          <div className={styles.sub} />
        </div>
        <div className={styles.badge} />
      </div>
    ))}
  </div>
);

export default MonthListSkeleton;