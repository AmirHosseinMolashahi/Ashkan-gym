import React from 'react'
import css from './InfoBox.module.scss'
import userpic from '../../../assets/dashbaord/man-user.jpg'
import { useAuth } from '../../../context/AuthContext';

const InfoBox = () => {
  const { user, isCoach, coach, loading } = useAuth();

  return (
    <div className={css.infoBox}>
        <div className={css.container}>
            <div className={css.avatar}>
                <img src={user?.profile_picture} alt="" />
                <span>
                    وضعیت:  {user?.role}
                </span>
            </div>
            <div className={css.baseInfo}>
                <ul>
                    <li>
                        کدملی: <span>{user?.national_id}</span>
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
                        تاریخ تولد: <span>{user?.birthdate}</span>
                    </li>
                    <li>
                        تلفن: <span>{user?.phone_number}</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
  )
}

export default InfoBox