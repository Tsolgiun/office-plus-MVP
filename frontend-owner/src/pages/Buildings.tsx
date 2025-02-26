import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Space, Typography, Tag, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Building } from '../types/models';
import { api } from '../services/api';

const { Title } = Typography;

const Buildings: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBuildings = async () => {
    try {
      const data = await api.getBuildings();
      setBuildings(data);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      // You might want to show an error notification here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Building',
      content: 'Are you sure you want to delete this building?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await api.deleteBuilding(id);
          await fetchBuildings(); // Refresh the list
        } catch (error) {
          console.error('Error deleting building:', error);
          // Show error notification
        }
      },
    });
  };

  const columns = [
    {
      title: '名字',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '地址',
      dataIndex: 'location',
      key: 'location',
      render: (location: { address: string; metro: string }) => (
        <div>
          <div>{location.address}</div>
          <small>Metro: {location.metro}</small>
        </div>
      ),
    },
    {
      title: '价格范围',
      dataIndex: 'priceRange',
      key: 'priceRange',
      render: (range: { min: number; max: number }) => (
        `¥${range.min} - ¥${range.max}`
      ),
    },
    {
      title: '面积范围',
      dataIndex: 'areaRange',
      key: 'areaRange',
      render: (range: { min: number; max: number }) => (
        `${range.min}㎡ - ${range.max}㎡`
      ),
    },
    {
      title: '标签',
      key: 'tags',
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '行动',
      key: 'action',
      render: (_: any, record: Building) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<AppstoreOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/buildings/${record._id}/offices`);
            }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/buildings/edit/${record._id}`);
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
          <Title level={2}>Buildings</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/buildings/new')}
          >
            添加写字楼
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={buildings}
          rowKey="_id"
          loading={loading}
          pagination={{
            total: buildings.length,
            pageSize: 10,
            showSizeChanger: false,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/buildings/${record._id}`),
            style: { cursor: 'pointer' }
          })}
        />
      </Space>
    </Card>
  );
};

export default Buildings;
