import { useState } from 'react';
import { Plus, Search, TruckIcon, Minus, Trash2, Receipt } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export const Purchases = () => {
  const { products, categories, suppliers, addInvoice, updateProduct, settings } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [cart, setCart] = useState<{ productId: string; name: string; cost: number; quantity: number }[]>([]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { 
        productId: product.id, 
        name: product.name, 
        cost: product.cost, 
        quantity: 1 
      }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const total = cart.reduce((sum, item) => sum + (item.cost * item.quantity), 0);

  const handlePurchase = () => {
    if (cart.length === 0) {
      toast.error('قائمة المشتريات فارغة');
      return;
    }
    if (!selectedSupplier) {
      toast.error('يرجى اختيار مورد');
      return;
    }

    const invoice = {
      type: 'purchase' as const,
      supplierId: selectedSupplier,
      items: cart.map((item) => ({
        id: Math.random().toString(36).substring(2),
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.cost,
        discount: 0,
        total: item.cost * item.quantity,
      })),
      subtotal: total,
      discount: 0,
      tax: 0,
      total,
      paid: total,
      remaining: 0,
      status: 'completed' as const,
      paymentMethod: 'cash' as const,
      createdBy: 'admin',
    };

    addInvoice(invoice);
    setCart([]);
    setSelectedSupplier('');
    toast.success('تم إتمام عملية الشراء بنجاح');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">المشتريات</h1>
          <p className="text-muted-foreground">إنشاء فاتورة شراء جديدة</p>
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
                className="glass-card rounded-xl p-4 text-right hover-lift transition-all hover:border-accent"
              >
                <h4 className="font-semibold mb-1 line-clamp-1">{product.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">المخزون: {product.quantity}</p>
                <p className="text-lg font-bold text-accent">
                  {formatCurrency(product.cost, settings.currency)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="glass-card rounded-2xl p-6 h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <TruckIcon className="text-accent" size={24} />
            <h2 className="text-xl font-bold">قائمة المشتريات</h2>
          </div>

          {/* Supplier Selection */}
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="input-field mb-4"
            required
          >
            <option value="">اختر المورد *</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>

          {/* Cart Items */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin mb-4">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">{item.name}</p>
                  <p className="text-sm text-accent font-semibold">
                    {formatCurrency(item.cost * item.quantity, settings.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="btn-ghost p-1"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="btn-ghost p-1"
                  >
                    <Plus size={16} />
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
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
              <TruckIcon className="mx-auto mb-2" size={40} />
              <p>القائمة فارغة</p>
            </div>
          )}

          {/* Summary */}
          {cart.length > 0 && (
            <>
              <div className="border-t border-border pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-accent">{formatCurrency(total, settings.currency)}</span>
                </div>
              </div>

              <button onClick={handlePurchase} className="btn-success w-full">
                <Receipt size={20} />
                إتمام الشراء
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
