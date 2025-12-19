import { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, FileText } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const Reports = () => {
  const { invoices, products, categories, settings, getDashboardStats } = useStore();
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const stats = getDashboardStats();

  // Sales by category
  const salesByCategory = categories.map(cat => {
    const categoryProducts = products.filter(p => p.categoryId === cat.id);
    const categoryTotal = invoices
      .filter(i => i.type === 'sale' && i.status === 'completed')
      .reduce((sum, inv) => {
        return sum + inv.items
          .filter(item => categoryProducts.some(p => p.id === item.productId))
          .reduce((itemSum, item) => itemSum + item.total, 0);
      }, 0);
    return { name: cat.name, value: categoryTotal, color: cat.color };
  }).filter(c => c.value > 0);

  // Monthly sales data (mock for demo)
  const monthlySalesData = [
    { month: 'يناير', sales: 15000, purchases: 10000 },
    { month: 'فبراير', sales: 22000, purchases: 15000 },
    { month: 'مارس', sales: 18000, purchases: 12000 },
    { month: 'أبريل', sales: 28000, purchases: 18000 },
    { month: 'مايو', sales: 25000, purchases: 16000 },
    { month: 'يونيو', sales: 32000, purchases: 20000 },
  ];

  // Top selling products
  const topProducts = products
    .map(product => {
      const totalSold = invoices
        .filter(i => i.type === 'sale' && i.status === 'completed')
        .reduce((sum, inv) => {
          const item = inv.items.find(i => i.productId === product.id);
          return sum + (item?.quantity || 0);
        }, 0);
      return { ...product, totalSold };
    })
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  // Recent invoices
  const recentInvoices = invoices.slice(-10).reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">التقارير</h1>
          <p className="text-muted-foreground">تحليل أداء المتجر والإحصائيات</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="input-field"
          >
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
            <option value="year">هذه السنة</option>
          </select>
          <button className="btn-secondary">
            <Download size={18} />
            تصدير
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <TrendingUp className="text-primary" size={20} />
            </div>
            <span className="text-sm text-muted-foreground">إجمالي المبيعات</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.totalSales, settings.currency)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-accent/10">
              <TrendingDown className="text-accent" size={20} />
            </div>
            <span className="text-sm text-muted-foreground">إجمالي المشتريات</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.totalPurchases, settings.currency)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-success/10">
              <BarChart3 className="text-success" size={20} />
            </div>
            <span className="text-sm text-muted-foreground">صافي الربح</span>
          </div>
          <p className="text-2xl font-bold text-accent">{formatCurrency(stats.totalProfit, settings.currency)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-info/10">
              <FileText className="text-info" size={20} />
            </div>
            <span className="text-sm text-muted-foreground">عدد الفواتير</span>
          </div>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales vs Purchases Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="section-title">المبيعات والمشتريات الشهرية</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px'
                  }} 
                />
                <Legend />
                <Bar dataKey="sales" name="المبيعات" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="المشتريات" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="section-title">المبيعات حسب التصنيف</h3>
          <div className="h-[300px]">
            {salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, settings.currency)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                لا توجد بيانات مبيعات
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="section-title">المنتجات الأكثر مبيعاً</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <span className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.totalSold} وحدة مباعة</p>
                </div>
                <span className="font-bold">{formatCurrency(product.price * product.totalSold, settings.currency)}</span>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-center text-muted-foreground py-4">لا توجد مبيعات بعد</p>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="section-title">آخر الفواتير</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.type === 'sale' ? 'فاتورة بيع' : 'فاتورة شراء'} • {formatDate(invoice.createdAt)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold">{formatCurrency(invoice.total, settings.currency)}</p>
                  <span className={`badge ${
                    invoice.status === 'completed' ? 'badge-success' : 
                    invoice.status === 'pending' ? 'badge-warning' : 'badge-destructive'
                  }`}>
                    {invoice.status === 'completed' ? 'مكتمل' : 
                     invoice.status === 'pending' ? 'معلق' : 'ملغي'}
                  </span>
                </div>
              </div>
            ))}
            {recentInvoices.length === 0 && (
              <p className="text-center text-muted-foreground py-4">لا توجد فواتير بعد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
