import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, Descriptions, Tag, Row, Col, Card, Empty, Button, Space } from 'antd';
import { EnvironmentOutlined, HomeOutlined, LeftOutlined, RightOutlined, CalendarOutlined } from '@ant-design/icons';
import FavoriteButton from '../../components/FavoriteButton';
import styled from 'styled-components';
import { Building, Office } from '../../types/models';
import { api } from '../../services/api';
import AMapComponent from '../../components/AMapComponent';

const { Title, Text } = Typography;

const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 60% 40%;
  gap: 24px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
`;

const MainColumn = styled.div`
  width: 100%;
`;

const StickyColumn = styled.div`
  position: sticky;
  top: 24px;
  height: fit-content;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImageContainer = styled.div`
  position: relative;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 24px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover {
    .nav-buttons, .favorite-button {
      opacity: 1;
    }
  }
`;

const NavButton = styled(Button)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  background: rgba(255, 255, 255, 0.9) !important;
  border-radius: 50% !important;
  border: none !important;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 1;

  &.prev {
    left: 20px;
  }

  &.next {
    right: 20px;
  }
`;

const FavoriteButtonWrapper = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  opacity: 1;
`;

const PhotoCounter = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  z-index: 1;
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

  .ant-card-cover {
    position: relative;
  }
`;

const OfficeCardFavoriteWrapper = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s;

  ${OfficeCard}:hover & {
    opacity: 1;
  }
`;

const PriceRangeText = styled(Title)`
  margin-bottom: 8px !important;
`;

const BuildingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [building, setBuilding] = useState<Building | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (building?.photos) {
      setCurrentPhotoIndex(prev => 
        prev === 0 ? building.photos.length - 1 : prev - 1
      );
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (building?.photos) {
      setCurrentPhotoIndex(prev => 
        prev === building.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

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
      <Space style={{ marginBottom: 16, padding: '0 24px' }}>
        <Button type="link" onClick={() => navigate('/buildings')}>
          ← Back to Buildings
        </Button>
      </Space>

      <PageLayout>
        <MainColumn>
          {building.photos && building.photos.length > 0 && (
            <ImageContainer>
              <img 
                src={building.photos[currentPhotoIndex]} 
                alt={`${building.name} - ${currentPhotoIndex + 1}`} 
              />
              <FavoriteButtonWrapper className="favorite-button">
                <FavoriteButton itemId={building._id} type="building" />
              </FavoriteButtonWrapper>
              <div className="nav-buttons">
                <NavButton 
                  className="prev" 
                  icon={<LeftOutlined />} 
                  onClick={handlePrevPhoto}
                />
                <NavButton 
                  className="next" 
                  icon={<RightOutlined />} 
                  onClick={handleNextPhoto}
                />
              </div>
              <PhotoCounter>
                {currentPhotoIndex + 1} / {building.photos.length}
              </PhotoCounter>
            </ImageContainer>
          )}

          <ContentSection>
            <Title level={2}>Building Information</Title>
            <Descriptions column={1}>
              <Descriptions.Item label="Location">
                <EnvironmentOutlined /> {typeof building.location?.address === 'string' 
                  ? building.location.address 
                  : (building.location?.address as any)?.fullAddress || ''
                } {building.location?.metro && `(${building.location.metro})`}
              </Descriptions.Item>
              <Descriptions.Item label="Area Range">
                <HomeOutlined /> {building.areaRange?.min ?? 0} - {building.areaRange?.max ?? 0} ㎡
              </Descriptions.Item>
              <Descriptions.Item label="Amenities">
                {building.amenities?.join(', ') || 'None'}
              </Descriptions.Item>
            </Descriptions>

            {building.location?.coordinates && 
              typeof building.location.coordinates.lat === 'number' && 
              typeof building.location.coordinates.lng === 'number' && (
              <div style={{ marginTop: '16px' }}>
                <AMapComponent
                  initialLocation={{
                    lat: building.location.coordinates.lat,
                    lng: building.location.coordinates.lng
                  }}
                  readOnly
                  style={{ height: '300px', borderRadius: '8px' }}
                />
              </div>
            )}
          </ContentSection>

          <ContentSection>
            <Title level={3}>Available Offices</Title>
            {offices.length === 0 ? (
              <Empty description="No offices available" />
            ) : (
              <Row gutter={[24, 24]}>
                {offices.map(office => (
                  <Col xs={24} sm={12} key={office._id}>
                    <OfficeCard
                      onClick={() => navigate(`/offices/${office._id}`)}
                      cover={
                        <div style={{ position: 'relative' }}>
                          <img 
                            alt={`Office ${office.floor ?? 'Unknown'}F`}
                            src={office.photos?.[0] || '/placeholder-office.jpg'}
                            style={{ height: 200, objectFit: 'cover' }}
                          />
                          <OfficeCardFavoriteWrapper onClick={e => e.stopPropagation()}>
                            <FavoriteButton itemId={office._id} type="office" />
                          </OfficeCardFavoriteWrapper>
                        </div>
                      }
                    >
                      <Card.Meta
                        title={`${office.floor ?? 'Unknown'}F - ${office.area ?? 0}㎡`}
                        description={
                          <>
                            <Text>¥{office.totalPrice?.toLocaleString() ?? 0}/月</Text>
                            <br />
                            <Text type="secondary">
                              {[office.renovation, office.orientation].filter(Boolean).join(' • ') || 'No details available'}
                            </Text>
                            <TagContainer>
                              <Tag color={office.status === 'available' ? 'green' : 'orange'}>
                                {office.status || 'Unknown'}
                              </Tag>
                              {office.tags?.slice(0, 2).map((tag, index) => (
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
        </MainColumn>

        <StickyColumn>
          <Title level={2}>{building.name}</Title>
          {building.grade && <Tag color="blue" style={{ marginBottom: 16 }}>{building.grade}</Tag>}
          
          <Space align="baseline" style={{ marginBottom: 16 }}>
            <PriceRangeText level={3}>
              ¥{building.priceRange?.min?.toLocaleString() ?? 0} - ¥{building.priceRange?.max?.toLocaleString() ?? 0}
            </PriceRangeText>
            <Text type="secondary">/月</Text>
          </Space>

          <TagContainer>
            {building.tags?.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </TagContainer>

          <Descriptions column={1} size="small" style={{ marginTop: 24 }}>
            <Descriptions.Item label="Available Offices">
              {offices.filter(o => o.status === 'available').length} units
            </Descriptions.Item>
            <Descriptions.Item label="Metro">
              {building.location?.metro || 'Not specified'}
            </Descriptions.Item>
          </Descriptions>

          <Button 
            type="primary" 
            icon={<CalendarOutlined />}
            onClick={() => navigate(`/buildings/${id}/appointment`)}
          >
            预约参观
          </Button>
        </StickyColumn>
      </PageLayout>
    </div>
  );
};

export default BuildingDetail;
