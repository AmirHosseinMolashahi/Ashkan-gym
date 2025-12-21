import React, { useEffect, useState } from 'react';
import style from './AnnounceList.module.scss';
import api from '../../../hooks/api';
import toPersianDigits from '../../../hooks/convertNumber';
import { UilTrashAlt, UilEdit, UilCheckCircle, UilEye, UilCheck ,UilTimes, UilAngleRight, UilAngleLeft  } from '@iconscout/react-unicons'
import Modal from '../../GlobalComponents/Modal/Modal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/NotificationContext';
import { useSelector } from 'react-redux';

const AnnounceList = () => {

  const [listItems, setListItems] = useState()
  const [page, setPage] = useState()
  const [totalPages, setTotalPages] = useState()
  const { notify } = useToast();
  const { user } = useSelector(state => state.auth);
  const [modal, setModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null)
  const [prevModal, setPrevModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const navigate = useNavigate()

  const fetchListItems = async (page = 1) => {
    try {
      const res = await api.get(`announcements/lists/?page=${page}`);
      setListItems(res.data.results)
      setPage(page)
      setTotalPages(Math.ceil(res.data.count / 10));
      console.log(res.data)
    } catch (err) {
      console.log(err)
      notify('خطا در دریافت اطلاعات!', 'error')
    }
  }

  useEffect(() => {
    fetchListItems();
  }, []);

  const handleNext = () => {
    if (page < totalPages) {
      fetchListItems(page+1)
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      fetchListItems(page-1)
    }
  };


  const handleModal = (item = null) => {
    if (item !== null) {
      setSelectedItem(item);
    }
    setModal(!modal)
  }

  const handlePrevModal = (item = null) => {
    if (item !== null) {
      setSelectedItem(item);
    }
    setPrevModal(!prevModal)
  }

  const handleDeleteModal = (item = null) => {
    if (item !== null) {
      setSelectedItem(item);
    }
    setDeleteModal(!deleteModal)
  }


  const handleReadAnnounce = async (id) => {
    try {
      await api.post(`announcements/${id}/read/`);
      fetchListItems();
    } catch (err) {
      notify('خطا در تغییر وضیعیت به خوانده شده!', 'error')
    }
  }

  const handleDeleteAnnounce = async (id) => {
    try {
      await api.delete(`announcements/${id}/delete/`);
      notify('اطلاعیه با موفقیت حذف شد!', 'info')
      handleDeleteModal();
      fetchListItems();
    } catch (err) {
      notify('خطا در حذف اطلاعیه!', 'error')
    }
  }

  return (
    <div className={style.announceList}>
      <div className={style.listContainer}>
          {user.role === 'manager' ? (
            <>
              <table>
                <thead>
                  <tr>
                    <th>عنوان</th>
                    <th>ایجاد کننده</th>
                    <th>تاریخ و ساعت</th>
                    <th>تعداد دریافت کنندگان</th>
                    <th>وضعیت اطلاعیه</th>
                    <th>تغییر / حذف</th>
                    <th>نمایش</th>
                  </tr>
                </thead>
                <tbody>
                  {listItems ? (
                    listItems.map((items, index) => {
                      return(
                        <tr key={index}>
                          <td>{items.title}</td>
                          <td>{items.user.full_name}</td>
                          <td>{toPersianDigits(items.time_jalali)}</td>
                          <td>{toPersianDigits(items.recipients_count)}</td>
                          <td>{items.status_label}</td>
                          <td className={style.actions}><UilTrashAlt onClick={() => handleDeleteModal(items)} /> <UilEdit onClick={() => navigate(`${items.id}/edit`)}/></td>
                          <td className={style.prevButton}><UilEye onClick={() => handlePrevModal(items)} /></td>
                        </tr>
                      )
                    })
                  ) : (
                    <p>اطلاعیه ای وجود ندارد!</p>
                  ) }
                </tbody>
              </table>
              <div className={style.pagination}>
                <button onClick={handleNext} disabled={page === totalPages}><UilAngleRight /></button>
                <span>{totalPages} / {page}</span>
                <button onClick={handlePrev} disabled={page === 1}><UilAngleLeft /></button>
              </div>
            </>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>ردیف</th>
                    <th>عنوان</th>
                    <th>توضیحات</th>
                    <th>تاریخ و ساعت</th>
                    <th>نمایش</th>
                  </tr>
                </thead>
                <tbody>
                  {listItems ? (
                    listItems.map((items, index) => {
                      return(
                        <tr key={index} className={items.is_new ? `${style.newAnnounce}` : '' }>
                          <td>
                            {items.is_new ? <span></span> : ' ' }
                            {index + 1}
                          </td>
                          <td>{items.title}</td>
                          <td>{items.descriptions.length > 30 
                          ? items.descriptions.slice(0, 30) + '...' 
                          : items.descriptions}
                          </td>
                          <td>{toPersianDigits(items.time_jalali)}</td>
                          <td className={style.viewAnnounce}>
                            <button onClick={() => {
                              handleModal(items);
                              items.is_new ? handleReadAnnounce(items.id) : ' '; 
                            }}>
                              <UilEye />      
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>اطلاعیه ای وجود ندارد!</tr>
                  ) }
                </tbody>
              </table>
              <div className={style.pagination}>
                <button onClick={handleNext} disabled={page === totalPages}><UilAngleRight /></button>
                <span>{totalPages} / {page}</span>
                <button onClick={handlePrev} disabled={page === 1}><UilAngleLeft /></button>
              </div>
            </>
          )}
      </div>
      {modal && (
        <Modal handleModal={handleModal}>
          <h1>{selectedItem.title}</h1>
          <div style={{overflowY: 'scroll'}}>{selectedItem.descriptions}</div>
          <div>{toPersianDigits(selectedItem.time_jalali)}</div>
        </Modal>
      )}
      {prevModal && (
        <Modal handleModal={handlePrevModal} width='500px' height='500px'>
          <div className={style.prevModal}>
            <h3>{selectedItem.title}</h3>
            <div className={style.descriptions}>{selectedItem.descriptions}</div>
            <div className={style.recipients_list}>
              <h3>لیست دریافت کنندگان</h3>
              <ul className={style.list}>
                {selectedItem.recipients_status.map((item, index) => {
                  return (
                    <li key={index} className={style.list_item}>
                      <span>{item.full_name}</span>
                      {item.is_read ? (
                        <span className={style.status}>
                          مشاهده شده است <UilCheck fill='#2ECC71'/>
                        </span>
                        ) : (
                        <span className={style.status}>
                          مشاهده نشده است <UilTimes fill='#C1121F' />
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
            <div>{toPersianDigits(selectedItem.time_jalali)}</div>
          </div>
        </Modal>
      )}
      {deleteModal && (
        <Modal handleModal={handleDeleteModal} height='200px'>
          <div className={style.deleteModal}>
            <p>آیا از حذف کردن "{selectedItem.title}" مطمئن هستید؟</p>
            <div className={style.buttons}>
              <button className={style.deleteBtn} onClick={() => handleDeleteAnnounce(selectedItem.id)}>حذف</button>
              <button className={style.cancleBtn} onClick={handleDeleteModal}>لغو</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AnnounceList