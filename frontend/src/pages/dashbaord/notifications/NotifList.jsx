import React, { useEffect, useState } from 'react'
import style from './NotifList.module.scss';
import api from '../../../hooks/api';
import toPersianDigits from '../../../hooks/convertNumber';
import { UilTrashAlt, UilAngleLeft , UilAngleRight, UilMegaphone, UilCalendar, UilUsdCircle, UilSignin, UilLaptop, UilCheckSquare, UilSetting } from '@iconscout/react-unicons'
import Modal from '../../../components/GlobalComponents/Modal/Modal';
import { useToast } from '../../../context/NotificationContext';
import { useSelector, useDispatch } from "react-redux";
import { 
  deleteNotification,
  fetchNotifications,
  fetchUnreadCount,
  markAllAsRead,
  markNotificationAsRead,
  markNotificationReadLocal,
  fetchNextNotifications,
  fetchPrevNotifications,
  fetchNotificationsByPage,
} from '../../../store/notificationSlice';

import BackButton from '../../../components/dashboards/backButton/BackButton';
import { isToday, isYesterday, parseISO, formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import NotifCard from './notifCard/index';
import Pagination from '../../../components/GlobalComponents/Pagination/Pagination';
import NewtonLoader from '../../../components/GlobalComponents/NewtonLoader/NewtonLoader';
import NotifCardSkeleton from './notifCardSkeleton/NotifCardSkeleton';

export function groupNotifications(notifs) {
  const grouped = {
    today: [],
    yesterday: [],
    older: [],
  };

  notifs.forEach((n) => {
    const date = parseISO(n.created_at);

    if (isToday(date)) {
      grouped.today.push(n);
    } else if (isYesterday(date)) {
      grouped.yesterday.push(n);
    } else {
      grouped.older.push(n);
    }
  });

  return grouped;
}

const NotifList = () => {

  const { notify } = useToast();
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [onCancelCallback, setOnCancelCallback] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [allReadModal, setAllReadModal] = useState(false);
  
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRead, setFilterRead] = useState(null);


  const dispatch = useDispatch();
  const { list, loading, page, totalPages, unreadCount, next, previous} = useSelector(
    state => state.notifications
  );

  const applyFilter = ({ category = filterStatus, is_read = filterRead }) => {
    setFilterStatus(category);
    setFilterRead(is_read);

    dispatch(
      fetchNotifications({
        page: 1,
        category,
        is_read,
      })
    );
  };

  const handleDeleteModal = (items, onCancel = null) => {
    if (items !== null && items !== false) {
      setSelectedNotif(items);
      setOnCancelCallback(() => onCancel); // ← callback ذخیره میشه
    }
    setDeleteModal(!deleteModal);
  };

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


  const handleReadNotif = (item) => {
    dispatch(markNotificationReadLocal(item.id));
    dispatch(markNotificationAsRead(item));
  }


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

  const grouped = groupNotifications(list);


  return (
    <div className={style.NotifList}>
      <div className={style.container}>
        <BackButton route='/dashboard' title='بازگشت' />
        <div className={style.header}>
          <div className={style.headerTitle}>
            <h3>لیست اعلان های شما</h3>
            <span>{unreadCount} جدید</span>
          </div>
          <div className={style.actions}>
            <button 
              className={`${style.markAllRead} ${unreadCount === 0 ? style.disabled : ''}`}
              onClick={() => {
                if (unreadCount > 0) {
                  handleAllReadModal()
                }
              }}
            >
              خواندن همه <UilCheckSquare />
            </button>
            {/* <div className={style.filterDropdown}>
              <button
                className={style.dropdownToggle}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                فیلتر نوتیف‌ها <UilSetting />
              </button>
            </div> */}
          </div>
        </div>

        <div className={style.toolbar}>
          <div className={style.btnContainer}>
            <button
              className={`${style.filterObj} ${filterStatus === '' && filterRead === null ? style.active : ''}`}
              onClick={() =>
                applyFilter({
                  category: "",
                  is_read: null,
                })
              }
            >
              همه اعلان ها
            </button>
            <button
              className={`${style.filterObj} ${filterStatus === '' && filterRead === false ? style.active : ''}`}
              onClick={() =>
                applyFilter({
                  category: "",
                  is_read: false,
                })
              }
            >
              خوانده نشده
            </button>
            <button
              className={`${style.filterObj} ${filterStatus === 'tuition' && filterRead === null ? style.active : ''}`}
              onClick={() =>
                applyFilter({
                  category: "tuition",
                  is_read: null,
                })
              }
            >
              مالی
            </button>
          </div>
        </div>
        <div className={style.wrapper}>
          {loading ? (
            <div className={style.skleteonContainer}>
              {[1,2,3,4].map((item) => (
                <NotifCardSkeleton key={item} />
              ))}
            </div>
          ) : (
            <>
              {grouped.today.length > 0 && (
                <div className={style.cardContainer}>
                  <h3>امروز</h3>
                  {grouped.today.map((item) => (
                    <NotifCard
                      key={item.id}
                      item={item}
                      handleDelete={handleDeleteModal}
                      handleRead={handleReadNotif}
                    />
                  ))}
                </div>
              )}

              {grouped.yesterday.length > 0 && (
                <div className={style.cardContainer}>
                  <h3>دیروز</h3>
                  {grouped.yesterday.map((item) => (
                    <NotifCard
                      key={item.id}
                      item={item}
                      handleDelete={handleDeleteModal}
                      handleRead={handleReadNotif}
                    />
                  ))}
                </div>
              )}

              {grouped.older.length > 0 && (
                <div className={style.cardContainer}>
                  <h3>قدیمی‌تر</h3>
                  {grouped.older.map((item) => (
                    <NotifCard
                      key={item.id}
                      item={item}
                      handleDelete={handleDeleteModal}
                      handleRead={handleReadNotif}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!loading && (
        <div className={style.paginationWrapper}>
          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            onNext={() => {
              if (next) {
                dispatch(fetchNextNotifications())
              }
            }}
            onPrev={() => {
              if (previous) {
                dispatch(fetchPrevNotifications())
              }
            }}
            onPageChange={(page) => {
              dispatch(fetchNotificationsByPage(page));
            }}
          />
        </div>
      )}
      {deleteModal && (
        <Modal handleModal={handleDeleteModal}>
          <div className={style.deleteModal}>
            <p>آیا از حذف کردن "{selectedNotif.title}" مطمئن هستید؟</p>
            <div className={style.buttons}>
              <button className={style.deleteBtn} onClick={() => deleteNotif(selectedNotif.id)}>حذف</button>
              {/* <button className={style.cancleBtn} onClick={handleDeleteModal}>لغو</button> */}
              <button className={style.cancleBtn} onClick={() => {
                if (onCancelCallback) onCancelCallback(); // ← x رو reset میکنه
                handleDeleteModal(false);
              }}>
                لغو
              </button>
            </div>
          </div>
        </Modal>
      )}
      {allReadModal && (
        <Modal handleModal={handleAllReadModal} height='200px'>
          <div className={style.deleteModal}>
            <p>آیا از تغییر وضعیت همه‌ی اعلان ها به "خوانده شده" مطمئن هستید؟</p>
            <div className={style.buttons}>
              <button className={style.saveBtn} onClick={() => handleMarkAllRead()}>بله</button>
              <button className={style.cancleBtn} onClick={handleAllReadModal}>لغو</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default NotifList