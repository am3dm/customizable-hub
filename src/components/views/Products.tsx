import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, Filter } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import { ProductModal } from '../modals/ProductModal';

export const Products = () => {
  const { products, categories, deleteProduct, settings } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'غير محدد';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || '#6B7280';
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteProduct(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">المنتجات</h1>
          <p className="text-muted-foreground">إدارة منتجات المتجر</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          إضافة منتج
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
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
        <div className="relative">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field pr-10 min-w-[200px]"
          >
            <option value="">جميع التصنيفات</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product, index) => (
          <div 
            key={product.id} 
            className="glass-card rounded-2xl overflow-hidden hover-lift animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="aspect-square bg-muted/50 flex items-center justify-center relative">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="text-muted-foreground" size={48} />
              )}
              <div 
                className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: getCategoryColor(product.categoryId) }}
              >
                {getCategoryName(product.categoryId)}
              </div>
              {product.quantity <= product.minQuantity && (
                <div className="absolute top-3 left-3 badge-destructive">
                  مخزون منخفض
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">SKU: {product.sku}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(product.price, settings.currency)}
                </span>
                <span className="text-sm text-muted-foreground">
                  المخزون: {product.quantity} {product.unit}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(product)}
                  className="btn-secondary flex-1 py-2"
                >
                  <Edit size={16} />
                  تعديل
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="btn-ghost text-destructive p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto text-muted-foreground mb-4" size={64} />
          <p className="text-lg text-muted-foreground">لا توجد منتجات</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          onClose={handleModalClose} 
        />
      )}
    </div>
  );
};
