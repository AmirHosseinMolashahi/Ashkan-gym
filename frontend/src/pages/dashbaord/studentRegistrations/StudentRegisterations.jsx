import React from 'react'
import style from './StudentRegisterations.module.scss';
import MultiStepForm from '../../../components/registration/multiStepForm/MultiStepForm';

const StudentRegisterations = () => {
  return (
    <div className={style.studentRegister}>
      <div className={style.wrapper}>
        <h1>ثبت نام ورزشکار</h1>
        <MultiStepForm />
      </div>
    </div>
  )
}

export default StudentRegisterations