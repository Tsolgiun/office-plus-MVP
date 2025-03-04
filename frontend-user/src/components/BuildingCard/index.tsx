import React from 'react';
import { Card, Tag, Typography, Space } from 'antd';
import { EnvironmentOutlined, HomeOutlined, DollarOutlined } from '@ant-design/icons';
import FavoriteButton from '../FavoriteButton';
import styled from 'styled-components';
import { Building } from '../../types/models';
import { useNavigate } from 'react-router-dom';

const { Meta } = Card;
const { Text } = Typography;

const StyledCard = styled(Card)`
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

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

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
  color: #595959;
`;

const TagsContainer = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

interface BuildingCardProps {
  building: Building;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ building }) => {
  const navigate = useNavigate();
  const { name, location, priceRange, areaRange, grade, tags = [], photos = [] } = building;

  return (
    <StyledCard
      hoverable
      cover={
        <div>
          <img
            alt={name}
            src={photos[0] || '/placeholder-building.jpg'}
          />
          <FavoriteButtonWrapper onClick={e => e.stopPropagation()}>
            <FavoriteButton itemId={building._id} type="building" />
          </FavoriteButtonWrapper>
        </div>
      }
      onClick={() => navigate(`/buildings/${building._id}`)}
    >
      <Meta
        title={name}
        description={
          <Space direction="vertical" style={{ width: '100%' }}>
            <InfoRow>
              <EnvironmentOutlined />
              <Text>{typeof location.address === 'string' ? location.address : (location.address as any).fullAddress}</Text>
            </InfoRow>
            <InfoRow>
              <HomeOutlined />
              <Text>{areaRange.min} - {areaRange.max} ㎡</Text>
            </InfoRow>
            <InfoRow>
              <DollarOutlined />
              <Text>¥{priceRange.min.toLocaleString()} - ¥{priceRange.max.toLocaleString()}/月</Text>
            </InfoRow>
            <TagsContainer>
              <Tag color="blue">{grade}</Tag>
              {tags.slice(0, 3).map((tag: string, index: number) => (
                <Tag key={index}>{tag}</Tag>
              ))}
              {tags.length > 3 && <Tag>+{tags.length - 3}</Tag>}
            </TagsContainer>
          </Space>
        }
      />
    </StyledCard>
  );
};

export default BuildingCard;
