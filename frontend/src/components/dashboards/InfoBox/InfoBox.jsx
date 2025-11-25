import React from 'react'
import css from './InfoBox.module.scss'
import userpic from '../../../assets/dashbaord/man-user.jpg'
import { useAuth } from '../../../context/AuthContext';
import toPersianDigits from '../../../hooks/convertNumber';
import roleConverter from '../../../hooks/roleConverter';

const InfoBox = () => {
  const { user, loading } = useAuth();

  return (
    <div className={css.infoBox}>
        <div className={css.container}>
            <div className={css.avatar}>
                <img src={user?.profile_picture} alt="" />
                <span>
                    وضعیت:  {roleConverter(user?.role)}
                </span>
            </div>
            <div className={css.baseInfo}>
                <ul>
                    <li>
                        کدملی: <span>{toPersianDigits(user?.national_id)}</span>
                    </li>
                    <li>
                        نام: <span>{user?.first_name}</span>
                    </li>
                    <li>
                        نام خانوادگی: <span>{user?.last_name}</span>
                    </li>
                    <li>
                        نام پدر: <span>{user?.father_name}</span>
                    </li>
                    <li>
                        تاریخ تولد: <span>{toPersianDigits(user?.birthdate_jalali)}</span>
                    </li>
                    <li>
                        تلفن: <span>{toPersianDigits(user?.phone_number)}</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
  )
}

export default InfoBox