import React, { useState } from 'react';
import { Card, Typography, Avatar, Form, Input, Button, message, Tabs, Space, Descriptions } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Profile: React.FC = () => {
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const { user, updateUser } = useAuthStore();

  const handleSubmit = async (values: any) => {
    try {
      await updateUser({
        username: values.username,
        email: values.email,
        phone: values.phone
      });
      message.success('个人信息更新成功');
      setEditing(false);
    } catch (error) {
      message.error('更新失败，请重试');
      console.error('Error updating profile:', error);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <Text type="secondary">请先登录查看个人信息</Text>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Card>
        <Tabs defaultActiveKey="profile">
          <TabPane tab="个人信息" key="profile">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <Avatar 
                size={64} 
                icon={<UserOutlined />} 
                style={{ marginRight: 16 }}
              />
              <div>
                <Title level={3}>{user.username}</Title>
                身份：
                <Text type="secondary">{user.role === 'user' ? '普通用户' : '所有者'}</Text>
              </div>
              {!editing && (
                <Button 
                  type="link" 
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditing(true);
                    form.setFieldsValue(user);
                  }}
                  style={{ marginLeft: 'auto' }}
                >
                  编辑资料
                </Button>
              )}
            </div>

            {editing ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={user}
              >
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="用户名" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="邮箱" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="手机号码"
                  rules={[
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', validateTrigger: 'onBlur' }
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="手机号码" />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                      保存
                    </Button>
                    <Button onClick={() => setEditing(false)}>
                      取消
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="用户名">
                  <Space>
                    <UserOutlined />
                    {user.username}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="邮箱">
                  <Space>
                    <MailOutlined />
                    {user.email}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="电话">
                  <Space>
                    <PhoneOutlined />
                    {user.phone}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile;
