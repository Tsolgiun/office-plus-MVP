import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import { ThemeProvider } from 'styled-components';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import Buildings from './pages/Buildings';
import Offices from './pages/Offices';

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
  return (
    <ConfigProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <Router>
          <MainLayout>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<div>Login</div>} />
                <Route path="/register" element={<div>Register</div>} />
                <Route path="/buildings" element={<Buildings />} />
                <Route path="/buildings/:id" element={<div>Building Detail</div>} />
                <Route path="/buildings/:buildingId/offices/:officeId" element={<div>Office Detail</div>} />
                <Route path="/offices" element={<Offices />} />
                <Route path="/search" element={<div>Search</div>} />
                
                {/* Protected Routes - To be implemented */}
                <Route path="/favorites" element={<div>Favorites</div>} />
                <Route path="/appointments" element={<div>Appointments</div>} />
                <Route path="/profile" element={<div>Profile</div>} />
              </Routes>
            </Suspense>
          </MainLayout>
        </Router>
      </ThemeProvider>
    </ConfigProvider>
  );
};

export default App;
