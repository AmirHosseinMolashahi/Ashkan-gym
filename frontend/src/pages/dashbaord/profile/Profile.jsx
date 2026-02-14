import React, { useState, useEffect } from 'react';
import styles from './Profile.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../../utils/cropImage'; // تابع کمکی برای برش
import { UilCameraPlus, UilSignInAlt, UilChatBubbleUser, UilLockAlt, UilEdit, UilUserPlus, UilCheckCircle, UilCheck  } from '@iconscout/react-unicons'
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian"
import persian_en from "react-date-object/locales/persian_fa"
import toPersianDigits from '../../../hooks/convertNumber';
import roleConverter from '../../../hooks/roleConverter';
import { useToast } from '../../../context/NotificationContext';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser, updateUser } from '../../../store/userSlice';
import api from '../../../hooks/api';
import { useLoading } from '../../../context/LoadingContext';

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
    gender_title: '',
    gender: '',
  });
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  const { notify } = useToast();
  const { showLoading, hideLoading } = useLoading()
  const navigate = useNavigate();
  
  const [profileImage, setProfileImage] = useState(null); // برای نمایش
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  //دیتایی که از بک اند گرفته شده
  const [userCourse, setUserCourse] = useState(null)
  const [studentCount, setStudentCount] = useState(null)

  // state های مورد نیاز
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);


  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    try {
      const croppedFile = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setProfileImage(croppedFile); // اکنون File هست
      setIsEditingAvatar(true)
      setCropModalOpen(false);
    } catch (e) {
      console.error("خطا در کراپ تصویر:", e);
    }
  };

  const fetchUserCourse = async () => {
    try {
      const res = await api.get('/training/courses/count/');
      setUserCourse(res.data.courses)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchStudentCount = async () => {
    try {
      const res = await api.get('/training/courses/students/count/');
      setStudentCount(res.data.students)
      console.log(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (!user) {
      dispatch(fetchUser());
    }
  }, [dispatch, user]);

  // 2. پر کردن فرم
  useEffect(() => {
    if (user) {
      setFormData(user);
    }
    fetchUserCourse();
    fetchStudentCount();
  }, [user]);



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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const form = new FormData();
  //   form.append('national_id', formData.username);
  //   form.append('father_name', formData.father_name);
  //   form.append('first_name', formData.first_name);
  //   form.append('last_name', formData.last_name);
  //   form.append('email', formData.email);
  //   form.append('birthdate', formData.birthdate_jalali);
  //   form.append('phone_number', formData.phone_number);
  //   form.append('address', formData.address);
  //   form.append('role', formData.role);

  //   if (profileImage) {
  //     form.append('profile_picture', profileImage,'profile.jpg');
  //   }

  //   try {
  //     await dispatch(updateUser(form)).unwrap()
  //     await dispatch(fetchUser()).unwrap();
  //     notify('اطلاعات با موفقیت ذخیره شد 🙌', 'success');
  //     window.scrollTo({ top: 0, behavior: 'smooth' });
  //   } catch (err) {
  //     notify('خطا در ذخیره اطلاعات!', 'error');
  //   }
  // };

  const handleSavePersonal = async () => {
    showLoading()

    const form = new FormData();
    form.append('father_name', formData.father_name);
    form.append('first_name', formData.first_name);
    form.append('last_name', formData.last_name);
    form.append('birthdate', formData.birthdate_jalali);
    form.append('gender', formData.gender);

    try {
      await dispatch(updateUser(form)).unwrap()
      await dispatch(fetchUser()).unwrap();
      notify('اطلاعات با موفقیت ذخیره شد 🙌', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsEditingPersonal(false);
    } catch (err) {
      notify('خطا در ذخیره اطلاعات ❌', 'error');
    } finally {
      hideLoading()
    }
  };

  const handleSaveContact = async () => {
    showLoading()

    const form = new FormData();
    form.append('phone_number', formData.phone_number);
    form.append('email', formData.email);
    form.append('address', formData.address);

    try {
      await dispatch(updateUser(form)).unwrap()
      await dispatch(fetchUser()).unwrap();
      notify('اطلاعات با موفقیت ذخیره شد 🙌', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsEditingPersonal(false);
    } catch (err) {
      notify('خطا در ذخیره اطلاعات ❌', 'error');
    } finally {
      hideLoading()
    }
  };

  const handleSaveAvatar = async () => {
    if (!profileImage) {
      notify('عکس وارد نشد', 'error')
      return null
    }
    const form = new FormData();
    form.append('profile_picture', profileImage,'profile.jpg');

    showLoading();
    try {
      await dispatch(updateUser(form)).unwrap()
      await dispatch(fetchUser()).unwrap();
      notify('عکس پروفایل با موفقیت ذخیره شد ✅', 'success');
      setProfileImage(null);
      setIsEditingAvatar(false)
    } catch (err) {
      notify('خطا در آپلود تصویر ❌', 'error');
    } finally {
      hideLoading()
    }
  };


  return (
    
    <div className={styles.profile}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.avatarInfo}>
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
                {profileImage && isEditingAvatar && (
                  <button className={styles.checkUpload} onClick={() => handleSaveAvatar()}>
                    <UilCheck  color='#333' size='1.5em' />
                  </button>
                )}
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className={styles.hiddenInput}
                />
              </div>
            </div>
            <div className={styles.info}>
              <h1>{user.full_name}</h1>
              <p>{roleConverter(user.role)}</p>
              <p>آخرین ورود: {toPersianDigits(formData.previous_login_jalali)}</p>
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.rightContent}>
              {/* <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.profileContainer}>
                  
                </div>
                <div className={styles.inputContainer}>
                  
                  <div className={styles.inputWrapper}>
                    <label>کدملی</label>
                    <input name="national_id" className={styles.formInput} value={formData.national_id} onChange={handleChange} placeholder="کد ملی" readOnly/>
                  </div>

                  <div className={styles.inputWrapper}>
                    <label>نام پدر</label>
                    <input name="father_name" className={styles.formInput} value={formData.father_name} onChange={handleChange} placeholder="نام پدر"/>
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
                    {/* <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} placeholder="تاریخ تولد" required/>
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
              </form> */}
              <div className={styles.personalInfo}>
                <div className={styles.infoHeader}>
                  <h3>اطلاعات شخصی</h3>
                  <button onClick={() => {
                    if (isEditingPersonal) {
                      handleSavePersonal()
                      console.log('nigga')
                    }
                    setIsEditingPersonal(!isEditingPersonal);
                  }}> 
                  {isEditingPersonal ? 'ذخیره' : 'ویرایش'}
                  {isEditingPersonal ? <UilCheck /> : <UilEdit />}
                  </button>
                </div>
                <div className={styles.infoContent}>
                  <ul>
                    <li>
                      <p>کد ملی</p>
                      <p>{formData.national_id}</p>
                    </li>
                    <li>
                      <p>نام پدر</p>
                      {isEditingPersonal ? (
                        <input
                          name="father_name"
                          value={formData.father_name}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <p>{formData.father_name}</p>
                      )}
                    </li>
                    <li>
                      <p>نام</p>
                      {isEditingPersonal ? (
                        <input
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <p>{formData.first_name}</p>
                      )}
                    </li>
                    <li>
                      <p>نام خانوادگی</p>
                      {isEditingPersonal ? (
                        <input
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <p>{formData.last_name}</p>
                      )}
                    </li>
                    <li>
                      <p>جنسیت</p>
                      {isEditingPersonal ? (
                        <select name="gender" id="" className={styles.formInput} value={formData.gender} onChange={handleChange}>
                          <option value="m">آقا</option>
                          <option value="f">خانم</option>
                        </select>
                      ) : (
                        <p>{formData.gender === 'm' ? 'آقا' : 'خانم'}</p>
                      )}
                    </li>
                    <li>
                      <p>تاریخ تولد</p>
                      {isEditingPersonal ? (
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
                      ) : (
                        <p>{toPersianDigits(formData.birthdate_jalali)}</p>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
              <div className={styles.personalInfo}>
                <div className={styles.infoHeader}>
                  <h3>آدرس و اطلاعات تماس</h3>
                  <button onClick={() => {
                    if (isEditingContact) {
                      handleSaveContact()
                    }
                    setIsEditingContact(!isEditingContact);
                  }}> 
                  {isEditingContact ? 'ذخیره' : 'ویرایش'}
                  {isEditingContact ? <UilCheck /> : <UilEdit />}
                  </button>
                </div>
                <div className={styles.infoContent}>
                  <ul>
                    <li>
                      <p>تلفن</p>
                      {isEditingContact ? (
                        <input
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <p>{formData.phone_number}</p>
                      )}
                    </li>
                    <li>
                      <p>ایمیل</p>
                      {isEditingContact ? (
                        <input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <p>{formData.email}</p>
                      )}
                    </li>
                    <li>
                      <p>آدرس</p>
                      {isEditingContact ? (
                        <input
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <p>{formData.address}</p>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
              <div className={styles.changePassword}>
                <div className={styles.infoHeader}>
                  <h3>تغییر رمز عبور <UilLockAlt /></h3>
                </div>
                <div className={styles.infoContent}>
                  <div className={styles.inputWrapper}>
                    <label>رمز عبور فعلی</label>
                    <input type="password" />
                  </div>
                  <div className={styles.inputWrapper}>
                    <label>رمز عبور جدید</label>
                    <input type="password" />
                  </div>
                  <div className={styles.inputWrapper}>
                    <label>تایید رمز عبور جدید</label>
                    <input type="password" />
                  </div>
                  <button>تغییر رمز عبور</button>
                </div>
              </div>
            </div>
            <div className={styles.leftContent}>
              <div className={styles.profileInfo}>
                <div className={styles.header}>
                  <h3>وضعیت شما</h3>
                </div>
                <div className={styles.profileInfoContent}>
                  <ul className={styles.userStatus}>
                    <li>
                      <p>تاریخ ثبت نام</p>
                      <p>{user.joined_at}</p>
                    </li>
                    <li>
                      {user.role === 'manager' ? (
                        <>
                          <p>کلاس ها</p>
                          <p>{userCourse ? userCourse : 'کلاسی موجود نیست'}</p>
                        </>
                      ) : (
                        <>
                          <p>کلاس های شما</p>
                          <p>{userCourse ? userCourse : 'در حال حاضر کلاسی ندارید'}</p>
                        </>
                      )}
                    </li>
                    {user.role !== 'athlete' && (
                      <li>
                        {user.role === 'manager' ? (
                          <>
                            <p>تعداد ورزشکاران</p>
                            <p>{studentCount ? studentCount : 'X'}</p>
                          </>
                        ) : (
                          <>
                            <p>تعداد ورزشکاران شما</p>
                            <p>{studentCount ? studentCount : 'X'}</p>
                          </>
                        )}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              <div className={styles.profileInfo}>
                <div className={styles.header}>
                  <h3>فعالیت های اخیر شما</h3>
                </div>
                <div className={styles.profileInfoContent}>
                  <ul className={styles.recentActivity}>
                    <li>
                      <div className={styles.activityIcon} style={{backgroundColor: '#e9f0ff'}}>
                        <UilCheckCircle fill='#2f6bff' />
                      </div>
                      <div className={styles.activityInfo}>
                        <p>تایید حضور غیاب کلاس</p>
                        <p>2 ساعت قبل</p>
                      </div>
                    </li>
                    <li>
                      <div className={styles.activityIcon} style={{backgroundColor: '#e9ffeb'}}>
                        <UilEdit fill='#39ff2f'/>
                      </div>
                      <div className={styles.activityInfo}>
                        <p>تغییر ساعت کلاس</p>
                        <p>3 ساعت قبل</p>
                      </div>
                    </li>
                    <li>
                      <div className={styles.activityIcon} style={{backgroundColor: '#ffe9fe'}}>
                        <UilUserPlus fill='#ff2fee' />
                      </div>
                      <div className={styles.activityInfo}>
                        <p>ثبت نام ورزشکار جدید</p>
                        <p>4 ساعت قبل</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className={styles.profileInfo}>
                <div className={styles.header}>
                  <h3>تنظیمات حساب کاربری شما</h3>
                </div>
                <div className={styles.profileInfoContent}>
                  <ul className={styles.userStatus}>
                    <li>
                      <div>دریافت ایمیل</div>
                      <div>
                        <input
                          type="checkbox"
                          name="finished"
                          className={styles.ikxBAC} />
                      </div>
                    </li>
                    <li>
                      <div>دریافت پیامک</div>
                      <div>
                        <input
                          type="checkbox"
                          name="finished"
                          className={styles.ikxBAC}/>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    </div>

  );
};

export default EditProfile;
