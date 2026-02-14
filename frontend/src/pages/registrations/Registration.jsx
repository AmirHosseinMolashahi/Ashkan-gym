import React from 'react'
import style from './Registration.module.scss';
import LoginForm from '../../components/registration/LoginForm/LoginForm';
import LoginPic from '../../assets/registration/LoginPic.jpg'

const Registration = () => {
  return (
    <div className={style.container}>
      <dic className={style.wrapper}>
        <div className={style.right}>
          <LoginForm />
        </div>
        <div className={style.left}>
          <img src={LoginPic} alt="" />
        </div>
      </dic>
    </div>
  )
}

export default Registration