import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { AuthResponse, User, Building, Office, PaginatedResponse, ApiError } from '../types/models';

class ApiService {
  private api: AxiosInstance;
  private static instance: ApiService;

  private constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('token', response.data.token);
    return response.data;
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', {
      username,
      email,
      password,
    });
    localStorage.setItem('token', response.data.token);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/profile');
    return response.data;
  }

  // Building endpoints
  async createBuilding(buildingData: Partial<Building>): Promise<Building> {
    const response: AxiosResponse<{ building: Building }> = await this.api.post('/buildings', buildingData);
    return response.data.building;
  }

  async getBuildings(): Promise<Building[]> {
    const response: AxiosResponse<Building[]> = await this.api.get('/buildings');
    return response.data;
  }

  async getBuildingById(id: string): Promise<Building> {
    const response: AxiosResponse<Building> = await this.api.get(`/buildings/${id}`);
    return response.data;
  }

  async updateBuilding(id: string, buildingData: Partial<Building>): Promise<Building> {
    const response: AxiosResponse<{ building: Building }> = await this.api.put(`/buildings/${id}`, buildingData);
    return response.data.building;
  }

  async deleteBuilding(id: string): Promise<void> {
    await this.api.delete(`/buildings/${id}`);
  }

  async searchBuildings(params: Record<string, any>): Promise<PaginatedResponse<Building>> {
    const response: AxiosResponse<PaginatedResponse<Building>> = await this.api.get('/buildings/search', { params });
    return response.data;
  }

  // Office endpoints
  async createOffice(officeData: Partial<Office>): Promise<Office> {
    const response: AxiosResponse<{ office: Office }> = await this.api.post('/offices', officeData);
    return response.data.office;
  }

  async getBuildingOffices(buildingId: string): Promise<Office[]> {
    const response: AxiosResponse<Office[]> = await this.api.get(`/offices/building/${buildingId}`);
    return response.data;
  }

  async getOfficeById(id: string): Promise<Office> {
    const response: AxiosResponse<Office> = await this.api.get(`/offices/${id}`);
    return response.data;
  }

  async updateOffice(id: string, officeData: Partial<Office>): Promise<Office> {
    const response: AxiosResponse<{ office: Office }> = await this.api.put(`/offices/${id}`, officeData);
    return response.data.office;
  }

  async deleteOffice(id: string): Promise<void> {
    await this.api.delete(`/offices/${id}`);
  }

  async searchOffices(params: Record<string, any>): Promise<PaginatedResponse<Office>> {
    const response: AxiosResponse<PaginatedResponse<Office>> = await this.api.get('/offices/search', { params });
    return response.data;
  }

  // Upload endpoints (to be implemented when file upload is added)
  async uploadPhotos(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('photos', file));
    
    const response: AxiosResponse<{ urls: string[] }> = await this.api.post('/upload/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.urls;
  }
}

export const api = ApiService.getInstance();
