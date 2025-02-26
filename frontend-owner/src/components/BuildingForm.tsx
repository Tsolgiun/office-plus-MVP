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
        label="Building Name"
        rules={[{ required: true, message: 'Please enter building name' }]}
      >
        <Input placeholder="Enter building name" />
      </Form.Item>

      <Form.Item
        label="Location"
        required
      >
        <Input.Group compact>
          <Form.Item
            name={['location', 'address']}
            rules={[{ required: true, message: 'Please enter address' }]}
            style={{ marginBottom: 0 }}
          >
            <Input placeholder="Address" style={{ width: '70%' }} />
          </Form.Item>
          <Form.Item
            name={['location', 'metro']}
            rules={[{ required: true, message: 'Please enter nearest metro' }]}
            style={{ marginBottom: 0 }}
          >
            <Input placeholder="Nearest Metro" style={{ width: '30%' }} />
          </Form.Item>
        </Input.Group>
      </Form.Item>

      <Form.Item label="Price Range (¥/㎡/month)" required>
        <Input.Group compact>
          <Form.Item
            name={['priceRange', 'min']}
            rules={[{ required: true, message: 'Required' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="Min"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
          <Form.Item
            name={['priceRange', 'max']}
            rules={[{ required: true, message: 'Required' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="Max"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Input.Group>
      </Form.Item>

      <Form.Item label="Area Range (㎡)" required>
        <Input.Group compact>
          <Form.Item
            name={['areaRange', 'min']}
            rules={[{ required: true, message: 'Required' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="Min"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
          <Form.Item
            name={['areaRange', 'max']}
            rules={[{ required: true, message: 'Required' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              placeholder="Max"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Input.Group>
      </Form.Item>

      <Form.Item
        name="grade"
        label="Building Grade"
        rules={[{ required: true, message: 'Please select building grade' }]}
      >
        <Select placeholder="Select grade">
          {grades.map(grade => (
            <Select.Option key={grade} value={grade}>
              {grade}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.List name="amenities">
        {(fields, { add, remove }) => (
          <Form.Item label="Amenities">
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
              Add Amenity
            </Button>
          </Form.Item>
        )}
      </Form.List>

      <Form.List name="tags">
        {(fields, { add, remove }) => (
          <Form.Item label="Tags">
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
              Add Tag
            </Button>
          </Form.Item>
        )}
      </Form.List>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {mode === 'create' ? 'Create Building' : 'Update Building'}
          </Button>
          <Button onClick={() => navigate('/buildings', { replace: true })}>
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default BuildingForm;
