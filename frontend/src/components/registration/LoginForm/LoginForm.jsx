import React, { useState } from 'react';
import style from './LoginForm.module.scss';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate  } from 'react-router-dom';
import { useNotification } from '../../../context/notificationContext';
import { useLoading } from '../../../context/LoadingContext';
import { UilEye, UilEyeSlash  } from '@iconscout/react-unicons';


const LoginForm = () => {
  
  const [national_id, setNational_id] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const {showLoading, hideLoading} = useLoading();

  const [errors, setErrors] = useState({
    national_id: "",
    password: "",
    general: "",
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoading()
    try {
      await login(national_id, password);
      navigate('/dashboard')
      notify('با موفقیت وارد شدید!', 'success');
    } catch (error){
      notify(error.response.data.error, 'error');
      const msg = error.response?.data?.error || "خطا";
      console.log(msg)

      if (msg.includes("کد ملی")) {
        setErrors({ national_id: msg, password: "", general: "" });
      } else if (msg.includes("رمز عبور")) {
        setErrors({ password: msg, national_id: "", general: "" });
      } else {
        setErrors({ general: msg, national_id: "", password: "" });
      }
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
              className={`${style.input} ${errors.national_id ? style.inputError : "" }`}
              type="text"
              placeholder="کد ملی"
              value={national_id}
              onChange={(e) => setNational_id(e.target.value)}
              required
            />
            {errors.national_id && (
              <span className={style.errorText}>{errors.national_id}</span>
            )}
          </div>
          <div className={style.inputWrapper}>
            <label>رمز ورود</label>
            <div className={style.passwordWrapper}>
              <input
                className={`${style.passwordinput} ${errors.password ? style.inputError : "" }`}
                type={showPassword ? "text" : "password"}
                placeholder="رمز ورود"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className={style.togglePassword} onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? <UilEye /> : <UilEyeSlash /> }
              </span>
            </div>
            {errors.password && (
              <span className={style.errorText}>{errors.password}</span>
            )}
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