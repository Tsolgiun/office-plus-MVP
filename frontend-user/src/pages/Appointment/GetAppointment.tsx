import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Table, Tag, Space, Button, Popconfirm, Empty, Spin, message } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, TeamOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Appointment, Building } from '../../types/models';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  pending: 'orange',
  confirmed: 'green',
  cancelled: 'red',
  completed: 'blue',
  rejected: 'magenta',
};

const GetAppointment: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [buildings, setBuildings] = useState<Record<string, Building>>({});
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, logout, user } = useAuthStore();
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn || !user?._id) return;

      try {
        setLoading(true);
        // Fetch all user appointments
        const appointmentsData = await api.getUserAppointments(user._id);
       
        setAppointments(appointmentsData.appointments);
        
        // Fetch building details for all appointments using a loop
        const buildingsData: Record<string, Building> = {};
        
        // Keep track of processed building IDs to avoid duplicate requests
        const processedBuildingIds = new Set<string>();
        
        for (const appointment of appointmentsData.appointments) {
          const buildingId = appointment.building as string;
          // Skip if we've already fetched this building
          if (processedBuildingIds.has(buildingId)) continue;
          
          try {
            const building = await api.getBuildingById(buildingId);
            buildingsData[buildingId] = building;
            processedBuildingIds.add(buildingId);
          } catch (error) {
            console.error(`Error fetching building ${buildingId}:`, error);
          }
        }
        setBuildings(buildingsData);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        message.error('无法加载预约数据，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await api.cancelAppointment(appointmentId);
      message.success('预约已取消');
      
      // Update the local state to reflect the cancellation
      setAppointments(prev => 
        prev.map(app => 
          app._id === appointmentId ? { ...app, status: 'cancelled' } : app
        )
      );
    } catch (error) {
      console.error('Error canceling appointment:', error);
      message.error('取消预约失败，请稍后再试');
    }
  };

  const columns = [
    {
      title: '写字楼',
      dataIndex: 'building',
      key: 'building',
      render: (buildingId: string) => (
        <span>
          {buildings[buildingId]?.name || '未知写字楼'}
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <EnvironmentOutlined /> {buildings[buildingId]?.location?.address || '地址不详'}
            </Text>
          </div>
        </span>
      ),
    },
    {
      title: '预约时间',
      dataIndex: 'startTime',
      key: 'time',
      render: (startTime: Date, record: Appointment) => (
        <span>
          <div>
            <CalendarOutlined /> {dayjs(startTime).format('YYYY-MM-DD')}
          </div>
          <div>
            <ClockCircleOutlined /> {dayjs(startTime).format('HH:mm')} - {dayjs(record.endTime).format('HH:mm')}
          </div>
        </span>
      ),
      sorter: (a: Appointment, b: Appointment) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    },
    {
      title: '详情',
      key: 'details',
      render: (_: React.Key, record: Appointment) => (
        <span>
          <div>
            <TeamOutlined /> {record.attendees} 人
          </div>
          {record.room && (
            <div>
              房间: {record.room}
            </div>
          )}
          <div>
            <PhoneOutlined /> {record.contactInfo}
          </div>
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: '待确认', value: 'pending' },
        { text: '已确认', value: 'confirmed' },
        { text: '已取消', value: 'cancelled' },
        { text: '已完成', value: 'completed' },
        { text: '已拒绝', value: 'rejected' },
      ],
      onFilter: (value: boolean | React.Key, record: Appointment) => 
        record.status === value.toString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: React.Key, record: Appointment) => (
        <Space size="small">
          {record.status === 'pending' || record.status === 'confirmed' ? (
            <Popconfirm
              title="确定要取消此预约吗？"
              description="取消后将无法恢复，需要重新预约。"
              onConfirm={() => handleCancelAppointment(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button danger size="small">取消预约</Button>
            </Popconfirm>
          ) : null}
          
          <Button 
            type="link" 
            size="small" 
            onClick={() => navigate(`/buildings/${record.building}`)}
          >
            查看写字楼
          </Button>
        </Space>
      ),
    },
  ];

  // Helper function to convert status codes to readable text
  function getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      pending: '待确认',
      confirmed: '已确认',
      cancelled: '已取消',
      completed: '已完成',
      rejected: '已拒绝',
    };
    return statusMap[status] || status;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <Title level={2}>我的预约</Title>
      
      {appointments.length === 0 ? (
        <Empty 
          description="暂无预约记录" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/buildings')}>
            去预约写字楼
          </Button>
        </Empty>
      ) : (
        <Table 
          dataSource={appointments} 
          columns={columns} 
          rowKey="_id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条预约`,
          }}
        />
      )}
    </Card>
  );
};

export default GetAppointment;
