import React, { useCallback, useState } from 'react';
import { UploadOutlined, LoadingOutlined, DeleteOutlined } from '@ant-design/icons';
import { Upload, Button, Space, Image, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import axios from 'axios';

interface ImageUploadProps {
  photos: string[];
  onImagesChange: (newPhotos: string[]) => void;
  endpoint: string;
  multiple?: boolean;
  maxCount?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  photos = [],
  onImagesChange,
  endpoint,
  multiple = true,
  maxCount = 10
}) => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      console.log('Starting file upload:', file.name, file.type, file.size);
      const formData = new FormData();
      formData.append('photos', file);

      const fullEndpoint = `${import.meta.env.VITE_API_URL}${endpoint}`;
      console.log('Uploading to:', fullEndpoint);
      
      const response = await axios.post(fullEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.photos) {
        const newPhotos = response.data.photos;
        onImagesChange([...photos, ...newPhotos]);
        message.success('Image uploaded successfully');
      }
    } catch (error) {
      let errorMessage = 'Failed to upload image';
      if (axios.isAxiosError(error)) {
        console.error('Upload error response:', error.response?.data);
        errorMessage = error.response?.data?.message || errorMessage;
      }
      message.error(errorMessage);
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
      setFileList([]);
    }
  };

  const handleDelete = useCallback(async (photoUrl: string) => {
    try {
      const fullEndpoint = `${import.meta.env.VITE_API_URL}${endpoint}`;
      await axios.delete(`${fullEndpoint}/${encodeURIComponent(photoUrl)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const newPhotos = photos.filter(photo => photo !== photoUrl);
      onImagesChange(newPhotos);
      message.success('Image deleted successfully');
    } catch (error) {
      message.error('Failed to delete image');
      console.error('Delete error:', error);
    }
  }, [photos, endpoint, onImagesChange]);

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must smaller than 5MB!');
        return false;
      }

      handleUpload(file);
      return false; // Prevent default upload behavior
    },
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    multiple,
    maxCount: maxCount - photos.length,
    showUploadList: false
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Upload {...uploadProps}>
          <Button icon={loading ? <LoadingOutlined /> : <UploadOutlined />} disabled={loading || photos.length >= maxCount}>
            {loading ? 'Uploading' : 'Upload Images'}
          </Button>
        </Upload>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
          {photos.map((photo, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <Image
                src={photo}
                alt={`Photo ${index + 1}`}
                style={{ width: 100, height: 100, objectFit: 'cover' }}
              />
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(photo)}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'rgba(255, 255, 255, 0.8)'
                }}
              />
            </div>
          ))}
        </div>
      </Space>
    </div>
  );
};

export default ImageUpload;
