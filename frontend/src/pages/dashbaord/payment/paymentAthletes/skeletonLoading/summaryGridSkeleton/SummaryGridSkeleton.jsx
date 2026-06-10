import styles from "./SummaryGridSkeleton.module.scss";

const SummaryCardSkeleton = ({ isAction = false }) => {
  return (
    <article className={`${styles.card} ${isAction ? styles.actionCard : ""}`}>
      <div className={`${styles.bone} ${styles.boneLabel}`} />
      <div className={`${styles.bone} ${styles.boneAmount}`} />
      <div className={`${styles.bone} ${isAction ? styles.boneBtn : styles.boneBadge}`} />
    </article>
  );
};

const SummaryGridSkeleton = () => {
  return (
    <div className={styles.summaryGrid}>
      <SummaryCardSkeleton />
      <SummaryCardSkeleton />
      <SummaryCardSkeleton />
      <SummaryCardSkeleton isAction />
    </div>
  );
};

export default SummaryGridSkeleton;