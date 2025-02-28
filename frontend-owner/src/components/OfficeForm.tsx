import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Space, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Office } from '../types/models';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import ImageUpload from './ImageUpload';

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
  const [officeId, setOfficeId] = useState<string | null>(initialValues?._id || null);

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

  const handleImagesChange = (photos: string[]) => {
    form.setFieldValue('photos', photos);
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
        const response = await api.createOffice(officeData);
        setOfficeId(response._id);
        message.success('Office created successfully. You can now upload images.');
        // Don't navigate away in create mode - allow image upload first
      } else {
        if (!initialValues?._id) {
          throw new Error('Office ID not found');
        }
        await api.updateOffice(initialValues._id, officeData);
        message.success('Office updated successfully');
      }
      if (mode === 'edit') {
        onSuccess?.();
        navigate(`/buildings/${buildingId}/offices`);
      }
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
        label="楼层"
        rules={[{ required: true, message: '请添加楼层号' }]}
      >
        <InputNumber
          placeholder="添加楼层号"
          style={{ width: '100%' }}
          min={1}
        />
      </Form.Item>

      <Form.Item
        name="area"
        label="面积 (㎡)"
        rules={[{ required: true, message: '请添加面积' }]}
      >
        <InputNumber
          placeholder="添加面积"
          style={{ width: '100%' }}
          min={0}
          step={0.5}
          onChange={updateTotalPrice}
        />
      </Form.Item>

      <Form.Item
        name="pricePerUnit"
        label="元/㎡/月"
        rules={[{ required: true, message: '请添加 元/㎡/月' }]}
      >
        <InputNumber
          placeholder="请添每㎡价格"
          style={{ width: '100%' }}
          min={0}
          step={0.01}
          onChange={updateTotalPrice}
        />
      </Form.Item>

      <Form.Item
        name="totalPrice"
        label="月租(¥)"
      >
        <InputNumber
          style={{ width: '100%' }}
          disabled
        />
      </Form.Item>

      <Form.Item
        name="efficiency"
        label="空间利用率 (%)"
        rules={[
          { required: true, message: '请添加空间利用率' },
          { type: 'number', min: 0, max: 100, message: '利用率必须是0-100' }
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
        label="容量 (人数)"
        rules={[{ required: true, message: '请添加容量(人数)' }]}
      >
        <InputNumber
          placeholder="添加容量(人数)"
          style={{ width: '100%' }}
          min={1}
        />
      </Form.Item>

      <Form.Item
        name="renovation"
        label="装修"
        rules={[{ required: true, message: '请选择专修程度' }]}
      >
        <Select placeholder="选择装修程度">
          <Select.Option value="furnished">精装</Select.Option>
          <Select.Option value="unfurnished">简装</Select.Option>
          <Select.Option value="custom">毛坯</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="orientation"
        label="朝向"
        rules={[{ required: true, message: '请选择朝向' }]}
      >
        <Select placeholder="选择朝向">
          <Select.Option value="north">北</Select.Option>
          <Select.Option value="south">南</Select.Option>
          <Select.Option value="east">东</Select.Option>
          <Select.Option value="west">西</Select.Option>
          <Select.Option value="northeast">东北</Select.Option>
          <Select.Option value="northwest">西北</Select.Option>
          <Select.Option value="southeast">东南</Select.Option>
          <Select.Option value="southwest">西南</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="leaseTerm"
        label="租期"
        rules={[{ required: true, message: '请添加租期' }]}
      >
        <Select placeholder="选择租期">
          <Select.Option value="1-year">1 Year</Select.Option>
          <Select.Option value="2-year">2 Years</Select.Option>
          <Select.Option value="3-year">3 Years</Select.Option>
          <Select.Option value="negotiable">Negotiable</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="status"
        label="状态"
        rules={[{ required: true, message: '请选择状态' }]}
      >
        <Select placeholder="选择状态">
          <Select.Option value="available">可用的</Select.Option>
          <Select.Option value="rented">租用的</Select.Option>
          <Select.Option value="pending">待定</Select.Option>
          <Select.Option value="maintenance">维护中</Select.Option>
        </Select>
      </Form.Item>

      {mode === 'create' ? (
        officeId && (
          <Form.Item
            name="photos"
            label="Office Photos"
          >
            <div>
              <p>Office created successfully! You can now upload images.</p>
              <ImageUpload
                photos={form.getFieldValue('photos') || []}
                onImagesChange={handleImagesChange}
                endpoint={`/offices/${officeId}/images`}
              />
              <Button 
                type="primary" 
                onClick={() => navigate(`/buildings/${buildingId}/offices`, { replace: true })}
                style={{ marginTop: 16 }}
              >
                Done - Go to Offices List
              </Button>
            </div>
          </Form.Item>
        )
      ) : (
        <Form.Item
          name="photos"
          label="Office Photos"
        >
          <ImageUpload
            photos={form.getFieldValue('photos') || []}
            onImagesChange={handleImagesChange}
            endpoint={`/offices/${initialValues?._id}/images`}
          />
        </Form.Item>
      )}

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
              Add Tag
            </Button>
          </Form.Item>
        )}
      </Form.List>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {mode === 'create' ? '创建办公室' : '更新办公室'}
          </Button>
          <Button onClick={() => navigate(`/buildings/${buildingId}/offices`)}>
            取消
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default OfficeForm;
