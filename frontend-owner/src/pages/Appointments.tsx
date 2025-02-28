import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Typography, Table, Tag, Space, Button, Popconfirm, Select, message, Spin, DatePicker } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, TeamOutlined, PhoneOutlined, EnvironmentOutlined, FilterOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import dayjs from 'dayjs';
import { Building, Office } from '../types/models';
import { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Status color mapping
const statusColors: Record<string, string> = {
  pending: 'orange',
  confirmed: 'green',
  cancelled: 'red',
  completed: 'blue',
  rejected: 'magenta',
};

interface Appointment {
  _id: string;
  userId: string;
  building: string;
  room?: string;
  startTime: Date;
  endTime: Date;
  purpose: string;
  attendees: number;
  status: string;
  contactInfo: string;
  office?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

const Appointments: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [buildings, setBuildings] = useState<Record<string, Building>>({});
  const [offices, setOffices] = useState<Record<string, Office>>({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchedOfficeId, setSearchedOfficeId] = useState<string | null>(null);

  useEffect(() => {
    // Check for officeId in the query params
    const params = new URLSearchParams(location.search);
    const officeId = params.get('officeId');
    if (officeId) {
      setSearchedOfficeId(officeId);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all buildings first
        const buildingsData = await api.getBuildings();
        const buildingsMap: Record<string, Building> = {};
        buildingsData.forEach(building => {
          buildingsMap[building._id] = building;
        });
        setBuildings(buildingsMap);
        
        // Fetch all offices across all buildings
        const officesPromises = buildingsData.map(building => 
          api.getBuildingOffices(building._id)
        );
        const officesArrays = await Promise.all(officesPromises);
        const allOffices = officesArrays.flat();
        
        const officesMap: Record<string, Office> = {};
        allOffices.forEach(office => {
          officesMap[office._id] = office;
        });
        setOffices(officesMap);
        
        // Fetch all appointments
        let fetchedAppointments: Appointment[] = [];
        
        for (const building of buildingsData) {
          const buildingAppointments = await api.getBuildingAppointments(building._id);
          console.log(buildingAppointments);
          console.log(building._id);
          if (buildingAppointments.appointments) {
            fetchedAppointments = [...fetchedAppointments, ...buildingAppointments.appointments];
          }
        }
        
        // Filter by office ID if specified
        if (searchedOfficeId) {
          fetchedAppointments = fetchedAppointments.filter(
            appointment => appointment.office === searchedOfficeId
          );
        }
        
        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error('Error fetching appointments data:', error);
        message.error('无法加载预约数据，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchedOfficeId]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await api.updateAppointmentStatus(appointmentId, newStatus);
      
      // Update local state
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment._id === appointmentId 
            ? { ...appointment, status: newStatus } 
            : appointment
        )
      );
      
      message.success(`预约状态已更新为${getStatusText(newStatus)}`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      message.error('更新预约状态失败');
    }
  };

  // Function to get Chinese status text
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: '待确认',
      confirmed: '已确认',
      cancelled: '已取消',
      completed: '已完成',
      rejected: '已拒绝',
    };
    return statusMap[status] || status;
  };

  const filteredAppointments = filterStatus 
    ? appointments.filter(appointment => appointment.status === filterStatus)
    : appointments;

  const columns: ColumnsType<Appointment> = [
    {
      title: '用户信息',
      key: 'user',
      render: (record: Appointment) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.user?.name || '未知用户'}</Text>
          <Text type="secondary">{record.user?.email}</Text>
          <Text><PhoneOutlined /> {record.contactInfo}</Text>
        </Space>
      ),
    },
    {
      title: '写字楼/办公室',
      key: 'location',
      render: (record: Appointment) => (
        <Space direction="vertical" size="small">
          <Text strong>{buildings[record.building]?.name || '未知写字楼'}</Text>
          <Text>
            {record.office && offices[record.office] 
              ? `Floor ${offices[record.office].floor}, ${offices[record.office].area}㎡` 
              : record.room || '未指定办公室'
            }
          </Text>
          <Text type="secondary">
            <EnvironmentOutlined /> {buildings[record.building]?.location?.address || '地址不详'}
          </Text>
        </Space>
      ),
    },
    {
      title: '预约时间',
      key: 'time',
      render: (record: Appointment) => (
        <Space direction="vertical" size="small">
          <Text><CalendarOutlined /> {dayjs(record.startTime).format('YYYY-MM-DD')}</Text>
          <Text><ClockCircleOutlined /> {dayjs(record.startTime).format('HH:mm')} - {dayjs(record.endTime).format('HH:mm')}</Text>
          <Text><TeamOutlined /> {record.attendees} 人</Text>
        </Space>
      ),
      sorter: (a: Appointment, b: Appointment) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    },
    {
      title: '预约目的',
      dataIndex: 'purpose',
      key: 'purpose',
      ellipsis: true,
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
      onFilter: (value: string | boolean | number, record: Appointment) => 
        record.status === value.toString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Appointment) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="确认此预约?"
                onConfirm={() => handleUpdateStatus(record._id, 'confirmed')}
                okText="确认"
                cancelText="取消"
              >
                <Button type="primary" size="small">确认预约</Button>
              </Popconfirm>
              <Popconfirm
                title="拒绝此预约?"
                onConfirm={() => handleUpdateStatus(record._id, 'rejected')}
                okText="确认"
                cancelText="取消"
              >
                <Button danger size="small">拒绝预约</Button>
              </Popconfirm>
            </>
          )}
          
          {record.status === 'confirmed' && (
            <>
              <Popconfirm
                title="将此预约标记为已完成?"
                onConfirm={() => handleUpdateStatus(record._id, 'completed')}
                okText="确认"
                cancelText="取消"
              >
                <Button type="primary" size="small">标记完成</Button>
              </Popconfirm>
              <Popconfirm
                title="取消此预约?"
                onConfirm={() => handleUpdateStatus(record._id, 'cancelled')}
                okText="确认"
                cancelText="取消"
              >
                <Button danger size="small">取消预约</Button>
              </Popconfirm>
            </>
          )}
          
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>预约管理</Title>
          
          <Space>
            {searchedOfficeId && (
              <Button onClick={() => setSearchedOfficeId(null)}>
                显示所有预约
              </Button>
            )}
            
            <Select
              placeholder="按状态筛选"
              style={{ width: 120 }}
              allowClear
              onChange={(value) => setFilterStatus(value)}
            >
              <Option value="pending">待确认</Option>
              <Option value="confirmed">已确认</Option>
              <Option value="cancelled">已取消</Option>
              <Option value="completed">已完成</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
          </Space>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredAppointments}
          rowKey="_id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条预约`
          }}
        />
      </Space>
    </Card>
  );
};

export default Appointments;
