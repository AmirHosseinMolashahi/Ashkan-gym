import style from "./CourseDetailCardsSkeleton.module.scss";

const CourseDetailCardsSkeleton = () => {
  return (
    <div className={style.cardContainer}>

      {/* کارت زمان‌بندی */}
      <div className={style.detailCard}>
        <div className={`${style.skCardTitle} ${style.pulse}`} />
        <div className={style.detailCardContent}>
          <div className={style.detailCardWrapper}>
            <div className={style.timeList}>
              <div className={style.skTimeRow}>
                <div className={`${style.skIcon} ${style.pulse}`} />
                <div className={`${style.skText} ${style.pulse}`} style={{ width: '60%' }} />
              </div>
              <div className={style.skTimeRow}>
                <div className={`${style.skIcon} ${style.pulse}`} />
                <div className={`${style.skText} ${style.pulse}`} style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* کارت پرداخت */}
      <div className={style.detailCard}>
        <div className={`${style.skCardTitle} ${style.pulse}`} />
        <div className={style.detailCardContent}>
          <div className={style.detailCardWrapper}>
            <div className={style.payList}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className={style.skPayRow}>
                  <div className={`${style.skText} ${style.pulse}`} style={{ width: '50%' }} />
                  <div className={`${style.skBadge} ${style.pulse}`} />
                </div>
              ))}
            </div>
            <div className={`${style.skProgress} ${style.pulse}`} />
          </div>
        </div>
      </div>

      {/* کارت جلسه بعدی */}
      <div className={style.detailCard}>
        <div className={`${style.skCardTitle} ${style.pulse}`} />
        <div className={style.detailCardContent}>
          <div className={`${style.skDateBox} ${style.pulse}`} />
          <div className={`${style.skTimeText} ${style.pulse}`} />
        </div>
      </div>

    </div>
  );
};

export default CourseDetailCardsSkeleton;