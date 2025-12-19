import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Category, Customer, Supplier, Invoice, Transaction, Settings, ViewMode, DashboardStats } from '@/types';

interface StoreState {
  // Current view
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'balance' | 'totalPurchases'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'balance' | 'totalPurchases'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;

  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;

  // Dashboard stats
  getDashboardStats: () => DashboardStats;

  // Cart for POS
  cart: { product: Product; quantity: number }[];
  addToCart: (product: Product) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const generateInvoiceNumber = (prefix: string, count: number) => {
  return `${prefix}${String(count + 1).padStart(6, '0')}`;
};

// Initial demo data
const initialCategories: Category[] = [
  { id: '1', name: 'إلكترونيات', description: 'أجهزة إلكترونية ومستلزماتها', color: '#3B82F6', isActive: true, createdAt: new Date() },
  { id: '2', name: 'ملابس', description: 'ملابس رجالية ونسائية', color: '#10B981', isActive: true, createdAt: new Date() },
  { id: '3', name: 'أغذية', description: 'مواد غذائية ومشروبات', color: '#F59E0B', isActive: true, createdAt: new Date() },
  { id: '4', name: 'مستلزمات منزلية', description: 'أدوات ومستلزمات للمنزل', color: '#8B5CF6', isActive: true, createdAt: new Date() },
];

const initialProducts: Product[] = [
  { id: '1', name: 'هاتف ذكي', description: 'هاتف ذكي حديث', sku: 'PHONE001', categoryId: '1', price: 2500, cost: 2000, quantity: 50, minQuantity: 10, unit: 'قطعة', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'سماعات بلوتوث', description: 'سماعات لاسلكية', sku: 'HEAD001', categoryId: '1', price: 350, cost: 250, quantity: 100, minQuantity: 20, unit: 'قطعة', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'قميص رجالي', description: 'قميص قطني', sku: 'SHIRT001', categoryId: '2', price: 150, cost: 80, quantity: 200, minQuantity: 30, unit: 'قطعة', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', name: 'عصير برتقال', description: 'عصير طبيعي', sku: 'JUICE001', categoryId: '3', price: 15, cost: 10, quantity: 500, minQuantity: 100, unit: 'علبة', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '5', name: 'طقم صحون', description: 'طقم صحون 24 قطعة', sku: 'DISH001', categoryId: '4', price: 450, cost: 300, quantity: 30, minQuantity: 5, unit: 'طقم', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

const initialCustomers: Customer[] = [
  { id: '1', name: 'أحمد محمد', phone: '0501234567', email: 'ahmed@email.com', balance: 0, totalPurchases: 5000, createdAt: new Date() },
  { id: '2', name: 'خالد عبدالله', phone: '0507654321', balance: 500, totalPurchases: 12000, createdAt: new Date() },
];

const initialSuppliers: Supplier[] = [
  { id: '1', name: 'شركة الإلكترونيات', phone: '0112345678', email: 'info@electronics.com', balance: 10000, totalPurchases: 50000, createdAt: new Date() },
  { id: '2', name: 'مصنع الملابس', phone: '0118765432', balance: 0, totalPurchases: 25000, createdAt: new Date() },
];

const initialSettings: Settings = {
  storeName: 'متجر النجاح',
  storePhone: '0501234567',
  storeEmail: 'info@success-store.com',
  storeAddress: 'الرياض، المملكة العربية السعودية',
  currency: 'ر.س',
  taxRate: 15,
  invoicePrefix: 'INV-',
  language: 'ar',
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentView: 'dashboard',
      setCurrentView: (view) => set({ currentView: view }),

      products: initialProducts,
      addProduct: (product) => set((state) => ({
        products: [...state.products, {
          ...product,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
      })),
      updateProduct: (id, product) => set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, ...product, updatedAt: new Date() } : p
        ),
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      })),

      categories: initialCategories,
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, {
          ...category,
          id: generateId(),
          createdAt: new Date(),
        }],
      })),
      updateCategory: (id, category) => set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? { ...c, ...category } : c
        ),
      })),
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      })),

      customers: initialCustomers,
      addCustomer: (customer) => set((state) => ({
        customers: [...state.customers, {
          ...customer,
          id: generateId(),
          balance: 0,
          totalPurchases: 0,
          createdAt: new Date(),
        }],
      })),
      updateCustomer: (id, customer) => set((state) => ({
        customers: state.customers.map((c) =>
          c.id === id ? { ...c, ...customer } : c
        ),
      })),
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
      })),

      suppliers: initialSuppliers,
      addSupplier: (supplier) => set((state) => ({
        suppliers: [...state.suppliers, {
          ...supplier,
          id: generateId(),
          balance: 0,
          totalPurchases: 0,
          createdAt: new Date(),
        }],
      })),
      updateSupplier: (id, supplier) => set((state) => ({
        suppliers: state.suppliers.map((s) =>
          s.id === id ? { ...s, ...supplier } : s
        ),
      })),
      deleteSupplier: (id) => set((state) => ({
        suppliers: state.suppliers.filter((s) => s.id !== id),
      })),

      invoices: [],
      addInvoice: (invoice) => {
        const state = get();
        const invoiceNumber = generateInvoiceNumber(state.settings.invoicePrefix, state.invoices.length);
        
        // Update product quantities
        if (invoice.type === 'sale') {
          invoice.items.forEach((item) => {
            const product = state.products.find((p) => p.id === item.productId);
            if (product) {
              state.updateProduct(item.productId, { quantity: product.quantity - item.quantity });
            }
          });
        } else if (invoice.type === 'purchase') {
          invoice.items.forEach((item) => {
            const product = state.products.find((p) => p.id === item.productId);
            if (product) {
              state.updateProduct(item.productId, { quantity: product.quantity + item.quantity });
            }
          });
        }

        set((state) => ({
          invoices: [...state.invoices, {
            ...invoice,
            id: generateId(),
            invoiceNumber,
            createdAt: new Date(),
          }],
        }));
      },
      updateInvoice: (id, invoice) => set((state) => ({
        invoices: state.invoices.map((i) =>
          i.id === id ? { ...i, ...invoice } : i
        ),
      })),

      transactions: [],
      addTransaction: (transaction) => set((state) => ({
        transactions: [...state.transactions, {
          ...transaction,
          id: generateId(),
          createdAt: new Date(),
        }],
      })),

      settings: initialSettings,
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings },
      })),

      getDashboardStats: () => {
        const state = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const salesInvoices = state.invoices.filter((i) => i.type === 'sale' && i.status === 'completed');
        const purchaseInvoices = state.invoices.filter((i) => i.type === 'purchase' && i.status === 'completed');

        const totalSales = salesInvoices.reduce((sum, i) => sum + i.total, 0);
        const totalPurchases = purchaseInvoices.reduce((sum, i) => sum + i.total, 0);

        const todaySales = salesInvoices
          .filter((i) => new Date(i.createdAt) >= today)
          .reduce((sum, i) => sum + i.total, 0);

        const monthSales = salesInvoices
          .filter((i) => new Date(i.createdAt) >= monthStart)
          .reduce((sum, i) => sum + i.total, 0);

        const lowStockProducts = state.products.filter((p) => p.quantity <= p.minQuantity).length;
        const pendingInvoices = state.invoices.filter((i) => i.status === 'pending').length;

        return {
          totalSales,
          totalPurchases,
          totalProfit: totalSales - totalPurchases,
          totalProducts: state.products.length,
          lowStockProducts,
          pendingInvoices,
          todaySales,
          monthSales,
        };
      },

      cart: [],
      addToCart: (product) => set((state) => {
        const existingItem = state.cart.find((item) => item.product.id === product.id);
        if (existingItem) {
          return {
            cart: state.cart.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          };
        }
        return { cart: [...state.cart, { product, quantity: 1 }] };
      }),
      updateCartQuantity: (productId, quantity) => set((state) => ({
        cart: quantity <= 0
          ? state.cart.filter((item) => item.product.id !== productId)
          : state.cart.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
      })),
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter((item) => item.product.id !== productId),
      })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'store-data',
    }
  )
);
