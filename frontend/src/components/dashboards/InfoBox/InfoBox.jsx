import React from 'react'
import css from './InfoBox.module.scss'
import userpic from '../../../assets/dashbaord/man-user.jpg'
import toPersianDigits from '../../../hooks/convertNumber';
import roleConverter from '../../../hooks/roleConverter';
import { useSelector} from "react-redux";
import { UilEdit, UilMobileAndroid } from '@iconscout/react-unicons';
import { useNavigate } from 'react-router-dom';



const InfoBox = () => {
  const { user, loading } = useSelector(state => state.auth);
  const navigate = useNavigate()

  if (loading) return <p>در حال بارگزاری</p>

  return (
    <div className={css.infoBox}>
        <div className={css.container}>
            <div className={css.avatar}>
                <img src={user?.profile_picture} alt="" />
                <div className={css.editIcon}>
                    <UilEdit onClick={() => navigate('/dashboard/profile')} />
                </div>
            </div>
            <div className={css.baseInfo}>
                <ul>
                    <li className={css.infoItem}>
                        <p><b>{user?.full_name}</b> عزیز</p>
                        <p className={css.userRole}><b>{roleConverter(user?.roles)}</b> محترم باشگاه اشکان.</p>
                        <p className={css.welcomeText}>به داشبورد خود خوش آمدید.</p>
                    </li>
                    <li className={css.infoItem}>
                        <p className={css.userMobile}><UilMobileAndroid /> <b>{toPersianDigits(user?.phone_number)}</b></p>
                        <p className={css.validNumber}>از صحت شماره تلفن خود اطمینان حاصل نمایید. کلیه‌ی فعالیت ها (تغییر رمز عبور و  اطلاعیه ها و ...) از طریق این شماره انجام میگیرد.</p>
                    </li>
                </ul>
            </div>
        </div>
    </div>
  )
}

export default InfoBox