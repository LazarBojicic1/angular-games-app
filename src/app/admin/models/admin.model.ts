export interface AdminPagedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AdminListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface AdminDashboardStats {
  games: number;
  genres: number;
  platforms: number;
  users: number;
  favorites?: number;
  play_later?: number;
}

export interface AdminGenre {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string | null;
}

export interface AdminGenrePayload {
  name: string;
  slug: string;
  image_background: string | null;
}

export interface AdminPlatform {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string | null;
}

export interface AdminPlatformPayload {
  name: string;
  slug: string;
  image_background: string | null;
}

export interface AdminRole {
  id: number;
  name: string;
  label: string;
  users_count?: number;
}

export interface AdminRolePayload {
  name: string;
  label: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole | string;
  role_id?: number;
  created_at?: string;
}

export interface AdminUserPayload {
  name: string;
  email: string;
  role_id: number;
  password?: string;
  password_confirmation?: string;
}

export interface AdminNamedValue {
  id?: number;
  name: string;
  slug?: string;
}

export interface AdminScreenshot {
  id?: number;
  image: string;
}

export interface AdminPlatformWrapper {
  platform: AdminPlatform;
}

export interface AdminGame {
  id: number;
  rawg_id?: number | null;
  name: string;
  slug: string;
  background_image: string | null;
  description_raw: string;
  website: string;
  released: string | null;
  rating: number;
  metacritic: number | null;
  playtime: number;
  genres: AdminGenre[];
  platforms: Array<AdminPlatform | AdminPlatformWrapper>;
  developers: Array<AdminNamedValue | string>;
  publishers: Array<AdminNamedValue | string>;
  tags: Array<AdminNamedValue | string>;
  screenshots: Array<AdminScreenshot | string>;
}

export interface AdminGamePayload {
  name: string;
  slug: string;
  background_image: string | null;
  description_raw: string;
  website: string | null;
  released: string | null;
  rating: number;
  metacritic: number | null;
  playtime: number;
  genre_ids: number[];
  platform_ids: number[];
  developers: string[];
  publishers: string[];
  tags: string[];
  screenshots: string[];
}

export type LaravelValidationErrors = Record<string, string[]>;

export interface LaravelValidationResponse {
  message?: string;
  errors?: Record<string, string[] | string>;
}
