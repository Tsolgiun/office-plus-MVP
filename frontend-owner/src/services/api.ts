import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { AuthResponse, User, Building, Office, PaginatedResponse, ApiError } from '../types/models';

class ApiService {
  private api: AxiosInstance;
  private static instance: ApiService;
  private readonly publicEndpoints = [
    '/buildings/public',
    '/buildings/public/',
    '/offices/public',
    '/buildings/public/search',
    '/offices/public/',
    '/offices/public/building/',
  ];

  private isPublicEndpoint(url: string): boolean {
    return this.publicEndpoints.some(endpoint => url.startsWith(endpoint));
  }

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

  async updateProfile(userData: Partial<User>): Promise<any> {
    const response: AxiosResponse<User> = await this.api.put('/auth/updateProfile', userData);
    return response.data;
  }

  // Building endpoints - Owner access
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

  // Building endpoints - Public access
  async getPublicBuildings(): Promise<Building[]> {
    const response: AxiosResponse<Building[]> = await this.api.get('/buildings/public');
    return response.data;
  }

  async getPublicBuildingById(id: string): Promise<Building> {
    const response: AxiosResponse<Building> = await this.api.get(`/buildings/public/${id}`);
    return response.data;
  }

  async searchPublicBuildings(params: Record<string, any>): Promise<PaginatedResponse<Building>> {
    const response: AxiosResponse<PaginatedResponse<Building>> = await this.api.get('/buildings/public/search', { params });
    return response.data;
  }

  // Office endpoints - Owner access
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

  // Office endpoints - Public access
  async getPublicBuildingOffices(buildingId: string): Promise<Office[]> {
    const response: AxiosResponse<Office[]> = await this.api.get(`/offices/public/building/${buildingId}`);
    return response.data;
  }

  async getPublicOfficeById(id: string): Promise<Office> {
    const response: AxiosResponse<Office> = await this.api.get(`/offices/public/${id}`);
    return response.data;
  }

  async searchPublicOffices(params: Record<string, any>): Promise<PaginatedResponse<Office>> {
    const response: AxiosResponse<PaginatedResponse<Office>> = await this.api.get('/offices/public/search', { params });
    return response.data;
  }

  // Building image endpoints
  async uploadBuildingPhotos(buildingId: string, photos: FormData): Promise<string[]> {
    const response: AxiosResponse<{ photos: string[] }> = await this.api.post(
      `/buildings/${buildingId}/images`,
      photos,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.photos;
  }

  async deleteBuildingPhoto(buildingId: string, photoUrl: string): Promise<void> {
    await this.api.delete(`/buildings/${buildingId}/images/${encodeURIComponent(photoUrl)}`);
  }

  // Office image endpoints
  async uploadOfficePhotos(officeId: string, photos: FormData): Promise<string[]> {
    const response: AxiosResponse<{ photos: string[] }> = await this.api.post(
      `/offices/${officeId}/images`,
      photos,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.photos;
  }

  async deleteOfficePhoto(officeId: string, photoUrl: string): Promise<void> {
    await this.api.delete(`/offices/${officeId}/images/${encodeURIComponent(photoUrl)}`);
  }

  // appointments endpoints
  async getBuildingAppointments(buildingId: string, date?: string): Promise<any> {
    const url = date 
      ? `/appointments/getBuildingAppointments/${buildingId}?date=${date}`
      : `/appointments/getBuildingAppointments/${buildingId}`;
      
    const response = await this.api.get(url);
    return response.data;
  }

  async updateAppointmentStatus(appointmentId: string, status: string): Promise<any> {
    const response = await this.api.post(`/appointments/updateAppointmentStatus/${appointmentId}`, { status });
    return response.data;
  }
}

export const api = ApiService.getInstance();
