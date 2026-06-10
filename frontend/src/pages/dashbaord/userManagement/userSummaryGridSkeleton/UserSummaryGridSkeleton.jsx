import styles from "./UserSummaryGridSkeleton.module.scss";

const UserSummaryCardSkeleton = () => {
  return (
    <article className={styles.summaryCard}>
      <div className={`${styles.bone} ${styles.boneTitle}`} />
      <div className={`${styles.bone} ${styles.boneAmount}`} />
    </article>
  );
};

const UserSummaryGridSkeleton = () => {
  return (
    <div className={styles.summaryGrid}>
      {Array.from({ length: 4 }).map((_, i) => (
        <UserSummaryCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default UserSummaryGridSkeleton;