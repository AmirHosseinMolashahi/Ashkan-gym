import React from 'react'
import styles from "./AllUsersCard.module.scss";
import { UilCreditCard, UilEdit, UilTrashAlt, UilTimes, UilMobileAndroid, UilCalendar, UilShield, UilCheck } from '@iconscout/react-unicons'
import toPersianDigits from '../../../../../hooks/convertNumber';
import roleConverter from '../../../../../hooks/roleConverter';
import { useNavigate } from 'react-router-dom';

const AllUsersCard = ({ data }) => {
  const navigate = useNavigate();
  return (
    <div className={styles.usersCard}>
      {data.map((item, index) => (
        <div key={item.id ?? index} className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.userInfo}>
              <img src={item.profile_picture} alt={item.full_name} />
              <div>
                <strong>{item.full_name}</strong>
                <div className={styles.statusContainer}>
                  <span className={styles.roleBadge}>
                    {roleConverter(item.roles)}
                  </span>
                  <span className={`${styles.badge} ${item.is_active ? styles.active : styles.inactive}`}>
                    {item.is_active ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.cardActions}>
              <button onClick={() => navigate(`/dashboard/user-management/${item.id}/edit`)}>
                <UilEdit />
              </button>
              <button onClick={() => handleDeleteModal(item.id)}>
                <UilTrashAlt fill='#C1121F' />
              </button>
            </div>
          </div>
          <div className={styles.cardInfo}>
            <ul>
              <li>
                <div className={styles.infoTitle}><UilCreditCard />کد ملی </div>
                <span>{toPersianDigits(item.national_id)}</span>
              </li>
              <li>
                <div className={styles.infoTitle}><UilMobileAndroid />تلفن </div>
                <span>{toPersianDigits(item.phone_number)}</span>
              </li>
              <li>
                <div className={styles.infoTitle}><UilCalendar />تاریخ عضویت </div>
                <span>{toPersianDigits((item.joined_at || "").split(" ")[0] || "-")}</span>
              </li>
              <li>
                <div className={styles.infoTitle}><UilShield />بیمه </div>
                <span>{item.insurance ? `تا ${toPersianDigits(item.insurance_expiry_jalali)}` : 'ندارد'}</span>
              </li>
            </ul>
          </div>
        </div>
        ) 
      )} 
    </div>
  )
}

export default AllUsersCard