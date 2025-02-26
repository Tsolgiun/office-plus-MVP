import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Space, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Building } from '../types/models';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

interface BuildingFormProps {
  initialValues?: Partial<Building>;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

const BuildingForm: React.FC<BuildingFormProps> = ({ initialValues, mode, onSuccess }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (mode === 'create') {
        await api.createBuilding(values);
        message.success('Building created successfully');
      } else {
        if (!initialValues?._id) {
          throw new Error('Building ID not found');
        }
        await api.updateBuilding(initialValues._id, values);
        message.success('Building updated successfully');
      }
      onSuccess?.();
      navigate('/buildings', { replace: true });
    } catch (error) {
      console.error('Error saving building:', error);
      message.error('Error saving building. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const grades = ['A', 'A+', 'B', 'B+', 'C'];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        amenities: [],
        tags: [],
        photos: [],
        ...initialValues
      }}
    >
      <Form.Item
        name="name"
        label="写字楼名字"
        rules={[{ required: true, message: '请输入写字楼名字' }]}
      >
        <Input placeholder="输入写字楼名字" />
      </Form.Item>

      <Form.Item
        label="地址"
        required
      >
        <Input.Group compact>
          <Form.Item
            name={['location', 'address']}
            rules={[{ required: true, message: '请输入地址' }]}
            style={{ marginBottom: 0 }}
          >
            <Input placeholder="地址" style={{ width: '70%' }} />
          </Form.Item>
          <Form.Item
            name={['location', 'metro']}
            rules={[{ required: true, message: '请输入最近的地铁' }]}
            style={{ marginBottom: 0 }}
          >
            <Input placeholder="最近的地铁" style={{ width: '30%' }} />
          </Form.Item>
        </Input.Group>
      </Form.Item>

      <Form.Item label="价格区间 (¥/㎡/月)" required>
        <Input.Group compact>
          <Form.Item
            name={['priceRange', 'min']}
            rules={[{ required: true, message: '请输入价格最小值' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="价格最小"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
          <Form.Item
            name={['priceRange', 'max']}
            rules={[{ required: true, message: '请输入价格最大值' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="价格最大"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Input.Group>
      </Form.Item>

      <Form.Item label="面积区间 (㎡)" required>
        <Input.Group compact>
          <Form.Item
            name={['areaRange', 'min']}
            rules={[{ required: true, message: '请输入面积最小值' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="面积最小"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
          <Form.Item
            name={['areaRange', 'max']}
            rules={[{ required: true, message: '请输入面积最大值' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="面积最大"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Input.Group>
      </Form.Item>

      <Form.Item
        name="grade"
        label="写字楼等级"
        rules={[{ required: true, message: '请选择写字楼等级' }]}
      >
        <Select placeholder="选择等级">
          {grades.map(grade => (
            <Select.Option key={grade} value={grade}>
              {grade}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.List name="amenities">
        {(fields, { add, remove }) => (
          <Form.Item label="便利设施">
            {fields.map((field, index) => (
              <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }}>
                <Form.Item
                  {...field}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Please input amenity or delete this field",
                    },
                  ]}
                  noStyle
                >
                  <Input placeholder="Enter amenity" style={{ width: '300px' }} />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(index)} />
              </Space>
            ))}
            <Button
              type="dashed"
              onClick={() => add()}
              block
              icon={<PlusOutlined />}
            >
              添加便利设施
            </Button>
          </Form.Item>
        )}
      </Form.List>

      <Form.List name="tags">
        {(fields, { add, remove }) => (
          <Form.Item label="标签">
            {fields.map((field, index) => (
              <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }}>
                <Form.Item
                  {...field}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Please input tag or delete this field",
                    },
                  ]}
                  noStyle
                >
                  <Input placeholder="Enter tag" style={{ width: '300px' }} />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(index)} />
              </Space>
            ))}
            <Button
              type="dashed"
              onClick={() => add()}
              block
              icon={<PlusOutlined />}
            >
              增加标签
            </Button>
          </Form.Item>
        )}
      </Form.List>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {mode === 'create' ? '创建写字楼' : '更新写字楼'}
          </Button>
          <Button onClick={() => navigate('/buildings', { replace: true })}>
            取消
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default BuildingForm;
