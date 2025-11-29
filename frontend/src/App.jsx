import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeLayouts from './layouts/homeLayouts/HomeLayouts'
import Home from './pages/home/Home';
import DashboardLayouts from './layouts/dashboardLayouts/DashboardLayouts';
import Dashbaord from './pages/dashbaord/Dashbaord';
import Registration from './pages/registrations/Registration';
import PrivateRoute from './wrapper/PrivateRoute';
import EditProfile from './pages/dashbaord/profile/Profile';
import Schedule from './pages/dashbaord/schedule/Schedule';

function App() {

  return (
    <Router>
      <Routes>
        <Route element={<HomeLayouts />}>
          <Route path='/' element={<Home />} />
          <Route path="/registration/:type" element={<Registration />} />
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
        </Route>
      </Routes>
    </Router>
  )
}

export default App
