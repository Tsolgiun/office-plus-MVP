import React, { useEffect, useState } from 'react';
import type { Dayjs } from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Spin, 
  Descriptions, 
  Tag, 
  Button, 
  Empty, 
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Row,
  Col,
} from 'antd';
import { 
  EnvironmentOutlined, 
  HomeOutlined,
  TeamOutlined,
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import FavoriteButton from '../../components/FavoriteButton';
import styled from 'styled-components';
import { Building, Office } from '../../types/models';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;
const { TextArea } = Input;

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
  opacity: 0;

  &:hover {
    background: rgba(255, 255, 255, 1) !important;
    transform: translateY(-50%) scale(1.1);
  }

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

const PriceText = styled(Title)`
  margin-bottom: 8px !important;
`;

const BookingButton = styled(Button)`
  width: 100%;
  height: 48px;
  font-size: 16px;
  margin-top: 16px;
`;

const PriceHeader = styled.div`
  margin-bottom: 16px;
`;

const OfficeDetail: React.FC = () => {
  const { buildingId, officeId, id } = useParams<{ buildingId?: string; officeId?: string; id?: string }>();
  const navigate = useNavigate();
  const [office, setOffice] = useState<Office | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [form] = Form.useForm();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const targetOfficeId = officeId || id;
        if (!targetOfficeId) return;
        
        const officeData = await api.getOfficeById(targetOfficeId);
        setOffice(officeData);

        const targetBuildingId = buildingId || officeData.buildingId;
        const buildingData = await api.getBuildingById(targetBuildingId);
        setBuilding(buildingData);
      } catch (error) {
        console.error('Error fetching office data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [buildingId, officeId, id]);

  const handleBooking = () => {
    if (!isLoggedIn) {
      message.info('Please login to book a viewing');
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsModalVisible(true);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (office?.photos) {
      setCurrentPhotoIndex(prev => 
        prev === 0 ? office.photos.length - 1 : prev - 1
      );
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (office?.photos) {
      setCurrentPhotoIndex(prev => 
        prev === office.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  interface BookingFormValues {
    date: Dayjs;
    time: string;
    notes?: string;
  }

  const handleSubmit = async (values: BookingFormValues) => {
    console.log('Booking values:', values);
    message.success('Viewing request submitted successfully');
    setIsModalVisible(false);
    form.resetFields();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!office || !building) {
    return <Empty description="Office not found" />;
  }

  return (
    <div>
      <Row align="middle" style={{ padding: '0 24px', marginBottom: 16 }}>
        <Col>
          <Button type="link" onClick={() => navigate('/buildings')}>
            ← Back to Buildings
          </Button>
          <Button type="link" onClick={() => navigate(`/buildings/${office.buildingId}`)}>
            ← Back to Building
          </Button>
        </Col>
      </Row>

      <PageLayout>
        <MainColumn>
          {office.photos && office.photos.length > 0 && (
            <ImageContainer>
              <img 
                src={office.photos[currentPhotoIndex]} 
                alt={`Office View ${currentPhotoIndex + 1}`} 
              />
              <FavoriteButtonWrapper className="favorite-button">
                <FavoriteButton itemId={office._id} type="office" />
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
                {currentPhotoIndex + 1} / {office.photos.length}
              </PhotoCounter>
            </ImageContainer>
          )}

          <ContentSection>
            <Title level={2}>Office Details</Title>
            <Descriptions column={1}>
              <Descriptions.Item label="Building">
                <EnvironmentOutlined /> {building.name || 'Unknown Building'}
              </Descriptions.Item>
              <Descriptions.Item label="Area">
                <HomeOutlined /> {office.area ?? 0} ㎡
              </Descriptions.Item>
              <Descriptions.Item label="Capacity">
                <TeamOutlined /> {office.capacity ?? 'N/A'} people
              </Descriptions.Item>
              <Descriptions.Item label="Lease Term">
                <CalendarOutlined /> {office.leaseTerm || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Renovation">
                {office.renovation || 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Orientation">
                {office.orientation || 'Not specified'}
              </Descriptions.Item>
            </Descriptions>
          </ContentSection>
        </MainColumn>

        <StickyColumn>
          <PriceHeader>
            <Space align="baseline">
              <PriceText level={3}>¥{office.totalPrice?.toLocaleString() ?? 0}</PriceText>
              <Text type="secondary">/月</Text>
            </Space>
          </PriceHeader>

          <Descriptions column={1} size="small">
            <Descriptions.Item label="Floor">
              {office.floor ?? 'Unknown'} F
            </Descriptions.Item>
            <Descriptions.Item label="Price per Unit">
              ¥{office.pricePerUnit?.toLocaleString() ?? 0}/㎡
            </Descriptions.Item>
            <Descriptions.Item label="Efficiency">
              {office.efficiency ? `${(office.efficiency * 100).toFixed(0)}%` : 'N/A'}
            </Descriptions.Item>
          </Descriptions>

          <TagContainer>
            <Tag color={office.status === 'available' ? 'green' : 'orange'}>
              {office.status || 'Unknown'}
            </Tag>
            {office.tags?.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </TagContainer>

          {office.status === 'available' && (
            <BookingButton 
              type="primary"
              onClick={handleBooking}
            >
              Book a Viewing
            </BookingButton>
          )}
        </StickyColumn>
      </PageLayout>

      <Modal
        title="Book a Viewing"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form 
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="date"
            label="Preferred Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="time"
            label="Preferred Time"
            rules={[{ required: true, message: 'Please select a time' }]}
          >
            <Input placeholder="e.g., 14:00" />
          </Form.Item>
          <Form.Item
            name="notes"
            label="Additional Notes"
          >
            <TextArea rows={4} placeholder="Any special requirements or questions?" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit Request
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OfficeDetail;
