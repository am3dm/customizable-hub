// أنواع البيانات الأساسية للنظام

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  price: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  unit: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number;
  totalPurchases: number;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number;
  totalPurchases: number;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'sale' | 'purchase' | 'return';
  customerId?: string;
  supplierId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  remaining: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'credit' | 'transfer';
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  reference?: string;
  createdAt: Date;
  createdBy: string;
}

export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  totalProfit: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingInvoices: number;
  todaySales: number;
  monthSales: number;
}

export interface Settings {
  storeName: string;
  storePhone?: string;
  storeEmail?: string;
  storeAddress?: string;
  currency: string;
  taxRate: number;
  logo?: string;
  invoicePrefix: string;
  language: 'ar' | 'en';
}

export type ViewMode = 'dashboard' | 'products' | 'categories' | 'sales' | 'purchases' | 'customers' | 'suppliers' | 'reports' | 'settings' | 'users' | 'debts';

// Database mapped types for Supabase
export interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  category_id: string | null;
  price: number;
  cost: number;
  quantity: number;
  min_quantity: number;
  unit: string | null;
  image_url: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  categories?: { name: string; color: string | null } | null;
}

export interface DbCategory {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  parent_id: string | null;
  is_active: boolean | null;
  created_at: string;
}

export interface DbCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  balance: number | null;
  total_purchases: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbSupplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  balance: number | null;
  total_purchases: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbInvoice {
  id: string;
  invoice_number: string;
  type: string;
  customer_id: string | null;
  supplier_id: string | null;
  subtotal: number;
  discount: number | null;
  tax: number | null;
  total: number;
  paid: number | null;
  remaining: number | null;
  status: string | null;
  payment_method: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  customers?: { name: string } | null;
  suppliers?: { name: string } | null;
}

export interface DbStoreSettings {
  id: string;
  store_name: string | null;
  store_phone: string | null;
  store_email: string | null;
  store_address: string | null;
  logo_url: string | null;
  currency: string | null;
  tax_rate: number | null;
  invoice_prefix: string | null;
  language: string | null;
  created_at: string;
  updated_at: string;
}
