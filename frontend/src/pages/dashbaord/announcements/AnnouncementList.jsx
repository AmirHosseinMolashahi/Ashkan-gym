import React, { useState, useEffect } from 'react';
import style from './AnnouncementList.module.scss';
import {
  UilPlus,
  UilTrashAlt,
  UilEdit,
  UilMegaphone,
  UilClock,
  UilUser,
  UilFilter,
  UilMailbox,
  UilCheckCircle,
  UilEye,
} from '@iconscout/react-unicons';
import Pagination from '../../../components/GlobalComponents/Pagination/Pagination';
import api from '../../../hooks/api';
import toPersianDigits from '../../../hooks/convertNumber';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/NotificationContext';
import Modal from '../../../components/GlobalComponents/Modal/Modal';
import { useSelector } from 'react-redux';
import { hasRole } from '../../../hooks/roleConverter';


const STATUS_CONFIG = {
  p: { label: 'منتشر شده', color: 'green' },
  r: { label: 'در بررسی',   color: 'orange' },
  d: { label: 'پیش‌نویس',   color: 'gray' },
  b: { label: 'برگشت داده شده', color: 'red' },
};

const FILTERS = [
  { label: 'همه', value: 'all' },
  { label: 'منتشر شده', value: 'p' },
  { label: 'در بررسی', value: 'r' },
  { label: 'پیش‌نویس', value: 'd' },
  { label: 'برگشت خورده', value: 'b' },
];

// --- Sub-components ---
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'gray' };
  return (
    <span className={`${style.badge} ${style[cfg.color]}`}>
      {cfg.color === 'green' && <span className={style.dot} />}
      {cfg.label}
    </span>
  );
};





// --- skeleton-card ---
const AnnouncementCardSkeleton = () => (
  <div className={`${style.card} ${style.skeletonCard}`}>
    {/* Header */}
    <div className={style.cardHeader}>
      <div className={`${style.skeleton} ${style.badgeSkeleton}`} />
      <div className={`${style.skeleton} ${style.titleSkeleton}`} />
    </div>

    {/* Body */}
    <div className={style.bodySkeleton}>
      <div className={`${style.skeleton} ${style.line}`} />
      <div className={`${style.skeleton} ${style.line}`} />
      <div className={`${style.skeleton} ${style.shortLine}`} />
    </div>

    {/* Footer */}
    <div className={style.cardFooter}>
      <div className={style.meta}>
        <div className={`${style.skeleton} ${style.metaSkeleton}`} />
        <div className={`${style.skeleton} ${style.metaSkeletonSmall}`} />
      </div>

      <div className={style.cardActions}>
        <div className={`${style.skeleton} ${style.actionSkeleton}`} />
        <div className={`${style.skeleton} ${style.actionSkeleton}`} />
      </div>
    </div>
  </div>
);


// --- announcement-card ---
const AnnouncementCard = ({ item, user,  onDelete, onEdit, onView, justRead }) => (
  <div className={`${style.card} ${!item.is_read ? style.unread : ''} ${justRead.has(item.id) ? style.active : ''}`}>
    <div className={style.cardHeader}>
      <h4 className={style.cardTitle}>{item.title}</h4>
      {hasRole(user.roles, ['manager']) ? (
        <StatusBadge status={item.status} />
      ) : (
        item.is_read === false ? (
          <span className={style.newItem}>جدید</span>
        ) : (
          <span className={style.readItem}>خوانده شده</span>
        )
      )}
    </div>

    <div className={style.cardFooter}>
      <div className={style.footerContainer}>
        <div className={style.meta}>
          <span className={style.metaItem}>
            <UilUser className={style.metaIcon} />
            <span>{item.user.full_name}</span>
            <span className={style.metaRole}>{item.role}</span>
          </span>
          <span className={style.metaItem}>
            <UilClock className={style.metaIcon} />
            <span>{toPersianDigits(item.created_at_jalali)}</span>
          </span>
        </div>

        <div className={style.cardActions}>
          {hasRole(user.roles, ['manager']) ? (
            <>
              <button
                className={`${style.actionBtn} ${style.deleteBtn}`}
                onClick={() => onDelete(item)}
                aria-label="حذف"
              >
              <UilTrashAlt />
              </button>
              <button
                className={`${style.actionBtn} ${style.editBtn}`}
                onClick={() => onEdit(item)}
                aria-label="ویرایش"
              >
                <UilEdit />
              </button>
            </>
          ) : (
            <button
              className={`${style.actionBtn} ${style.viewBtn} ${item.is_read ? style.read : ''}`}
              onClick={() => onView(item)}
              aria-label="مشاهده"
            >
              <UilEye />
            </button>
          )}
        </div>
      </div>
      {hasRole(user.roles, 'manager') && (
        <div className={style.recipients}>
          <p><UilMailbox /> دریافت کنندگان: </p>
          {item.is_global === true ? (
            <span>همه</span>
          ) : (
            <>
              {item.target_roles.length > 0 && (
                <span>
                  {item.roles_data.map((i) => {
                    if (i.name === 'coach') return 'مربیان'
                    if (i.name === 'manager') return 'مدیران'
                    if (i.name === 'athlete') return 'ورزشکاران'
                    return ''
                  }).join('، ')}
                </span>
              )}
              {item.target_classes.length > 0 && (
                <span>{item.courses_data.map(i => `کلاس ${i.title}`).join('، ')}</span>
              )}
              {item.target_users.length > 0 && (
                <span>و {toPersianDigits(item.target_users.length)}+ کاربر دیگه</span>
              )}
            </>
          )}
        </div>
      )}
    </div>


  </div>
);

// --- Main Component ---
const AnnouncementList = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { notify } = useToast()
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem ] = useState(null)
  const [previewModal, setPreviewModal] = useState(false)
  const { user } = useSelector(
    state => state.auth
  )
  const [justRead, setJustRead] = useState(new Set())

  const [announcements, setAnnouncements] = useState([])
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAnnouncements = async (
    url = '/announcements/lists/'
  ) => {
    try {
      setLoading(true);
      let finalUrl = url;
      
      if (url.startsWith("http")) {
        const parsed = new URL(url);
        finalUrl = `${parsed.pathname}${parsed.search}`;
      }

      const res = await api.get(finalUrl);
      setAnnouncements(res.data.results)
      
      setPage(res.data.current_page);
      setTotalPages(res.data.total_pages);
      setTotalCount(res.data.count);

      setNextPage(res.data.next);
      setPrevPage(res.data.previous);
      console.log(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false);
    }
  }

  const buildActivityUrl = (pageNumber = 1) => {
    const params = new URLSearchParams();

    params.append("page", pageNumber);

    // status
    if (statusFilter !== "all") {
      params.append("status", statusFilter);
    }

    return `/announcements/lists/?${params.toString()}`;
  };

  
  useEffect(() => {
    fetchAnnouncements(buildActivityUrl(page));  
  }, [statusFilter, page])


  const handleDeleteModal = (item) => {
    if (!deleteModal) {
      setSelectedItem(item)
      setDeleteModal(true)
    } else {
      setSelectedItem(null)
      setDeleteModal(false)
    }
  }

  const handlePreviewModal = (item) => {
    if (!previewModal) {
      setSelectedItem(item)
      setPreviewModal(true)
      if (!item.is_read) {
        handleView(item)
      }
    } else {
      setSelectedItem(null)
      setPreviewModal(false)
    }
  }

  const handleDelete = async (item) => {
    try {
      await api.delete(`announcements/${item.id}/delete/`);
      setDeleteModal(false)
      setSelectedItem(null)
      notify('اطلاعیه با موفقیت حذف شد!', 'info')
      fetchAnnouncements(buildActivityUrl(page));
    } catch (err) {
      notify('خطا در حذف اطلاعیه!', 'error')
    }
  };

  const handleEdit = (item) => {
    navigate(`/dashboard/announcements/edit/${item.id}`)
  };
  
  
  const handleView = async (item) => {
    try {
      await api.post(`announcements/${item.id}/read/`);

      setJustRead(prev => new Set(prev).add(item.id))
      setAnnouncements(prev => prev.map(a => 
        a.id === item.id ? { ...a, is_read: true } : a
      ))
    } catch (err) {
      console.log(err)
      notify('خطا در ارتباط با سرور!', 'error')
    }
  }

  return (
    <div className={style.page}>
      {/* ── Header ── */}
      <div className={style.pageHeader}>
        <div className={style.pageHeaderText}>
          <h2>اطلاعیه ها</h2>
          <p>مدیریت و انتشار اطلاعیه‌ها</p>
        </div>
        {hasRole(user.roles, 'manager') && (
          <button className={style.newBtn} onClick={() => navigate('/dashboard/announcements/create')}>
            <UilPlus />
            اطلاعیه‌ی جدید
          </button>
        )}
      </div>

      {/* ── Filters ── */}
      <div className={style.filters}>
        <div className={style.filterCount}>
          <UilMegaphone className={style.filterCountIcon} />
          <span>{totalCount}</span>
        </div>
        {hasRole(user.roles, 'manager') && (
          FILTERS.map((f) => (
            <button
              key={f.value}
              className={`${style.filterBtn} ${statusFilter === f.value ? style.filterActive : ''}`}
              onClick={() => {setStatusFilter(f.value); setPage(1);}}
            >
              {f.label}
              {f.value !== '' && (
                <span className={style.filterDot} data-status={f.value} />
              )}
            </button>
          ))
        )}
      </div>

      {/* ── List ── */}
      <div className={style.list}>
        {loading
        ? Array.from({ length: 3 }).map((_, i) => (
          <AnnouncementCardSkeleton key={i} />
        ))
        : announcements.map((item) => (
          <AnnouncementCard
            key={item.id}
            item={item}
            onDelete={handleDeleteModal}
            onEdit={handleEdit}
            onView={handlePreviewModal}
            user={user}
            justRead={justRead}
          />
        ))}
        {announcements.length === 0 && (
          <div className={style.empty}>اعلانی یافت نشد</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className={style.paginationWrapper}>
          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            onNext={() => {
              if (nextPage) {
                fetchAnnouncements(nextPage);
              }
            }}
            onPrev={() => {
              if (prevPage) {
                fetchAnnouncements(prevPage);
              }
            }}
            onPageChange={(pageNumber) => {
              setPage(pageNumber);
            }}  
          />
        </div>
      )}

      {deleteModal && (
        <Modal handleModal={() => setDeleteModal(false)}>
          <div className={style.deleteModal}>
            <p>آیا از حذف کردن "{selectedItem.title}" مطمئن هستید؟</p>
            <div className={style.buttons}>
              <button className={style.deleteBtn} onClick={() => handleDelete(selectedItem)}>حذف</button>
              <button className={style.cancleBtn} onClick={handleDeleteModal}>لغو</button>
            </div>
          </div>
        </Modal>
      )}

      {previewModal && (
        <Modal handleModal={() => setPreviewModal(false)}>
          <div className={style.previewModal}>
            <h3>{selectedItem.title}</h3>
            <p>{selectedItem.descriptions}</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AnnouncementList;
