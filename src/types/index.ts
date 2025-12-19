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

export type ViewMode = 'dashboard' | 'products' | 'categories' | 'sales' | 'purchases' | 'customers' | 'suppliers' | 'reports' | 'settings';
