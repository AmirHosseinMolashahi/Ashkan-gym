import React from 'react'
import style from './RegisterForm.module.scss';
import { Link } from 'react-router-dom';

const RegisterForm = () => {
  return (
    <div className={style.container}>
      <div className={style.wrapper}>
        <h1>فرم ثبت نام</h1>
        <span>به صفحه ثبت نام خوش آمدید</span>
        <form action="" className={style.formContainer}>
          <div className={style.inputWrapper}>
            <label>کدملی</label>
            <input
                className={style.email}
                type="text"
                placeholder="کد ملی"
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
                required
            />
            </div>
            <div className={style.inputWrapper}>
            <label>نام خانوادگی</label>
            <input
                className={style.lastname}
                type="text"
                placeholder="نام خانوادگی"
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
                required
            />
          </div>
          <div className={style.doubleInput}>
            <div className={style.inputWrapper}>
              <label>رمز عبور</label>
              <input
                  className={style.password}
                  type="password"
                  placeholder="رمز عبور"
                  required
              />
            </div>
            <div className={style.inputWrapper}>
              <label>تایید رمز عبور</label>
              <input
                  className={style.password}
                  type="password"
                  placeholder="رمز عبور"
                  required
              />
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