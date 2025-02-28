import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Alert, Spin, Result, Button } from 'antd';
import AppointmentForm from '../../components/AppointmentForm/AppointmentForm';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Building } from '../../types/models';

const { Title, Text } = Typography;

const CreateAppointment: React.FC = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const fetchBuilding = async () => {
      if (!buildingId) return;
      
      try {
        setLoading(true);
        const data = await api.getBuildingById(buildingId);
        setBuilding(data);
      } catch (error) {
        console.error('Error fetching building:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilding();
  }, [buildingId, isLoggedIn, navigate]);

  const handleSuccess = () => {
    setSuccess(true);
  };

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (success) {
    return (
      <Result
        status="success"
        title="预约申请已成功提交！"
        subTitle="我们将尽快审核您的预约请求，请留意通知。"
        extra={[
          <Button type="primary" key="appointments" onClick={() => navigate('/appointments')}>
            查看我的预约
          </Button>,
          <Button key="home" onClick={() => navigate('/')}>返回首页</Button>,
        ]}
      />
    );
  }

  if (!building) {
    return (
      <Result
        status="error"
        title="无法加载该建筑信息"
        subTitle="请稍后再试或选择其他建筑"
        extra={
          <Button type="primary" onClick={() => navigate('/buildings')}>
            返回建筑列表
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <Card>
        <Title level={2}>预约参观</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
          您正在预约参观: {building.name}
        </Text>
        
        <Alert 
          type="info" 
          message="预约提示" 
          description="请至少提前24小时预约，工作人员将在12小时内与您确认具体时间。" 
          style={{ marginBottom: '24px' }} 
        />
        
        <AppointmentForm buildingId={buildingId!} onSuccess={handleSuccess} />
      </Card>
    </div>
  );
};

export default CreateAppointment; 