import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const { Title } = Typography;

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
`;

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const from = location.state?.from?.pathname || '/dashboard';

  const onFinish = async (values: LoginForm) => {
    try {
      await login(values.email, values.password);
      message.success('Login successful');
      navigate(from, { replace: true });
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <LoginContainer>
      <StyledCard>
        <LogoContainer>
          <Title level={2}>Office Plus</Title>
          <Title level={4}>拥有者门户</Title>
        </LogoContainer>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入你的邮箱!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入你的密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoading}
            >
              登录
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            还没有账号？ <Link to="/register">现在注册一个！</Link>
          </Form.Item>
        </Form>
      </StyledCard>
    </LoginContainer>
  );
};

export default Login;
