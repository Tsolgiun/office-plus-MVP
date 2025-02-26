import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Input, Select, Space, Empty, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import BuildingCard from '../../components/BuildingCard';
import { Building } from '../../types/models';
import { api } from '../../services/api';

const { Title } = Typography;
const { Option } = Select;

const FiltersContainer = styled.div`
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const Buildings: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const data = await api.getBuildings();
        setBuildings(data);
      } catch (error) {
        console.error('Error fetching buildings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  const sortedAndFilteredBuildings = buildings
    .filter(building => 
      building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.location.metro.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.priceRange.min - b.priceRange.min;
        case 'price-desc':
          return b.priceRange.min - a.priceRange.min;
        case 'area-asc':
          return a.areaRange.min - b.areaRange.min;
        case 'area-desc':
          return b.areaRange.min - a.areaRange.min;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Office Buildings</Title>
      
      <FiltersContainer>
        <Space size="large" style={{ width: '100%' }}>
          <Input
            placeholder="Search buildings..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 200 }}
          >
            <Option value="name">Name A-Z</Option>
            <Option value="price-asc">Price: Low to High</Option>
            <Option value="price-desc">Price: High to Low</Option>
            <Option value="area-asc">Area: Small to Large</Option>
            <Option value="area-desc">Area: Large to Small</Option>
          </Select>
        </Space>
      </FiltersContainer>

      {sortedAndFilteredBuildings.length === 0 ? (
        <Empty description="No buildings found" />
      ) : (
        <Row gutter={[24, 24]}>
          {sortedAndFilteredBuildings.map(building => (
            <Col xs={24} sm={12} lg={8} key={building._id}>
              <BuildingCard building={building} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Buildings;
