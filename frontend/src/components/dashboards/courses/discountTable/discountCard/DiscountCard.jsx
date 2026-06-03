import React from 'react'
import styles from './DiscountCard.module.scss';
import { UilImport, UilEye, UilEdit, UilTrashAlt, UilTimes, UilCheck } from '@iconscout/react-unicons'
import toPersianDigits from '../../../../../hooks/convertNumber';

const DiscountCard = ({data, editDiscount, deleteDiscount}) => {
  return (
    <div className={styles.discountCard}>
      {data.length > 0 ? (
        data.map((item, index) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <img src={item.student.profile_picture} />
              <div className={styles.info}>
                <strong>
                  {item.student.first_name} {item.student.last_name}
                </strong>
                <p>{item.student.national_id}</p>
              </div>
              <div className={styles.btnContainer}>
                <button className={styles.editBtn} onClick={() => editDiscount(item)}>
                  ویرایش <UilEdit />
                </button>
                {item.paid_amount_info.has_discount ? (
                  <button className={styles.deleteBtn} onClick={() => deleteDiscount(item)}>
                    حذف تخفیف
                  </button>
                ): ''}
              </div>
            </div>
            <div className={styles.cardInfo}>
              <ul>
                <li>
                  <strong>تاریخ سررسید</strong>
                  <p>{toPersianDigits(item.custom_due_day)} هر ماه</p>
                </li>
                <li>
                  <strong>مبلغ پرداختی</strong>
                  <p>{toPersianDigits(item.paid_amount_info.final_price)} تومان </p>
                </li>
                <li>
                  <strong>تخفیف</strong>
                  <p>
                    {item.paid_amount_info.has_discount === false ? (
                      <UilTimes />
                    ) : (
                      <UilCheck />
                    )}
                  </p>
                </li>
                <li>
                  <strong>علت تخفیف</strong>
                  <p>
                    {item.paid_amount_info.has_discount === false ? (
                      '-'
                    ) : (
                      item.paid_amount_info.reason ? item.paid_amount_info.reason : 'بدون توضیح'
                    )}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        ))
      ) : (
        <p>هیچ دیتایی پیدا نشد!</p>
      )}
    </div>
  )
}

export default DiscountCard