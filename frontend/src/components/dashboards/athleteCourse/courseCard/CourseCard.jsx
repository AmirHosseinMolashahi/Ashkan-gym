import toPersianDigits from '../../../../hooks/convertNumber';
import styles from './CourseCard.module.scss';

const CourseCard = ({
  title,
  imageUrl,
  isPaid,
  schedule,
  coach,
  attendancePercent,
  presentCount,
  lateCount,
  absentCount,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.hero}>
        <img src={imageUrl} alt={title} className={styles.heroImage} />
        <div className={styles.heroOverlay} />
        <h2 className={styles.title}>{title}</h2>
        {!isPaid && (
          <span className={styles.unpaidBadge}>
            <span className={styles.badgeDot} />
            پرداخت نشده
          </span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.infoRow}>
          <span className={styles.infoIcon}>📅</span>
          <span className={styles.infoText}>{toPersianDigits(schedule)}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoIcon}>👤</span>
          <span className={styles.infoText}>مربی: {coach}</span>
        </div>

        <div className={styles.attendanceSection}>
          <div className={styles.attendanceHeader}>
            <span className={styles.attendanceLabel}>درصد حضور این ماه</span>
            <span className={styles.attendancePercent}>{toPersianDigits(attendancePercent)}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${attendancePercent}%` }}
            />
          </div>
        </div>

        <div className={styles.stats}>
          <div className={`${styles.stat} ${styles.statPresent}`}>
            <span className={styles.statIcon}>✅</span>
            <div className={styles.statWrapper}>
              <span className={styles.statCount}>{toPersianDigits(presentCount)} جلسه</span>
              <span className={styles.statLabel}>حضور</span>
            </div>
          </div>
          <div className={`${styles.stat} ${styles.statLate}`}>
            <span className={styles.statIcon}>🕐</span>
            <div className={styles.statWrapper}>
              <span className={styles.statCount}>{toPersianDigits(lateCount)} جلسه</span>
              <span className={styles.statLabel}>تأخیر</span>
            </div>
          </div>
          <div className={`${styles.stat} ${styles.statAbsent}`}>
            <span className={styles.statIcon}>❌</span>
            <div className={styles.statWrapper}>
              <span className={styles.statCount}>{toPersianDigits(absentCount)} جلسه</span>
              <span className={styles.statLabel}>غیبت</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
