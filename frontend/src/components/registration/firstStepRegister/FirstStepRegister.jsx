import React, { useState } from 'react'
import style from './FirstStepRegister.module.scss';
import api from '../../../hooks/api';
import { useLoading } from '../../../context/LoadingContext';
import { UilEye, UilEyeSlash  } from '@iconscout/react-unicons';
import { useToast } from '../../../context/NotificationContext';

const FirstStepRegister = ({onSuccess, setUserId}) => {
  const { notify } = useToast();
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false);

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
    setLoading(true)
    try {
      const res = await api.post('/account/register/', formData);
      console.log(res.data)
      notify('ثبت نام اولیه با موفقیت انجام شد!', 'success');
      setUserId(res.data.id)
      onSuccess();
    } catch (err) {
      console.log(err)
      if (err.response.data.national_id) {
        notify(err.response.data.national_id, 'error');
      } else if (err.response.data.confirm_password) {
        notify(err.response.data.confirm_password, 'error');
      } 
      else {
        notify('خطا در ثبت اطلاعات', 'error')
      }
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className={style.container}>
      <div className={style.wrapper}>
        <h1>ثبت نام اولیه</h1>
        <form action="" className={style.formContainer} onSubmit={handleRegister}>
          <div className={style.inputWrapper}>
            <div className={style.inputContainer}>
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
          </div>
          <div className={style.inputWrapper}>
            <div className={style.inputContainer}>
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
            <div className={style.inputContainer}>
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
            <div className={style.inputContainer}>
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
          </div>
          <div className={style.inputWrapper}>
            <div className={style.inputContainer}>
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
            <div className={style.inputContainer}>
              <label>تایید رمز عبور</label>
              <div className={style.passwordWrapper}>
              <input
                  className={style.password}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="تایید رمز عبور"
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
          <button type="submit" className={style.submitBtn} disabled={loading}>
            {loading ? 'در حال ثبت...' : 'ثبت نام'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default FirstStepRegister;