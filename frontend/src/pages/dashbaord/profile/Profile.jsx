import React, { useState, useEffect } from 'react';
import api from '../../../hooks/api';
import styles from './Profile.module.scss';
import { useNotification } from '../../../context/notificationContext';
import { useAuth } from '../../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../../utils/cropImage'; // تابع کمکی برای برش
import { UilCameraPlus, UilSignInAlt, UilChatBubbleUser, UilLockAlt   } from '@iconscout/react-unicons'
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian"
import persian_en from "react-date-object/locales/persian_fa"
import toPersianDigits from '../../../hooks/convertNumber';
import roleConverter from '../../../hooks/roleConverter';


const EditProfile = () => {
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
    role: '',
    previous_login_jalali: '',
  });
  const { notify } = useNotification()
  const { updateUser, user } = useAuth();
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null); // برای نمایش
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('account/user');
        setFormData(res.data);
      } catch (err) {
        setMessage('خطا در دریافت اطلاعات کاربر');
      }
    };
    fetchProfile();
  }, []);

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
    form.append('national_id', formData.username);
    form.append('father_name', formData.father_name);
    form.append('first_name', formData.first_name);
    form.append('last_name', formData.last_name);
    form.append('email', formData.email);
    form.append('phone_number', formData.phone_number);
    form.append('address', formData.address);
    form.append('birthdate', formData.birthdate_jalali);
    form.append('role', formData.role);

    if (profileImage) {
      form.append('profile_picture', profileImage,'profile.jpg');
    }

    try {
      console.log(formData)
      await api.put('account/update/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      notify('اطلاعات با موفقیت ذخیره شد 🙌', 'success');
      updateUser();
      setSaved(true)
      setTimeout(() => setSaved(false), 2000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      notify('خطا در ذخیره اطلاعات!', 'error');
    }
  };

  return (
    
    <div className={styles.profile}>
      <div className={styles.container}>
        <h2>ویرایش اطلاعات شخصی</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* <div className={styles.profileContainer}>
            <label>تصویر پروفایل</label>
            <input type="file" accept="image/*" onChange={handleChange} />
              {profileImage ? (
                <img
                  src={URL.createObjectURL(profileImage)}
                  alt="Profile Preview"
                  width={100}
                  style={{ borderRadius: '50%', marginTop: 10 }}
                />
              )
              : (
                <img
                  src={formData.profile_picture}
                  alt="Profile Preview"
                  width={100}
                  📷
                  style={{ borderRadius: '50%', marginTop: 10 }}/>
              )}
          </div> */}
          <div className={styles.profileContainer}>
            <div className={styles.centerWrapper}>
              <div className={styles.profileImageWrapper}>
                <img
                  src={profileImage ? URL.createObjectURL(profileImage) : formData.profile_picture}
                  alt="Profile Preview"
                  className={styles.profileImage}
                />
                <label htmlFor="profile-upload" className={styles.uploadIcon}>
                  <UilCameraPlus color='#333' size='1.2rem'/>
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className={styles.hiddenInput}
                />
              </div>
            </div>
          </div>
          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <label>کدملی</label>
              <input name="national_id" className={styles.formInput} value={formData.national_id} onChange={handleChange} placeholder="کد ملی" readOnly/>
            </div>

            <div className={styles.inputWrapper}>
              <label>نام پدر</label>
              <input name="father_name" className={styles.formInput} value={formData.father_name} onChange={handleChange} placeholder="نام پدر" readOnly/>
            </div>
          </div>
          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <label>نام</label>
              <input name="first_name" className={styles.formInput} value={formData.first_name} onChange={handleChange} placeholder="نام" required/>
            </div>

            <div className={styles.inputWrapper}>
              <label>نام خانوادگی</label>
              <input name="last_name" className={styles.formInput} value={formData.last_name} onChange={handleChange} placeholder="نام خانوادگی" required/>
            </div>
          </div>
          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <label>ایمیل</label>
              <input type="email" name="email" className={styles.formInput} value={formData.email} onChange={handleChange} placeholder="ایمیل" required/>
            </div>

            <div className={styles.inputWrapper}>
              <label>شماره تماس</label>
              <input name="phone_number" className={styles.formInput} value={formData.phone_number} onChange={handleChange} placeholder="شماره تماس" required/>
            </div>
          </div>
          <div className={styles.inputContainer} >
            <div className={styles.inputWrapper}>
              <label>آدرس</label>
              <input name="address" className={styles.formInput} value={formData.address} onChange={handleChange} placeholder="آدرس" required/>
            </div>

            <div className={styles.inputWrapper}>
              <label>تاریخ تولد</label>
              {/* <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} placeholder="تاریخ تولد" required/> */}
              <DatePicker
                value={formData.birthdate_jalali}
                calendar={persian}
                locale={persian_en}
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
                  className={styles.formInput}
                  readOnly
                />
              )}
              />
            </div>
          </div>
          <button type="submit" className={styles.submit}>
            {saved ? "✅ ذخیره شد" : "ذخیره"}
          </button>
        </form>
      </div>
      {cropModalOpen && (
        <div className={styles.modal}>
          <div className={styles.cropContainer}>
            <div className={styles.cropArea}>
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
            <div className={styles.cropButtons}>
              <button onClick={handleCropSave}>ذخیره</button>
              <button className={styles.cancel} onClick={() => setCropModalOpen(false)}>لغو</button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.secondInfo}>
        <div className={styles.InfoItem}>
          <div className={styles.header}>
            <div>نقش</div>
            <div><UilChatBubbleUser  /></div>
          </div>
          <div className={styles.content}>
            {roleConverter(formData.role)}
          </div>
        </div>
        <div className={styles.InfoItem}>
          <div className={styles.header}>
            <div>آخرین ورود</div>
            <div><UilSignInAlt  /></div>
          </div>
          <div className={styles.content}>
            {toPersianDigits(formData.previous_login_jalali)}
          </div>
        </div>
        <div className={styles.InfoItem}>
          <div className={styles.header}>
            <div>تغییر رمز</div>
            <div><UilLockAlt /></div>
          </div>
          <div className={styles.content}>
            <button>تغییر رمز عبور</button>
          </div>
        </div>
      </div>
    </div>

  );
};

export default EditProfile;
