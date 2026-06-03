import React from 'react'
import style from './StudentRegisterations.module.scss';
import MultiStepForm from '../../../components/registration/multiStepForm/MultiStepForm';
import BackButton from '../../../components/dashboards/backButton/BackButton';

const StudentRegisterations = () => {
  return (
    <div className={style.studentRegister}>
      <div className={style.wrapper}>
        <h1>ثبت نام ورزشکار</h1>
        <BackButton route='/dashboard/' title='بازگشت'/>
        <MultiStepForm />
      </div>
    </div>
  )
}

export default StudentRegisterations