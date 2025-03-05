import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Space, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Building } from '../types/models';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import ImageUpload from './ImageUpload';
import AMapComponent from './AMapComponent';

const { TextArea } = Input;

interface BuildingFormProps {
  initialValues?: Partial<Building>;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

const DEFAULT_LOCATION = {
  lng: 116.397428,
  lat: 39.90923
};

const BuildingForm: React.FC<BuildingFormProps> = ({ initialValues, mode, onSuccess }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [buildingId, setBuildingId] = useState<string | null>(initialValues?._id || null);
  const [currentLocation, setCurrentLocation] = useState(initialValues?.location?.coordinates || DEFAULT_LOCATION);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleLocationSelect = (location: { lng: number; lat: number }, address?: string) => {
    setCurrentLocation(location);
    const currentLocation = form.getFieldValue('location') || {};
    
    // Parse address into components if address is provided
    if (address) {
      // Chinese addresses typically follow format: [City][Region][Street]
      // e.g., "深圳市南山区科技园路"
      const cityMatch = address.match(/^(.*?市)/);
      const city = cityMatch ? cityMatch[1] : '';
      
      let remainingAddress = address.replace(city, '');
      const regionMatch = remainingAddress.match(/^(.*?区|.*?县)/);
      const region = regionMatch ? regionMatch[1] : '';
      
      const street = remainingAddress.replace(region, '');
      
      form.setFieldsValue({
        location: {
          ...currentLocation,
          coordinates: location,
          address: {
            city: city,
            region: region,
            street: street,
            fullAddress: address
          }
        }
      });
    } else {
      form.setFieldsValue({
        location: {
          ...currentLocation,
          coordinates: location
        }
      });
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Ensure coordinates are included in the form data
      const formData = {
        ...values,
        location: {
          ...values.location,
          coordinates: currentLocation
        }
      };

      if (mode === 'create') {
        const building = await api.createBuilding(formData);
        setBuildingId(building._id);
        message.success('Building created successfully. You can now upload images.');
        // Don't navigate away in create mode - allow image upload first
      } else {
        if (!initialValues?._id) {
          throw new Error('Building ID not found');
        }
        await api.updateBuilding(initialValues._id, formData);
        message.success('Building updated successfully');
        onSuccess?.();
        // Only navigate away in edit mode
        navigate('/buildings', { replace: true });
      }
    } catch (error) {
      console.error('Error saving building:', error);
      message.error('Error saving building. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagesChange = async (photos: string[]) => {
    form.setFieldValue('photos', photos);
    
    if (mode === 'create' && buildingId) {
      try {
        // Fetch fresh building data after upload
        const building = await api.getBuildingById(buildingId);
        form.setFieldsValue({
          ...building,
          photos: building.photos
        });
        message.success('Image preview updated');
      } catch (error) {
        console.error('Error fetching updated building data:', error);
      }
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
        location: {
          coordinates: DEFAULT_LOCATION
        },
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
        label="位置选择"
        tooltip="搜索地址或点击地图选择位置"
      >
        <AMapComponent
          initialLocation={currentLocation}
          onLocationSelect={handleLocationSelect}
          showSearch={true}
        />
      </Form.Item>

      <Form.Item
        label="地址信息"
        required={true}
        style={{ marginBottom: 0 }}
      >
        <Form.Item
          name={['location', 'address', 'city']}
          label="城市"
          rules={[{ required: true, message: '请输入城市' }]}
          style={{ marginBottom: 16 }}
        >
          <Input placeholder="例如：深圳市" style={{ width: '100%' }} disabled />
        </Form.Item>
        
        <Form.Item
          name={['location', 'address', 'region']}
          label="区域"
          rules={[{ required: true, message: '请输入区域' }]}
          style={{ marginBottom: 16 }}
        >
          <Input placeholder="例如：南山区" style={{ width: '100%' }} disabled />
        </Form.Item>
        
        <Form.Item
          name={['location', 'address', 'street']}
          label="街道地址"
          rules={[{ required: true, message: '请输入详细街道地址' }]}
          style={{ marginBottom: 16 }}
        >
          <Input placeholder="输入详细街道地址" style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name={['location', 'address', 'fullAddress']}
          label="完整地址"
          rules={[{ required: true, message: '请输入完整地址' }]}
          style={{ marginBottom: 16 }}
        >
          <Input placeholder="完整地址（自动填充）" style={{ width: '100%' }} disabled />
        </Form.Item>
        
        <Form.Item
          name={['location', 'metro']}
          label="附近地铁站"
          rules={[{ required: true, message: '请输入最近的地铁' }]}
          style={{ marginBottom: 0 }}
        >
          <Input placeholder="输入最近的地铁站" style={{ width: '100%' }} />
        </Form.Item>
      </Form.Item>

      <Form.Item label="价格区间 (¥/㎡/月)" required>
        <Space.Compact>
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
        </Space.Compact>
      </Form.Item>

      <Form.Item label="面积区间 (㎡)" required>
        <Space.Compact>
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
        </Space.Compact>
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

      {mode === 'create' && !buildingId && (
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              创建写字楼
            </Button>
            <Button onClick={() => navigate('/buildings', { replace: true })}>
              取消
            </Button>
          </Space>
        </Form.Item>
      )}

      {mode === 'create' ? (
        buildingId && (
          <Form.Item
            name="photos"
            label="Building Photos"
          >
            <div>
              <p>Building created successfully! You can now upload images.</p>
              <ImageUpload
                photos={form.getFieldValue('photos') || []}
                onImagesChange={handleImagesChange}
                endpoint={`/buildings/${buildingId}/images`}
              />
              <Button 
                type="primary" 
                onClick={() => navigate('/buildings', { replace: true })}
                style={{ marginTop: 16 }}
              >
                Done - Go to Buildings List
              </Button>
            </div>
          </Form.Item>
        )
      ) : (
        <>
          <Form.Item
            name="photos"
            label="Building Photos"
          >
            <ImageUpload
              photos={form.getFieldValue('photos') || []}
              onImagesChange={handleImagesChange}
              endpoint={`/buildings/${initialValues?._id}/images`}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                更新写字楼
              </Button>
              <Button onClick={() => navigate('/buildings', { replace: true })}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </>
      )}
    </Form>
  );
};

export default BuildingForm;
