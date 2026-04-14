import React, {useState} from 'react';
import { UilClock } from '@iconscout/react-unicons';
import Modal from '../../../GlobalComponents/Modal/Modal';
import style from './AddTimeTable.module.scss';
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian"
import persian_en from "react-date-object/locales/persian_fa"

const AddTimeTable = ({timeTableModal, setTimeTableModal, handleSaveSchedule, scheduleRows, setScheduleRows}) => {

  const handleToggleDay = (id) => {
    setScheduleRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, enabled: !row.enabled, start: !row.enabled ? row.start : '', end: !row.enabled ? row.end : '' }
          : row
      )
    );
  };

  const handleTimeChange = (id, field, dateObj) => {
    setScheduleRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: dateObj || null } : row))
    );
  };

  return (
   <Modal handleModal={() => setTimeTableModal(false)} width="560px" height="auto">
    <div className={style.timetableModal}>
      <h2>اضافه کردن جدول زمانی</h2>
      <p>روز های هفته را انتخاب و ساعت شروع و پایان را تنظیم کنید!</p>

      <div className={style.daysList}>
        {scheduleRows.map((row, index) => (
          <div className={style.dayRow} key={index}>
            <label className={style.dayCheck}>
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={() => handleToggleDay(row.id)}
              />
              <span>{row.day}</span>
            </label>

            <span className={style.to}>از</span>

            <div className={style.timeInputs}>
              <div className={`${style.timeField} ${!row.enabled ? style.disabled : ""}`}>
                <UilClock size={14} />
                <DatePicker
                  disableDayPicker
                  format="HH:mm"
                  value={row.start}
                  calendar={persian}
                  locale={persian_en}
                  disabled={!row.enabled}
                  onChange={(date) => {
                    if (!row.enabled) return;
                    handleTimeChange(row.id, "start", date);
                  }}
                  plugins={[<TimePicker hideSeconds />]}
                />
              </div>

              <span className={style.to}>تا</span>

              <div className={`${style.timeField} ${!row.enabled ? style.disabled : ""}`}>
                <UilClock size={14} />
                <DatePicker
                  disableDayPicker
                  format="HH:mm"
                  value={row.end}
                  calendar={persian}
                  locale={persian_en}
                  disabled={!row.enabled}
                  onChange={(date) => {
                    if (!row.enabled) return;
                    handleTimeChange(row.id, "end", date);
                  }}
                  plugins={[<TimePicker hideSeconds />]}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={style.actions}>
        <button className={style.cancelBtn} onClick={() => setTimeTableModal(false)}>
          لغو
        </button>
        <button className={style.saveBtn} onClick={handleSaveSchedule()}>
          ذخیره‌ی جدول
        </button>
      </div>
    </div>
  </Modal>
  )
}

export default AddTimeTable