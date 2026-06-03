// ScheduleWidgetSkeleton.jsx
import styles from './ScheduleWidgetSkeleton.module.scss';

export default function ScheduleWidgetSkeleton() {
  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <div className={`${styles.sk} ${styles.badge}`} />
        <div className={styles.widgetHeaderRight}>
          <div className={`${styles.sk} ${styles.icon}`} />
          <div className={`${styles.sk} ${styles.title}`} />
        </div>
      </div>
      <div className={styles.scheduleList}>
        {[80, 60, 70].map((w, i) => (
          <div key={i} className={styles.scheduleItem}>
            <div className={`${styles.sk} ${styles.time}`} />
            <div className={styles.scheduleInfo}>
              <div className={styles.sk} style={{ width: `${w}px`, height: '13px' }} />
              <div className={`${styles.sk} ${styles.tag}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}