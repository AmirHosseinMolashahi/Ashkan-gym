import React from 'react'
import style from './Announce.module.scss'
import { UilPlus} from '@iconscout/react-unicons'
import {useNavigate} from 'react-router-dom'
import AnnounceList from '../../../components/dashboards/AnnounceList/AnnounceList'
import { useSelector } from 'react-redux'

const Announce = () => {

  const navigate = useNavigate()
  const newAnnouncHandler = () => {
    navigate('create')
  }

  const { user } = useSelector(state => state.auth);

  return (
    <div className={style.announce}>
      <div className={style.container}>
        <div className={style.wrapper}>
          {user?.role === 'manager' ? (
            <button onClick={newAnnouncHandler}>افزودن اطلاعیه جدید <UilPlus /></button>
          ) : (
            <h3>لیست اطلاعیه ها</h3>
          )}
          <AnnounceList />
        </div>
      </div>
    </div>
  )
}

export default Announce