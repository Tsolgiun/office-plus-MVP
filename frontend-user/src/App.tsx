import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import { ThemeProvider } from 'styled-components';
import MainLayout from './components/Layout/MainLayout';
import Buildings from './pages/Buildings';
import Offices from './pages/Offices';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Favorites from './pages/Favorites';
import BuildingDetail from './pages/Buildings/BuildingDetail';
import OfficeDetail from './pages/Offices/OfficeDetail';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import CreateAppointment from './pages/Appointment/CreateAppointment';
import GetAppointment from './pages/Appointment/GetAppointment';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
    fontFamily: 'Red Hat Display, Noto Sans SC, sans-serif',
  },
};

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh' 
  }}>
    <Spin size="large" />
  </div>
);

const App: React.FC = () => {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <ConfigProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <Router>
          <MainLayout>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Buildings />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/buildings" element={<Buildings />} />
                <Route path="/buildings/:id" element={<BuildingDetail />} />
                <Route path="/buildings/:buildingId/offices/:officeId" element={<OfficeDetail />} />
                <Route path="/buildings/:buildingId/appointment" element={<CreateAppointment />} />
                <Route path="/offices" element={<Offices />} />
                <Route path="/offices/:id" element={<OfficeDetail />} />
                
                {/* Protected Routes */}
                <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/appointments" element={<GetAppointment />} />
                <Route path="/profile" element={<ProtectedRoute><div>Profile</div></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </MainLayout>
        </Router>
      </ThemeProvider>
    </ConfigProvider>
  );
};

export default App;
