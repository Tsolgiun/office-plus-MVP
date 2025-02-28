import React, { useEffect, useState } from 'react';
import { Tabs, Empty, Spin, Row, Col } from 'antd';
import { useAuthStore } from '../../store/authStore';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import BuildingCard from '../../components/BuildingCard';
import { Office } from '../../types/models';

const PageContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
`;

const TabContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const OfficeCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const OfficeTitle = styled.h3`
  margin: 0 0 8px 0;
`;

const OfficeDetail = styled.p`
  margin: 4px 0;
  color: #666;
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 24px;
  }
`;

enum TabKey {
  ALL = 'all',
  BUILDINGS = 'buildings',
  OFFICES = 'offices'
}

const Favorites: React.FC = () => {
  const { favorites, loadFavorites } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>(TabKey.ALL);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        await loadFavorites();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadFavorites]);

  const handleOfficeClick = (officeId: string) => {
    navigate(`/offices/${officeId}`);
  };

  const renderOfficeCard = (office: Office) => (
    <Col xs={24} sm={12} lg={8} xxl={6} key={office._id}>
      <OfficeCard onClick={() => handleOfficeClick(office._id)}>
        {office.photos && office.photos.length > 0 && (
          <img
            src={office.photos[0]}
            alt={`Office ${office.floor}F`}
            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
          />
        )}
        <OfficeTitle>{`Floor ${office.floor}`}</OfficeTitle>
        <OfficeDetail>{`${office.area} ㎡`}</OfficeDetail>
        <OfficeDetail>{`¥${office.totalPrice.toLocaleString()}/月`}</OfficeDetail>
        <OfficeDetail>{`Capacity: ${office.capacity} people`}</OfficeDetail>
      </OfficeCard>
    </Col>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <Spin size="large" />
        </div>
      );
    }

    const buildingsContent = favorites.buildings.length > 0 ? (
      <Row gutter={[24, 24]}>
        {favorites.buildings.map(building => (
          <Col xs={24} sm={12} lg={8} xxl={6} key={building._id}>
            <BuildingCard building={building} />
          </Col>
        ))}
      </Row>
    ) : (
      <Empty description="No favorite buildings yet" />
    );

    const officesContent = favorites.offices.length > 0 ? (
      <Row gutter={[24, 24]}>
        {favorites.offices.map(office => renderOfficeCard(office))}
      </Row>
    ) : (
      <Empty description="No favorite offices yet" />
    );

    switch (activeTab) {
      case TabKey.BUILDINGS:
        return buildingsContent;
      case TabKey.OFFICES:
        return officesContent;
      default:
        return (
          <>
            {favorites.buildings.length === 0 && favorites.offices.length === 0 ? (
              <Empty description="No favorites yet" />
            ) : (
              <>
                {favorites.buildings.length > 0 && (
                  <>
                    <h2>Favorite Buildings</h2>
                    {buildingsContent}
                  </>
                )}
                {favorites.offices.length > 0 && (
                  <>
                    <h2 style={{ marginTop: '48px' }}>Favorite Offices</h2>
                    {officesContent}
                  </>
                )}
              </>
            )}
          </>
        );
    }
  };

  return (
    <PageContainer>
      <TabContainer>
        <StyledTabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
          items={[
            {
              key: TabKey.ALL,
              label: 'All Favorites',
              children: renderContent()
            },
            {
              key: TabKey.BUILDINGS,
              label: `Buildings (${favorites.buildings.length})`,
              children: renderContent()
            },
            {
              key: TabKey.OFFICES,
              label: `Offices (${favorites.offices.length})`,
              children: renderContent()
            }
          ]}
        />
      </TabContainer>
    </PageContainer>
  );
};

export default Favorites;
