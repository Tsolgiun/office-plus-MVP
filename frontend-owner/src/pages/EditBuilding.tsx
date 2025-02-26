import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import BuildingForm from '../components/BuildingForm';
import { Building } from '../types/models';
import { api } from '../services/api';

const { Title } = Typography;

const EditBuilding: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        if (!id) {
          throw new Error('Building ID not found');
        }
        const buildingData = await api.getBuildingById(id);
        setBuilding(buildingData);
      } catch (error) {
        console.error('Error fetching building:', error);
        navigate('/buildings');
      } finally {
        setLoading(false);
      }
    };

    fetchBuilding();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!building) {
    return null;
  }

  return (
    <Card>
      <Title level={2}>Edit Building</Title>
      <BuildingForm mode="edit" initialValues={building} />
    </Card>
  );
};

export default EditBuilding;
