import React from 'react';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { Button, message } from 'antd';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none !important;
  background: transparent !important;
  padding: 8px !important;
  transition: transform 0.3s !important;

  &:hover {
    transform: scale(1.1);
  }

  .anticon {
    font-size: 28px;
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.3));
  }

  .anticon-heart {
    position: relative;
  }

  .anticon-heart::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70%;
    height: 70%;
    background: rgba(255, 255, 255, 0.8);
    z-index: -1;
    border-radius: 50%;
  }
`;

interface FavoriteButtonProps {
  itemId: string;
  type: 'building' | 'office';
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ itemId, type, className }) => {
  const { isLoggedIn, toggleBuildingFavorite, toggleOfficeFavorite, isBuildingFavorited, isOfficeFavorited } = useAuthStore();
  const navigate = useNavigate();

  const isFavorited = type === 'building' 
    ? isBuildingFavorited(itemId)
    : isOfficeFavorited(itemId);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      message.info('Please login to save favorites');
      navigate('/login');
      return;
    }

    try {
      const toggleFn = type === 'building' ? toggleBuildingFavorite : toggleOfficeFavorite;
      const result = await toggleFn(itemId);
      
      if (result) {
        message.success('Added to favorites');
      } else {
        message.success('Removed from favorites');
      }
    } catch {
      message.error('Failed to update favorite');
    }
  };

  return (
    <StyledButton
      type="text"
      icon={isFavorited ? (
        <HeartFilled style={{ color: '#1890ff' }} />
      ) : (
        <HeartOutlined style={{ color: '#1890ff' }} />
      )}
      onClick={handleToggleFavorite}
      className={className}
    />
  );
};

export default FavoriteButton;
