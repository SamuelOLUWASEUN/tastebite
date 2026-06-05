// ─── Database Types ───────────────────────────────────────────────

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  prep_time_minutes: number;
  calories: number | null;
  tags: string[];
  created_at: string;
  category?: Category;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  notes: string | null;
  menu_item?: MenuItem;
};

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_address: string | null;
  delivery_notes: string | null;
  estimated_delivery_minutes: number | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  default_address: string | null;
  is_admin: boolean;
  created_at: string;
};

// ─── Cart Types ───────────────────────────────────────────────────

export type CartItem = {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
};

// ─── API Response Types ───────────────────────────────────────────

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};
