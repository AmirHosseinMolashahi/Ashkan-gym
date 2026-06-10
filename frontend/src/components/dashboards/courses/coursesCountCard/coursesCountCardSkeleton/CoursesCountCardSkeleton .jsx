import style from '../CoursesCountCard.module.scss';

const CoursesCountCardSkeleton = () => {
  return (
    <div className={`${style.countCard} ${style.skeleton}`}>
      <div className={`${style.skIcon} ${style.pulse}`} />
      <div className={style.info}>
        <div className={`${style.skNumber} ${style.pulse}`} />
        <div className={`${style.skTitle} ${style.pulse}`} />
      </div>
    </div>
  );
};

export default CoursesCountCardSkeleton;