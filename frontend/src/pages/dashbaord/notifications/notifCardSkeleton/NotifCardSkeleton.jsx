import style from './NotifCardSkeleton.module.scss'

function NotifCardSkeleton() {
  return (
    <div className={style.card}>
      <div className={style.wrapper}>
        <div className={style.icon}></div>

        <div className={style.info}>
          <div className={style.message}></div>
          <div className={style.messageShort}></div>
        </div>

        <div className={style.date}></div>
        <div className={style.bottom}>
          <div className={style.button}></div>
          <div className={style.button}></div>
        </div>
      </div>
    </div>
  )
}

export default NotifCardSkeleton