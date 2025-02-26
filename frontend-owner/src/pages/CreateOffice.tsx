import React from 'react';
import { Card, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import OfficeForm from '../components/OfficeForm';

const { Title } = Typography;

const CreateOffice: React.FC = () => {
  const { buildingId } = useParams<{ buildingId: string }>();

  if (!buildingId) {
    return <div>Building ID not found</div>;
  }

  return (
    <Card>
      <Title level={2}>Add New Office</Title>
      <OfficeForm mode="create" buildingId={buildingId} />
    </Card>
  );
};

export default CreateOffice;
