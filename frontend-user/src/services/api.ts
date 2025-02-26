import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { Building, Office, User, AuthResponse, ApiError, PaginatedResponse } from '../types/models';

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

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  }

  // Building endpoints
  async getBuildings(params?: Record<string, unknown>): Promise<Building[]> {
    const response: AxiosResponse<Building[]> = await this.api.get('/buildings', { params });
    return response.data;
  }

  async getBuildingById(id: string): Promise<Building> {
    const response: AxiosResponse<Building> = await this.api.get(`/buildings/${id}`);
    return response.data;
  }

  async searchBuildings(params: Record<string, unknown>): Promise<PaginatedResponse<Building>> {
    const response: AxiosResponse<PaginatedResponse<Building>> = await this.api.get('/buildings/search', { params });
    return response.data;
  }

  // Office endpoints
  async getBuildingOffices(buildingId: string): Promise<Office[]> {
    const response: AxiosResponse<Office[]> = await this.api.get(`/offices/building/${buildingId}`);
    return response.data;
  }

  async getOfficeById(id: string): Promise<Office> {
    const response: AxiosResponse<Office> = await this.api.get(`/offices/${id}`);
    return response.data;
  }

  async searchOffices(params: Record<string, unknown>): Promise<PaginatedResponse<Office>> {
    const response: AxiosResponse<PaginatedResponse<Office>> = await this.api.get('/offices/public/search', { params });
    return response.data;
  }

  // User endpoints
  async getUserProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/profile');
    return response.data;
  }

  // TODO: Add more endpoints as needed
}

export const api = ApiService.getInstance();
