import React from 'react';
import { Card, Typography } from 'antd';
import BuildingForm from '../components/BuildingForm';

const { Title } = Typography;

const CreateBuilding: React.FC = () => {
  return (
    <Card>
      <Title level={2}>添加写字楼</Title>
      <BuildingForm mode="create" />
    </Card>
  );
};

export default CreateBuilding;
