import React from 'react'
import css from './InfoBox.module.scss'
import userpic from '../../../assets/dashbaord/man-user.jpg'
import toPersianDigits from '../../../hooks/convertNumber';
import roleConverter from '../../../hooks/roleConverter';
import { useSelector} from "react-redux";
import { UilEdit, } from '@iconscout/react-unicons';
import { useNavigate } from 'react-router-dom';



const InfoBox = () => {
  const { user, loading } = useSelector(state => state.auth);
  const navigate = useNavigate()

  if (loading) return <p>در حال بارگزاری</p>

  return (
    <div className={css.infoBox}>
        <div className={css.container}>
            <div className={css.editIcon}>
                <UilEdit onClick={() => navigate('/dashboard/profile')} />
            </div>
            <div className={css.avatar}>
                <img src={user?.profile_picture} alt="" />
            </div>
            <div className={css.baseInfo}>
                <ul>
                    <li className={css.infoItem}>
                        <p><b>{user?.full_name}</b> عزیز، <b>{roleConverter(user?.role)}</b> محترم باشگاه اشکان.</p>
                        <p>به داشبورد خود خوش آمدید.</p>
                    </li>
                    <li className={css.infoItem}>
                        <p>شماره تلفن شما: <b>{toPersianDigits(user?.phone_number)}</b></p>
                        <p className={css.validNumber}>از صحت شماره تلفن خود اطمینان حاصل نمایید. کلیه‌ی فعالیت ها (تغییر رمز عبور و  اطلاعیه ها و ...) از طریق این شماره انجام میگیرد.</p>
                    </li>
                </ul>

                {/* <ul>
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
                </ul> */}
            </div>
        </div>
    </div>
  )
}

export default InfoBox