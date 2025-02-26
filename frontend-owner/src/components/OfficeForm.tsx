import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Space, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Office } from '../types/models';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface OfficeFormProps {
  buildingId: string;
  initialValues?: Partial<Office>;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

const OfficeForm: React.FC<OfficeFormProps> = ({
  buildingId,
  initialValues,
  mode,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  // Calculate total price when area or price per unit changes
  const updateTotalPrice = () => {
    const area = form.getFieldValue('area');
    const pricePerUnit = form.getFieldValue('pricePerUnit');
    if (area && pricePerUnit) {
      form.setFieldValue('totalPrice', area * pricePerUnit);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const officeData = {
        ...values,
        buildingId,
        totalPrice: values.area * values.pricePerUnit,
        efficiency: values.efficiency || 85, // Default efficiency if not provided
        tags: values.tags || [],
        photos: values.photos || []
      };

      if (mode === 'create') {
        await api.createOffice(officeData);
        message.success('Office created successfully');
      } else {
        if (!initialValues?._id) {
          throw new Error('Office ID not found');
        }
        await api.updateOffice(initialValues._id, officeData);
        message.success('Office updated successfully');
      }
      onSuccess?.();
      navigate(`/buildings/${buildingId}/offices`);
    } catch (error) {
      console.error('Error saving office:', error);
      message.error('Error saving office. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        status: 'available',
        efficiency: 85,
        tags: [],
        photos: [],
        ...initialValues
      }}
    >
      <Form.Item
        name="floor"
        label="Floor"
        rules={[{ required: true, message: 'Please enter floor number' }]}
      >
        <InputNumber
          placeholder="Enter floor number"
          style={{ width: '100%' }}
          min={1}
        />
      </Form.Item>

      <Form.Item
        name="area"
        label="Area (㎡)"
        rules={[{ required: true, message: 'Please enter area' }]}
      >
        <InputNumber
          placeholder="Enter area"
          style={{ width: '100%' }}
          min={0}
          step={0.5}
          onChange={updateTotalPrice}
        />
      </Form.Item>

      <Form.Item
        name="pricePerUnit"
        label="Price per ㎡ per Month (¥)"
        rules={[{ required: true, message: 'Please enter price per unit' }]}
      >
        <InputNumber
          placeholder="Enter price per ㎡"
          style={{ width: '100%' }}
          min={0}
          step={0.01}
          onChange={updateTotalPrice}
        />
      </Form.Item>

      <Form.Item
        name="totalPrice"
        label="Total Price per Month (¥)"
      >
        <InputNumber
          style={{ width: '100%' }}
          disabled
        />
      </Form.Item>

      <Form.Item
        name="efficiency"
        label="Space Efficiency (%)"
        rules={[
          { required: true, message: 'Please enter efficiency' },
          { type: 'number', min: 0, max: 100, message: 'Efficiency must be between 0 and 100' }
        ]}
      >
        <InputNumber
          placeholder="Enter efficiency"
          style={{ width: '100%' }}
          min={0}
          max={100}
          step={1}
        />
      </Form.Item>

      <Form.Item
        name="capacity"
        label="Capacity (persons)"
        rules={[{ required: true, message: 'Please enter capacity' }]}
      >
        <InputNumber
          placeholder="Enter capacity"
          style={{ width: '100%' }}
          min={1}
        />
      </Form.Item>

      <Form.Item
        name="renovation"
        label="Renovation"
        rules={[{ required: true, message: 'Please select renovation status' }]}
      >
        <Select placeholder="Select renovation status">
          <Select.Option value="furnished">Furnished</Select.Option>
          <Select.Option value="unfurnished">Unfurnished</Select.Option>
          <Select.Option value="custom">Custom</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="orientation"
        label="Orientation"
        rules={[{ required: true, message: 'Please select orientation' }]}
      >
        <Select placeholder="Select orientation">
          <Select.Option value="north">North</Select.Option>
          <Select.Option value="south">South</Select.Option>
          <Select.Option value="east">East</Select.Option>
          <Select.Option value="west">West</Select.Option>
          <Select.Option value="northeast">Northeast</Select.Option>
          <Select.Option value="northwest">Northwest</Select.Option>
          <Select.Option value="southeast">Southeast</Select.Option>
          <Select.Option value="southwest">Southwest</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="leaseTerm"
        label="Lease Term"
        rules={[{ required: true, message: 'Please enter lease term' }]}
      >
        <Select placeholder="Select lease term">
          <Select.Option value="1-year">1 Year</Select.Option>
          <Select.Option value="2-year">2 Years</Select.Option>
          <Select.Option value="3-year">3 Years</Select.Option>
          <Select.Option value="negotiable">Negotiable</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: 'Please select status' }]}
      >
        <Select placeholder="Select status">
          <Select.Option value="available">Available</Select.Option>
          <Select.Option value="rented">Rented</Select.Option>
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="maintenance">Maintenance</Select.Option>
        </Select>
      </Form.Item>

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
            {mode === 'create' ? 'Create Office' : 'Update Office'}
          </Button>
          <Button onClick={() => navigate(`/buildings/${buildingId}/offices`)}>
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default OfficeForm;
