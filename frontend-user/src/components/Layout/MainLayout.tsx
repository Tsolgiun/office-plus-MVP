import React from 'react';
import { Layout, Menu, Button, Space, theme } from 'antd';
import {
  HomeOutlined,
  BuildOutlined,
  SearchOutlined,
  HeartOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const { Header, Content } = Layout;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledHeader = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  width: 100%;
  z-index: 1;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const Logo = styled(Link)`
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
  margin-right: 48px;
`;

const StyledContent = styled(Content)`
  margin-top: 64px;
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #f0f2f5;
`;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  theme.useToken(); // Initialize theme token
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = false; // TODO: Replace with actual auth state

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/home">Home</Link>,
    },
    {
      key: 'buildings',
      icon: <BuildOutlined />,
      label: <Link to="/buildings">Buildings</Link>,
    },
    {
      key: 'offices',
      icon: <BuildOutlined />,
      label: <Link to="/offices">Offices</Link>,
    },
    {
      key: 'search',
      icon: <SearchOutlined />,
      label: <Link to="/search">Search</Link>,
    },
  ];

  const userMenuItems = isLoggedIn ? [
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: <Link to="/favorites">Favorites</Link>,
    },
    {
      key: 'appointments',
      icon: <CalendarOutlined />,
      label: <Link to="/appointments">Appointments</Link>,
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Profile</Link>,
    },
  ] : [];

  return (
    <StyledLayout>
      <StyledHeader>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Logo to="/">Office Plus</Logo>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname.split('/')[1] || 'home']}
            items={menuItems}
          />
        </div>
        <Space>
          {isLoggedIn ? (
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname.split('/')[1]]}
              items={userMenuItems}
            />
          ) : (
            <Space>
              <Button type="text" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                Register
              </Button>
            </Space>
          )}
        </Space>
      </StyledHeader>
      <StyledContent>
        {children}
      </StyledContent>
    </StyledLayout>
  );
};

export default MainLayout;
