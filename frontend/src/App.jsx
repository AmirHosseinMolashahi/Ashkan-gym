import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import HomeLayouts from './layouts/homeLayouts/HomeLayouts'
import Home from './pages/home/Home';
import DashboardLayouts from './layouts/dashboardLayouts/DashboardLayouts';
import Dashbaord from './pages/dashbaord/Dashbaord';
import Registration from './pages/registrations/Registration';
import ProtectedRoute from './wrapper/ProtectedRoute';
import EditProfile from './pages/dashbaord/profile/Profile';
import Schedule from './pages/dashbaord/schedule/Schedule';
import AnnouncementList from './pages/dashbaord/announcements/AnnouncementList';
import AnnounceForm from './pages/dashbaord/announcements/announceForm/AnnounceForm';
import NotifList from './pages/dashbaord/notifications/NotifList';
import { useToast } from './context/NotificationContext';
import { addNotification, deleteNotification } from './store/notificationSlice';
import { fetchNotifications, fetchUnreadCount, selectUnreadNotifications,  } from "./store/notificationSlice";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "./store/userSlice";
import StudentRegisterations from './pages/dashbaord/studentRegistrations/StudentRegisterations';
import Courses from './pages/dashbaord/courses/Courses';
import CoursesDetail from './pages/dashbaord/courses/coursesDetail/CoursesDetail';
import AthleteCourse from './pages/dashbaord/athleteCourse/AthleteCourse';
import Payment from './pages/dashbaord/payment/Payment';
import PaymentAthletes from './pages/dashbaord/payment/paymentAthletes/PaymentAthletes';
import StudentPayment from './pages/dashbaord/studentPayment/studentPayment';
import UserManagement from './pages/dashbaord/userManagement/UserManagement';
import ManagerEditUser from './pages/dashbaord/userManagement/managerEditUser/ManagerEditUser';
import AddCourse from './pages/dashbaord/courses/addCourse/AddCourse';
import EditCourse from './pages/dashbaord/courses/editCourse/EditCourse';
import NotFound from './components/NotFound/NotFound';
import Unauthorized from './components/Unauthorized/Unauthorized';
import { AnimatePresence, motion } from "framer-motion";



const PageWrapper = ({ children }) => {
    return (
      <motion.div
        initial={{ opacity: 0, x: 25 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -25 }}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.div>
    );
  }

function App() {
  const { notify } = useToast();

  const dispatch = useDispatch();
  const location = useLocation();

  const { user } = useSelector(state => state.auth);
  
  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  const wsRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    if (wsRef.current) return;

    let socket;
    let reconnectTimeout;

    const connect = () => {
      socket = new WebSocket("ws://localhost:8000/ws/notifications/");
      wsRef.current = socket;

      socket.onopen = () => {
        console.log("🔗 WebSocket connected");
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.action === "delete") {
          dispatch(deleteNotification(data.id));
        } else {
          dispatch(addNotification(data));
          dispatch(selectUnreadNotifications());
          notify(data.title, data.type ?? "info")
        }
      };

      socket.onclose = () => {
        console.log("❌ WebSocket closed, retrying...");
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user, dispatch, notify]);

  useEffect(() => {
    if (user) {
      console.log("👤 user is ready → fetch notifications");
      dispatch(fetchNotifications());
    }
  }, [user, dispatch, notify]);

  return (
    <AnimatePresence mode="wait">  
      <Routes location={location}>
        <Route element={<HomeLayouts />}>
          <Route path='/' element={<Home />} />
          <Route path="/registration/login" element={
            <PageWrapper>
              <Registration />
            </PageWrapper>
            } />
        </Route>
        <Route element={<DashboardLayouts />}>
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <PageWrapper><Dashbaord /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/profile' element={
            <ProtectedRoute>
              <PageWrapper><EditProfile /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/schedule' element={
            <ProtectedRoute>
              <PageWrapper><Schedule /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/announcements' element={
            <ProtectedRoute>
              <PageWrapper><AnnouncementList /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/announcements/create' element={
            <ProtectedRoute allowedRoles={'manager'}>
              <PageWrapper><AnnounceForm /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/announcements/edit/:id' element={
            <ProtectedRoute allowedRoles={'manager'}>
              <PageWrapper><AnnounceForm mode="edit" /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/notifications' element={
            <ProtectedRoute>
              <PageWrapper><NotifList /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/student-register' element={
            <ProtectedRoute allowedRoles={'manager', 'coach'}>
              <PageWrapper><StudentRegisterations /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/courses' element={
            <ProtectedRoute allowedRoles={'manager', 'coach'}>
              <PageWrapper><Courses /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/courses/add' element={
            <ProtectedRoute allowedRoles={'manager'}>
              <PageWrapper><AddCourse /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/courses/:id/edit' element={
            <ProtectedRoute allowedRoles={'manager'}>
              <PageWrapper><EditCourse /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/courses/:id' element={
            <ProtectedRoute allowedRoles={'manager', 'coach'}>
              <PageWrapper><CoursesDetail /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/my-courses' element={
            <ProtectedRoute>
              <PageWrapper><AthleteCourse /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/payment' element={
            <ProtectedRoute allowedRoles={'manager', 'coach'}>
              <PageWrapper><Payment /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/payment/courses/:courseId' element={
            <ProtectedRoute allowedRoles={'manager', 'coach'}>
              <PageWrapper><PaymentAthletes /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/student-payment' element={
            <ProtectedRoute>
              <PageWrapper><StudentPayment /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/user-management' element={
            <ProtectedRoute allowedRoles={'manager', 'coach'}>
              <PageWrapper><UserManagement /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path='/dashboard/user-management/:id/edit' element={
            <ProtectedRoute allowedRoles={'manager', 'coach'}>
              <PageWrapper><ManagerEditUser /></PageWrapper>
            </ProtectedRoute>
          } />
        </Route>
        <Route path="*" element={<NotFound />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
