import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Input, Select, Space, Empty, Spin, Card, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Office } from '../../types/models';
import { api } from '../../services/api';

const { Title } = Typography;
const { Option } = Select;
const { Meta } = Card;

const FiltersContainer = styled.div`
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const StyledCard = styled(Card)`
  height: 100%;
  .ant-card-cover {
    height: 200px;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

const Offices: React.FC = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('price-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const response = await api.searchOffices({
          page: currentPage,
          limit: 12,
          sortBy,
          status: 'available'
        });
        setOffices(response.data);
        setHasMore(response.hasMore);
      } catch (error) {
        console.error('Error fetching offices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffices();
  }, [currentPage, sortBy]);

  const sortedAndFilteredOffices = offices
    .filter(office => 
      (office.buildingId + office.floor).toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.totalPrice - b.totalPrice;
        case 'price-desc':
          return b.totalPrice - a.totalPrice;
        case 'area-asc':
          return a.area - b.area;
        case 'area-desc':
          return b.area - a.area;
        default:
          // Sort by floor number as default
          return a.floor - b.floor;
      }
    });

  const OfficeCard: React.FC<{ office: Office }> = ({ office }) => (
    <StyledCard
      hoverable
      cover={
        <img
          alt={`Office on floor ${office.floor}`}
          src={office.photos[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
        />
      }
    >
      <Meta
        title={`Office on Floor ${office.floor}`}
        description={
          <Space direction="vertical">
            <div>Status: {office.status}</div>
            <div>Area: {office.area} m²</div>
            <div>Price: ${office.totalPrice}/month</div>
            <div>Lease Term: {office.leaseTerm}</div>
            <div>Renovation: {office.renovation}</div>
            <div>Capacity: {office.capacity} people</div>
          </Space>
        }
      />
    </StyledCard>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Available Offices</Title>
      
      <FiltersContainer>
        <Space size="large" style={{ width: '100%' }}>
          <Input
            placeholder="Search offices..."
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
            <Option value="price-asc">Price: Low to High</Option>
            <Option value="price-desc">Price: High to Low</Option>
            <Option value="area-asc">Area: Small to Large</Option>
            <Option value="area-desc">Area: Large to Small</Option>
          </Select>
        </Space>
      </FiltersContainer>

      {sortedAndFilteredOffices.length === 0 ? (
        <Empty description="No offices found" />
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {sortedAndFilteredOffices.map(office => (
              <Col xs={24} sm={12} lg={8} key={office._id}>
                <OfficeCard office={office} />
              </Col>
            ))}
          </Row>
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Button 
                type="primary"
                onClick={() => setCurrentPage(prev => prev + 1)}
                loading={loading}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Offices;
