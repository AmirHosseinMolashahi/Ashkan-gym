import React from 'react'
import style from './Dashboard.module.scss';
import InfoBox from '../../components/dashboards/InfoBox/InfoBox'
import DetailBox from '../../components/dashboards/InfoBox/detailBox/DetailBox';


const Dashbaord = () => {
  return (
    <div className={style.dashboard}>
      <div className={style.userInfo}>
        <div className={style.right}>
          <InfoBox />
        </div>
        <div className={style.left}>
          <DetailBox />
        </div>
      </div>
    </div>
  )
}

export default Dashbaord