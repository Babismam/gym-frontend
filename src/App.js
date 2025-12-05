import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'; 
import { AuthProvider } from './context/AuthContext';

import Layout from './components/Layout';
import HomePage from './pages/HomePage/HomePage';
import Login from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import ManageMembers from './pages/ManageMembers';
import ManageTrainers from './pages/ManageTrainers';
import ManagePrograms from './pages/ManagePrograms';
import MyProgramAndAttendance from './pages/MyProgramAndAttendance';
import MySchedule from './pages/MySchedule';
import SchedulePage from './pages/SchedulePage';

import MyAssignedPrograms from './pages/MyAssignedPrograms';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route element={<Layout />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
              <Route path="/member-dashboard" element={<MemberDashboard />} />
              
              <Route path="/admin/members" element={<ManageMembers />} />
              <Route path="/admin/trainers" element={<ManageTrainers />} />
              <Route path="/admin/programs" element={<ManagePrograms />} />
              
              <Route path="/member/program" element={<MyProgramAndAttendance />} />
              <Route path="/trainer/schedule" element={<MySchedule />} />

              <Route path="/schedule" element={<SchedulePage />} />

              <Route path="/trainer/schedule" element={<MySchedule />} />
              <Route path="/trainer/programs" element={<MyAssignedPrograms />} />
            </Route>
            
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}