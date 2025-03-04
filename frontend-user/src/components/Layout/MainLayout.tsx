import React from 'react';
import { ChatWidget } from '../Chat/ChatWidget';
import { Layout, Menu, Button, theme, Dropdown } from 'antd';
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
  height: 100%;
  display: inline-flex;
  align-items: center;
`;

const StyledMenu = styled(Menu)`
  line-height: 64px;
  height: 64px;
  border-bottom: none;

  .ant-menu-item {
    display: inline-flex;
    align-items: center;
    margin: 0 4px;
    padding: 0 16px;
    height: 64px;
    line-height: 64px;
    
    a {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 100%;
    }
  }
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  height: 64px;
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
      label: <Link to="/buildings">写字楼</Link>,
    },
    {
      key: 'offices',
      icon: <BuildOutlined />,
      label: <Link to="/offices">办公室</Link>,
    },
  ];

  const userMenuItems = isLoggedIn ? [
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: <Link to="/favorites">收藏</Link>,
    },
    {
      key: 'appointments',
      icon: <CalendarOutlined />,
      label: <Link to="/appointments">预约</Link>,
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">个人资料</Link>,
    },
  ] : [];

  return (
    <StyledLayout>
      <StyledHeader>
        <HeaderSection>
          <Logo to="/">office直租</Logo>
          <StyledMenu
            mode="horizontal"
            selectedKeys={[location.pathname === '/' ? '' : location.pathname.split('/')[1]]}
            items={menuItems}
          />
        </HeaderSection>
        <HeaderSection>
          {isLoggedIn ? (
            <>
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
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button type="text" onClick={() => navigate('/login')}>
                登陆
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                注册
              </Button>
            </div>
          )}
        </HeaderSection>
      </StyledHeader>
      <StyledContent>
        {children}
      </StyledContent>
      <ChatWidget />
    </StyledLayout>
  );
};

export default MainLayout;
