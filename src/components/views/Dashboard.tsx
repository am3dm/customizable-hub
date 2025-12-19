import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  ShoppingCart,
  CreditCard
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';

export const Dashboard = () => {
  const { getDashboardStats, settings, products, invoices } = useStore();
  const stats = getDashboardStats();

  const statCards = [
    {
      title: 'إجمالي المبيعات',
      value: formatCurrency(stats.totalSales, settings.currency),
      icon: <DollarSign size={24} />,
      trend: '+12%',
      trendUp: true,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'مبيعات اليوم',
      value: formatCurrency(stats.todaySales, settings.currency),
      icon: <ShoppingCart size={24} />,
      trend: '+5%',
      trendUp: true,
      color: 'bg-accent/10 text-accent',
    },
    {
      title: 'إجمالي المشتريات',
      value: formatCurrency(stats.totalPurchases, settings.currency),
      icon: <CreditCard size={24} />,
      trend: '-3%',
      trendUp: false,
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'صافي الربح',
      value: formatCurrency(stats.totalProfit, settings.currency),
      icon: <TrendingUp size={24} />,
      trend: '+8%',
      trendUp: true,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'إجمالي المنتجات',
      value: stats.totalProducts.toString(),
      icon: <Package size={24} />,
      color: 'bg-info/10 text-info',
    },
    {
      title: 'منتجات منخفضة المخزون',
      value: stats.lowStockProducts.toString(),
      icon: <AlertTriangle size={24} />,
      color: 'bg-destructive/10 text-destructive',
    },
    {
      title: 'فواتير معلقة',
      value: stats.pendingInvoices.toString(),
      icon: <Clock size={24} />,
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'مبيعات الشهر',
      value: formatCurrency(stats.monthSales, settings.currency),
      icon: <TrendingUp size={24} />,
      trend: '+15%',
      trendUp: true,
      color: 'bg-primary/10 text-primary',
    },
  ];

  const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity);
  const recentInvoices = invoices.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحباً بك في نظام إدارة {settings.storeName}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="stat-card animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.trend && (
                  <div className={`flex items-center gap-1 mt-2 text-sm ${stat.trendUp ? 'text-accent' : 'text-destructive'}`}>
                    {stat.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{stat.trend}</span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="section-title flex items-center gap-2">
            <AlertTriangle className="text-warning" size={20} />
            منتجات منخفضة المخزون
          </h2>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-destructive">{product.quantity} {product.unit}</p>
                    <p className="text-xs text-muted-foreground">الحد الأدنى: {product.minQuantity}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">لا توجد منتجات منخفضة المخزون</p>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="section-title flex items-center gap-2">
            <ShoppingCart className="text-primary" size={20} />
            آخر الفواتير
          </h2>
          {recentInvoices.length > 0 ? (
            <div className="space-y-3">
              {recentInvoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                >
                  <div>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.createdAt).toLocaleDateString('ar-SA')}
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
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">لا توجد فواتير حتى الآن</p>
          )}
        </div>
      </div>
    </div>
  );
};
