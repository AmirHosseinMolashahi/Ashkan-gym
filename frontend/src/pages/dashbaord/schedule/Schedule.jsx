import React, { useState, useMemo, useEffect } from 'react';
import styles from './Schedule.module.scss';
import Header from '../../../components/dashboards/schedule/Header/Header';
import SideSection from '../../../components/dashboards/schedule/SideSection/SideSection';
import FilterBar from '../../../components/dashboards/schedule/FilterBar/FilterBar';
import TaskList from '../../../components/dashboards/schedule/TaskList/TaskList';
import api from '../../../hooks/api';
import Pagination from '../../../components/GlobalComponents/Pagination/Pagination';
import Modal from '../../../components/GlobalComponents/Modal/Modal';
import NewTaskForm from '../../../components/dashboards/schedule/newTaskForm/NewTaskForm';
import { useToast } from '../../../context/NotificationContext';
import Loader from '../../../components/GlobalComponents/NewLoader/Loader';
import NewTaskFormSkeleton from '../../../components/dashboards/schedule/newTaskForm/newTaskFormSkeleton/NewTaskFormSkeleton';
import BackButton from '../../../components/dashboards/backButton/BackButton';


const Schedule = () => {
  const [tasks, setTasks] = useState([]);
  const [finishedFilter, setFinishedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all')

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const [newTaskModal, setNewTaskModal] = useState(false)
  const [updateTaskModal, setUpdateTaskModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  const [selectedReminder, setSelectedReminder] = useState(null)


  const { notify } = useToast()
  const [pageLoading, setPageLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)



  const handleDeleteModal = (item = null) => {
    if (!deleteModal) {
      setSelectedReminder(item)
      setDeleteModal(true)
    } else {
      setSelectedReminder(null)
      setDeleteModal(false)
    }
  }


  const handleDelete = async (id) => {
    try {
      setLoading(true)
      await api.delete(`/reminder/${id}/delete/`);
      notify('یادآور با موفقیت حذف شد 👍🏻', 'info')
      setTasks(prev => prev.filter(task => task.id !== id));
      handleDeleteModal()
    } catch (err) {
      console.log(err.response)
      notify('خطا در حذف یادآور جدید ☹️', 'error')
    } finally {
      setLoading(false)
    }
  }


  const handleUpdateModal = (id) => {
    if (!updateTaskModal) {
      fetchReminderData(id)
      setUpdateTaskModal(true)
    } else {
      setSelectedReminder(null)
      setUpdateTaskModal(false)
    }
  }

  
  const handleSave = async (payload) => {
    try {
      setLoading(true)
      await api.post('/reminder/create/', payload)
      notify('یادآور با موفقیت ایجاد شد 👍🏻', 'success')
      fetchReminders(buildActivityUrl(page))
    } catch (err) {
      console.log(err.response)
      notify('خطا در ایجاد یادآور جدید ☹️', 'error')
    } finally {
      setNewTaskModal(false)
      setLoading(false)
    }
  }

  const fetchReminderData = async (id) => {
    try {
      const res = await api.get(`/reminder/${id}/`)
      setSelectedReminder(res.data)
      console.log(res.data)
    } catch (err) {
      console.log(err.response)
    }
  }

  const handleUpdate = async (payload) => {
    try {
      setUpdateLoading(true)
      await api.patch(`/reminder/${payload.id}/update/`, payload)
      notify('یادآور با موفقیت تغییر کرد 👍🏻', 'success')
      fetchReminders(buildActivityUrl(page))
    } catch (err) {
      console.log(err.response)
      notify('خطا در تغییر یادآور ☹️', 'error')
    } finally {
      handleUpdateModal()
      setUpdateLoading(false)
    }
  }


  const handleFinishedReminder = async (id) => {
    try {
      setLoading(true)
      await api.patch(`/reminder/${id}/finish/`)
      setTasks(prev => prev.map(a => 
        a.id === id ? { ...a, finished: true } : a
      ))
      notify('یادآور با موفقیت پایان یافت ✔️', 'success')
    } catch (err) {
      console.log(err.response)
      notify('خطا در عملیات ☹️', 'error')
    } finally {
      setLoading(false)
    }
  }


  const fetchReminders = async (
    url = '/reminder/list/'
  ) => {
    try {
      setPageLoading(true)
      let finalUrl = url;

      if (url.startsWith("http")) {
        const parsed = new URL(url);
        finalUrl = `${parsed.pathname}${parsed.search}`;
      }

      const res = await api.get(finalUrl);

      console.log(res.data.results)

      setTasks(res.data.results)
      setPage(res.data.current_page);
      setTotalPages(res.data.total_pages);
      setTotalCount(res.data.count);

      setNextPage(res.data.next);
      setPrevPage(res.data.previous);

    } catch (err) {
      console.log(err.response)
    } finally {
      setPageLoading(false)
    }
  }

    const buildActivityUrl = (pageNumber = 1) => {
    const params = new URLSearchParams();

    params.append("page", pageNumber);

    if (searchQuery.trim()) {
      params.append("search", searchQuery);
    }

    //finished
    if (finishedFilter !== "all") {
      params.append("finished", finishedFilter);
    }

    //priority
    if (priorityFilter, setPriorityFilter !== 'all') {
      params.append("priority", priorityFilter)
    }

    return `/reminder/list/?${params.toString()}`;
  };


  useEffect(() => {
    fetchReminders(buildActivityUrl(page))
  }, [page, finishedFilter, priorityFilter, searchQuery])

  if (loading) {
    return <Loader />
  }

  return (
    <div className={styles.app}>
      <BackButton route='/dashboard' title='بازگشت' />
      <Header onAddNew={() => setNewTaskModal(true)} />
      <div className={styles.body}>
        <SideSection tasks={tasks} loading={pageLoading}/>
        <main className={styles.main}>
          <FilterBar
            finishedFilter={finishedFilter}
            setFinishedFilter={setFinishedFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
          />
          <div className={styles.content}>
            <TaskList
              tasks={tasks}
              onToggle={handleFinishedReminder}
              onDelete={handleDeleteModal}
              onEdit={handleUpdateModal}
              loading={pageLoading}
            />
          </div>
          {totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onNext={() => {
                  if (nextPage) {
                    fetchReminders(nextPage);
                  }
                }}
                onPrev={() => {
                  if (prevPage) {
                    fetchReminders(prevPage);
                  }
                }}
                onPageChange={(pageNumber) => {
                  setPage(pageNumber);
                }}
              />
            </div>
          )}
        </main>
      </div>
      {newTaskModal && (
        <Modal handleModal={() => setNewTaskModal(false)}>
          <NewTaskForm 
            onSave={handleSave}
            onCancel={() => setNewTaskModal(false)}
          />
        </Modal>
      )}

      {updateTaskModal && (
        <Modal handleModal={() => handleUpdateModal()}>
          {selectedReminder === null ? (
            <NewTaskFormSkeleton />
          ) : (
            <NewTaskForm 
              mode='edit'
              data={selectedReminder}
              onSave={handleUpdate}
              onCancel={() => handleUpdateModal()}
              loading={updateLoading}
            />
          )}
        </Modal>
      )}

      {deleteModal && (
        <Modal handleModal={() => handleDeleteModal()}>
          <div className={styles.deleteModal}>
            <p>آیا از حذف کردن "{selectedReminder.title}" مطمئن هستید؟</p>
            <div className={styles.buttons}>
              <button className={styles.deleteBtn} onClick={() => handleDelete(selectedReminder.id)}>حذف</button>
              <button className={styles.cancleBtn} onClick={() => handleDeleteModal()}>
                لغو
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Schedule;
