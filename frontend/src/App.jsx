import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeLayouts from './layouts/homeLayouts/HomeLayouts'
import Home from './pages/home/Home';
import DashboardLayouts from './layouts/dashboardLayouts/DashboardLayouts';
import Dashbaord from './pages/dashbaord/Dashbaord';
import Registration from './pages/registrations/Registration';
import ProtectedRoute from './wrapper/ProtectedRoute';
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
import StudentPayment from './pages/dashbaord/studentPayment/studentPayment';
import UserManagement from './pages/dashbaord/userManagement/UserManagement';
import ManagerEditUser from './pages/dashbaord/userManagement/managerEditUser/ManagerEditUser';
import AddCourse from './pages/dashbaord/courses/addCourse/AddCourse';
import EditCourse from './pages/dashbaord/courses/editCourse/EditCourse';
import NotFound from './components/NotFound/NotFound';
import Unauthorized from './components/Unauthorized/Unauthorized';

function App() {
  const toast = useToast();
  const notify = toast?.notify;
  const dispatch = useDispatch();
  // const { notify } = useToast();
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
            <ProtectedRoute>
              <Dashbaord />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/profile' element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/schedule' element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/announcements' element={
            <ProtectedRoute>
              <Announce />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/announcements/create' element={
            <ProtectedRoute allowedRoles={'manager'}>
              <CreateAnnounce />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/announcements/:id/edit' element={
            <ProtectedRoute allowedRoles={'manager'}>
              <UpdateAnnounce />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/notifications' element={
            <ProtectedRoute>
              <NotifList />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/student-register' element={
            <ProtectedRoute allowedRoles={'manager', 'coach'}>
              <StudentRegisterations />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/courses' element={
            <ProtectedRoute allowedRoles={'manager', 'coach'}>
              <Courses />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/courses/add' element={
            <ProtectedRoute allowedRoles={'manager'}>
              <AddCourse />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/courses/:id/edit' element={
            <ProtectedRoute allowedRoles={'manager'}>
              <EditCourse />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/courses/:id' element={
            <ProtectedRoute allowedRoles={'manager', 'coach'}>
              <CoursesDetail />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/my-courses' element={
            <ProtectedRoute>
              <AthleteCourse />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/payment' element={
            <ProtectedRoute allowedRoles={'manager', 'coach'}>
              <Payment />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/payment/courses/:courseId' element={
            <ProtectedRoute allowedRoles={'manager', 'coach'}>
              <PaymentAthletes />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/student-payment' element={
            <ProtectedRoute>
              <StudentPayment />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/user-management' element={
            <ProtectedRoute allowedRoles={'manager'}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path='/dashboard/user-management/:id/edit' element={
            <ProtectedRoute allowedRoles={'manager'}>
              <ManagerEditUser />
            </ProtectedRoute>
          } />
        </Route>
        <Route path="*" element={<NotFound />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  )
}

export default App
