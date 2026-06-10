import React from 'react'
import style from './MyClassCard.module.scss'

const MyClassCard = ({icon,title, iconColor, body, footer , status = null}) => {
  return (
    <div className={style.countCard}>
      <div className={style.header} style={{background: iconColor}}>
        <div className={`${style.icon}  ${style[status]}`}>
          {icon}
        </div>
        <p className={style.title}>{title}</p>
      </div>
      <div className={style.body}>
          {body}
      </div>
      <div className={`${style.footer} ${style[status]}`}>
        {footer}
      </div>
    </div>
  )
}

export default MyClassCard;