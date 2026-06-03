import { useEffect, useState } from 'react';
import styles from './NewTaskForm.module.scss';
import { Calendar } from 'react-multi-date-picker';
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import DateObject from "react-date-object";
import toPersianDigits from '../../../../hooks/convertNumber';

const CATEGORIES = [
  { label: 'تمرین', icon: '🏃' },
  { label: 'مالی', icon: '💰' },
  { label: 'جلسه', icon: '📅' },
  { label: 'اعلان', icon: '🔔' },
  { label: 'سایر', icon: '•••' },
];

export default function NewTaskForm({ mode = 'create', data = null, onSave, onCancel, categories, loading = null }) {
  const [title, setTitle]           = useState('');
  const [descriptions, setDescriptions] = useState('');
  const [category, setCategory]     = useState('تمرین');
  const [date, setDate]             = useState('');
  const [time, setTime]             = useState('');
  const [priority, setPriority]     = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;
    const timeStr = typeof time === 'string' ? time : time?.format?.("HH:mm") ?? '';
    onSave?.({ id: data?.id, title, descriptions, category, date, time: timeStr, priority });
  };


  const timeToDateObject = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':');
    const dateObj = new DateObject({ calendar: persian, locale: persian_fa });
    dateObj.setHour(Number(hours));
    dateObj.setMinute(Number(minutes));
    dateObj.setSecond(0);
    return dateObj;
  };


  useEffect(() => {
    if (mode === 'edit' && data) {
      setTitle(data.title)
      setDescriptions(data.descriptions)
      setCategory(data.category.name)
      setDate(data.date_jalali)
      setPriority(data.priority)
      setTime(data.time)
    }
  }, [mode, data])

  return (
    <div className={styles.overlay}>
      <div className={styles.topBar}>
        <div className={styles.topBarCenter}>
          <span className={styles.sheetTitle}>یادآور جدید</span>
          <span className={styles.sheetSub}>یادآور شخصی ساز</span>
        </div>
        <button className={styles.bellBtn}>🔔</button>
      </div>

      <div className={styles.body}>

        <div className={styles.field}>
          <label className={styles.label}>
            <span className={styles.labelIcon}>T</span>
            عنوان
            <span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            placeholder="مثال: پرداخت حقوق مربیان..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            <span className={styles.labelIcon}>≡</span>
            توضیحات
          </label>
          <textarea
            className={styles.textarea}
            placeholder="جزییات بیشتر..."
            value={descriptions}
            onChange={e => setDescriptions(e.target.value)}
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            <span className={styles.labelIcon}>◈</span>
            دسته‌بندی
          </label>
          <div className={styles.chips}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.label}
                className={`${styles.chip} ${category === cat.label ? styles.chipActive : ''}`}
                onClick={() => setCategory(cat.label)}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>📅</span>
              تاریخ
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputIcon}>
              <DatePicker
                value={date}
                calendar={persian}
                locale={persian_fa}
                onChange={(date) => {
                  // const converter = (text) => text.replace(/[٠-٩۰-۹]/g,a=>a.charCodeAt(0)&15);
                  const miladi = date?.format("YYYY/MM/DD");  // ← این رشته میلادی
                  console.log("miladi: ", miladi)
                  setDate(miladi)
                }}
                render={(value, openCalendar) => (
                <input
                  onFocus={openCalendar}
                  value={value}           // این فارسی نمایش می‌دهد
                  placeholder="تاریخ"
                  className={styles.input}
                  readOnly
                />
              )}
              />
              <span className={styles.iconRight}>📅</span>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>⏱</span>
              ساعت
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputIcon}>
              <DatePicker
                value={timeToDateObject(time)}
                disableDayPicker
                
                format="HH:mm"
                plugins={[
                  <TimePicker hideSeconds />
                ]}
                onChange={(time) => {
                  setTime(time?.format("HH:mm"));
                }}
                render={(value, openCalendar) => (
                <input
                  onFocus={openCalendar}
                  value={toPersianDigits(value)}           // این فارسی نمایش می‌دهد
                  placeholder="ساعت"
                  className={styles.input}
                  readOnly
                /> )}
              />
              <span className={styles.iconRight}>🕔</span>
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            <span className={styles.labelIcon}>🚩</span>
            اولویت
          </label>
          <div className={styles.priorities}>
            <button
              className={`${styles.priorityBtn} ${priority === true ? styles.trueActive : ''}`}
              onClick={() => setPriority(true)}
            >
              دارد ✅
            </button>
            <button
              className={`${styles.priorityBtn} ${priority === false ? styles.falseActive : ''}`}
              onClick={() => setPriority(false)}
            >
              ندارد ❌
            </button>
          </div>
        </div>

      </div>

      <div className={styles.footer}>
        <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
          {loading ? '...' : '⟳ ذخیره یادآور'}
        </button>
        <button className={styles.cancelBtn} onClick={onCancel}>
          انصراف
        </button>
      </div>
    </div>
  );
}
