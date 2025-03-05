import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import OfficeForm from '../components/OfficeForm';
import { Office } from '../types/models';
import { api } from '../services/api';

const { Title } = Typography;

const EditOffice: React.FC = () => {
  const { buildingId: urlBuildingId, officeId } = useParams<{ buildingId: string; officeId: string }>();
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
        if (urlBuildingId) {
          navigate(`/buildings/${urlBuildingId}/offices`);
        } else {
          navigate('/offices');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOffice();
  }, [officeId, urlBuildingId, navigate]);

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

  // Ensure we have a building ID either from URL or office data
  const buildingId = urlBuildingId || office.buildingId;
  if (!buildingId) {
    return <div>Building ID not found</div>;
  }

  return (
    <Card>
      <Title level={2}>更改办公室</Title>
      <OfficeForm
        mode="edit"
        buildingId={buildingId}
        initialValues={office}
      />
    </Card>
  );
};

export default EditOffice;
