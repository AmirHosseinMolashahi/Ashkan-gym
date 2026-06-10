import style from "./CourseDetailHeaderSkeleton.module.scss";

const CourseDetailHeaderSkeleton = () => {
  return (
    <div className={style.header}>
      <div className={style.headerContainer}>
        <div className={style.topHeader}>
          <div className={`${style.skTitle} ${style.pulse}`} />
          <div className={style.btnContainer}>
            <div className={`${style.skBtnMain} ${style.pulse}`} />
            <div className={`${style.skBtnIcon} ${style.pulse}`} />
          </div>
        </div>
        <div className={`${style.skClassTitle} ${style.pulse}`} />
        <div className={style.mainHeader}>
          <ul>
            {[...Array(3)].map((_, i) => (
              <li key={i}>
                <div className={`${style.skStatLabel} ${style.pulse}`} />
                <div className={`${style.skStatNum} ${style.pulse}`} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailHeaderSkeleton;