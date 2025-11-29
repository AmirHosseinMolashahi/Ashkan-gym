import React from 'react'
import style from './Filter.module.scss';
import DatePicker from "react-multi-date-picker"
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import DateObject from "react-date-object";
import { UilTimes , } from '@iconscout/react-unicons'

const Filter = ({filters, setFilters}) => {

    const handleCheckbox = (e) => {
        const { name, checked } = e.target;

        if (name === "finished") {
            setFilters({
            ...filters,
            finished: checked,
            notFinished: checked ? false : filters.notFinished, // اگر finished تیک خورد → notFinished خاموش شود
            });
        }

        if (name === "notFinished") {
            setFilters({
            ...filters,
            notFinished: checked,
            finished: checked ? false : filters.finished, // اگر notFinished تیک خورد → finished خاموش شود
            });
        }
    };

    const handleDates = (dates) => {
        // رشته ISO برای فیلتر و backend
        const isoDates = dates.map(d => d.toDate().toISOString().slice(0, 10));

        // DateObject برای نمایش داخل DatePicker
        setFilters({
            ...filters,
            times: isoDates,
            timesObjects: dates // ← خود DateObject ها را هم نگه می‌داریم
        });
    };

    const handleClearFilter = () => {
        setFilters({
            finished: false,
            notFinished: false,
            times: [],
            timesObjects: [],
        })
    }

  return (
    <div className={style.filter}>
        <div className={style.filterHeader}>
            <h2>فیلتر</h2>
            <button onClick={handleClearFilter}>پاک کردن فیلتر ها <UilTimes /></button>
        </div>
        <div className={style.filterContainer}>
            <h3>بر اساس وضعیت:</h3>
            <div className={style.filterParent}>
                <div className={style.filterWrapper}>
                    <label>انجام شده</label>
                    <input
                        type="checkbox"
                        name="finished"
                        className={style.ikxBAC}
                        checked={filters.finished}
                        onChange={handleCheckbox} />
                </div>
                <div className={style.filterWrapper}>
                    <label>در حال انجام</label>
                    <input
                        type="checkbox"
                        name="notFinished"
                        className={style.ikxBAC}
                        checked={filters.notFinished}
                        onChange={handleCheckbox} />
                </div>
            </div>
        </div>
        <div className={style.filterContainer}>
            <h3>بر اساس زمان: (بازه زمانی )</h3>
            <DatePicker
                multiple
                calendar={persian}
                locale={persian_fa}
                plugins={[
                <DatePanel />
                ]}
                value={filters.timesObjects || []} 
                onChange={handleDates}
            />
        </div>
    </div>
  )
}

export default Filter