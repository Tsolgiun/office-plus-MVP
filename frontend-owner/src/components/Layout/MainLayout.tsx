import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BuildOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import styled from 'styled-components';

const { Header, Sider, Content } = Layout;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledLogo = styled.div`
  height: 64px;
  padding: 16px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
`;

const StyledHeader = styled(Header)`
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledContent = styled(Content)`
  margin: 24px 16px;
  padding: 24px;
  background: #fff;
  min-height: 280px;
  overflow-y: auto;
`;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(['offices']);
  const { token: { colorBgContainer } } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: <Link to="/dashboard">数据面板</Link>,
    },
    {
      key: 'buildings',
      icon: <BuildOutlined />,
      label: <Link to="/buildings">写字楼</Link>,
    },
    {
      key: 'offices',
      icon: <AppstoreOutlined />,
      label: '办公室',
      children: [
        {
          key: 'offices',
          label: <Link to="/offices">所有的办公室</Link>,
        },
        {
          key: 'offices-by-building',
          label: <Link to="/buildings">通过写字楼</Link>,
        }
      ]
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <StyledLayout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <StyledLogo>
          {collapsed ? 'OP' : 'Office Plus'}
        </StyledLogo>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <StyledHeader style={{ background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" style={{ height: '64px' }}>
              <Avatar icon={<UserOutlined />} />
              {!collapsed && <span style={{ marginLeft: 8 }}>{user?.username}</span>}
            </Button>
          </Dropdown>
        </StyledHeader>
        <StyledContent style={{ background: colorBgContainer }}>
          {children}
        </StyledContent>
      </Layout>
    </StyledLayout>
  );
};

export default MainLayout;
