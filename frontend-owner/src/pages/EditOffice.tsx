import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import OfficeForm from '../components/OfficeForm';
import { Office } from '../types/models';
import { api } from '../services/api';

const { Title } = Typography;

const EditOffice: React.FC = () => {
  const { buildingId, officeId } = useParams<{ buildingId: string; officeId: string }>();
  const navigate = useNavigate();
  const [office, setOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffice = async () => {
      try {
        if (!officeId) {
          throw new Error('Office ID not found');
        }
        const officeData = await api.getOfficeById(officeId);
        setOffice(officeData);
      } catch (error) {
        console.error('Error fetching office:', error);
        navigate(`/buildings/${buildingId}/offices`);
      } finally {
        setLoading(false);
      }
    };

    fetchOffice();
  }, [officeId, buildingId, navigate]);

  if (!buildingId) {
    return <div>Building ID not found</div>;
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!office) {
    return null;
  }

  return (
    <Card>
      <Title level={2}>Edit Office</Title>
      <OfficeForm
        mode="edit"
        buildingId={buildingId}
        initialValues={office}
      />
    </Card>
  );
};

export default EditOffice;
