import React from 'react'
import style from './DetailBox.module.scss';
import { useSelector } from "react-redux";
import toPersianDigits from '../../../../hooks/convertNumber';

const DetailBox = () => {
  const { user, loading} = useSelector(
    state => state.auth
  )

  return (
    <div className={style.detailBox}>
      <div className={style.container}>
        <ul>
          <li>آخرین ورود شما: {toPersianDigits(user?.previous_login_jalali)}</li>
        </ul>
      </div>
    </div>
  )
}

export default DetailBox