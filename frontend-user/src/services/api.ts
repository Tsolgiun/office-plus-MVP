import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { 
  Building, 
  Office, 
  User, 
  AuthResponse, 
  ApiError, 
  PaginatedResponse,
  UserFavorites,
  FavoriteResponse,
  Appointment
} from '../types/models';

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
    '/offices/public/search'
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

    // Add token to requests if available and endpoint requires auth
    this.api.interceptors.request.use((config) => {
      // Skip auth for public endpoints
      if (config.url && this.isPublicEndpoint(config.url)) {
        return config;
      }
      
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
        // Only redirect to login for auth-required endpoints
        if (error.response?.status === 401 && error.config?.url && !this.isPublicEndpoint(error.config.url)) {
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
    const response: AxiosResponse<Building[]> = await this.api.get('/buildings/public', { params });
    return response.data;
  }

  async getBuildingById(id: string): Promise<Building> {
    const response: AxiosResponse<Building> = await this.api.get(`/buildings/public/${id}`);
    return response.data;
  }

  async searchBuildings(params: Record<string, unknown>): Promise<PaginatedResponse<Building>> {
    const response: AxiosResponse<PaginatedResponse<Building>> = await this.api.get('/buildings/public/search', { params });
    return response.data;
  }

  // Office endpoints
  async getBuildingOffices(buildingId: string): Promise<Office[]> {
    const response: AxiosResponse<Office[]> = await this.api.get(`/offices/public/building/${buildingId}`);
    return response.data;
  }

  async getOfficeById(id: string): Promise<Office> {
    const response: AxiosResponse<Office> = await this.api.get(`/offices/public/${id}`);
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

  // Favorite endpoints
  async getFavorites(): Promise<UserFavorites> {
    const response: AxiosResponse<UserFavorites> = await this.api.get('/favorites');
    return response.data;
  }

  async toggleBuildingFavorite(buildingId: string): Promise<FavoriteResponse> {
    const response: AxiosResponse<FavoriteResponse> = await this.api.post(`/favorites/buildings/${buildingId}`);
    return response.data;
  }

  async toggleOfficeFavorite(officeId: string): Promise<FavoriteResponse> {
    const response: AxiosResponse<FavoriteResponse> = await this.api.post(`/favorites/offices/${officeId}`);
    return response.data;
  }

  // Appointments endpoints
  async createAppointment(appointmentData: Omit<Appointment, '_id' | 'status'>): Promise<Appointment> {
    const response = await this.api.post('/appointments/createAppointment', appointmentData);
    return response.data;
  }

  async getUserAppointments(userId: string): Promise<{ appointments: Appointment[] }> {
    const response = await this.api.get(`/appointments/getUserAppointments/${userId}`);
    return response.data;
  }

  async cancelAppointment(appointmentId: string): Promise<{ message: string }> {
    const response = await this.api.post(`/appointments/cancelAppointment/${appointmentId}`);
    return response.data;
  }

  async getBuildingAppointments(buildingId: string, date?: string): Promise<{ appointments: Appointment[] }> {
    const url = date 
      ? `/appointments/getBuildingAppointments/${buildingId}?date=${date}`
      : `/appointments/getBuildingAppointments/${buildingId}`;
      
    const response = await this.api.get(url);
    return response.data;
  }

  async updateAppointmentStatus(appointmentId: string, status: string): Promise<{ message: string }> {
    const response = await this.api.post(`/appointments/updateAppointmentStatus/${appointmentId}`, { status });
    return response.data;
  }

  //Ai endpoints
  async getAIresponse(message: string): Promise<{ response: string }> {
    const response = await this.api.get(`/auth/getAIresponse`, { params: { message } });
    return response.data;
  }
}

export const api = ApiService.getInstance();
