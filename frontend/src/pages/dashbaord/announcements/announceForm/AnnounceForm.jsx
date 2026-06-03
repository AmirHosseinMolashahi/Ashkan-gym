import React, {useState, useEffect} from 'react'
import style from './AnnounceForm.module.scss';
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import api from '../../../../hooks/api';
import MultiSelect from '../../../../components/dashboards/MulitSelect/MultiSelect';
import { UilTimesCircle, UilCheckSquare, UilText, UilAlignRightJustify, UilRssAlt } from '@iconscout/react-unicons'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../../context/NotificationContext';
import BackButton from '../../../../components/dashboards/backButton/BackButton';
import RecipientsGroupSection from './recipientsGroupSection/RecipientsGroupSection';
import Loader from '../../../../components/GlobalComponents/NewLoader/Loader';
import { useParams } from 'react-router-dom';

const STATUS_OPTIONS = [
  {
    id: "d",
    label: "پیش‌نویس",
    description: "محتوا هنوز ارسال نشده",
    icon: "✏️",
  },
  {
    id: "r",
    label: "در حال بررسی",
    description: "در حال بررسی توسط مدیر",
    icon: "🕐",
  },
  {
    id: "p",
    label: "منتشر شده",
    description: "قابل مشاهده برای کاربران",
    icon: "📡",
  },
  {
    id: "b",
    label: "برگشت خورده",
    description: "برگشت خورده توسط مدیر",
    icon: "📦",
  },
];




const AnnounceForm = ({ mode = 'create', announceId = null }) => {
  const { notify } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const [roles, setRoles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    descriptions: '',
  })

  const [announcementOn, setAnnouncementOn] = useState(true);
  const [selectedRecipients, setSelectedRecipients] = useState({ classes: [], roles: [], students: [] });

  const [selectedStatus, setSelectedStatus] = useState('draft')

  const fethchData = async () => {
    try {
      const resUser = await api.get('account/users/');
      const resRole = await api.get('account/roles/');
      const resCourse = await api.get('training/courses/');

      console.log(resUser.data.results)
      console.log(resRole.data.results)
      console.log(resCourse.data.results)
      
      setUsers(resUser.data.results);
      setRoles(resRole.data.results);
      setCourses(resCourse.data.results);

    } catch (err) {
      console.log(err)
      notify('خطا در دریافت اطلاعات!', 'error');
    }
  };

  const fetchAnnounceData = async (id) => {
    try {
      const res = await api.get(`announcements/${id}/edit/`);
      const data = res.data;
      setFormData({ title: data.title, descriptions: data.descriptions });
      setSelectedStatus(data.status);
      setAnnouncementOn(data.is_global);
      setSelectedRecipients({
        classes: data.target_classes,
        roles: data.target_roles,
        students: data.target_users,
      });
    } catch (err) {
      notify('خطا در دریافت اطلاعیه!', 'error');
    }
  };

  useEffect(() => {
    fethchData();

    if (mode === 'edit' && id) {
      fetchAnnounceData(id);
    }
  }, []);


  const handleChange = (e) => {
    const { name, value, type } = e.target;
    name === 'status' ? setSelectedStatus(value) : ''
    setFormData({ ...formData, [name]: value });
  }

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault()

    const payload = {

      title: formData.title,
      descriptions: formData.descriptions,
      status: selectedStatus,
      is_global: announcementOn,

      target_roles: selectedRecipients.roles,

      target_classes: selectedRecipients.classes,

      target_users: selectedRecipients.students,
    }

    try {
      if (mode === 'edit') {
        await api.patch(`announcements/${id}/edit/`, payload);
      } else {
        await api.post('announcements/create/', payload);
      }
      notify('اطلاعات با موفقیت ذخیره شده!', 'success');
      navigate('/dashboard/announcements')
    } catch (err) {
      console.log(err.response)
      notify('خطا در ذخیره اطلاعات!', 'error');
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className={style.createAnnounce}>
      <div className={style.container}>
        <div className={style.header}>
          <BackButton route='/dashboard/announcements' title='بازگشت'/>
          <div className={style.headerWrapper}>
            <h3>{mode === 'create' ? 'ایجاد اطلاعیه‌ی جدید' : 'ویرایش اطلاعیه'}</h3>
            <button className={style.saveBtn} onClick={handleSubmit}>{mode === 'create' ? 'ایجاد اطلاعیه' : 'ذخیره تغییرات'} <UilCheckSquare /></button>
          </div>
        </div>
        <div className={style.formContainer} id='scrollContainer'>
          <button className={style.clearData}>پاک کردن همه اطلاعات <UilTimesCircle /></button>
          <div className={style.inputContainer}>
            <p><UilText /> عنوان</p>
            <input
              type="text"
              name="title"
              placeholder='عنوان'
              value={formData.title}
              maxLength={200}
              onChange={handleChange}
              className={style.formInput}
            />
            <span></span>
          </div>
          <div className={style.inputContainer}>
            <p><UilAlignRightJustify  /> توضیحات</p>
            <textarea name="descriptions" id="" value={formData.descriptions} placeholder='توضیحات' onChange={handleChange}></textarea>
          </div>
          <div className={style.inputContainer}>
            <p><UilRssAlt /> وضعیت انتشار</p>
            <div className={style.options}>
            {STATUS_OPTIONS.map((option) => {
              const isActive = selectedStatus === option.id;
              return (
                <label
                  key={option.id}
                  className={`${style.option} ${isActive ? style.active : ""}`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.id}
                    checked={isActive}
                    onChange={(e) => handleChange(e)}
                    className={style.radio}
                  />
                  <span className={style.radioCustom}>
                    {isActive && <span className={style.radioDot} />}
                  </span>
                  <span className={style.optionContent}>
                    <span className={style.optionLabel}>{option.label}</span>
                    <span className={style.optionDesc}>{option.description}</span>
                  </span>
                  <span className={style.optionIcon}>{option.icon}</span>
                </label>
              );
            })}
          </div>
          </div>
          <div className={style.inputContainer}>
            <RecipientsGroupSection 
              users={users}
              courses={courses}
              roles={roles}
              announcementOn={announcementOn}
              setAnnouncementOn={setAnnouncementOn}
              selected={selectedRecipients}
              setSelected={setSelectedRecipients}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnnounceForm