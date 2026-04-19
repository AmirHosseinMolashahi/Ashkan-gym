import React, { useState, useEffect } from 'react';
import styles from './Profile.module.scss';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../../utils/cropImage'; // تابع کمکی برای برش
import { UilCameraPlus, UilLockAlt, UilEdit, UilCheckCircle, UilCheck, UilEye, UilFile } from '@iconscout/react-unicons'
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian"
import persian_en from "react-date-object/locales/persian_fa"
import toPersianDigits from '../../../hooks/convertNumber';
import roleConverter, { hasRole } from '../../../hooks/roleConverter';
import { useToast } from '../../../context/NotificationContext';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser, updateUser } from '../../../store/userSlice';
import api from '../../../hooks/api';
import { useLoading } from '../../../context/LoadingContext';
import FileModal from '../../../components/GlobalComponents/FileModal/FileModal';
import Modal from '../../../components/GlobalComponents/Modal/Modal';

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


  const DOC_TYPES = {
    id_card: "شناسنامه" ,
    register_form: "فرم ثبت نام" ,
    insurance_card: "بیمه ورزشی" ,
    other: "سایر" ,
  };


  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  const { notify } = useToast();
  const { showLoading, hideLoading } = useLoading()
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);


  // helper ساده برای زمان نسبی
  const timeAgoFa = (dateStr) => {
    if (!dateStr) return '';
    const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diffSec < 60) return `${toPersianDigits(diffSec)} ثانیه قبل`;
    const min = Math.floor(diffSec / 60);
    if (min < 60) return `${toPersianDigits(min)} دقیقه قبل`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${toPersianDigits(hour)} ساعت قبل`;
    const day = Math.floor(hour / 24);
    return `${toPersianDigits(day)} روز قبل`;
  };
  
  const [profileImage, setProfileImage] = useState(null); // برای نمایش
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  //دیتایی که از بک اند گرفته شده
  const [userCourse, setUserCourse] = useState(null)
  const [studentCount, setStudentCount] = useState(null)
  const [userDocs, setUserDocs] = useState([])

  // state های مورد نیاز
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  const [previewDocModal, setPreviewDocModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);


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

  const fetchUserDocs = async () => {
    try {
      const res = await api.get('/registration/documents/list/');
      setUserDocs(res.data || []);
    } catch (err) {
      console.log(err);
      notify('خطا در دریافت مدارک ❌', 'error');
      setUserDocs([]);
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

  // 3) گرفتن activity ها
  const fetchRecentActivities = async () => {
    setActivityLoading(true);
    try {
      const res = await api.get('/activity/recent/?limit=6');
      setActivities(res.data || []);
    } catch (err) {
      console.log(err);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      dispatch(fetchUser());
    }
  }, [dispatch, user]);

  // 2. پر کردن فرم
  useEffect(() => {
    if (user) {
      setFormData(user);
      fetchRecentActivities();
    }
    fetchUserCourse();
    fetchStudentCount();
    fetchUserDocs();
  }, [user]);

  const handlePreviewDocModal = (doc) => {
    if (!previewDocModal) {
      setSelectedDoc(doc);
      setPreviewDocModal(true);
    } else {
      setSelectedDoc(null);
      setPreviewDocModal(false);
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
      setIsEditingContact(false);
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
              <h1>{user?.full_name}</h1>
              <p>{roleConverter(user?.roles)}</p>
              <p>آخرین ورود: {toPersianDigits(formData.previous_login_jalali)}</p>
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.rightContent}>
              <div className={styles.personalInfo}>
                <div className={styles.infoHeader}>
                  <h3>اطلاعات شخصی</h3>
                  <button onClick={() => {
                    if (isEditingPersonal) {
                      handleSavePersonal()
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
                      <p>{user?.joined_at}</p>
                    </li>
                    <li>
                      {hasRole(user?.roles, 'manager') ? (
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
                    {!hasRole(user?.roles, 'athlete') && (
                      <li>
                        {hasRole(user?.roles, 'manager') ? (
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
                  <h3>مدارک شما</h3>
                </div>
                <div className={styles.profileInfoContent}>
                  {userDocs.length === 0 ? (
                    <p>هنوز مدرکی آپلود نشده است.</p>
                  ) : (
                    <ul className={styles.docList}>
                      {userDocs.map((doc) => (
                        <li key={doc.id} className={styles.docItem}>
                          <div className={styles.docInfo}>
                            <UilFile color='#333' size='1.5rem'/>
                            <strong>{DOC_TYPES[doc.doc_type] || 'در حال بارگذاری...'}</strong>
                          </div>
                          {doc.document ? (
                          <div className={styles.docActions}>
                            <UilEye color='#333' size='1.3rem' onClick={() => handlePreviewDocModal(doc)}/>
                          </div>
                          ) : (
                            ""
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className={styles.profileInfo}>
                <div className={styles.header}>
                  <h3>فعالیت های اخیر شما</h3>
                </div>
                <div className={styles.profileInfoContent}>
                  <ul className={styles.recentActivity}>
                    {activityLoading && <li>در حال دریافت فعالیت‌ها...</li>}

                    {!activityLoading && activities.length === 0 && (
                      <li>فعلاً فعالیتی ثبت نشده است.</li>
                    )}

                    {!activityLoading &&
                      activities.map((item) => (
                        <li key={item?.id}>
                          <div
                            className={styles.activityIcon}
                            style={{ backgroundColor: '#e9f0ff' }}
                          >
                            <UilCheckCircle fill="#2f6bff" />
                          </div>
                          <div className={styles.activityInfo}>
                            <p>{item?.description || item?.verb}</p>
                            <p>{timeAgoFa(item?.created_at)}</p>
                          </div>
                        </li>
                      ))}
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
      {previewDocModal && (
        <Modal handleModal={() => handlePreviewDocModal(null)} width="500px" height="600px">
          <FileModal fileUrl={selectedDoc?.document} />
        </Modal>
      )}
    </div>

  );
};

export default EditProfile;
