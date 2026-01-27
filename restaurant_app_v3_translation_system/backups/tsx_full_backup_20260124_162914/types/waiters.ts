export type Waiter = {
  id: number;
  name: string;
  pin: string;
  role?: string;
  active: boolean;
  last_login_at?: string | null;
};

