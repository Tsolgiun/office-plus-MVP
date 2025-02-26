import React from 'react';
import { Typography, Button, Input, Card, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const HeroSection = styled.div`
  text-align: center;
  padding: 60px 0;
  margin: -24px -24px 24px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
`;

const StyledTitle = styled(Title)`
  color: white !important;
  margin-bottom: 24px;
`;

const SearchSection = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 0 24px;
`;

const FeatureCard = styled(Card)`
  height: 100%;
  text-align: center;
  
  .ant-card-body {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Extensive Selection',
      description: 'Browse through a wide range of office spaces across different locations.',
    },
    {
      title: 'Easy Booking',
      description: 'Schedule viewings and make appointments with just a few clicks.',
    },
    {
      title: 'Detailed Information',
      description: 'Get comprehensive details about each office space including amenities and pricing.',
    },
  ];

  return (
    <>
      <HeroSection>
        <StyledTitle level={1}>Find Your Perfect Office Space</StyledTitle>
        <SearchSection>
          <Input
            size="large"
            placeholder="Search by location or building name"
            prefix={<SearchOutlined />}
            onPressEnter={() => navigate('/search')}
            suffix={
              <Button type="primary" onClick={() => navigate('/search')}>
                Search
              </Button>
            }
          />
        </SearchSection>
      </HeroSection>

      <div style={{ padding: '48px 0' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          Why Choose Office Plus?
        </Title>
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={8} key={index}>
              <FeatureCard>
                <Title level={3}>{feature.title}</Title>
                <Paragraph>{feature.description}</Paragraph>
              </FeatureCard>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
};

export default Home;
