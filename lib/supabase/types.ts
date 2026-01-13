export interface Client {
  id: string;
  email: string;
  name: string;
  company?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  type: 'rapid' | 'full' | 'ai-integration' | 'design';
  status: 'inquiry' | 'active' | 'review' | 'completed' | 'cancelled';
  budget: number;
  start_date?: string;
  delivery_date?: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assigned_to?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  project_id: string;
  sender_type: 'client' | 'team';
  sender_name: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface File {
  id: string;
  project_id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_by: string;
  uploaded_by_type: 'client' | 'team';
  created_at: string;
}

export interface Payment {
  id: string;
  project_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  stripe_payment_id?: string;
  paid_at?: string;
  created_at: string;
}
