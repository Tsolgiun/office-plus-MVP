import React from 'react';
import { Layout, Menu, Button, Space, theme, Dropdown } from 'antd';
import {
  BuildOutlined,
  HeartOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../../store/authStore';

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

const StyledMenu = styled(Menu)`
  .ant-menu-item {
    display: inline-flex;
    align-items: center;
    margin: 0 4px;
    
    a {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
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
  const { isLoggedIn, logout, user } = useAuthStore();

  const menuItems = [
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
          <StyledMenu
            mode="horizontal"
            selectedKeys={[location.pathname.split('/')[1] || 'buildings']}
            items={menuItems}
          />
        </div>
        <Space>
          {isLoggedIn ? (
            <Space>
              <StyledMenu
                mode="horizontal"
                selectedKeys={[location.pathname.split('/')[1]]}
                items={userMenuItems}
              />
              <Dropdown menu={{
                items: [{
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '注销',
                  onClick: () => {
                    logout();
                    navigate('/');
                  }
                }]
              }}>
                <Button type="text" icon={<UserOutlined />}>
                  {user?.username}
                </Button>
              </Dropdown>
            </Space>
          ) : (
            <Space>
              <Button type="text" onClick={() => navigate('/login')}>
                登陆
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                注册
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
