import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Input, Select, Space, Empty, Spin, Card, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Office } from '../../types/models';
import { api } from '../../services/api';
import FavoriteButton from '../../components/FavoriteButton';

const { Title } = Typography;
const { Option } = Select;
const { Meta } = Card;

const PageLayout = styled.div`
  display: flex;
  gap: 24px;
  min-height: calc(100vh - 64px); /* Adjust based on your header height */
`;

const Sidebar = styled.div`
  width: 280px;
  flex-shrink: 0;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: fit-content;
  position: sticky;
  top: 24px;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const StyledTitle = styled(Title)`
  margin-bottom: 16px !important;
`;

const StyledSelect = styled(Select<string>)`
  width: 100% !important;
  margin-top: 16px;
`;

const StyledCard = styled(Card)`
  height: 100%;

  .ant-card-cover {
    height: 200px;
    overflow: hidden;
    position: relative;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

const FavoriteButtonWrapper = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  opacity: 1;
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

  const navigate = useNavigate();

  const OfficeCard: React.FC<{ office: Office }> = ({ office }) => (
    <StyledCard
      hoverable
      onClick={() => navigate(`/offices/${office._id}`)}
      cover={
        <div style={{ position: 'relative' }}>
          <img
            alt={`Office on floor ${office.floor}`}
            src={office.photos[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
          />
          <FavoriteButtonWrapper onClick={e => e.stopPropagation()}>
            <FavoriteButton itemId={office._id} type="office" />
          </FavoriteButtonWrapper>
        </div>
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
    <PageLayout>
      <Sidebar>
        <StyledTitle level={4}>Filters</StyledTitle>
        <Input
          placeholder="Search offices..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <StyledSelect<string>
          value={sortBy}
          onChange={setSortBy}
        >
          <Option value="price-asc">Price: Low to High</Option>
          <Option value="price-desc">Price: High to Low</Option>
          <Option value="area-asc">Area: Small to Large</Option>
          <Option value="area-desc">Area: Large to Small</Option>
        </StyledSelect>
      </Sidebar>

      <MainContent>
        {sortedAndFilteredOffices.length === 0 ? (
          <Empty description="No offices found" />
        ) : (
          <>
            <Row gutter={[24, 24]} justify="center">
              {sortedAndFilteredOffices.map(office => (
                <Col xs={24} sm={12} lg={8} xl={8} key={office._id}>
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
      </MainContent>
    </PageLayout>
  );
};

export default Offices;
