export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface CurrentUser {
  userId: number;
  email: string;
  roles: string[];
}
