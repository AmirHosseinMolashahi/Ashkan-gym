import React, { useState } from 'react'
import style from './RegisterForm.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import {useAuth} from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../hooks/api';
import { useLoading } from '../../../context/LoadingContext';
import { UilEye, UilEyeSlash  } from '@iconscout/react-unicons';

const RegisterForm = () => {
  const navigate = useNavigate()
  const { login, loading } = useAuth();
  const { notify } = useNotification();
  const {showLoading, hideLoading} = useLoading();
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    national_id : '',
    first_name : '',
    last_name : '',
    phone_number : '',
    password : '',
    confirm_password : '',
  }) 

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    showLoading();
    try {
      console.log(formData)
      // 1. ثبت‌نام
      await api.post('/account/register/', formData);
      // 2. ورود خودکار با استفاده از login داخل context
      await login(formData.national_id, formData.password);
      navigate('/dashboard/profile');
      notify('ثبت نام اولیه با موفقیت انجام شد!', 'success');
      notify('لطفا اطلاعات خود را تکمیل کنید!', 'info', 4000)
    } catch (err) {
      notify('لطفا دوباره تلاش کنین!', 'error');
    } finally {
      hideLoading();
    }
  };

  return (
    <div className={style.container}>
      <div className={style.wrapper}>
        <h1>فرم ثبت نام</h1>
        <span>به صفحه ثبت نام خوش آمدید</span>
        <form action="" className={style.formContainer} onSubmit={handleRegister}>
          <div className={style.inputWrapper}>
            <label>کدملی</label>
            <input
                className={style.email}
                type="text"
                placeholder="کد ملی"
                name='national_id'
                value={formData.national_id}
                onChange={handleChange}
                required
            />
          </div>
          <div className={style.doubleInput}>
            <div className={style.inputWrapper}>
            <label>نام</label>
            <input
                className={style.name}
                type="text"
                placeholder="نام"
                name='first_name'
                value={formData.first_name}
                onChange={handleChange}
                required
            />
            </div>
            <div className={style.inputWrapper}>
            <label>نام خانوادگی</label>
            <input
                className={style.lastname}
                type="text"
                placeholder="نام خانوادگی"
                name='last_name'
                value={formData.last_name}
                onChange={handleChange}
                required
            />
            </div>
          </div>
          <div className={style.inputWrapper}>
            <label>موبایل</label>
            <input
                className={style.email}
                type="text"
                placeholder="موبایل"
                name='phone_number'
                value={formData.phone_number}
                onChange={handleChange}
                required
            />
          </div>
          <div className={style.doubleInput}>
            <div className={style.inputWrapper}>
              <label>رمز عبور</label>
              <div className={style.passwordWrapper}>
              <input
                  className={style.password}
                  type={showPassword ? "text" : "password"}
                  placeholder="رمز عبور"
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  required
              />
              <span className={style.togglePassword} onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? <UilEye /> : <UilEyeSlash /> }
              </span>
              </div>
            </div>
            <div className={style.inputWrapper}>
              <label>تایید رمز عبور</label>
              <div className={style.passwordWrapper}>
              <input
                  className={style.password}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="رمز عبور"
                  name='confirm_password'
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
              />
              <span className={style.togglePassword} onClick={() => setShowConfirmPassword((prev) => !prev)}>
                {showConfirmPassword ? <UilEye /> : <UilEyeSlash /> }
              </span>
              </div>
            </div>
          </div>
          <button type="submit" className={style.submitBtn}>
          ثبت نام
          </button>
        </form>
        <div className={style.registerLink}>
            <p>حساب کاربری دارید؟ <Link to="/registration/login">ورود</Link></p>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm