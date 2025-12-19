import { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Category } from '@/types';
import { CategoryModal } from '../modals/CategoryModal';

export const Categories = () => {
  const { categories, products, deleteCategory } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const getProductCount = (categoryId: string) => {
    return products.filter(p => p.categoryId === categoryId).length;
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const productCount = getProductCount(id);
    if (productCount > 0) {
      alert(`لا يمكن حذف هذا التصنيف لأنه يحتوي على ${productCount} منتج`);
      return;
    }
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      deleteCategory(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">التصنيفات</h1>
          <p className="text-muted-foreground">إدارة تصنيفات المنتجات</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          إضافة تصنيف
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <div 
            key={category.id} 
            className="glass-card rounded-2xl p-6 hover-lift animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <Tag style={{ color: category.color }} size={24} />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleEdit(category)}
                  className="btn-ghost p-2"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(category.id)}
                  className="btn-ghost text-destructive p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="badge bg-muted text-muted-foreground">
                {getProductCount(category.id)} منتج
              </span>
              <span 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Tag className="mx-auto text-muted-foreground mb-4" size={64} />
          <p className="text-lg text-muted-foreground">لا توجد تصنيفات</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CategoryModal 
          category={editingCategory} 
          onClose={handleModalClose} 
        />
      )}
    </div>
  );
};
