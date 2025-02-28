import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Typography, Tag, Spin, Table, Button } from 'antd';
import { BuildOutlined, HomeOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Building, Office } from '../types/models';
import styled from 'styled-components';
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const StyledCard = styled(Card)`
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }
`;

// Define your appointment interface
interface Appointment {
  _id: string;
  userId: string;
  building: string;
  startTime: Date;
  endTime: Date;
  status: string;
  purpose: string;
  user?: {
    name: string;
    email: string;
  };
}

// Status color mapping
const statusColors: Record<string, string> = {
  pending: 'orange',
  confirmed: 'green',
  cancelled: 'red',
  completed: 'blue',
  rejected: 'magenta',
};

// Status text mapping
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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [recentOffices, setRecentOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalOfficeCount, setTotalOfficeCount] = useState(0);
  const [buildingsMap, setBuildingsMap] = useState<Record<string, Building>>({});
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const buildingsData = await api.getBuildings();
        setBuildings(buildingsData);

        // Get offices from each building and combine them
        const officesPromises = buildingsData.map(building => 
          api.getBuildingOffices(building._id)
        );
        const officesArrays = await Promise.all(officesPromises);
        const allOffices = officesArrays.flat();

        // Set total office count
        setTotalOfficeCount(allOffices.length);

        // Sort offices by last updated date and take the 5 most recent
        const sortedOffices = allOffices.sort((a, b) => 
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        ).slice(0, 5);

        setRecentOffices(sortedOffices);

        // Create a buildings map for easy lookup
        const buildingsMapObj: Record<string, Building> = {};
        buildingsData.forEach(building => {
          buildingsMapObj[building._id] = building;
        });
        setBuildingsMap(buildingsMapObj);
        
        // Fetch appointments for all buildings
        let allAppointments: Appointment[] = [];
        for (const building of buildingsData) {
          const response = await api.getBuildingAppointments(building._id);
          if (response.appointments && response.appointments.length > 0) {
            allAppointments = [...allAppointments, ...response.appointments];
          }
        }
        
        // Sort by date (newest first) and take the 5 most recent
        const sortedAppointments = allAppointments.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        setRecentAppointments(sortedAppointments.slice(0, 5));
        
        // Calculate statistics
        const stats = {
          total: allAppointments.length,
          pending: allAppointments.filter(a => a.status === 'pending').length,
          confirmed: allAppointments.filter(a => a.status === 'confirmed').length,
          completed: allAppointments.filter(a => a.status === 'completed').length,
          cancelled: allAppointments.filter(a => a.status === 'cancelled').length,
          rejected: allAppointments.filter(a => a.status === 'rejected').length
        };
        setAppointmentStats(stats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'rented':
        return 'blue';
      case 'pending':
        return 'warning';
      case 'maintenance':
        return 'error';
      default:
        return 'default';
    }
  };

  // Prepare data for pie chart
  const chartData = [
    { name: '待确认', value: appointmentStats.pending, color: statusColors.pending },
    { name: '已确认', value: appointmentStats.confirmed, color: statusColors.confirmed },
    { name: '已完成', value: appointmentStats.completed, color: statusColors.completed },
    { name: '已取消', value: appointmentStats.cancelled, color: statusColors.cancelled },
    { name: '已拒绝', value: appointmentStats.rejected, color: statusColors.rejected }
  ].filter(item => item.value > 0);

  // Define columns for recent appointments table
  const columns: ColumnsType<Appointment> = [
    {
      title: '用户',
      key: 'user',
      render: (record: Appointment) => (
        <Text>{record.user?.name || '未知用户'}</Text>
      )
    },
    {
      title: '写字楼',
      key: 'building',
      render: (record: Appointment) => (
        <Text>{buildingsMap[record.building]?.name || '未知'}</Text>
      )
    },
    {
      title: '时间',
      key: 'time',
      render: (record: Appointment) => (
        <Text>{dayjs(record.startTime).format('YYYY-MM-DD HH:mm')}</Text>
      )
    },
    {
      title: '状态',
      key: 'status',
      render: (record: Appointment) => (
        <Tag color={statusColors[record.status] || 'default'}>
          {getStatusText(record.status)}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Appointment) => (
        <Link to={`/appointments?id=${record._id}`}>
          <Button type="link" size="small">查看</Button>
        </Link>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>数据面板</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="写字楼总数"
              value={buildings.length}
              prefix={<BuildOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="办公室总数"
              value={totalOfficeCount}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="可用的办公室"
              value={recentOffices.filter(office => office.status === 'available').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="你的写字楼" extra={<a onClick={() => navigate('/buildings')}>查看全部</a>}>
            <List
              dataSource={buildings}
              renderItem={building => (
                <StyledCard
                  size="small"
                  style={{ marginBottom: '8px' }}
                  onClick={() => navigate(`/buildings/${building._id}`)}
                >
                  <List.Item>
                    <List.Item.Meta
                      title={building.name}
                      description={building.location.address}
                    />
                    <div>
                      {building.tags.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </List.Item>
                </StyledCard>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="近期的办公室更新" extra={<ClockCircleOutlined />}>
            <List
              dataSource={recentOffices}
              renderItem={office => (
                <StyledCard
                  size="small"
                  style={{ marginBottom: '8px' }}
                  onClick={() => navigate(`/buildings/${office.buildingId}/offices/${office._id}`)}
                >
                  <List.Item>
                    <List.Item.Meta
                      title={`Floor ${office.floor} - ${office.area}㎡`}
                      description={`¥${office.pricePerUnit}/㎡/月`}
                    />
                    <Tag color={getStatusColor(office.status)}>
                      {office.status.toUpperCase()}
                    </Tag>
                  </List.Item>
                </StyledCard>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="新的预约" extra={<ClockCircleOutlined />}>
            <List
              dataSource={recentOffices}
              renderItem={office => (
                <StyledCard
                  size="small"
                  style={{ marginBottom: '8px' }}
                  onClick={() => navigate('/appointments')}
                >          
                </StyledCard>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        
        <Col xs={24} md={12}>
          <Card 
            title="最近预约" 
            extra={<Link to="/appointments">查看全部</Link>}
            loading={loading}
          >
            <Table 
              dataSource={recentAppointments}
              columns={columns}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
