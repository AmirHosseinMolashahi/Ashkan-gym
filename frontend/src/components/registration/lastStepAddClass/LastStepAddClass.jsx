import React, { useState, useEffect } from 'react'
import style from './LastStepAddClass.module.scss';
import { useSelector } from 'react-redux';
import api from '../../../hooks/api';
import MultiSelect2 from '../../dashboards/MulitSelect2/MultiSelect2';
import { useToast } from '../../../context/NotificationContext';


const LastStepAddClass = ({userId, onSuccess}) => {

  const { user } = useSelector(state => state.auth);
  const [maleClasses, setMaleClasses] = useState([]);
  const [femaleClasses, setFemaleClasses] = useState([]);
  const [selectedMaleClass, setSelectedMaleClass] = useState([]);
  const [selectedFemaleClass, setSelectedFemaleClass] = useState([]);
  const [newStudent, setNewStudent] = useState(null)
  const { notify } = useToast()


  const fetchClasses = async () => {
    try {
      const res = await api.get('training/courses/')
      console.log(res.data)
      setFemaleClasses(res.data.filter(c => c.gender === 'female'))
      setMaleClasses(res.data.filter(c => c.gender === 'male'))
    } catch (err) {
      console.log(err)
    };
  }

  const fetchUserInfo = async (userId) => {
    try {
      const res = await api.get(`/account/register/complete-profile/${userId}/`)
      setNewStudent(res.data)
    } catch (err) {
      console.log(err)
    };
  }


  useEffect(() => {
    fetchClasses();
    fetchUserInfo(userId);
  }, [])

  const handleSubmit = async () => {
    const finalSelectedClasses = [
      ...selectedMaleClass,
      ...selectedFemaleClass,
    ]

    if (finalSelectedClasses.length === 0) {
      notify('یک کلاس را انتخاب کنین!', 'warning')
      return null;
    } 

    const form = new FormData();
    form.append('student', userId)
    finalSelectedClasses.forEach(course =>
      form.append("courses", course)
    )

    try {
      const res = await api.post('training/enrollment/add/',form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onSuccess();
      notify('ورزشکار با موفقیت به کلاس اضافه شد!', 'success')
    } catch (err) {
      console.log(err)
    }
  }


  return (
    <div className={style.thirdStep}>
      <div className={style.container}>
        <h3>اضافه کردن به کلاس</h3>
        <p>شما در حال اضافه کردن <b>{newStudent?.full_name}</b> به کلاس:</p>
        <div className={style.listContainer}>
          {femaleClasses.length > 0 ? (
            <div className={style.listWrapper}>
              <h4> خانم ها</h4>
              {femaleClasses.length > 0 ? (
                <MultiSelect2
                  width='400px'
                  items={femaleClasses}
                  value={selectedFemaleClass}
                  searchPlaceholder='جستجوی کلاس های خانم ها'
                  onChange={setSelectedFemaleClass}
                />
              ): (
                <p>کلاسی برای خانم ها وجود ندارد</p>
              )}
            </div>
          ) : (
            ''
          )}
          {maleClasses.length > 0 ? (
            <div className={style.ListWrapper}>
              <h4> آقایان</h4>
              {maleClasses.length > 0 ? (
                <MultiSelect2
                  width='400px'
                  items={maleClasses}
                  value={selectedMaleClass}
                  searchPlaceholder='جستجوی کلاس های آقایان'
                  onChange={setSelectedMaleClass}
                />
              ): (
                <p>کلاسی برای آقایان وجود ندارد</p>
              )}
            </div>
          ) : (
            ''
          )}
        </div>
        <button onClick={() => handleSubmit()} className={style.addClassBtn}>اضافه کردن +</button>
      </div>
    </div>
  )
}

export default LastStepAddClass;