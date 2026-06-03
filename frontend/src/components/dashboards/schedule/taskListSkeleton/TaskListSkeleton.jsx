// TaskListSkeleton.jsx
import styles from './TaskListSkeleton.module.scss';

const SkeletonItem = ({ hasDescription = false }) => (
  <div className={styles.item}>
    <div className={`${styles.sk} ${styles.checkbox}`} />
    <div className={styles.content}>
      <div className={styles.titleRow}>
        <div className={`${styles.sk} ${styles.title}`} />
        <div className={`${styles.sk} ${styles.tag}`} />
      </div>
      {hasDescription && (
        <>
          <div className={`${styles.sk} ${styles.descLine}`} />
          <div className={`${styles.sk} ${styles.descLineShort}`} />
        </>
      )}
    </div>
    <div className={styles.left}>
      <div className={`${styles.sk} ${styles.timeLine}`} />
      <div className={`${styles.sk} ${styles.dateLine}`} />
      <div className={styles.actions}>
        <div className={`${styles.sk} ${styles.actionBtn}`} />
        <div className={`${styles.sk} ${styles.actionBtn}`} />
      </div>
    </div>
  </div>
);

const SkeletonGroup = ({ itemCount = 2 }) => (
  <div className={styles.group}>
    <div className={styles.groupHeader}>
      <div className={`${styles.sk} ${styles.groupIcon}`} />
      <div className={`${styles.sk} ${styles.groupLabel}`} />
    </div>
    {[...Array(itemCount)].map((_, i) => (
      <SkeletonItem key={i} hasDescription={i === 0} />
    ))}
  </div>
);

export default function TaskListSkeleton() {
  return (
    <div className={styles.taskList}>
      <SkeletonGroup itemCount={2} />
      <SkeletonGroup itemCount={1} />
    </div>
  );
}