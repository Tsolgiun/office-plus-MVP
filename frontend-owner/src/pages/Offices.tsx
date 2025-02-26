import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Space, Typography, Tag, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Office, Building } from '../types/models';
import { api } from '../services/api';

const { Title } = Typography;

const Offices: React.FC = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const [offices, setOffices] = useState<Office[]>([]);
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      if (!buildingId) {
        throw new Error('Building ID not found');
      }
      const [buildingData, officesData] = await Promise.all([
        api.getBuildingById(buildingId),
        api.getBuildingOffices(buildingId)
      ]);
      setBuilding(buildingData);
      setOffices(officesData);
    } catch (error) {
      console.error('Error fetching offices:', error);
      // You might want to show an error notification here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [buildingId]);

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Office',
      content: 'Are you sure you want to delete this office?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await api.deleteOffice(id);
          await fetchData(); // Refresh the list
        } catch (error) {
          console.error('Error deleting office:', error);
          // Show error notification
        }
      },
    });
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
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: Office) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/buildings/${buildingId}/offices/edit/${record._id}`);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record._id);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space direction="vertical" size="small">
            <Title level={2}>Offices</Title>
            {building && (
              <Typography.Text type="secondary">
                写字楼: {building.name}
              </Typography.Text>
            )}
          </Space>
          <Space>
            <Button onClick={() => navigate('/buildings')}>
              返回大楼
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/buildings/${buildingId}/offices/new`)}
            >
              添加办公室
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={offices}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: offices.length,
            pageSize: 10,
            showSizeChanger: false,
          }}
        />
      </Space>
    </Card>
  );
};

export default Offices;
