import React, {useState, useEffect} from 'react'
import style from './DetailBox.module.scss';
import { useSelector } from "react-redux";
import toPersianDigits from '../../../../hooks/convertNumber';
import api from '../../../../hooks/api';
import Modal from '../../../GlobalComponents/Modal/Modal';
import { UilEdit, UilPen, UilCheckCircle, UilExclamationTriangle, UilClockFive, UilShieldExclamation, UilHeartRate, UilShieldPlus } from '@iconscout/react-unicons'
import { useNavigate } from 'react-router-dom';
import { hasRole } from '../../../../hooks/roleConverter';

const DetailBox = () => {
  const { user, loading} = useSelector(
    state => state.auth
  )

  const navigate = useNavigate()
  const [noInsuranceCount, setNoInsuranceCount] = useState(0)
  const [NoInsuranceList, setNoInsuranceList] = useState([])
  const [noIsuranceListModal, setNoInsuranceListModal] = useState(false)

  if (hasRole(user?.roles, 'manager') || hasRole(user?.roles, 'coach')) {
    const fetchUsersWithoutInsurance = async () => {
      try {
        const request = await api.get('/account/users/no-insurance/');
        setNoInsuranceCount(request.data.users_without_insurance_number);
        setNoInsuranceList(request.data.users_without_insurance_list);
      } catch (err) {
        console.error('Error fetching users without insurance:', err);
      }
    };

    useEffect(() => {
      fetchUsersWithoutInsurance();
    }, []);
  }

  return (
    <>
      <div className={style.detailBox}>
        <div className={style.container}>
          <div className={style.detailIcon}>وضعیت فعلی <UilHeartRate /></div>
          <div className={style.detailList}>
            <div className={style.lastLogin}>
              <button>
                <UilClockFive />
              </button>
              <div className={style.lastLoginTime}>
                آخرین ورود: <span>{toPersianDigits(user?.previous_login_jalali)}</span>
              </div>
            </div>
            {hasRole(user?.roles, 'manager') || hasRole(user?.roles, 'coach') ? (
              <>
                <hr />
                <div className={style.insuranceList}>
                  <button>
                    <UilShieldExclamation />
                  </button>
                  <div className={style.insuranceDetail}>
                     بیمه ورزشکاران: 
                    <span>
                      <strong>{noInsuranceCount}</strong> نفر فاقد بیمه
                    </span>
                  </div>
                  <button className={style.viewInsuranceList} onClick={() => setNoInsuranceListModal(true)}>بررسی</button>
                </div>
              </>
            ) : null}
            <hr />
            <div className={style.insuranceStatus}>
              <button>
                <UilShieldPlus />
              </button>
              <div className={style.insuranceStatusDetail}>
                وضعیت بیمه: {user?.insurance ? (
                  <span className={style.insured}>دارای بیمه <UilCheckCircle size="1.2rem"/></span>
                ) : (
                  <span className={style.notInsured}>فاقد بیمه<UilExclamationTriangle size="1.2rem"/></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {noIsuranceListModal && (
        <Modal handleModal={() => setNoInsuranceListModal(false)} width="500px" height="400px">
          <h2 className={style.modalTitle}>لیست افراد فاقد بیمه</h2>
          <div className={style.noInsuranceList}>
            {NoInsuranceList.map((user, index) => (
              <div key={index} className={style.listItem}>
                <div className={style.rightItem}>
                  <span className={style.rowNum}>{toPersianDigits(index + 1)}</span>
                  <div className={style.userInfo}>
                    <h3>{user.first_name} {user.last_name}</h3>
                    <div className={style.userBaseInfo}>
                      <p>{toPersianDigits(user.national_id)}</p>
                      <p className={`${style.expired} ${user.insurance_expiry_jalali === null ? style.noDate : ''}`}>{user.insurance_expiry_jalali !== null ? "تاریخ انقضا: " + toPersianDigits(user.insurance_expiry_jalali) : 'فاقد تاریخ انقضا'}</p>
                    </div>
                  </div>
                </div>
                <button className={style.editBtn}><UilPen onClick={() => navigate(`/dashboard/user-management/${user.id}/edit`)}/></button>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  )
}

export default DetailBox