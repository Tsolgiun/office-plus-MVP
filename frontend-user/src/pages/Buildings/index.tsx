import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Input, Select, Empty, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import BuildingCard from '../../components/BuildingCard';
import { Building } from '../../types/models';
import { api } from '../../services/api';

const { Title } = Typography;
const { Option } = Select;

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

const WelcomeSection = styled.div`
  margin-bottom: 24px;
  text-align: center;
  padding: 48px 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const StyledTitle = styled(Title)`
  margin-bottom: 16px !important;
`;

const StyledSelect = styled(Select<string>)`
  width: 100% !important;
  margin-top: 16px;
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
    <PageLayout>
      <Sidebar>
        <StyledTitle level={4}>筛选</StyledTitle>
        <Input
          placeholder="查找写字楼"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <StyledSelect
          value={sortBy}
          onChange={setSortBy}
        >
          <Option value="name">名字: A-Z排序</Option>
          <Option value="price-asc">价格: 从低到高</Option>
          <Option value="price-desc">价格: 从高到低</Option>
          <Option value="area-asc">面积: 从小到大</Option>
          <Option value="area-desc">面积: 从大到小</Option>
        </StyledSelect>
      </Sidebar>

      <MainContent>
        <WelcomeSection>
          <StyledTitle>找到最适合你的办公场所</StyledTitle>
          <Typography.Text>
            探索我们优质的办公楼宇，找到最适合你的办公场所
          </Typography.Text>
        </WelcomeSection>

        {sortedAndFilteredBuildings.length === 0 ? (
          <Empty description="没有找到合适的写字楼" />
        ) : (
          <Row gutter={[24, 24]} justify="center">
            {sortedAndFilteredBuildings.map(building => (
              <Col xs={24} sm={12} lg={8} xl={8} key={building._id}>
                <BuildingCard building={building} />
              </Col>
            ))}
          </Row>
        )}
      </MainContent>
    </PageLayout>
  );
};

export default Buildings;
