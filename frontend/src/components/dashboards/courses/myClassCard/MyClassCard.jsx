import React from 'react'
import style from './MyClassCard.module.scss'

const MyClassCard = ({icon,title, iconColor, body, footer}) => {
  return (
    <div className={style.countCard}>
      <div className={style.header} style={{background: iconColor}}>
        <div className={style.icon}>
          {icon}
        </div>
        <p>{title}</p>
      </div>
      <div className={style.body}>
          {body}
      </div>
      <div className={style.footer}>
        {footer}
      </div>
    </div>
  )
}

export default MyClassCard;