import type {
  RegisterData,
  LoginData,
  ApiResponse,
  AuthSuccessResponse,
  ErrorResponse
} from '../types/Auth';
import { post } from '../types/api'; // Importer depuis api.ts (ajuste le chemin si besoin)

export const authService = {
  register: async (
    userData: RegisterData
  ): Promise<ApiResponse<AuthSuccessResponse | ErrorResponse>> => {
    try {
      const data = await post<AuthSuccessResponse>(
        'auth/register', // Endpoint sans /api si API_BASE_URL inclut déjà le préfixe nécessaire
        userData
      );

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        data: error as ErrorResponse,
      };
    }
  },

  login: async (
    credentials: LoginData
  ): Promise<ApiResponse<AuthSuccessResponse | ErrorResponse>> => {
    try {
      const data = await post<AuthSuccessResponse>(
        'auth/login', // Endpoint sans /api
        credentials
      );

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        data: error as ErrorResponse,
      };
    }
  },
};