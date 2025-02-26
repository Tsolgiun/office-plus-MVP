export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'tenant' | 'owner' | 'admin';
}

export interface Building {
  _id: string;
  name: string;
  location: {
    address: string;
    metro: string;
  };
  priceRange: {
    min: number;
    max: number;
  };
  areaRange: {
    min: number;
    max: number;
  };
  grade: string;
  amenities: string[];
  tags: string[];
  photos: string[];
  owner: string;
}

export interface Office {
  _id: string;
  buildingId: string;
  floor: number;
  area: number;
  pricePerUnit: number;
  totalPrice: number;
  efficiency: number;
  capacity: number;
  renovation: 'furnished' | 'unfurnished' | 'custom';
  orientation: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
  leaseTerm: '1-year' | '2-year' | '3-year' | 'negotiable';
  photos: string[];
  tags: string[];
  status: 'available' | 'rented' | 'pending' | 'maintenance';
  lastUpdated: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  error?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
