export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: 'customer' | 'farmer' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          product_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'product_count'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      farmers: {
        Row: {
          id: string;
          user_id: string;
          farm_name: string;
          location: string;
          state: string;
          bio: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          verified: boolean;
          rating: number;
          total_reviews: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['farmers']['Row'], 'id' | 'created_at' | 'verified' | 'rating' | 'total_reviews'>;
        Update: Partial<Database['public']['Tables']['farmers']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          farmer_id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          original_price: number | null;
          unit: string;
          stock_quantity: number;
          image_url: string | null;
          images: string[];
          is_organic: boolean;
          is_featured: boolean;
          rating: number;
          total_reviews: number;
          discount_percent: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at' | 'rating' | 'total_reviews'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cart_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['cart_items']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          total_amount: number;
          delivery_address: Json;
          payment_method: string;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['wishlists']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['wishlists']['Insert']>;
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          full_name: string;
          phone: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          pincode: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['addresses']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['addresses']['Insert']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Convenient type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Farmer = Database['public']['Tables']['farmers']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type CartItem = Database['public']['Tables']['cart_items']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Wishlist = Database['public']['Tables']['wishlists']['Row'];
export type Address = Database['public']['Tables']['addresses']['Row'];

export type ProductWithFarmer = Product & {
  farmer: Farmer;
  category: Category;
};

export type CartItemWithProduct = CartItem & {
  product: ProductWithFarmer;
};

export type OrderWithItems = Order & {
  order_items: (OrderItem & { product: Product })[];
};
