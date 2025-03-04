import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Input, Select, Empty, Spin, Button, Tag } from 'antd';
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

const FilterButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  width: 100%;
  text-align: left;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
  width: 100%;
`;

const FilterLabel = styled(Typography.Text)`
  font-weight: 500;
  min-width: 50px;
`;

const FilterTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
`;

const StyledTag = styled(Tag)`
  cursor: pointer;
  margin-bottom: 4px;
  padding: 5px 12px;
  font-size: 14px;
  &:hover {
    opacity: 0.8;
  }
`;

const ClearButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 8px;
`;

// Define a type for the address object
interface AddressObject {
  fullAddress?: string;
  city?: string;
  region?: string;
  street?: string;
  [key: string]: any; // To allow for other potential fields
}

// Define a type for the extended location
interface ExtendedLocation {
  address?: string | { [key: string]: any };
  addressDetails?: AddressObject;
  metro: string;
  coordinates?: {
    lng: number;
    lat: number;
  };
}

const Buildings: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  
  // New state for filters
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedStreet, setSelectedStreet] = useState<string | null>(null);

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

  // Extract unique cities, regions and streets from buildings data
  const getLocationFilters = () => {
    const cities = new Set<string>();
    const regions = new Set<string>();
    const streets = new Set<string>();

    buildings.forEach(building => {
      const address = building.location.address;
      
      // Process address if it's an object
      if (address && typeof address === 'object') {
        const addrObj = address as any;
        if (addrObj.city) cities.add(addrObj.city);
        if (addrObj.region) regions.add(addrObj.region);
        if (addrObj.street && addrObj.street !== 'Unknown Street') streets.add(addrObj.street);
      } 
      
    });

    return {
      cities: Array.from(cities),
      regions: Array.from(regions),
      streets: Array.from(streets)
    };
  };

  const filters = getLocationFilters();

  // Handle filter clicks
  const handleCityClick = (city: string) => {
    setSelectedCity(selectedCity === city ? null : city);
  };

  const handleRegionClick = (region: string) => {
    setSelectedRegion(selectedRegion === region ? null : region);
  };

  const handleStreetClick = (street: string) => {
    setSelectedStreet(selectedStreet === street ? null : street);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCity(null);
    setSelectedRegion(null);
    setSelectedStreet(null);
  };

  const sortedAndFilteredBuildings = buildings
    .filter(building => {
      // Apply existing search term filter
      const searchTermLower = searchTerm.toLowerCase();
      
      const nameMatches = building.name.toLowerCase().includes(searchTermLower);
      const metroMatches = building.location.metro.toLowerCase().includes(searchTermLower);
      
      let addressMatches = false;
      
      // Get the address information
      const address = building.location.address;
      const addressDetails = (building.location as any).addressDetails;
      
      // Get address components from both possible locations
      let city = '';
      let region = '';
      let street = '';
      let fullAddress = '';
      
      // Process address if it's an object
      if (address && typeof address === 'object') {
        const addrObj = address as any;
        city = addrObj.city || '';
        region = addrObj.region || '';
        street = addrObj.street || '';
        fullAddress = addrObj.fullAddress || '';
        
        addressMatches = 
          fullAddress.toLowerCase().includes(searchTermLower) ||
          city.toLowerCase().includes(searchTermLower) ||
          region.toLowerCase().includes(searchTermLower) ||
          street.toLowerCase().includes(searchTermLower);
      } 
      // Process address if it's a string
      else if (address && typeof address === 'string') {
        addressMatches = address.toLowerCase().includes(searchTermLower);
      }
      
      // Process addressDetails if it exists
      if (addressDetails) {
        city = addressDetails.city || city;
        region = addressDetails.region || region;
        street = addressDetails.street || street;
        fullAddress = addressDetails.fullAddress || fullAddress;
        
        addressMatches = addressMatches || 
          fullAddress.toLowerCase().includes(searchTermLower) ||
          city.toLowerCase().includes(searchTermLower) ||
          region.toLowerCase().includes(searchTermLower) ||
          street.toLowerCase().includes(searchTermLower);
      }
      
      const searchMatches = nameMatches || metroMatches || addressMatches;
      
      // Apply location filters
      let cityMatches = true;
      let regionMatches = true;
      let streetMatches = true;
      
      // Apply filters using the extracted values
      if (selectedCity) {
        cityMatches = city === selectedCity;
      }
      
      if (selectedRegion) {
        regionMatches = region === selectedRegion;
      }
      
      if (selectedStreet) {
        streetMatches = street === selectedStreet;
      }
      
      return searchMatches && cityMatches && regionMatches && streetMatches;
    })
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
          
          {!loading && (
            <FilterButtonsContainer>
              {(selectedCity || selectedRegion || selectedStreet) && (
                <ClearButtonContainer>
                  <Button 
                    type="primary" 
                    ghost 
                    onClick={clearAllFilters}
                  >
                    清除所有筛选
                  </Button>
                </ClearButtonContainer>
              )}
              
              {filters.cities.length > 0 && (
                <FilterSection>
                  <FilterLabel>城市:</FilterLabel>
                  <FilterTagsContainer>
                    {filters.cities.map(city => (
                      <StyledTag
                        key={city}
                        color={selectedCity === city ? '#1890ff' : 'default'}
                        onClick={() => handleCityClick(city)}
                      >
                        {city}
                      </StyledTag>
                    ))}
                  </FilterTagsContainer>
                </FilterSection>
              )}
              
              {filters.regions.length > 0 && (
                <FilterSection>
                  <FilterLabel>区域:</FilterLabel>
                  <FilterTagsContainer>
                    {filters.regions.map(region => (
                      <StyledTag
                        key={region}
                        color={selectedRegion === region ? '#1890ff' : 'default'}
                        onClick={() => handleRegionClick(region)}
                      >
                        {region}
                      </StyledTag>
                    ))}
                  </FilterTagsContainer>
                </FilterSection>
              )}
              
              {filters.streets.length > 0 && (
                <FilterSection>
                  <FilterLabel>街道:</FilterLabel>
                  <FilterTagsContainer>
                    {filters.streets.map(street => (
                      <StyledTag
                        key={street}
                        color={selectedStreet === street ? '#1890ff' : 'default'}
                        onClick={() => handleStreetClick(street)}
                      >
                        {street}
                      </StyledTag>
                    ))}
                  </FilterTagsContainer>
                </FilterSection>
              )}
            </FilterButtonsContainer>
          )}
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
