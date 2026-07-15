import { User } from './user.model';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  name: string;
  password_confirmation: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  access_token?: string;
  token_type?: string;
  user: User;
}
