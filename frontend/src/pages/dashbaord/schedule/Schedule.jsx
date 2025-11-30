import React, { useState, useEffect } from 'react'
import style from './Schedule.module.scss';
import { Calendar } from 'react-multi-date-picker';
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import { UilPlusCircle, UilTimesCircle, UilTrashAlt, UilEdit, UilCheckCircle, UilHourglass   } from '@iconscout/react-unicons'
import DatePicker from "react-multi-date-picker";
import { useNotification } from '../../../context/notificationContext';
import api from '../../../hooks/api';
import toPersianDigits from '../../../hooks/convertNumber';
import Filter from '../../../components/dashboards/Filter/Filter';

const Schedule = () => {

  const initialForm = {
    title: '',
    descriptions: '',
    time: '',
    finished: false,
  }

  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState(false)
  const [completeModal, setCompleteModal] =useState(false)
  const { notify } = useNotification()
  const [selectedId, setSelectedId] = useState(null);

  const [filters, setFilters] = useState({
    finished: false,
    notFinished: false,
    times: [],
  });

 

  const [remindersList, setRemindersList] = useState([]);
  const selectedReminder = remindersList?.find(item => item.id === selectedId);

  const [formData, setFormData] = useState(initialForm);
  const [editFormData, setEditFormData] = useState(initialForm);

  const handleModal = () => {
    if (modal) {
    // اگر مودال در حال بسته شدن است → فرم پاک شود
    setFormData(initialForm);
    }
    setModal(!modal);
  }
  const handleDeleteModal = (id) => {
    setSelectedId(id);
    setDeleteModal(!deleteModal);
  }

  const handleEditModal = (item) => {
    setSelectedId(item.id)
    setEditFormData({
      title: item.title,
      descriptions: item.descriptions,
      time: item.time_jalali,
    });
    setEditModal(!editModal);
  }

  const handleCompleteModal = (item) => {
    setSelectedId(item.id)
    setEditFormData({
      title: item.title,
      descriptions: item.descriptions,
      time: item.time_jalali,
      finished: true,
    });
    setCompleteModal(!completeModal);
  }

  const fethchReminders = async () => {
      try {
        const res = await api.get('schedule/lists/');
        setRemindersList(res.data);
        console.log(res.data)
      } catch (err) {
        console.log(err)
        notify('خطا در ذخیره اطلاعات!', 'error');
      }
    };

  useEffect(() => {
    fethchReminders();
  }, []);

  const filtered = remindersList
  // فیلتر وضعیت: اگر فعال نبود → همه عبور کنند
  .filter(r => (filters.finished ? r.finished === true : true))
  .filter(r => (filters.notFinished ? r.finished === false : true))

  // فیلتر تاریخ خاص با DatePicker
  .filter(r => {
    if (filters.times.length === 0) return true; // اگر هیچ تاریخی انتخاب نشده → همه عبور کنند

    // تبدیل رشته تاریخ Reminder به Date
    const reminderDate = new Date(r.time.split(",")[0]);

    // تبدیل تاریخ‌های انتخاب شده به Date
    const selectedDates = filters.times.map(d => new Date(d));

    // پیدا کردن کمترین و بیشترین تاریخ انتخاب شده
    const minDate = new Date(Math.min(...selectedDates));
    const maxDate = new Date(Math.max(...selectedDates));

    // بررسی اینکه reminder بین این بازه است
    return reminderDate >= minDate && reminderDate <= maxDate;
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('title', formData.title);
    form.append('descriptions', formData.descriptions);
    form.append('time', formData.time);

    try {
      await api.post('schedule/create/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      notify('یادآور با موفقیت ذخیره شد 🙌', 'success');
      fethchReminders()
    } catch (err) {
      notify('خطا در ذخیره اطلاعات!', 'error');
    } finally {
      handleModal()
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      await api.delete(`/schedule/delete/${selectedId}/`);
      notify('یادآور با موفقیت حذف شد!', 'info')
      setRemindersList(prev => prev.filter(item => item.id !== selectedId));
      handleDeleteModal()
    } catch {
      notify('خطا در حذف یادآور!', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/schedule/update/${selectedId}/`, editFormData, {
        headers: {'Content-Type': 'multipart/form-data'}
      });
      notify('یادآور با موفقیت ویرایش شد!', 'info')
      fethchReminders()
      handleEditModal(editFormData)
    } catch(err) {
      console.log(err)
      notify('خطا در ویرایش یادآور!', 'error');
    } finally {
    }
  }

  const handleFinished = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/schedule/update/${selectedId}/`, editFormData, {
        headers: {'Content-Type': 'multipart/form-data'}
      });
      notify('یادآور با موفقیت به پایان رسید !', 'info')
      fethchReminders()
      handleCompleteModal(editFormData)
    } catch(err) {
      console.log(err)
      notify('خطا در ویرایش یادآور!', 'error');
    } finally {
    }
  }

  return (
    <div className={style.schedule}>
      {/* right part of the website */}
      <div className={style.right}>
        <div className={style.container}>
          <div className={style.header}>
            <h1>لیست  یادآور های شما</h1>
            <button onClick={handleModal}> افزودن یادآور <UilPlusCircle  />  </button>
          </div>
          <div className={style.content}>
            {filtered && filtered.length > 0 ? (
              <div className={style.remindersContainer}>
                {filtered.map((item, index) => {
                  return(
                    <div className={style.reminder} key={index} style={item.finished ? {color: '#969396'} : {color: '#1c1c1c'}}>
                      <div className={style.remindersWrapper}>
                        <div className={style.remindersInfo}>
                          <h3>{item.title}</h3>
                          <p>{item.descriptions}</p>
                        </div>
                        <hr />
                        <div className={style.remindersTime}>
                          <h5>زمان</h5>
                          <p>{toPersianDigits(item.time_jalali)}</p>
                        </div>
                        <hr />
                        <div className={style.remindersActions}>
                          <UilEdit onClick={() => handleEditModal(item)}/>
                          <UilTrashAlt onClick={() => handleDeleteModal(item.id)} />
                        </div>
                        <hr />
                        <div className={style.remindersStatus}>
                          {item.finished ? <UilCheckCircle /> : <UilHourglass onClick={() => handleCompleteModal(item)} /> }
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <h3>هیچ یادآوری وجود ندارد!</h3>
            )
          }
          </div>
        </div>
      </div>
      {/* left part of website */}
      <div className={style.left}>
        <div className={style.topLeft}>
          <Filter filters={filters} setFilters={setFilters} />
          <p>تعداد یادآور های شما: {remindersList.length}</p>
        </div>
        <div className={style.bottomLeft}>
          <Calendar 
            calendar={persian}
            locale={persian_fa}
            className={style.calendar}
            fullWidth 
          />
        </div>
      </div>
      {/* modal */}
      {modal && (
        <div className={style.modal}>
          <div className={style.container}>
            <div className={style.closeBtn} onClick={handleModal}>
              <UilTimesCircle />
            </div>
            <form onSubmit={handleSubmit}>
              <div className={style.inputContainer}>
                <label>عنوان</label>
                <input 
                  type="text"
                  placeholder='عنوان'
                  name='title'
                  value={formData.title}
                  onChange={handleChange}
                  className={style.formInput}
                />
              </div>
              <div className={style.inputContainer}>
                <label>توضیحات</label>
                <textarea 
                  maxLength={250}
                  type="text"
                  placeholder='توضیحات'
                  name='descriptions'
                  value={formData.descriptions}
                  onChange={handleChange}
                  className={style.formInput}
                />
              </div>
              <div className={style.inputContainer}>
                <label>تاریخ</label>
                <DatePicker
                  value={formData.time}
                  calendar={persian}
                  locale={persian_fa}
                  onChange={(date) => {
                    // const converter = (text) => text.replace(/[٠-٩۰-۹]/g,a=>a.charCodeAt(0)&15);
                    const miladi = date?.format("YYYY/MM/DD");  // ← این رشته میلادی
                    // console.log("miladi: ", miladi)
                    setFormData({ ...formData, time: miladi });
                  }}
                  render={(value, openCalendar) => (
                  <input
                    onFocus={openCalendar}
                    value={value}           // این فارسی نمایش می‌دهد
                    placeholder="تاریخ"
                    className={style.formInput}
                    readOnly
                  />
                )}
                />
              </div>
              <div className={style.buttonContainer}>
                <button className={style.submitBtn} type="submit">ذخیره</button>
                <button className={style.cancelBtn} onClick={handleModal}>لغو</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteModal && (
        <div className={style.deleteModal}>
          <div className={style.container}>
            <div className={style.closeBtn} onClick={handleDeleteModal}>
              <UilTimesCircle />
            </div>
            <div className={style.content}>
              {selectedReminder
                ? `آیا از حذف کردن "${selectedReminder.title}" مطمئن هستید؟`
                : "آیا از حذف کردن این یادآور مطمئن هستید؟"}
            </div>
            <div className={style.buttonContainer}>
              <button className={style.cancelBtn} onClick={handleDelete}>حذف</button>
              <button className={style.statusBtn} onClick={handleDeleteModal}>لغو</button>
            </div>
          </div>
        </div>
      )}
      {editModal && (
        <div className={style.modal}>
          <div className={style.container}>
            <div className={style.closeBtn} onClick={handleEditModal}>
              <UilTimesCircle />
            </div>
            <form onSubmit={handleUpdate}>
              <div className={style.inputContainer}>
                <label>عنوان</label>
                <input 
                  type="text"
                  placeholder='عنوان'
                  name='title'
                  value={editFormData.title}
                  onChange={e => setEditFormData({...editFormData, title: e.target.value})}
                  className={style.formInput}
                />
              </div>
              <div className={style.inputContainer}>
                <label>توضیحات</label>
                <textarea 
                  maxLength={250}
                  type="text"
                  placeholder='توضیحات'
                  name='descriptions'
                  value={editFormData.descriptions}
                  onChange={e => setEditFormData({...editFormData, descriptions: e.target.value})}
                  className={style.formInput}
                />
              </div>
              <div className={style.inputContainer}>
                <label>تاریخ</label>
                <DatePicker
                  value={editFormData.time}
                  calendar={persian}
                  locale={persian_fa}
                  onChange={(date) => {
                    // const converter = (text) => text.replace(/[٠-٩۰-۹]/g,a=>a.charCodeAt(0)&15);
                    const miladi = date?.format("YYYY/MM/DD");  // ← این رشته میلادی
                    // console.log("miladi: ", miladi)
                    setEditFormData({ ...editFormData, time: miladi });
                  }}
                  render={(value, openCalendar) => (
                  <input
                    onFocus={openCalendar}
                    value={value}           // این فارسی نمایش می‌دهد
                    placeholder="تاریخ"
                    className={style.formInput}
                    readOnly
                  />
                )}
                />
              </div>
              <div className={style.buttonContainer}>
                <button className={style.submitBtn} type="submit">ذخیره</button>
                <button className={style.cancelBtn} onClick={handleEditModal}>لغو</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {completeModal && (
        <div className={style.deleteModal}>
          <div className={style.container}>
            <div className={style.closeBtn} onClick={handleCompleteModal}>
              <UilTimesCircle />
            </div>
            <div className={style.content}>
              {selectedReminder
                ? `آیا از تمام شدن "${selectedReminder.title}" مطمئن هستید؟`
                : "آیا از تمام شدن این یادآور مطمئن هستید؟"}
            </div>
            <div className={style.buttonContainer}>
              <button className={style.successBtn} onClick={handleFinished}>انجام شد</button>
              <button className={style.statusBtn} onClick={handleCompleteModal}>لغو</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Schedule