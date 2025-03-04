import React from 'react';
import { Typography, Row, Col, Card, Button, Space, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  BuildOutlined, 
  SearchOutlined, 
  CalendarOutlined, 
  SafetyOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  StarFilled,
  CheckCircleFilled
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 80px 0;
  margin: -24px -24px 24px -24px;
  text-align: center;
  color: white;
`;

const Section = styled.div`
  margin: 48px 0;
`;

const FeatureCard = styled(Card)`
  height: 100%;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
`;

const IconWrapper = styled.div`
  font-size: 36px;
  color: #1890ff;
  margin-bottom: 16px;
`;

const StyledButton = styled(Button)`
  height: 48px;
  font-size: 16px;
  padding: 0 32px;
`;

const StatCard = styled(Card)`
  text-align: center;
  background: #f8f9fa;
  border: none;
  
  .number {
    font-size: 36px;
    font-weight: bold;
    color: #1890ff;
    margin-bottom: 8px;
  }
`;

const TestimonialCard = styled(Card)`
  margin: 16px;
  position: relative;
  
  .quote {
    font-size: 18px;
    font-style: italic;
    margin-bottom: 16px;
  }
  
  .stars {
    color: #faad14;
    margin-bottom: 8px;
  }
`;

const BannerSection = styled.div`
  display: flex;
  background: #f0f8ff;
  padding: 60px 0;
  margin: 48px -24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 32px 0;
  }
`;

const BannerContent = styled.div`
  flex: 1;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const BannerImage = styled.div`
  flex: 1;
  background-image: url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8bW9kZXJuJTIwb2ZmaWNlfHwwfHx8fDE2MjM0NTY3ODl8MA&ixlib=rb-4.0.3&q=80&w=1080');
  background-size: cover;
  background-position: center;
  min-height: 400px;
  
  @media (max-width: 768px) {
    min-height: 300px;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 24px 0;
  
  li {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    font-size: 16px;
    
    .anticon {
      color: #52c41a;
      margin-right: 12px;
      font-size: 18px;
    }
  }
`;

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      title: '多样办公空间',
      icon: <BuildOutlined />,
      description: '从小型独立办公室到大型写字楼，多样化的选择满足不同企业需求。'
    },
    {
      title: '便捷地理位置',
      icon: <EnvironmentOutlined />,
      description: '位于城市核心商业区，交通便利，周边设施完善，提升企业形象。'
    },
    {
      title: '灵活租赁方案',
      icon: <DollarOutlined />,
      description: '提供短期、长期多种租赁方案，灵活应对企业发展不同阶段的需求。'
    },
    {
      title: '一站式服务',
      icon: <CustomerServiceOutlined />,
      description: '从选址、装修到日常运营，一站式服务让您专注于业务发展。'
    },
    {
      title: '预约看房便捷',
      icon: <CalendarOutlined />,
      description: '在线预约看房，节省时间成本，提高找房效率。'
    },
    {
      title: '安全保障',
      icon: <SafetyOutlined />,
      description: '所有房源经过严格审核，保障用户权益和交易安全。'
    }
  ];

  const testimonials = [
    {
      quote: "通过office直租，我们在短短两周内找到了理想的办公空间，整个过程非常顺畅。",
      author: "张先生",
      company: "创新科技有限公司",
      rating: 5
    },
    {
      quote: "平台上的办公空间信息非常详细，预约看房也很方便，节省了我们大量时间。",
      author: "李女士",
      company: "明亮设计工作室",
      rating: 5
    },
    {
      quote: "作为初创公司，我们找到了经济实惠又专业的办公空间，非常感谢office直租的帮助。",
      author: "王先生",
      company: "未来金融科技",
      rating: 4
    }
  ];
  
  const stats = [
    { number: "10,000+", label: "可租赁办公空间" },
    { number: "500+", label: "合作写字楼" },
    { number: "50+", label: "覆盖城市" },
    { number: "98%", label: "客户满意度" }
  ];

  return (
    <>
      <HeroSection>
        <Title style={{ color: 'white', fontSize: 48, marginBottom: 16 }}>office直租 - 专业办公空间解决方案</Title>
        <Paragraph style={{ color: 'white', fontSize: 18, maxWidth: 800, margin: '0 auto 32px' }}>
          为企业提供高质量、灵活的办公空间选择，帮助您找到理想的工作环境
        </Paragraph>
        <Space size="large">
          <StyledButton type="primary" size="large" icon={<SearchOutlined />} onClick={() => navigate('/buildings')}>
            寻找写字楼
          </StyledButton>
          <StyledButton type="default" size="large" ghost onClick={() => navigate('/offices')}>
            浏览办公室
          </StyledButton>
        </Space>
      </HeroSection>

      <Section>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>关于 office直租</Title>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={16}>
            <Typography>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                office直租是一个专注于办公空间租赁的在线平台，致力于为企业提供高质量的办公解决方案。我们汇集了全国各大城市的优质写字楼和办公室资源，通过智能匹配技术，帮助企业快速找到最适合的办公场所。
              </Paragraph>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                无论您是初创企业寻找小型办公空间，还是成熟企业需要大型写字楼，我们都能满足您的需求。office直租提供全面的信息展示、便捷的预约看房服务和专业的租赁咨询，让办公选址变得简单高效。
              </Paragraph>
            </Typography>
          </Col>
        </Row>
      </Section>

      <Section>
        <Row gutter={[24, 24]}>
          {stats.map((stat, index) => (
            <Col xs={12} md={6} key={index}>
              <StatCard>
                <div className="number">{stat.number}</div>
                <div>{stat.label}</div>
              </StatCard>
            </Col>
          ))}
        </Row>
      </Section>

      <BannerSection>
        <BannerContent>
          <Title level={2}>高效办公空间解决方案</Title>
          <Paragraph style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 24 }}>
            我们致力于为企业提供一站式办公空间服务，从需求分析到空间配置，打造理想的工作环境。
          </Paragraph>
          <FeatureList>
            <li><CheckCircleFilled /> 免费专业顾问支持</li>
            <li><CheckCircleFilled /> 个性化空间定制方案</li>
            <li><CheckCircleFilled /> 灵活租期和优惠价格</li>
            <li><CheckCircleFilled /> 高效便捷的在线预约</li>
          </FeatureList>
          {/* <Button type="primary" size="large" onClick={() => navigate('/buildings')}>
            探索更多
          </Button> */}
        </BannerContent>
        <BannerImage />
      </BannerSection>

      <Divider />

      <Section>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>我们的优势</Title>
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <FeatureCard>
                <IconWrapper>{feature.icon}</IconWrapper>
                <Title level={4}>{feature.title}</Title>
                <Paragraph>{feature.description}</Paragraph>
              </FeatureCard>
            </Col>
          ))}
        </Row>
      </Section>

      <Section>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>用户评价</Title>
        <Row gutter={[24, 24]}>
          {testimonials.map((testimonial, index) => (
            <Col xs={24} md={8} key={index}>
              <TestimonialCard>
                <div className="stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarFilled key={i} />
                  ))}
                </div>
                <div className="quote">{testimonial.quote}</div>
                <div>
                  <Text strong>{testimonial.author}</Text>
                  <br />
                  <Text type="secondary">{testimonial.company}</Text>
                </div>
              </TestimonialCard>
            </Col>
          ))}
        </Row>
      </Section>

      <Section style={{ textAlign: 'center' }}>
        <Title level={2} style={{ marginBottom: 24 }}>立即开始寻找理想的办公空间</Title>
        <Paragraph style={{ fontSize: 16, marginBottom: 32 }}>
          数千个优质办公空间等待您的选择，让我们帮助您找到最完美的工作环境
        </Paragraph>
        <Space size="large">
          <StyledButton type="primary" size="large" icon={<TeamOutlined />} onClick={() => navigate('/register')}>
            立即注册
          </StyledButton>
          <StyledButton onClick={() => navigate('/buildings')}>
            浏览写字楼
          </StyledButton>
        </Space>
      </Section>
    </>
  );
};

export default Home;
