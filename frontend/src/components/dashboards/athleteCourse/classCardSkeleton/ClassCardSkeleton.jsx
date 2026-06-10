import React from 'react'
import style from './ClassCardSkeleton.module.scss';

const ClassCardSkeleton = () => {
  return (
    <div className={style.countCard}>
      <div className={style.header}>
        <div className={`${style.icon} ${style.skeletonCircle}`} />
        <div className={`${style.skeletonText} ${style.skeletonTitle}`} />
      </div>
      <div className={`${style.skeletonText} ${style.skeletonBody}`} />
      <div className={`${style.skeletonText} ${style.skeletonFooter}`} />
    </div>
  )
}

export default ClassCardSkeleton