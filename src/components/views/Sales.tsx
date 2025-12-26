import { useState, useRef, useCallback } from 'react';
import { Plus, Search, ShoppingCart, Minus, Trash2, CreditCard, Banknote, Receipt, Printer, Loader2, ScanBarcode } from 'lucide-react';
import { useProducts, useCategories, useCustomers, useCreateInvoice, useStoreSettings } from '@/hooks/useDatabase';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ThermalInvoicePrint } from '@/components/ThermalInvoicePrint';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
}

export const Sales = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: customers = [] } = useCustomers();
  const { data: storeSettings } = useStoreSettings();
  const createInvoice = useCreateInvoice();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Print states
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [lastInvoiceItems, setLastInvoiceItems] = useState<any[]>([]);
  const [lastCustomer, setLastCustomer] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const currency = storeSettings?.currency || 'د.ع';
  const taxRate = storeSettings?.tax_rate || 0;

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.barcode?.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory && product.is_active && product.quantity > 0;
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + tax;
  
  // Calculate paid and remaining
  const paid = paymentMethod === 'credit' 
    ? (paidAmount ? parseFloat(paidAmount) : 0)
    : total;
  const remaining = Math.max(0, total - paid);

  // Handle barcode scan
  const handleBarcodeScan = useCallback((barcode: string) => {
    const product = products.find(p => p.barcode === barcode || p.sku === barcode);
    if (product) {
      if (product.quantity > 0 && product.is_active) {
        addToCart(product);
        toast.success(`تمت إضافة: ${product.name}`);
      } else {
        toast.error('المنتج غير متوفر');
      }
    } else {
      toast.error('لم يتم العثور على المنتج');
      setSearchQuery(barcode); // Set as search query for manual lookup
    }
  }, [products]);

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.quantity) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        toast.error('الكمية المطلوبة غير متوفرة');
      }
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        maxQuantity: product.quantity,
      }]);
    }
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      const item = cart.find(i => i.id === productId);
      if (item && newQuantity <= item.maxQuantity) {
        setCart(cart.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        ));
      }
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setSelectedCustomer('');
    setPaidAmount('');
    setNotes('');
    setPaymentMethod('cash');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    if (paymentMethod === 'credit' && !selectedCustomer) {
      toast.error('يجب اختيار عميل للبيع الآجل');
      return;
    }

    setIsProcessing(true);

    try {
      const invoiceData = {
        type: 'sale' as const,
        customer_id: selectedCustomer || undefined,
        subtotal,
        discount,
        tax,
        total,
        paid,
        remaining,
        status: remaining === 0 ? 'completed' as const : 'pending' as const,
        payment_method: paymentMethod,
        notes: notes || undefined,
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          discount: 0,
          total: item.price * item.quantity,
        })),
      };

      const newInvoice = await createInvoice.mutateAsync(invoiceData);

      // Update customer balance if credit sale
      if (paymentMethod === 'credit' && selectedCustomer && remaining > 0) {
        const customer = customers.find(c => c.id === selectedCustomer);
        if (customer) {
          const newBalance = (customer.balance || 0) + remaining;
          const newTotalPurchases = (customer.total_purchases || 0) + total;
          
          await supabase
            .from('customers')
            .update({ 
              balance: newBalance,
              total_purchases: newTotalPurchases,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedCustomer);
          
          queryClient.invalidateQueries({ queryKey: ['customers'] });
        }
      }

      // Prepare print data
      setLastInvoice(newInvoice);
      setLastInvoiceItems(invoiceData.items);
      setLastCustomer(selectedCustomer ? {
        ...customers.find(c => c.id === selectedCustomer),
        balance: paymentMethod === 'credit' && remaining > 0 
          ? (customers.find(c => c.id === selectedCustomer)?.balance || 0) + remaining
          : customers.find(c => c.id === selectedCustomer)?.balance
      } : null);
      
      clearCart();
      setShowPrintDialog(true);
      toast.success('تم إتمام عملية البيع بنجاح');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('حدث خطأ أثناء إتمام العملية');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '', 'width=300,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html dir="rtl">
            <head>
              <title>فاتورة</title>
              <style>
                @page { size: 80mm auto; margin: 0; }
                body { margin: 0; padding: 0; }
              </style>
            </head>
            <body>${printContent}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">نقطة البيع</h1>
          <p className="text-muted-foreground">إنشاء فاتورة بيع جديدة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Filter */}
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="بحث عن منتج أو باركود..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <BarcodeScanner onScan={handleBarcodeScan} buttonText="مسح الباركود" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder="جميع التصنيفات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="glass-card rounded-xl p-4 text-right hover-lift transition-all hover:border-primary"
              >
                <h4 className="font-semibold mb-1 line-clamp-1">{product.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">المخزون: {product.quantity}</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(product.price, currency)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="glass-card rounded-2xl p-6 h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="text-primary" size={24} />
            <h2 className="text-xl font-bold">سلة المشتريات</h2>
          </div>

          {/* Customer Selection */}
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger className="mb-4">
              <SelectValue placeholder="عميل نقدي" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">عميل نقدي</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} {(customer.balance ?? 0) > 0 && `(${formatCurrency(customer.balance || 0, currency)})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Cart Items */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">{item.name}</p>
                  <p className="text-sm text-primary font-semibold">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    className="btn-ghost p-1"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="btn-ghost p-1"
                    disabled={item.quantity >= item.maxQuantity}
                  >
                    <Plus size={16} />
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="btn-ghost text-destructive p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {cart.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="mx-auto mb-2" size={40} />
              <p>السلة فارغة</p>
            </div>
          )}

          {/* Summary */}
          {cart.length > 0 && (
            <>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>المجموع الفرعي</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-sm items-center gap-2">
                  <span>الخصم</span>
                  <Input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 py-1 text-center"
                  />
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>الضريبة ({taxRate}%)</span>
                    <span>{formatCurrency(tax, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>الإجمالي</span>
                  <span className="text-primary">{formatCurrency(total, currency)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex gap-2 my-4">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'cash' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <Banknote size={20} />
                  <span className="text-xs">نقداً</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'card' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <CreditCard size={20} />
                  <span className="text-xs">بطاقة</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('credit')}
                  className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'credit' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <Receipt size={20} />
                  <span className="text-xs">آجل</span>
                </button>
              </div>

              {/* Partial Payment for Credit */}
              {paymentMethod === 'credit' && (
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-sm items-center gap-2">
                    <span>المبلغ المدفوع</span>
                    <Input
                      type="number"
                      min="0"
                      max={total}
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder="0"
                      className="w-32 py-1 text-center"
                    />
                  </div>
                  <div className="flex justify-between text-sm font-bold text-destructive">
                    <span>المتبقي (آجل)</span>
                    <span>{formatCurrency(remaining, currency)}</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <Input
                placeholder="ملاحظات على الفاتورة..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mb-4"
              />

              <Button 
                onClick={handleCheckout} 
                className="w-full gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <Receipt size={20} />
                    إتمام البيع
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Print Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تم إنشاء الفاتورة بنجاح</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-auto">
            <div ref={printRef}>
              {lastInvoice && (
                <ThermalInvoicePrint
                  invoice={lastInvoice}
                  items={lastInvoiceItems}
                  customer={lastCustomer}
                  storeSettings={storeSettings}
                />
              )}
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
              إغلاق
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer size={18} />
              طباعة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
