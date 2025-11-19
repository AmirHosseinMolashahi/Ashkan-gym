import React, { useState } from 'react';
import style from './LoginForm.module.scss';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate  } from 'react-router-dom';
import { useNotification } from '../../../context/notificationContext';
import { useLoading } from '../../../context/LoadingContext';


const LoginForm = () => {
  
  const [national_id, setNational_id] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const {showLoading, hideLoading} = useLoading();


  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoading()
    try {
      await login(national_id, password);
      navigate('/dashboard')
      notify('با موفقیت وارد شدید!', 'success');
    } catch (err){
      console.log("error")
      notify('نام کاربری یا رمز عبور اشتباه است', 'error');
    } finally {
      hideLoading()
    }
  };

  return (
    <div className={style.container}>
      <div className={style.wrapper}>
        <h1>صفحه ورود</h1>
        <span>به صفحه ورود خوش آمدید</span>
        <form action="" onSubmit={handleSubmit} className={style.formContainer}>
          <div className={style.inputWrapper}>
            <label>کد ملی</label>
            <input
              className={style.email}
              type="text"
              placeholder="کد ملی"
              value={national_id}
              onChange={(e) => setNational_id(e.target.value)}
              required
            />
          </div>
          <div className={style.inputWrapper}>
            <label>رمز ورود</label>
            <input
              className={style.password}
              type="password"
              placeholder="رمز ورود"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <a className={style.forgetPass}>رمز عبور خود را فراموش کرده اید؟</a>
          <button type="submit" className={style.submitBtn}>
            <span>ورود</span>
          </button>
        </form>
        <div className={style.registerLink}>
          <p>حساب کاربری ندارید؟ <Link to="/registration/register">ثبت نام</Link></p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm