import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Typography, Tag, Spin } from 'antd';
import { BuildOutlined, HomeOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Building, Office } from '../types/models';
import styled from 'styled-components';

const { Title } = Typography;

const StyledCard = styled(Card)`
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }
`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [recentOffices, setRecentOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);

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

        // Sort offices by last updated date and take the 5 most recent
        const sortedOffices = allOffices.sort((a, b) => 
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        ).slice(0, 5);

        setRecentOffices(sortedOffices);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalOffices = buildings.reduce((sum, building) => {
    const min = building.areaRange.min;
    const max = building.areaRange.max;
    // Estimate number of offices based on area range
    const estimatedOffices = Math.ceil((max - min) / 100); // Assuming average office size of 100
    return sum + estimatedOffices;
  }, 0);

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Buildings"
              value={buildings.length}
              prefix={<BuildOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Offices"
              value={totalOffices}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Available Offices"
              value={recentOffices.filter(office => office.status === 'available').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Your Buildings" extra={<a onClick={() => navigate('/buildings')}>View All</a>}>
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
          <Card title="Recent Office Updates" extra={<ClockCircleOutlined />}>
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
      </Row>
    </div>
  );
};

export default Dashboard;
