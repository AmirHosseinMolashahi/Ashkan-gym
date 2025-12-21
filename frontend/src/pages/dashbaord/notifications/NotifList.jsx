import React, { useEffect, useState } from 'react'
import style from './NotifList.module.scss';
import api from '../../../hooks/api';
import toPersianDigits from '../../../hooks/convertNumber';
import { UilTrashAlt, UilAngleLeft , UilAngleRight, UilMegaphone, UilCalendar, UilUsdCircle } from '@iconscout/react-unicons'
import Modal from '../../../components/GlobalComponents/Modal/Modal';
import { useToast } from '../../../context/NotificationContext';
import { useSelector, useDispatch } from "react-redux";
import { deleteNotification, markAsRead, fetchNotifications, fetchUnreadCount, markAllAsRead } from '../../../store/notificationSlice';

const NotifList = () => {

  const { notify } = useToast();
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterRead, setFilterRead] = useState("");
  const [allReadModal, setAllReadModal] = useState(false);
  const NotifCategory = {
    announcements : <UilMegaphone  />,
    reminders : <UilCalendar />,
    tuition: <UilUsdCircle />,
  }


  const dispatch = useDispatch();
  const { list, loading, page, totalPages, unreadCount} = useSelector(
    state => state.notifications
  );

  useEffect(() => {
    if (page > totalPages) {
      dispatch(fetchNotifications(totalPages));
    }
  }, [totalPages]);

  const applyFilter = (value) => {
    setFilterRead(value)
    dispatch(fetchNotifications({
      page: 1,
      type: filterType,
      is_read: value, // فقط unread یا همه
    }));
    setDropdownOpen(false)
  };

  const handleNext = () => {
    if (page < totalPages) {
      dispatch(fetchNotifications({
        page: page + 1,
        type: filterType,
        is_read: filterRead,
      }));
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      dispatch(fetchNotifications({
        page: page - 1,
        type: filterType,
        is_read: filterRead,
      }));
    }
  };

  const handleDeleteModal = (items) => {
    if ( items !== null ) {
      setSelectedNotif(items);
    }
    setDeleteModal(!deleteModal);
  }

  const deleteNotif = async (id) => {
    await api.delete(`/notifications/${id}/delete/`);
    dispatch(deleteNotification(id));
    dispatch(fetchUnreadCount());
    notify('اعلان با موفقیت حذف شد!', 'info');
    handleDeleteModal(false);
    setTimeout(() => {
      dispatch(fetchNotifications(page));
    }, 0);
  };


  const handleAllReadModal = () => {
    setAllReadModal(!allReadModal);
  }

  const handleMarkAllRead = async () => {
    try {
      dispatch(markAllAsRead());
      notify('وضعیت همه‌ی اعلان ها به خوانده شده تغییر کرد!', 'info');
      setAllReadModal(false)
    } catch {
      notify('خطا در تغییر وضعیت همه اعلان ها به خوانده شده', 'error')
    }
  }

  if (loading) {
    return(
      <p>در حال بارگذاری...</p>
    )
  }


  return (
    <div className={style.NotifList}>
      <div className={style.container}>
        <div className={style.header}>
          <h1>لیست اعلان های شما</h1>
         {list.length !== 0 && (
          <div className={style.buttons}>
            <div className={style.filterDropdown}>
              <span
                className={style.dropdownToggle}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                فیلتر نوتیف‌ها
              </span>

              {dropdownOpen && (
                <ul className={style.dropdownMenu}>
                  <li
                    className={filterRead === "" ? style.active : ""}
                    onClick={() => applyFilter("")}
                  >
                    همه
                  </li>
                  <li
                    className={filterRead === "false" ? style.active : ""}
                    onClick={() => applyFilter("false")}
                  >
                    فقط نخوانده‌ها
                  </li>
                </ul>
              )}
            </div>
            <div className={`${style.markAllRead} ${unreadCount === 0 ? style.disabled : ''}`}>
              <span onClick={() => {
                if (unreadCount > 0) {
                  handleAllReadModal()
                }
              }}>
                تغییر وضعیت همه به خوانده شده
              </span>
            </div>
          </div>
         )}
        </div>
        <div className={style.wrapper}>
          {list.length !== 0 ? (
            <>
            <table>
              <thead>
                <tr>
                  <th>ردیف</th>
                  <th>نوع اعلان</th>
                  <th>عنوان</th>
                  <th>توضیحات</th>
                  <th>زمان</th>
                  <th>حذف</th>
                </tr>
              </thead>
              <tbody>
                {list ? (
                  list.map((items, index) => {
                    return(
                      <tr key={index} className={items.is_read ? '' : `${style.unreadNotif}`}>
                        <td>{index + 1}</td>
                        <td>{NotifCategory[items.category] ? NotifCategory[items.category] : items.category}</td>
                        <td>{items.title}</td>
                        <td>{items.message}</td>
                        <td>{toPersianDigits(items.created_at_jalali)}</td>
                        <td className={style.actions}><UilTrashAlt onClick={() => handleDeleteModal(items)} /></td>
                      </tr>
                    )
                  })
                ) : (
                  <p>اطلاعیه ای وجود ندارد!</p>
                ) }
              </tbody>
            </table>
            {list.length > 10 && (
              <div className={style.pagination}>
                <button onClick={handleNext} disabled={page === totalPages}><UilAngleRight /></button>
                <span>{totalPages} / {page}</span>
                <button onClick={handlePrev} disabled={page === 1}><UilAngleLeft /></button>
              </div>
            )}
            </>
          ) : (
            <p>در حال حاضر اعلانی برای شما وجود ندارد.</p>
          )}
        </div>
      </div>
      {deleteModal && (
        <Modal handleModal={handleDeleteModal} height='200px'>
          <div className={style.deleteModal}>
            <p>آیا از حذف کردن "{selectedNotif.title}" مطمئن هستید؟</p>
            <div className={style.buttons}>
              <button className={style.deleteBtn} onClick={() => deleteNotif(selectedNotif.id)}>حذف</button>
              <button className={style.cancleBtn} onClick={handleDeleteModal}>لغو</button>
            </div>
          </div>
        </Modal>
      )}
      {allReadModal && (
        <Modal handleModal={handleAllReadModal} height='200px'>
          <div className={style.deleteModal}>
            <p>آیا از تغییر وضعیت همه‌ی اعلان ها به "خوانده شده" مطمئن هستید؟</p>
            <div className={style.buttons}>
              <button className={style.deleteBtn} onClick={() => handleMarkAllRead()}>بله</button>
              <button className={style.cancleBtn} onClick={handleAllReadModal}>لغو</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default NotifList