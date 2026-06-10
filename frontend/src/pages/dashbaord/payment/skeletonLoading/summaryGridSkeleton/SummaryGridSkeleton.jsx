import styles from "./SummaryGridSkeleton.module.scss";

const SummaryCardSkeleton = () => {
  return (
    <article className={styles.summaryCard}>
      <div className={`${styles.bone} ${styles.boneTitle}`} />
      <div className={`${styles.bone} ${styles.boneAmount}`} />
      <div className={`${styles.bone} ${styles.boneBadge}`} />
    </article>
  );
};

const SummaryGridSkeleton = () => {
  return (
    <div className={styles.summaryGrid}>
      {Array.from({ length: 4 }).map((_, i) => (
        <SummaryCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default SummaryGridSkeleton;