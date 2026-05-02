import React, {useState, useEffect} from 'react'
import style from './DetailBox.module.scss';
import { useSelector } from "react-redux";
import toPersianDigits from '../../../../hooks/convertNumber';
import api from '../../../../hooks/api';
import Modal from '../../../GlobalComponents/Modal/Modal';
import { UilEdit, UilCheckCircle, UilExclamationTriangle } from '@iconscout/react-unicons'
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
          <ul>
            <li>آخرین ورود شما: {toPersianDigits(user?.previous_login_jalali)}</li>
            {hasRole(user?.roles, 'manager') || hasRole(user?.roles, 'coach') ? (
              <li>
                تعداد <strong>{noInsuranceCount}</strong> نفر فاقد بیمه میباشند
                <button onClick={() => setNoInsuranceListModal(true)}>نمایش لیست</button>
              </li>
            ) : null}
            <li>
              وضعیت بیمه: {user?.insurance ? (
                <span className={style.insured}>دارای بیمه <UilCheckCircle size="1.2rem"/></span>
              ) : (
                <span className={style.notInsured}>فاقد بیمه<UilExclamationTriangle size="1.2rem"/></span>
              )}
            </li>
          </ul>
        </div>
      </div>
      {noIsuranceListModal && (
        <Modal handleModal={() => setNoInsuranceListModal(false)} width="500px" height="400px">
          <h2 className={style.modalTitle}>لیست افراد فاقد بیمه</h2>
          <ul className={style.noInsuranceList}>
            {NoInsuranceList.map((user, index) => (
              <li key={index}>
                <span>{index + 1}.</span>
                {user.first_name} {user.last_name} - {toPersianDigits(user.national_id)} - {user.insurance_expiry_jalali !== null ? "تاریخ انقضا: " + toPersianDigits(user.insurance_expiry_jalali) : 'فاقد تاریخ انقضا'}
                <span className={style.editButton}><UilEdit onClick={() => navigate(`/dashboard/user-management/${user.id}/edit`)}/></span>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </>
  )
}

export default DetailBox