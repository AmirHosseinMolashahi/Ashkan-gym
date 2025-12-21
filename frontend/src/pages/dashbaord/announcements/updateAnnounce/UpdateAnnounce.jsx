import React, {useState, useEffect} from 'react'
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import api from '../../../../hooks/api';
import MultiSelect from '../../../../components/dashboards/MulitSelect/MultiSelect';
import {UilTimesCircle} from '@iconscout/react-unicons'
import { useNavigate, useParams } from 'react-router-dom'
import style from '../createAnnounce/CreateAnnounce.module.scss';
import toPersianDigits from '../../../../hooks/convertNumber';
import { useToast } from '../../../../context/NotificationContext';

const UpdateAnnounce = () => {

  const { notify } = useToast();
  const navigate = useNavigate()
  const { id } = useParams()

  const [coaches, setCoaches] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    descriptions: '',
    recipients: [],
    recipients_ids: [],
    time_jalali: '',
    status: '',
  })

  const [selectedCoaches, setSelectedCoaches] = useState([]);
  const [selectedAthletes, setSelectedAthletes] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const fethchUsers = async () => {
    try {
      const resUser = await api.get('account/users/');
      const resCoach = await api.get('account/users/?role=coach');
      const resAthlete = await api.get('account/users/?role=athlete');

      const coachesList = resCoach.data;
      const athletesList = resAthlete.data;

      // استخراج ID ها
      const coachIds = coachesList.map(c => c.id);
      const athleteIds = athletesList.map(a => a.id);

      // فیلتر کاربران:
      // اگر کاربری coach یا athlete باشد → از users حذف شود
      const cleanUsers = resUser.data.filter(
        u => !coachIds.includes(u.id) && !athleteIds.includes(u.id)
      );
      
      setCoaches(coachesList);
      setAthletes(athletesList);
      setUsers(cleanUsers);

    } catch (err) {
      console.log(err)
      notify('خطا در دریافت اطلاعات!', 'error');
    }
  };


  const fetchData = async () => {
    try {
      const res = await api.get(`/announcements/${id}/edit/`);
      setFormData(res.data)
      const rec = res.data.recipients_ids;

      // مربیان
      setSelectedCoaches(
        coaches.filter(c => rec.includes(c.id)).map(c => c.id)
      );

      // ورزشکاران
      setSelectedAthletes(
        athletes.filter(a => rec.includes(a.id)).map(a => a.id)
      );

      // همه کاربران
      setSelectedUsers(
        users.filter(u => rec.includes(u.id)).map(u => u.id)
      );
      
    } catch (err) {
      notify('خطا در دریافت اطلاعات اطلاعیه!', 'error')
    }
  }

  useEffect(() => {
    fethchUsers();
  }, []);

  useEffect(() => {
    if (coaches.length && athletes.length && users.length) {
      fetchData();
    }
  }, [coaches, athletes, users]);


  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const finalReceptions = [
      ...selectedCoaches,
      ...selectedAthletes,
      ...selectedUsers
    ];

    const form = new FormData();
    form.append('title', formData.title)
    form.append('descriptions', formData.descriptions)
    form.append('recipients', JSON.stringify(finalReceptions))
    form.append('time', formData.time_jalali)
    form.append('status', formData.status)


    try {
      console.log(JSON.stringify(finalReceptions))
      await api.put(`announcements/${id}/edit/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      document.getElementById('scrollContainer').scrollTo({ top: 0, behavior: 'smooth' });
      notify('اطلاعات با موفقیت ویرایش شد!', 'success');
      navigate('/dashboard/announcements')
    } catch (err) {
      console.log(err)
      notify('خطا در ذخیره اطلاعات!', 'error');
    } finally {
    }
  }


  return (
    <div className={style.createAnnounce}>
      <div className={style.container}>
        <h1>ویرایش اطلاعیه</h1>
        <form onSubmit={handleSubmit} id='scrollContainer'>
          <span className={style.clearData}>پاک کردن همه اطلاعات <UilTimesCircle /></span>
          <div className={style.formContainer}>
            <div className={style.inputContainer}>
              <label htmlFor="">عنوان</label>
              <input
                type="text"
                name="title"
                placeholder='عنوان'
                maxLength={200}
                value={formData.title}
                onChange={handleChange}
                className={style.formInput}
              />
              <span></span>
            </div>
            <div className={style.inputContainer}>
              <label htmlFor="">توضیحات</label>
              <textarea name="descriptions" id="" placeholder='توضیحات' value={formData.descriptions} onChange={handleChange}></textarea>
            </div>
            <div className={style.inputContainer}>
              <label>دریافت کنندگان</label>

              <div className={style.userSelectWrapper}>
                <MultiSelect
                  items={coaches}
                  value={selectedCoaches}
                  searchPlaceholder='جستجوی همه مربیان'
                  onChange={setSelectedCoaches}
                  />
                <MultiSelect
                  items={athletes}
                  value={selectedAthletes}
                  searchPlaceholder='جستجوی همه ورزشکاران'
                  onChange={setSelectedAthletes}
                  />
                <MultiSelect
                  items={users}
                  value={selectedUsers}
                  searchPlaceholder='جستجوی همه کاربران'
                  onChange={setSelectedUsers}
                  />
              </div>

            </div>
            <div className={style.inputContainer}>
              <label>تاریخ و ساعت</label>
              <DatePicker
                value={formData.time_jalali}
                calendar={persian}
                locale={persian_fa}
                position='top-right'
                format='YYYY/MM/DD HH:mm'
                plugins={[
                  <TimePicker position="bottom" hideSeconds />
                ]}
                onChange={(date) => {
                  const miladi = date?.format("YYYY/MM/DD HH:mm");  // ← این رشته میلادی
                  setFormData({ ...formData, time_jalali: miladi });
                }}
                render={(value, openCalendar) => (
                  <input
                    onFocus={openCalendar}
                    value={value}           // این فارسی نمایش می‌دهد
                    placeholder="تاریخ و ساعت"
                    className={style.formInput}
                    readOnly
                  />
                )}
              />
            </div>
            <div className={style.inputContainer}>
              <label htmlFor="">وضعیت</label>
              <select name="status" id="" className={style.statusInput} value={formData.status} onChange={handleChange}>
                <option value="">------------</option>
                <option value="d">پیشنویس</option>
                <option value="b">برگشت خورده</option>
                <option value="r">در حال بررسی</option>
                <option value="p">منتشر شده</option>
              </select>
            </div>
            <button>ایجاد</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateAnnounce