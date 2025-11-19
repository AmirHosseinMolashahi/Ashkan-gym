import React from 'react'
import style from './Registration.module.scss';
import LoginForm from '../../components/registration/LoginForm/LoginForm';
import RegisterForm from '../../components/registration/RegisterForm/RegisterForm';
import { useParams } from 'react-router-dom';

const Registration = () => {
  const { type } = useParams()
  return (
    <div className={style.container}>
      <div className={style.right}>
        {type === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
      <div className={style.left}>
        left
      </div>
    </div>
  )
}

export default Registration