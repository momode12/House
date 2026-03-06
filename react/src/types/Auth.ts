export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  email: string;
  username: string;
}

/* Réponses API */
export interface AuthSuccessResponse {
  token: string;
  user: User;
}

export interface ErrorResponse {
  message: string;
}

/* Wrapper générique */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
}
