import style from './SecondStepInfo.module.scss';
import React, { useState, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../../utils/cropImage'; // تابع کمکی برای برش
import { UilCameraPlus, UilSignInAlt, UilChatBubbleUser, UilLockAlt   } from '@iconscout/react-unicons'
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian"
import persian_en from "react-date-object/locales/persian_fa"
import toPersianDigits from '../../../hooks/convertNumber';
import { useToast } from '../../../context/NotificationContext';
import api from '../../../hooks/api';

const SecondStepInfo = ({userId, onSuccess, setUserId}) => {
  const [formData, setFormData] = useState({
    national_id: '',
    father_name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    profile_picture: '',
    birthdate_jalali: '',
    gender: '',
    insurance: false,
    insurance_expiry_jalali: '',
  });
  const { notify } = useToast();
  const [profileImage, setProfileImage] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false)

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    try {
      const croppedFile = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setProfileImage(croppedFile); // اکنون File هست
      setCropModalOpen(false);
    } catch (e) {
      console.error("خطا در کراپ تصویر:", e);
    }
  };

  useEffect(() => {
    const fetchUserInfo = async (userId) => {
      try {
        const res = await api.get(`/account/register/complete-profile/${userId}/`);
        setFormData(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    fetchUserInfo(userId);
  },  [])



  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setImageToCrop(reader.result);
          setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('father_name', formData.father_name);
    form.append('first_name', formData.first_name);
    form.append('last_name', formData.last_name);
    form.append('email', formData.email);
    form.append('phone_number', formData.phone_number);
    form.append('address', formData.address);
    form.append('birthdate', formData.birthdate_jalali);
    form.append('gender', formData.gender);
    form.append('insurance', formData.insurance);
    if (formData.insurance_expiry_jalali) {
      form.append('insurance_expiry_date', formData.insurance_expiry_jalali);
    }

    if (profileImage) {
      form.append('profile_picture', profileImage,'profile.jpg');
    }

    try {
      const res = await api.put(`/account/register/complete-profile/${userId}/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log(res.data)
      setUserId(res.data.id)
      onSuccess();
      notify('اطلاعات با موفقیت ذخیره شد 🙌', 'success');
    } catch (err) {
      console.log(err)
      notify('خطا در ذخیره اطلاعات!', 'error');
    }
  };

  if (loading) return <p>در حال بارگزاری</p> 

  return (
    <div className={style.container}>
      <div className={style.wrapper}>
        <h1>اطلاعات تکمیلی</h1>
        <form onSubmit={handleSubmit} className={style.form}>
          <div className={style.inputContainer}>
            <div className={style.profileContainer}>
              <div className={style.centerWrapper}>
                <div className={style.profileImageWrapper}>
                  <img
                    src={profileImage ? URL.createObjectURL(profileImage) : formData.profile_picture}
                    alt="Profile Preview"
                    className={style.profileImage}
                  />
                  <label htmlFor="profile-upload" className={style.uploadIcon}>
                    <UilCameraPlus color='#333' size='1.2rem'/>
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className={style.hiddenInput}
                  />
                </div>
                {profileImage ? (
                  <h3>عکس پروفایل آپلود شد ✅</h3>
                ) : (
                  <h3>عکس پروفایل را آپلود کنید</h3>
                )}
              </div>
            </div>
          </div>
          <div className={style.inputContainer}>
            <div className={style.inputWrapper}>
              <label>کدملی</label>
              <input name="national_id" className={style.formInput} value={formData.national_id} onChange={handleChange} placeholder="کد ملی" readOnly/>
            </div>

            <div className={style.inputWrapper}>
              <label>شماره تماس</label>
              <input name="phone_number" className={style.formInput} value={formData.phone_number} onChange={handleChange} placeholder="شماره تماس" required/>
            </div>
            
          </div>
          <div className={style.inputContainer}>
            <div className={style.inputWrapper}>
              <label>نام</label>
              <input name="first_name" className={style.formInput} value={formData.first_name} onChange={handleChange} placeholder="نام" required/>
            </div>

            <div className={style.inputWrapper}>
              <label>نام خانوادگی</label>
              <input name="last_name" className={style.formInput} value={formData.last_name} onChange={handleChange} placeholder="نام خانوادگی" required/>
            </div>
          </div>
          <hr style={{marginTop: '1rem', marginBottom: '1rem'}} />
          <div className={style.inputContainer}>
            <div className={style.inputWrapper}>
              <label>نام پدر</label>
              <input name="father_name" className={style.formInput} value={formData.father_name} onChange={handleChange} placeholder="نام پدر" required/>
            </div>

            <div className={style.inputWrapper}>
              <label>ایمیل</label>
              <input type="email" name="email" className={style.formInput} value={formData.email} onChange={handleChange} placeholder="ایمیل" required/>
            </div>
          </div>
          <div className={style.inputContainer}>
            <div className={style.inputWrapper}>
              <label>جنسیت</label>
              <select name="gender" className={style.formInput} value={formData.gender} onChange={handleChange} required>
                <option value="">--------</option>
                <option value="m">آقا</option>
                <option value="f">خانم</option>
              </select>
            </div>
            <div className={style.inputWrapper}>
              <label>تاریخ تولد</label>
              {/* <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} placeholder="تاریخ تولد" required/> */}
              <DatePicker
                value={formData.birthdate_jalali}
                calendar={persian}
                locale={persian_en}
                calendarPosition = 'top-right'
                onChange={(date) => {
                  // const converter = (text) => text.replace(/[٠-٩۰-۹]/g,a=>a.charCodeAt(0)&15);
                  const miladi = date?.format("YYYY/MM/DD");  // ← این رشته میلادی
                  // console.log("miladi: ", miladi)
                  setFormData({ ...formData, birthdate_jalali: miladi });
                }}
                render={(value, openCalendar) => (
                <input
                  onFocus={openCalendar}
                  value={value}           // این فارسی نمایش می‌دهد
                  placeholder="تاریخ تولد"
                  className={style.formInput}
                  readOnly
                  required
                  style={{width: '95%'}}
                />
              )}
              />
            </div>
          </div>
          <div className={style.inputContainer}>
            <div className={style.inputWrapper}>
              <label>بیمه</label>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <p>آیا کاربر بیمه دارد؟</p>
                <input type="checkbox" name="insurance" checked={formData.insurance} onChange={(e) => setFormData({...formData, insurance: e.target.checked})} />
              </div>
            </div>
            <div className={style.inputWrapper}>
              <label>تاریخ پایان بیمه</label>
              <DatePicker
                value={formData.insurance_expiry_jalali}
                calendar={persian}
                locale={persian_en}
                calendarPosition = 'top-right'
                onChange={(date) => {
                  const miladi = date?.format("YYYY/MM/DD");
                  setFormData({ ...formData, insurance_expiry_jalali: miladi });
                }}
                render={(value, openCalendar) => (
                <input
                  onFocus={openCalendar}
                  value={value}
                  placeholder="تاریخ پایان بیمه"
                  className={style.formInput}
                  readOnly
                  style={{width: '95%'}}
                />
              )}
              />
            </div>
          </div>

          <div className={style.inputContainer}>
            <div className={style.inputWrapper}>
              <label>آدرس</label>
              <textarea name="address" className={style.formInput} value={formData.address} onChange={handleChange} placeholder="آدرس" required ></textarea>
            </div>
          </div>
          <button type="submit" className={style.submit}>
            ذخیره
          </button>
        </form>
      </div>
      {cropModalOpen && (
        <div className={style.modal}>
          <div className={style.cropContainer}>
            <div className={style.cropArea}>
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className={style.cropButtons}>
              <button onClick={handleCropSave}>ذخیره</button>
              <button className={style.cancel} onClick={() => setCropModalOpen(false)}>لغو</button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default SecondStepInfo;
