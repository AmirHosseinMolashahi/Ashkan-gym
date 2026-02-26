import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UilArrowLeft, UilCameraPlus,UilCheck } from '@iconscout/react-unicons';
import styles from './ManagerEditUser.module.scss';
import api from '../../../../hooks/api';
import toPersianDigits from '../../../../hooks/convertNumber';
import roleConverter from '../../../../hooks/roleConverter';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian"
import persian_en from "react-date-object/locales/persian_fa"
import { useToast } from '../../../../context/NotificationContext';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../../../utils/cropImage'; // تابع کمکی برای برش

const INITIAL_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  father_name: '',
  birthdate: '',
  birthdate_jalali: '',
  address: '',
  gender: '',
  profile_picture: null,
  role: '',
  is_active: '',
};

const normalizeDigits = (value = '') =>
  String(value).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

const ManagerEditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();


  const [profileImage, setProfileImage] = useState(null); // برای نمایش
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [form, setForm] = useState(INITIAL_FORM);
  const [userData, setUserData] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const userFullName = useMemo(() => {
    if (!userData) return '-';
    return userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
  }, [userData]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/account/management-users/${id}/`);
      const data = res.data;
      console.log(data)

      setUserData(data);
      setPreview(data.profile_picture || '');

      setForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
        father_name: data.father_name || '',
        birthdate: data.birthdate || '',
        birthdate_jalali: data.birthdate_jalali || '',
        address: data.address || '',
        gender: data.gender || '',
        profile_picture: null,
        role: data.role,
        is_active: String(data.is_active ?? true), // "true" | "false"
      });
    } catch (err) {
      setError('اطلاعات کاربر دریافت نشد.');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const handlePasswordReset = () => {
    notify('لینک بازنشانی رمز عبور ارسال شد.', 'info');
  };

  const handleSuspendUser = () => {
    setForm((prev) => ({ ...prev, is_active: prev.is_active === 'true' ? 'false' : 'true' }));
    notify('وضعیت کاربر تغییر کرد. برای اعمال نهایی ذخیره کنید.', 'info');
  };

  const handleDeleteUser = async () => {
    const ok = window.confirm('از حذف دائمی این کاربر مطمئن هستید؟');
    if (!ok) return;

    try {
      await api.delete(`/account/management-users/${id}/`);
      notify('کاربر با موفقیت حذف شد.', 'success');
      navigate('/dashboard/user-management');
    } catch (err) {
      notify('حذف کاربر انجام نشد.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      const payload = new FormData();
      payload.append('first_name', form.first_name.trim());
      payload.append('last_name', form.last_name.trim());
      payload.append('email', form.email.trim());
      payload.append('phone_number', normalizeDigits(form.phone_number.trim()));
      payload.append('father_name', form.father_name.trim());
      payload.append('address', form.address.trim());
      payload.append('gender', form.gender);
      payload.append('birthdate', form.birthdate_jalali);
      payload.append('role', form.role);
      payload.append('is_active', form.is_active);


      if (profileImage) {
        payload.append('profile_picture', profileImage,'profile.jpg');
      }

      await api.patch(`/account/management-users/${id}/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      notify('اطلاعات با موفقیت ذخیره شد 🙌', 'success');
      navigate('/dashboard/user-management');
    } catch (err) {
      const backendError =
        err?.response?.data?.detail ||
        err?.response?.data?.birthdate?.[0] ||
        err?.response?.data?.phone_number?.[0];
      setError(backendError || 'ذخیره تغییرات با خطا مواجه شد.');
      notify('ذخیره تغییرات با خطا مواجه شد.', 'error');
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>در حال بارگذاری اطلاعات کاربر...</div>;
  }

  return (
    <div className={styles.editUser} dir="rtl">
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard/user-management')}>
          <UilArrowLeft />
          بازگشت به لیست کاربران
        </button>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={() => navigate('/dashboard/user-management')}>
            لغو
          </button>
          <button className={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </div>
      </div>

      <h2 className={styles.title}>ویرایش کاربر</h2>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.layout}>
        <form className={styles.main} onSubmit={handleSubmit}>
          <section className={styles.card}>
            <h3>اطلاعات فردی</h3>
            <p className={styles.cardDesc}>اطلاعات پایه کاربر را به‌روزرسانی کنید.</p>

            <div className={styles.gridTwo}>
              <div className={styles.inputGroup}>
                <label>نام</label>
                <input value={form.first_name} onChange={(e) => onChange('first_name', e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label>نام خانوادگی</label>
                <input value={form.last_name} onChange={(e) => onChange('last_name', e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label>ایمیل</label>
                <input value={form.email} onChange={(e) => onChange('email', e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label>شماره موبایل</label>
                <input value={form.phone_number} onChange={(e) => onChange('phone_number', e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label>نام پدر</label>
                <input value={form.father_name} onChange={(e) => onChange('father_name', e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label>تاریخ تولد (شمسی)</label>
                <DatePicker
                  value={form.birthdate_jalali}
                  calendar={persian}
                  locale={persian_en}
                  onChange={(date) => {
                    const miladi = date?.format("YYYY/MM/DD");  // ← این رشته میلادی
                    onChange('birthdate_jalali', miladi );
                  }}
                  render={(value, openCalendar) => (
                  <input
                    onFocus={openCalendar}
                    value={value}           // این فارسی نمایش می‌دهد
                    placeholder="تاریخ تولد"
                    readOnly
                  />
                )}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>جنسیت</label>
                <select value={form.gender} onChange={(e) => onChange('gender', e.target.value)}>
                  <option value="">انتخاب کنید</option>
                  <option value="m">آقا</option>
                  <option value="f">خانم</option>
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>آدرس</label>
              <textarea value={form.address} onChange={(e) => onChange('address', e.target.value)} rows={4} />
            </div>
          </section>

          <section className={styles.card}>
            <h3>وضعیت حساب و نقش</h3>
            <p className={styles.cardDesc}>سطح دسترسی و وضعیت فعلی حساب را مدیریت کنید.</p>

            <div className={styles.gridTwo}>
              <div className={styles.inputGroup}>
                <label>نقش سیستم</label>
                <select value={form.role} onChange={(e) => onChange('role', e.target.value)}>
                  <option value="athlete">ورزشکار</option>
                  <option value="coach">مربی</option>
                  <option value="manager">مدیر</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>وضعیت حساب</label>
                <select value={form.is_active} onChange={(e) => onChange('is_active', e.target.value)}>
                  <option value="true">فعال</option>
                  <option value="false">غیرفعال</option>
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>شناسه کاربر (غیرقابل تغییر)</label>
              <input value={`USR-${userData?.id || '-'}`} readOnly />
            </div>
          </section>
        </form>

        <aside className={styles.side}>
          <section className={styles.profileCard}>
            <div className={styles.avatarWrap}>
              <div className={styles.centerWrapper}>
                <div className={styles.profileImageWrapper}>
                  <img
                    src={profileImage ? URL.createObjectURL(profileImage) : userData?.profile_picture}
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
                    onChange={onImageChange}
                    className={styles.hiddenInput}
                  />
                </div>
              </div>
            </div>

            <h4>{userFullName}</h4>
            <p>{userData?.email || '-'}</p>

            <div className={styles.metaRow}>
              <span>نقش</span>
              <strong>{roleConverter(userData?.role)}</strong>
            </div>
            <div className={styles.metaRow}>
              <span>وضعیت</span>
              <strong>{userData?.is_active ? 'فعال' : 'غیرفعال'}</strong>
            </div>
            <div className={styles.metaRow}>
              <span>کد ملی</span>
              <strong>{toPersianDigits(userData?.national_id || '-')}</strong>
            </div>
            <div className={styles.metaRow}>
              <span>تاریخ عضویت</span>
              <strong>{toPersianDigits((userData?.joined_at || '').split(' ')[0] || '-')}</strong>
            </div>
          </section>

          <section className={styles.dangerCard}>
            <h3 className={styles.dangerTitle}>منطقه خطر</h3>

            <button className={styles.dangerAction} type="button" onClick={handlePasswordReset}>
              ارسال لینک بازنشانی رمز عبور
            </button>

            <button className={styles.dangerAction} type="button" onClick={handleSuspendUser}>
              {form.is_active === 'true' ? 'غیرفعال کردن حساب' : 'فعال کردن حساب'}
            </button>

            <button className={styles.deleteAction} type="button" onClick={handleDeleteUser}>
              حذف دائمی کاربر
            </button>
          </section>
        </aside>
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

export default ManagerEditUser;
