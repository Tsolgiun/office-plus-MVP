import React, { useEffect, useState } from 'react';
import type { Dayjs } from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Spin, 
  Carousel, 
  Descriptions, 
  Tag, 
  Button, 
  Empty, 
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  message
} from 'antd';
import { 
  EnvironmentOutlined, 
  DollarOutlined, 
  HomeOutlined,
  TeamOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { Building, Office } from '../../types/models';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { Title } = Typography;
const { TextArea } = Input;

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

const OfficeDetail: React.FC = () => {
  const { buildingId, officeId } = useParams<{ buildingId: string; officeId: string }>();
  const navigate = useNavigate();
  const [office, setOffice] = useState<Office | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!buildingId || !officeId) return;
      
      try {
        const [buildingData, officeData] = await Promise.all([
          api.getBuildingById(buildingId),
          api.getOfficeById(officeId)
        ]);
        setBuilding(buildingData);
        setOffice(officeData);
      } catch (error) {
        console.error('Error fetching office data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [buildingId, officeId]);

  const handleBooking = () => {
    if (!isLoggedIn) {
      message.info('Please login to book a viewing');
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsModalVisible(true);
  };

  interface BookingFormValues {
    date: Dayjs;
    time: string;
    notes?: string;
  }

  const handleSubmit = async (values: BookingFormValues) => {
    // TODO: Implement booking submission
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
      <Space style={{ marginBottom: 16 }}>
        <Button type="link" onClick={() => navigate('/buildings')}>
          ← Back to Buildings
        </Button>
        <Button type="link" onClick={() => navigate(`/buildings/${buildingId}`)}>
          ← Back to Building
        </Button>
      </Space>

      <StyledCarousel autoplay>
        {office.photos.map((photo, index) => (
          <div key={index}>
            <img src={photo} alt={`Office View ${index + 1}`} />
          </div>
        ))}
      </StyledCarousel>

      <ContentSection>
        <Space align="center" style={{ marginBottom: 16 }}>
          <Title level={2}>Floor {office.floor}</Title>
          <Tag color={office.status === 'available' ? 'green' : 'orange'}>
            {office.status}
          </Tag>
        </Space>

        <TagContainer>
          {office.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </TagContainer>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="Building" span={2}>
            <EnvironmentOutlined /> {building.name}
          </Descriptions.Item>
          <Descriptions.Item label="Area">
            <HomeOutlined /> {office.area} ㎡
          </Descriptions.Item>
          <Descriptions.Item label="Monthly Price">
            <DollarOutlined /> ¥{office.totalPrice.toLocaleString()}/月
          </Descriptions.Item>
          <Descriptions.Item label="Capacity">
            <TeamOutlined /> {office.capacity} people
          </Descriptions.Item>
          <Descriptions.Item label="Lease Term">
            <CalendarOutlined /> {office.leaseTerm}
          </Descriptions.Item>
          <Descriptions.Item label="Renovation" span={2}>
            {office.renovation}
          </Descriptions.Item>
          <Descriptions.Item label="Orientation" span={2}>
            {office.orientation}
          </Descriptions.Item>
          <Descriptions.Item label="Efficiency">
            {(office.efficiency * 100).toFixed(0)}%
          </Descriptions.Item>
          <Descriptions.Item label="Price per Unit">
            ¥{office.pricePerUnit.toLocaleString()}/㎡
          </Descriptions.Item>
        </Descriptions>

        {office.status === 'available' && (
          <Button 
            type="primary" 
            size="large" 
            style={{ marginTop: 24 }}
            onClick={handleBooking}
          >
            Book a Viewing
          </Button>
        )}
      </ContentSection>

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
