import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Space, Typography, Tag, Popconfirm, message, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Building } from '../types/models';
import { api } from '../services/api';

const { Title } = Typography;

const Buildings: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchBuildings = async () => {
    try {
      setRefreshing(true);
      const data = await api.getBuildings();
      setBuildings(data);
      setFilteredBuildings(data);
      message.success('数据加载成功');
    } catch (error) {
      console.error('Error fetching buildings:', error);
      message.error('加载数据失败，请重试');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleDelete = async (id: string) => {
    // Store current state for potential rollback
    const previousBuildings = [...buildings];
    const previousFilteredBuildings = [...filteredBuildings];

    try {
      setDeleteLoading(id);
      
      // Optimistically update the UI
      const updatedBuildings = buildings.filter(b => b._id !== id);
      const updatedFilteredBuildings = filteredBuildings.filter(b => b._id !== id);
      setBuildings(updatedBuildings);
      setFilteredBuildings(updatedFilteredBuildings);

      // Make the API call
      await api.deleteBuilding(id);
      message.success('大厦及其所有办公室已成功删除');
    } catch (error) {
      console.error('Error deleting building:', error);
      message.error('删除失败，请重试');
      
      // Revert optimistic update on error
      setBuildings(previousBuildings);
      setFilteredBuildings(previousFilteredBuildings);
    } finally {
      setDeleteLoading(null);
    }
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
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个大厦吗？这将同时删除所有相关的办公室。"
              onConfirm={() => handleDelete(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                loading={deleteLoading === record._id}
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>写字楼</Title>
          <Space>
            <Tooltip title="刷新">
              <Button
                icon={<ReloadOutlined spin={refreshing} />}
                onClick={fetchBuildings}
                loading={refreshing}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/buildings/new')}
            >
              添加写字楼
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredBuildings}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个大厦`,
          }}
          locale={{
            emptyText: '暂无大厦数据',
            filterConfirm: '确定',
            filterReset: '重置',
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
