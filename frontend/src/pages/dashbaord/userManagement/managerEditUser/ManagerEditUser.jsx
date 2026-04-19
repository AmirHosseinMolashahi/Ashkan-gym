import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UilArrowLeft, UilCameraPlus,UilCheck, UilFilePlus, UilFile, UilPen , UilTrash, UilEye } from '@iconscout/react-unicons';
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
import Modal from '../../../../components/GlobalComponents/Modal/Modal';
import FileUpload from '../../../../components/registration/FileUpload/FileUpload';
import FileModal from '../../../../components/GlobalComponents/FileModal/FileModal';

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
  roles: [],
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

  const [userDocs, setUserDocs] = useState([]);
  const [uploadDocsModal, setUploadDocsModal] = useState(false);
  const [deleteDocsModal, setDeleteDocsModal] = useState(false);
  const [previewDocModal, setPreviewDocModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const DOC_TYPES = {
    id_card: "شناسنامه" ,
    register_form: "فرم ثبت نام" ,
    insurance_card: "بیمه ورزشی" ,
    other: "سایر" ,
  };

  const handleUploadModal = () => {
    if (!uploadDocsModal) {
      if (userDocs.length >= 4) {
        notify('ظرفیت بارگذاری مدارک برای این کاربر پر میباشد!', 'info')
        return null
      }
      addDocument();
    }

    if (uploadDocsModal && userDocs.slice(-1)[0]['file'] === null ) {
      userDocs.pop()
    }

    setUploadDocsModal(!uploadDocsModal)
  }

  const addDocument = () => {
    console.log(userDocs)
    setUserDocs([...userDocs, { file: null, doc_type: "" }]);
  };

  const updateDocument = (index, value, type) => {
    const updated = [...userDocs];
    updated[index]['file']= value;
    updated[index]['doc_type']= type;
    setUserDocs(updated);
    handleUploadDocument(value, type);
  };

  const handleDeleteDocumentModal = (doc) => {
    if (!deleteDocsModal) {
      setSelectedDoc(doc);
      setDeleteDocsModal(!deleteDocsModal);
    } else {
      setSelectedDoc(null);
      setDeleteDocsModal(!deleteDocsModal);
    }
  };

  const handlePreviewDocModal = (doc) => {
    if (!previewDocModal) {
      setSelectedDoc(doc);
      setPreviewDocModal(true);
    } else {
      setSelectedDoc(null);
      setPreviewDocModal(false);
    }
  };


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
        roles: data.roles || [],
        is_active: String(data.is_active ?? true), // "true" | "false"
      });
    } catch (err) {
      setError('اطلاعات کاربر دریافت نشد.');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDocs = async () => {
    try {
      const res = await api.get(`/registration/${id}/manager/upload/`);
      setUserDocs(res.data);
      console.log('User documents:', res.data);
    } catch (err) {
      console.error('خطا در دریافت مدارک کاربر:', err);
      notify('خطا در دریافت مدارک کاربر.', 'danger');      
    }
  };


  useEffect(() => {
    fetchUser();
    fetchUserDocs();
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
      // ارسال نقش‌ها به صورت آرایه
      form.roles.forEach(role => {
        payload.append('roles', typeof role === 'object' ? role.name : role);
      });
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

  const handleUploadDocument = async (file, type) => {
    const payload = new FormData();
    payload.append('document', file[0]);
    payload.append('doc_type', type);
    
    try {
      await api.post(`/registration/${id}/manager/upload/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      notify('مدرك با موفقیت آپلود شد!', 'success');
      fetchUserDocs(); // بارگذاری مجدد مدارک بعد از آپلود      
    } catch (err) {
      notify('خطا در آپلود مدرك!', 'error');
      console.log(err);
    }
  }

  const handleDeleteDocument = async (docId) => {
    try {
      await api.delete(`/registration/${id}/documents/${docId}/`);
      notify('مدرك با موفقیت حذف شد!', 'success');
      fetchUserDocs(); // بارگذاری مجدد مدارک بعد از حذف
      handleDeleteDocumentModal(null); // بستن مودال تایید حذف
    } catch (err) {
      notify('خطا در حذف مدرك!', 'error');
      console.log(err);
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
                <select 
                  value={form.roles[0]?.name || form.roles[0] || ''} 
                  onChange={(e) => onChange('roles', [e.target.value])}>
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
              <strong>{roleConverter(userData?.roles)}</strong>
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

          <section className={styles.profileCard}>
            <div className={styles.docHeader}>
              <h3>مدارک ثبت‌نام</h3>
              <button className={styles.addBtn} onClick={() => handleUploadModal()}>
                <UilFilePlus  color='#333' size='2rem'/>
              </button>
            </div>
            {userDocs.length === 0 ? (
              <p className={styles.noDocs}>هیچ مدرکی بارگذاری نشده است.</p>
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
                      <UilTrash color='#333' size='1.3rem' onClick={() => handleDeleteDocumentModal(doc)}/>
                    </div>
                    ) : (
                      ""
                    )}
                  </li>
                ))}
              </ul>
            )}

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
      {uploadDocsModal && (
        <Modal handleModal={() => setUploadDocsModal(false)} width="500px" height="600px">
          <FileUpload handleModal={handleUploadModal} updateDocument={updateDocument} documents={userDocs}/>
        </Modal>
      )}
      {deleteDocsModal && (
        <Modal handleModal={() => handleDeleteDocumentModal(null)} width="400px" height="150px">
          <h3>آیا از حذف این مدرك مطمئن هستید؟</h3>
          <div className={styles.deleteDocActions}>
            <button className={styles.cancelDelete} onClick={() => handleDeleteDocumentModal(null)}>خیر، انصراف</button>
            <button className={styles.confirmDelete} onClick={() => {handleDeleteDocument(selectedDoc.id)}}>بله، حذف شود</button>
          </div>
        </Modal>
      )}
      {previewDocModal && (
        <Modal handleModal={() => handlePreviewDocModal(null)} width="500px" height="600px">
          <FileModal fileUrl={selectedDoc?.document} />
        </Modal>
      )}
    </div>
  );
};

export default ManagerEditUser;
