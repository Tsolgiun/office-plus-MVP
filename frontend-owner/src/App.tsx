import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ThemeProvider } from 'styled-components';

// Components
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Buildings from './pages/Buildings';
import CreateBuilding from './pages/CreateBuilding';
import EditBuilding from './pages/EditBuilding';
import Offices from './pages/Offices';
import CreateOffice from './pages/CreateOffice';
import EditOffice from './pages/EditOffice';
import AllOffices from './pages/AllOffices';
import Appointments from './pages/Appointments';
import Profile from './pages/Profile';

// Theme configuration
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
    fontFamily: 'Red Hat Display, Noto Sans SC, sans-serif',
  },
};

const App: React.FC = () => {
  return (
    <ConfigProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="buildings" element={<Buildings />} />
                      <Route path="buildings/new" element={<CreateBuilding />} />
                      <Route path="buildings/edit/:id" element={<EditBuilding />} />
                      <Route path="offices" element={<AllOffices />} />
                      <Route path="buildings/:buildingId/offices" element={<Offices />} />
                      <Route path="buildings/:buildingId/offices/new" element={<CreateOffice />} />
                      <Route path="buildings/:buildingId/offices/edit/:officeId" element={<EditOffice />} />
                      <Route path="appointments" element={<Appointments />} />
                      <Route path="profile" element={<Profile />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </ConfigProvider>
  );
};

export default App;
