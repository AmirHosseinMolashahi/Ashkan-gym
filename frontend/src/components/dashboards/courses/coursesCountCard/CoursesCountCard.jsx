import React from 'react'
import style from './CoursesCountCard.module.scss'

const CoursesCountCard = ({icon, number, title, iconColor}) => {
  return (
    <div className={style.countCard}>
      <div className={style.icon} style={{background: iconColor}}>
        {icon}
      </div>
      <div className={style.info}>
        <h1>
          {number}
        </h1>
        <p>
          {title}
        </p>
      </div>
    </div>
  )
}

export default CoursesCountCard;