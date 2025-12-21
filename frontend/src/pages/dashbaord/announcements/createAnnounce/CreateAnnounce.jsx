import React, {useState, useEffect} from 'react'
import style from './CreateAnnounce.module.scss';
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import api from '../../../../hooks/api';
import MultiSelect from '../../../../components/dashboards/MulitSelect/MultiSelect';
import {UilTimesCircle} from '@iconscout/react-unicons'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../../context/NotificationContext';

const CreateAnnounce = () => {
  const { notify } = useToast();
  const navigate = useNavigate()

  const [coaches, setCoaches] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    descriptions: '',
    recipients: [],
    time: '',
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
      
      setUsers(resUser.data);
      setCoaches(resCoach.data);
      setAthletes(resAthlete.data);

    } catch (err) {
      console.log(err)
      notify('خطا در دریافت اطلاعات!', 'error');
    }
  };

  useEffect(() => {
    fethchUsers();
  }, []);


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
    form.append('time', formData.time)
    form.append('status', formData.status)


    try {
      await api.post('announcements/create/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      document.getElementById('scrollContainer').scrollTo({ top: 0, behavior: 'smooth' });
      notify('اطلاعات با موفقیت ذخیره شده!', 'success');
      navigate('/dashboard/announcements')
    } catch (err) {
      console.log(err)
      notify('خطا در ذخیره اطلاعات!', 'error');
    }
  }


  return (
    <div className={style.createAnnounce}>
      <div className={style.container}>
        <h1>ایجاد اطلاعیه‌ی جدید</h1>
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
                onChange={handleChange}
                className={style.formInput}
              />
              <span></span>
            </div>
            <div className={style.inputContainer}>
              <label htmlFor="">توضیحات</label>
              <textarea name="descriptions" id="" placeholder='توضیحات' onChange={handleChange}></textarea>
            </div>
            <div className={style.inputContainer}>
              <label>دریافت کنندگان</label>

              <div className={style.userSelectWrapper}>
                <MultiSelect
                  items={coaches}
                  value={selectedCoaches}
                  searchPlaceholder='جستجوی مربیان'
                  onChange={setSelectedCoaches}
                  />
                <MultiSelect
                  items={athletes}
                  value={selectedAthletes}
                  searchPlaceholder='جستجوی ورزشکاران'
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
                calendar={persian}
                locale={persian_fa}
                position='top-right'
                format='YYYY/MM/DD HH:mm'
                plugins={[
                  <TimePicker position="bottom" hideSeconds />
                ]}
                onChange={(date) => {
                  const miladi = date?.format("YYYY/MM/DD HH:mm");  // ← این رشته میلادی
                  setFormData({ ...formData, time: miladi });
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
              <select name="status" id="" className={style.statusInput} onChange={handleChange}>
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

export default CreateAnnounce