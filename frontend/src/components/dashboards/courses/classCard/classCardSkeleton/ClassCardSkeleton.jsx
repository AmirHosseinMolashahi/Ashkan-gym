import style from "../ClassCard.module.scss";

const ClassCardSkeleton = () => {
  return (
    <div className={style.card}>
      <div className={`${style.skTopBorder} ${style.pulse}`} />
      <div className={style.header}>
        <div className={`${style.skBadge} ${style.pulse}`} />
        <div className={`${style.skMenu} ${style.pulse}`} />
      </div>
      <div className={`${style.skTitle} ${style.pulse}`} />
      <div className={`${style.skCoach} ${style.pulse}`} />
      <div className={`${style.skSubtitle} ${style.pulse}`} />
      <div className={style.info}>
        <div className={`${style.skInfoRow} ${style.pulse}`} style={{ width: '55%' }} />
        <div className={`${style.skInfoRow} ${style.pulse}`} style={{ width: '70%' }} />
        <div className={`${style.skInfoRow} ${style.pulse}`} style={{ width: '60%' }} />
      </div>
      <div className={`${style.skButton} ${style.pulse}`} />
    </div>
  );
};

export default ClassCardSkeleton;