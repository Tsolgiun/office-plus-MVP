import React from 'react';
import { Form, Input, Button, Card, Typography, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

const { Title } = Typography;

const RegisterContainer = styled.div`
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

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreement: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [form] = Form.useForm();

  const onFinish = async (values: RegisterForm) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    try {
      await register(values.username, values.email, values.password);
      message.success('Registration successful');
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      message.error(errorMessage);
    }
  };

  return (
    <RegisterContainer>
      <StyledCard>
        <LogoContainer>
          <Title level={2}>Office Plus</Title>
          <Title level={4}>创建你的账户</Title>
        </LogoContainer>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          scrollToFirstError
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 3, message: '用户名长度至少为3个字符' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入你的邮箱!' },
              { type: 'email', message: '请输入一个正确的邮箱!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入你的密码!' },
              { min: 6, message: '密码至少是6个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认你的密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('密码不匹配!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error('请同意隐私政策和用户协议')),
              },
            ]}
          >
            <Checkbox>
              我已阅读和同意<a href="#">隐私政策和用户协议</a>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoading}
            >
              注册
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            已经有账户了? <Link to="/login">点我登陆</Link>
          </Form.Item>
        </Form>
      </StyledCard>
    </RegisterContainer>
  );
};

export default Register;
