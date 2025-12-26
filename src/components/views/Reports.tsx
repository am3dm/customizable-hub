import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  ShoppingCart, 
  Package,
  Users,
  Calendar,
  Loader2,
  FileText
} from 'lucide-react';
import { useProducts, useInvoices, useCustomers, useStoreSettings } from '@/hooks/useDatabase';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const Reports = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: storeSettings } = useStoreSettings();
  
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  const currency = storeSettings?.currency || 'د.ع';

  // Fetch invoice items for profit calculation
  const { data: invoiceItems = [] } = useQuery({
    queryKey: ['invoice-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*, invoices(type, status, created_at), products(cost)');
      if (error) throw error;
      return data;
    },
  });

  const isLoading = productsLoading || invoicesLoading || customersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Date filtering
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case 'today':
        return today;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return monthAgo;
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return yearAgo;
      default:
        return today;
    }
  };

  const startDate = getDateRange();

  // Filter invoices by date range
  const filteredInvoices = invoices.filter(inv => 
    new Date(inv.created_at) >= startDate
  );

  const salesInvoices = filteredInvoices.filter(inv => inv.type === 'sale' && inv.status === 'completed');
  const purchaseInvoices = filteredInvoices.filter(inv => inv.type === 'purchase' && inv.status === 'completed');

  // Calculate totals
  const totalSales = salesInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPurchases = purchaseInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalDiscounts = salesInvoices.reduce((sum, inv) => sum + (inv.discount || 0), 0);
  const totalTax = salesInvoices.reduce((sum, inv) => sum + (inv.tax || 0), 0);

  // Calculate profit from invoice items
  const calculateProfit = () => {
    let totalProfit = 0;
    invoiceItems.forEach(item => {
      if (item.invoices?.type === 'sale' && item.invoices?.status === 'completed') {
        const invoiceDate = new Date(item.invoices.created_at);
        if (invoiceDate >= startDate) {
          const cost = item.products?.cost || 0;
          const profit = (item.price - cost) * item.quantity;
          totalProfit += profit;
        }
      }
    });
    return totalProfit;
  };

  const totalProfit = calculateProfit();

  // Customer debts
  const customersWithDebt = customers.filter(c => (c.balance ?? 0) > 0);
  const totalDebts = customersWithDebt.reduce((sum, c) => sum + (c.balance ?? 0), 0);

  // Top selling products
  const productSales: Record<string, { name: string; quantity: number; revenue: number; profit: number }> = {};
  
  invoiceItems.forEach(item => {
    if (item.invoices?.type === 'sale' && item.invoices?.status === 'completed') {
      const invoiceDate = new Date(item.invoices.created_at);
      if (invoiceDate >= startDate) {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            name: item.product_name,
            quantity: 0,
            revenue: 0,
            profit: 0,
          };
        }
        const cost = item.products?.cost || 0;
        productSales[item.product_id].quantity += item.quantity;
        productSales[item.product_id].revenue += item.total;
        productSales[item.product_id].profit += (item.price - cost) * item.quantity;
      }
    }
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Low stock products
  const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity);

  // Daily sales chart data
  const getDailySales = () => {
    const dailyData: Record<string, number> = {};
    
    salesInvoices.forEach(inv => {
      const date = new Date(inv.created_at).toLocaleDateString('ar-IQ');
      dailyData[date] = (dailyData[date] || 0) + inv.total;
    });

    return Object.entries(dailyData).map(([date, total]) => ({ date, total }));
  };

  const dailySales = getDailySales();

  const dateRangeLabels = {
    today: 'اليوم',
    week: 'آخر أسبوع',
    month: 'آخر شهر',
    year: 'آخر سنة',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header flex-wrap gap-4">
        <div>
          <h1 className="page-title">التقارير والإحصائيات</h1>
          <p className="text-muted-foreground">تحليل شامل للمبيعات والأرباح والديون</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 ml-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">آخر شهر</SelectItem>
              <SelectItem value="year">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <DollarSign className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSales, currency)}</p>
                <p className="text-xs text-muted-foreground">{salesInvoices.length} فاتورة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <TrendingUp className="text-accent" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">صافي الربح</p>
                <p className="text-2xl font-bold text-accent">{formatCurrency(totalProfit, currency)}</p>
                <p className="text-xs text-muted-foreground">
                  {totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0}% هامش ربح
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <ShoppingCart className="text-warning" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المشتريات</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPurchases, currency)}</p>
                <p className="text-xs text-muted-foreground">{purchaseInvoices.length} فاتورة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <Users className="text-destructive" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الديون</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalDebts, currency)}</p>
                <p className="text-xs text-muted-foreground">{customersWithDebt.length} عميل مدين</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="debts">الديون</TabsTrigger>
          <TabsTrigger value="inventory">المخزون</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={20} />
                  ملخص المبيعات - {dateRangeLabels[dateRange]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>إجمالي المبيعات</span>
                    <span className="font-bold">{formatCurrency(totalSales, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>الخصومات</span>
                    <span className="font-bold text-destructive">-{formatCurrency(totalDiscounts, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span>الضرائب</span>
                    <span className="font-bold">{formatCurrency(totalTax, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                    <span className="font-bold">صافي الربح</span>
                    <span className="font-bold text-primary">{formatCurrency(totalProfit, currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Sales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} />
                  المبيعات اليومية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-auto">
                  {dailySales.length > 0 ? (
                    dailySales.map((day, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span>{day.date}</span>
                        <span className="font-bold">{formatCurrency(day.total, currency)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">لا توجد مبيعات في هذه الفترة</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                أفضل المنتجات مبيعاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">المنتج</th>
                      <th className="text-center py-3 px-4">الكمية المباعة</th>
                      <th className="text-center py-3 px-4">الإيرادات</th>
                      <th className="text-center py-3 px-4">الربح</th>
                      <th className="text-center py-3 px-4">هامش الربح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.length > 0 ? (
                      topProducts.map((product, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{product.name}</td>
                          <td className="py-3 px-4 text-center">{product.quantity}</td>
                          <td className="py-3 px-4 text-center">{formatCurrency(product.revenue, currency)}</td>
                          <td className="py-3 px-4 text-center text-accent">{formatCurrency(product.profit, currency)}</td>
                          <td className="py-3 px-4 text-center">
                            {product.revenue > 0 ? ((product.profit / product.revenue) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          لا توجد مبيعات في هذه الفترة
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debts Tab */}
        <TabsContent value="debts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                ديون العملاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">العميل</th>
                      <th className="text-center py-3 px-4">الهاتف</th>
                      <th className="text-center py-3 px-4">إجمالي المشتريات</th>
                      <th className="text-center py-3 px-4">الرصيد المستحق</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersWithDebt.length > 0 ? (
                      customersWithDebt
                        .sort((a, b) => (b.balance ?? 0) - (a.balance ?? 0))
                        .map((customer) => (
                          <tr key={customer.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{customer.name}</td>
                            <td className="py-3 px-4 text-center">{customer.phone || '-'}</td>
                            <td className="py-3 px-4 text-center">{formatCurrency(customer.total_purchases || 0, currency)}</td>
                            <td className="py-3 px-4 text-center text-destructive font-bold">
                              {formatCurrency(customer.balance || 0, currency)}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-muted-foreground">
                          لا يوجد عملاء مدينون
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {customersWithDebt.length > 0 && (
                <div className="mt-4 p-4 bg-destructive/10 rounded-lg flex justify-between items-center">
                  <span className="font-bold">إجمالي الديون المستحقة</span>
                  <span className="text-xl font-bold text-destructive">{formatCurrency(totalDebts, currency)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <Package size={20} />
                منتجات منخفضة المخزون ({lowStockProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">المنتج</th>
                      <th className="text-center py-3 px-4">SKU</th>
                      <th className="text-center py-3 px-4">الكمية الحالية</th>
                      <th className="text-center py-3 px-4">الحد الأدنى</th>
                      <th className="text-center py-3 px-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.length > 0 ? (
                      lowStockProducts.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{product.name}</td>
                          <td className="py-3 px-4 text-center">{product.sku}</td>
                          <td className="py-3 px-4 text-center font-bold text-destructive">{product.quantity}</td>
                          <td className="py-3 px-4 text-center">{product.min_quantity}</td>
                          <td className="py-3 px-4 text-center">
                            {product.quantity === 0 ? (
                              <span className="badge badge-destructive">نفد</span>
                            ) : (
                              <span className="badge badge-warning">منخفض</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          جميع المنتجات متوفرة بكميات كافية
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
