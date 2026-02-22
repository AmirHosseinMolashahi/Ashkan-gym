import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeLayouts from './layouts/homeLayouts/HomeLayouts'
import Home from './pages/home/Home';
import DashboardLayouts from './layouts/dashboardLayouts/DashboardLayouts';
import Dashbaord from './pages/dashbaord/Dashbaord';
import Registration from './pages/registrations/Registration';
import PrivateRoute from './wrapper/PrivateRoute';
import EditProfile from './pages/dashbaord/profile/Profile';
import Schedule from './pages/dashbaord/schedule/Schedule';
import Announce from './pages/dashbaord/announcements/Announce';
import CreateAnnounce from './pages/dashbaord/announcements/createAnnounce/CreateAnnounce';
import UpdateAnnounce from './pages/dashbaord/announcements/updateAnnounce/UpdateAnnounce';
import NotifList from './pages/dashbaord/notifications/NotifList';
import { useToast } from './context/notificationContext';
import { addNotification, deleteNotification } from './store/notificationSlice';
import { fetchNotifications, fetchUnreadCount, fetchUnreadNotifList } from "./store/notificationSlice";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "./store/userSlice";
import StudentRegisterations from './pages/dashbaord/studentRegistrations/StudentRegisterations';
import Courses from './pages/dashbaord/courses/Courses';
import CoursesDetail from './pages/dashbaord/courses/coursesDetail/CoursesDetail';
import AthleteCourse from './pages/dashbaord/athleteCourse/AthleteCourse';
import Payment from './pages/dashbaord/payment/Payment';
import PaymentAthletes from './pages/dashbaord/payment/paymentAthletes/PaymentAthletes';

function App() {
  const dispatch = useDispatch();
  const { notify } = useToast();
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
          dispatch(fetchUnreadCount());
          dispatch(fetchUnreadNotifList());
          notify(data.title, data.type ?? "info");
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
  }, [user, dispatch]);

  useEffect(() => {
    if (user) {
      console.log("👤 user is ready → fetch notifications");
      dispatch(fetchNotifications());
      dispatch(fetchUnreadCount());
      dispatch(fetchUnreadNotifList());
    }
  }, [user, dispatch]);

  return (
    <Router>
      <Routes>
        <Route element={<HomeLayouts />}>
          <Route path='/' element={<Home />} />
          <Route path="/registration/login" element={<Registration />} />
        </Route>
        <Route element={<DashboardLayouts />}>
          <Route path='/dashboard' element={
            <PrivateRoute>
              <Dashbaord />
            </PrivateRoute>
          } />
          <Route path='/dashboard/profile' element={
            <PrivateRoute>
              <EditProfile />
            </PrivateRoute>
          } />
          <Route path='/dashboard/schedule' element={
            <PrivateRoute>
              <Schedule />
            </PrivateRoute>
          } />
          <Route path='/dashboard/announcements' element={
            <PrivateRoute>
              <Announce />
            </PrivateRoute>
          } />
          <Route path='/dashboard/announcements/create' element={
            <PrivateRoute>
              <CreateAnnounce />
            </PrivateRoute>
          } />
          <Route path='/dashboard/announcements/:id/edit' element={
            <PrivateRoute>
              <UpdateAnnounce />
            </PrivateRoute>
          } />
          <Route path='/dashboard/notifications' element={
            <PrivateRoute>
              <NotifList />
            </PrivateRoute>
          } />
          <Route path='/dashboard/student-register' element={
            <PrivateRoute>
              <StudentRegisterations />
            </PrivateRoute>
          } />
          <Route path='/dashboard/courses' element={
            <PrivateRoute>
              <Courses />
            </PrivateRoute>
          } />
          <Route path='/dashboard/courses/:id' element={
            <PrivateRoute>
              <CoursesDetail />
            </PrivateRoute>
          } />
          <Route path='/dashboard/my-courses' element={
            <PrivateRoute>
              <AthleteCourse />
            </PrivateRoute>
          } />
          <Route path='/dashboard/payment' element={
            <PrivateRoute>
              <Payment />
            </PrivateRoute>
          } />
          <Route path='/dashboard/payment/courses/:courseId' element={
            <PrivateRoute>
              <PaymentAthletes />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
