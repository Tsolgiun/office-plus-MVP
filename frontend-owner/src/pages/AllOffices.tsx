import React, { useEffect, useState } from 'react';
import { Table, Card, Space, Typography, Tag, Button, Modal, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Office, Building } from '../types/models';
import { api } from '../services/api';

const { Title } = Typography;
const { Option } = Select;

interface OfficeWithBuilding extends Office {
  buildingName?: string;
}

const AllOffices: React.FC = () => {
  const [offices, setOffices] = useState<OfficeWithBuilding[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all buildings
        const buildingsData = await api.getBuildings();
        setBuildings(buildingsData);
        
        // Fetch offices for each building
        const officesPromises = buildingsData.map(async (building) => {
          const buildingOffices = await api.getBuildingOffices(building._id);
          return buildingOffices.map(office => ({
            ...office,
            buildingName: building.name
          }));
        });

        const allOffices = await Promise.all(officesPromises);
        setOffices(allOffices.flat());
      } catch (error) {
        console.error('Error fetching offices:', error);
        message.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedBuilding('');
  };

  const handleCreate = () => {
    if (!selectedBuilding) {
      message.error('Please select a building');
      return;
    }
    navigate(`/buildings/${selectedBuilding}/offices/new`);
    setIsModalVisible(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'rented':
        return 'blue';
      case 'pending':
        return 'warning';
      case 'maintenance':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Building',
      dataIndex: 'buildingName',
      key: 'buildingName',
    },
    {
      title: 'Floor',
      dataIndex: 'floor',
      key: 'floor',
      render: (floor: number) => `${floor}F`,
    },
    {
      title: 'Area',
      dataIndex: 'area',
      key: 'area',
      render: (area: number) => `${area}㎡`,
    },
    {
      title: 'Price',
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      render: (price: number) => `¥${price}/㎡/月`,
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `¥${price}/月`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>All Offices</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
          >
            Add Office
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={offices}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/buildings/${record.buildingId}/offices`),
            style: { cursor: 'pointer' }
          })}
        />

        <Modal
          title="Select Building"
          open={isModalVisible}
          onOk={handleCreate}
          onCancel={handleCancel}
          okText="Create Office"
        >
          <Select
            placeholder="Select a building"
            style={{ width: '100%' }}
            value={selectedBuilding}
            onChange={(value) => setSelectedBuilding(value)}
          >
            {buildings.map(building => (
              <Option key={building._id} value={building._id}>
                {building.name}
              </Option>
            ))}
          </Select>
        </Modal>
      </Space>
    </Card>
  );
};

export default AllOffices;
