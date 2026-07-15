export type UserRoleName = 'admin' | 'user';

export interface Role {
  id: number;
  name: UserRoleName | string;
  label?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role | UserRoleName;
  role_id?: number;
  created_at?: string;
  updated_at?: string;
}

export function getUserRoleName(user: User | null): string | null {
  if (!user) {
    return null;
  }

  return typeof user.role === 'string' ? user.role : user.role.name;
}
