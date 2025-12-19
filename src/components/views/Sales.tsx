import { useState } from 'react';
import { Plus, Search, ShoppingCart, Minus, Trash2, CreditCard, Banknote, Receipt } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export const Sales = () => {
  const { products, categories, cart, addToCart, updateCartQuantity, removeFromCart, clearCart, customers, addInvoice, settings } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash');

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && product.isActive && product.quantity > 0;
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = (subtotal - discount) * (settings.taxRate / 100);
  const total = subtotal - discount + tax;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    const invoice = {
      type: 'sale' as const,
      customerId: selectedCustomer || undefined,
      items: cart.map((item) => ({
        id: Math.random().toString(36).substring(2),
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        discount: 0,
        total: item.product.price * item.quantity,
      })),
      subtotal,
      discount,
      tax,
      total,
      paid: total,
      remaining: 0,
      status: 'completed' as const,
      paymentMethod,
      createdBy: 'admin',
    };

    addInvoice(invoice);
    clearCart();
    setDiscount(0);
    setSelectedCustomer('');
    toast.success('تم إتمام عملية البيع بنجاح');
  };

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
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="بحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pr-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="">جميع التصنيفات</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
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
                  {formatCurrency(product.price, settings.currency)}
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
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="input-field mb-4"
          >
            <option value="">عميل نقدي</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>

          {/* Cart Items */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin mb-4">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">{item.product.name}</p>
                  <p className="text-sm text-primary font-semibold">
                    {formatCurrency(item.product.price * item.quantity, settings.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    className="btn-ghost p-1"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    className="btn-ghost p-1"
                    disabled={item.quantity >= item.product.quantity}
                  >
                    <Plus size={16} />
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
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
                  <span>{formatCurrency(subtotal, settings.currency)}</span>
                </div>
                <div className="flex justify-between text-sm items-center gap-2">
                  <span>الخصم</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="input-field w-24 py-1 text-center"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>الضريبة ({settings.taxRate}%)</span>
                  <span>{formatCurrency(tax, settings.currency)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>الإجمالي</span>
                  <span className="text-primary">{formatCurrency(total, settings.currency)}</span>
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

              <button onClick={handleCheckout} className="btn-success w-full">
                <Receipt size={20} />
                إتمام البيع
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
