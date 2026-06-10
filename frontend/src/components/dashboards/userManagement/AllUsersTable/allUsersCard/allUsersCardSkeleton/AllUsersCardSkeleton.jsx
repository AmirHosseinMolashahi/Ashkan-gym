import styles from "./AllUsersCardSkeleton.module.scss";

const AllUsersCardItemSkeleton = () => {
  return (
    <div className={styles.card}>

      <div className={styles.cardHeader}>
        <div className={styles.userInfo}>
          <div className={`${styles.bone} ${styles.boneAvatar}`} />
          <div className={styles.userInfoText}>
            <div className={`${styles.bone} ${styles.boneName}`} />
            <div className={styles.statusContainer}>
              <div className={`${styles.bone} ${styles.boneBadge}`} />
              <div className={`${styles.bone} ${styles.boneBadge}`} />
            </div>
          </div>
        </div>
        <div className={styles.cardActions}>
          <div className={`${styles.bone} ${styles.boneIconBtn}`} />
          <div className={`${styles.bone} ${styles.boneIconBtn}`} />
        </div>
      </div>

      <div className={styles.cardInfo}>
        <ul>
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i}>
              <div className={`${styles.bone} ${styles.boneInfoTitle}`} />
              <div className={`${styles.bone} ${styles.boneInfoValue}`} />
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

const AllUsersCardSkeleton = ({ count = 6 }) => {
  return (
    <div className={styles.usersCard}>
      {Array.from({ length: count }).map((_, i) => (
        <AllUsersCardItemSkeleton key={i} />
      ))}
    </div>
  );
};

export default AllUsersCardSkeleton;