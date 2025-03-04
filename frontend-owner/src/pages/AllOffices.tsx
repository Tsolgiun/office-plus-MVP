import React, { useEffect, useState } from 'react';
import { Table, Card, Space, Typography, Tag, Button, Modal, Select, message, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { Office, Building } from '../types/models';
import { api } from '../services/api';
const { Title } = Typography;
const { Option } = Select;

interface OfficeWithBuilding extends Office {
  buildingName?: string;
}

const statusMap: Record<string, string> = {
  'available': '可用',
  'rented': '已租',
  'pending': '待处理',
  'maintenance': '维护中'
};

const AllOffices: React.FC = () => {
  const [offices, setOffices] = useState<OfficeWithBuilding[]>([]);
  const [filteredOffices, setFilteredOffices] = useState<OfficeWithBuilding[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [buildingFilter, setBuildingFilter] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();


  const fetchData = async () => {
    try {
      setRefreshing(true);
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
      const flattenedOffices = allOffices.flat();
      setOffices(flattenedOffices);
      setFilteredOffices(flattenedOffices);
      // message.success('数据加载成功');
    } catch (error) {
      console.error('Error fetching offices:', error);
      // message.error('加载数据失败，请重试');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (buildingFilter) {
      setFilteredOffices(offices.filter(office => office.buildingId === buildingFilter));
    } else {
      setFilteredOffices(offices);
    }
  }, [buildingFilter, offices]);

  const handleDelete = async (officeId: string) => {
    try {
      setDeleteLoading(officeId);
      await api.deleteOffice(officeId);
      message.success('办公室删除成功');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error deleting office:', error);
      message.error('删除失败，请重试');
    } finally {
      setDeleteLoading(null);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedBuilding('');
  };

  const handleCreate = () => {
    if (!selectedBuilding) {
      message.error('请选择写字楼');
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

  const handleBuildingFilterChange = (value: string) => {
    setBuildingFilter(value);
  };

  const columns: ColumnsType<OfficeWithBuilding> = [
    {
      title: '写字楼',
      dataIndex: 'buildingName',
      key: 'buildingName',
      filters: buildings.map(building => ({
        text: building.name,
        value: building._id,
      })),
      onFilter: (value, record) => record.buildingId === value,
    },
    {
      title: '楼层',
      dataIndex: 'floor',
      key: 'floor',
      render: (floor: number) => `${floor}F`,
      sorter: (a, b) => a.floor - b.floor,
    },
    {
      title: '面积',
      dataIndex: 'area',
      key: 'area',
      render: (area: number) => `${area}㎡`,
      sorter: (a, b) => a.area - b.area,
    },
    {
      title: '单价',
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      render: (price: number) => `¥${price}/㎡/月`,
      sorter: (a, b) => a.pricePerUnit - b.pricePerUnit,
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `¥${price}/月`,
      sorter: (a, b) => a.totalPrice - b.totalPrice,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      filters: Object.entries(statusMap).map(([key, value]) => ({
        text: value,
        value: key,
      })),
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {statusMap[status] || status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: OfficeWithBuilding) => (
        <Space size="middle">
          <Tooltip title="编辑">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/buildings/${record.buildingId}/offices/edit/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个办公室吗？"
              onConfirm={() => handleDelete(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
                loading={deleteLoading === record._id}
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
          <Title level={2}>所有的办公室</Title>
          <Space>
            <Select
              style={{ width: 200 }}
              placeholder="按写字楼筛选"
              allowClear
              value={buildingFilter}
              onChange={handleBuildingFilterChange}
            >
              {buildings.map(building => (
                <Option key={building._id} value={building._id}>
                  {building.name}
                </Option>
              ))}
            </Select>
            <Tooltip title="刷新">
              <Button
                icon={<ReloadOutlined spin={refreshing} />}
                onClick={fetchData}
                loading={refreshing}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showModal}
            >
              添加办公室
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredOffices}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个办公室`,
          }}
          locale={{
            emptyText: '暂无办公室数据',
            filterConfirm: '确定',
            filterReset: '重置',
          }}
        />

        <Modal
          title="选择写字楼"
          open={isModalVisible}
          onOk={handleCreate}
          onCancel={handleCancel}
          okText="添加办公室"
          cancelText="取消"
        >
          <Select
            placeholder="请选择写字楼"
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
