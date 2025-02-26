import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, Carousel, Descriptions, Tag, Row, Col, Card, Empty, Button } from 'antd';
import { EnvironmentOutlined, DollarOutlined, HomeOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Building, Office } from '../../types/models';
import { api } from '../../services/api';

const { Title, Text } = Typography;

const StyledCarousel = styled(Carousel)`
  .slick-slide {
    height: 400px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

const ContentSection = styled.div`
  margin-top: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const TagContainer = styled.div`
  margin: 16px 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const OfficeCard = styled(Card)`
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const BuildingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [building, setBuilding] = useState<Building | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuildingData = async () => {
      if (!id) return;
      
      try {
        const [buildingData, officesData] = await Promise.all([
          api.getBuildingById(id),
          api.getBuildingOffices(id)
        ]);
        setBuilding(buildingData);
        setOffices(officesData);
      } catch (error) {
        console.error('Error fetching building data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildingData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!building) {
    return <Empty description="Building not found" />;
  }

  return (
    <div>
      <Button 
        type="link" 
        onClick={() => navigate('/buildings')}
        style={{ marginBottom: 16 }}
      >
        ← Back to Buildings
      </Button>

      <StyledCarousel autoplay>
        {building.photos.map((photo, index) => (
          <div key={index}>
            <img src={photo} alt={`${building.name} - ${index + 1}`} />
          </div>
        ))}
      </StyledCarousel>

      <ContentSection>
        <Title level={2}>{building.name}</Title>
        <TagContainer>
          <Tag color="blue">{building.grade}</Tag>
          {building.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </TagContainer>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="Location" span={2}>
            <EnvironmentOutlined /> {building.location.address} ({building.location.metro})
          </Descriptions.Item>
          <Descriptions.Item label="Area Range">
            <HomeOutlined /> {building.areaRange.min} - {building.areaRange.max} ㎡
          </Descriptions.Item>
          <Descriptions.Item label="Price Range">
            <DollarOutlined /> ¥{building.priceRange.min.toLocaleString()} - ¥{building.priceRange.max.toLocaleString()}/月
          </Descriptions.Item>
          <Descriptions.Item label="Amenities" span={2}>
            {building.amenities.join(', ')}
          </Descriptions.Item>
        </Descriptions>
      </ContentSection>

      <ContentSection>
        <Title level={3}>Available Offices</Title>
        {offices.length === 0 ? (
          <Empty description="No offices available" />
        ) : (
          <Row gutter={[24, 24]}>
            {offices.map(office => (
              <Col xs={24} sm={12} lg={8} key={office._id}>
                <OfficeCard
                  onClick={() => navigate(`/buildings/${building._id}/offices/${office._id}`)}
                  cover={
                    <img 
                      alt={`Office ${office.floor}F`}
                      src={office.photos[0] || '/placeholder-office.jpg'}
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                  }
                >
                  <Card.Meta
                    title={`${office.floor}F - ${office.area}㎡`}
                    description={
                      <>
                        <Text>¥{office.totalPrice.toLocaleString()}/月</Text>
                        <br />
                        <Text type="secondary">{office.renovation} • {office.orientation}</Text>
                        <TagContainer>
                          <Tag color={office.status === 'available' ? 'green' : 'orange'}>
                            {office.status}
                          </Tag>
                          {office.tags.slice(0, 2).map((tag, index) => (
                            <Tag key={index}>{tag}</Tag>
                          ))}
                        </TagContainer>
                      </>
                    }
                  />
                </OfficeCard>
              </Col>
            ))}
          </Row>
        )}
      </ContentSection>
    </div>
  );
};

export default BuildingDetail;
