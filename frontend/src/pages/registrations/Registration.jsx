import React from 'react'
import style from './Registration.module.scss';
import LoginForm from '../../components/registration/LoginForm/LoginForm';
import RegisterForm from '../../components/registration/RegisterForm/RegisterForm';
import { useParams } from 'react-router-dom';
import LoginPic from '../../assets/registration/LoginPic.jpg'

const Registration = () => {
  const { type } = useParams()
  return (
    <div className={style.container}>
      <dic className={style.wrapper}>
        <div className={style.right}>
          {type === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
        <div className={style.left}>
          <img src={LoginPic} alt="" />
        </div>
      </dic>
    </div>
  )
}

export default Registration