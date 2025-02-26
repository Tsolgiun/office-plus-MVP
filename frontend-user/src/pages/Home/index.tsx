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
      title: '广泛的选择',
      description: '浏览不同地点的各种办公空间',
    },
    {
      title: '轻松的预订',
      description: '只需简单操作即可安排看房时间和预约',
    },
    {
      title: '详尽的信息',
      description: '获取每个办公室的详细信息，包括设施和价格',
    },
  ];

  return (
    <>
      <HeroSection>
        <StyledTitle level={1}>找到你理想的办公空间</StyledTitle>
        <SearchSection>
          <Input
            size="large"
            placeholder="按位置或建筑名称搜索"
            prefix={<SearchOutlined />}
            onPressEnter={() => navigate('/search')}
            suffix={
              <Button type="primary" onClick={() => navigate('/search')}>
                查找
              </Button>
            }
          />
        </SearchSection>
      </HeroSection>

      <div style={{ padding: '48px 0' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
          为什么选择office plus ?
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
