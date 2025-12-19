import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Building2, Phone, Mail } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import { Supplier } from '@/types';
import { SupplierModal } from '../modals/SupplierModal';

export const Suppliers = () => {
  const { suppliers, deleteSupplier, settings } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone?.includes(searchQuery)
  );

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
      deleteSupplier(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">الموردين</h1>
          <p className="text-muted-foreground">إدارة بيانات الموردين</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          إضافة مورد
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="بحث عن مورد..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pr-10"
        />
      </div>

      {/* Suppliers Table */}
      <div className="data-table">
        <table className="w-full">
          <thead>
            <tr>
              <th>المورد</th>
              <th>الهاتف</th>
              <th>البريد الإلكتروني</th>
              <th>الرصيد المستحق</th>
              <th>إجمالي التوريدات</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Building2 className="text-accent" size={18} />
                    </div>
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      {supplier.address && (
                        <p className="text-xs text-muted-foreground">{supplier.address}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  {supplier.phone && (
                    <div className="flex items-center gap-1 text-sm">
                      <Phone size={14} className="text-muted-foreground" />
                      {supplier.phone}
                    </div>
                  )}
                </td>
                <td>
                  {supplier.email && (
                    <div className="flex items-center gap-1 text-sm">
                      <Mail size={14} className="text-muted-foreground" />
                      {supplier.email}
                    </div>
                  )}
                </td>
                <td>
                  <span className={supplier.balance > 0 ? 'text-destructive' : 'text-accent'}>
                    {formatCurrency(supplier.balance, settings.currency)}
                  </span>
                </td>
                <td>{formatCurrency(supplier.totalPurchases, settings.currency)}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(supplier)} className="btn-ghost p-2">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(supplier.id)} className="btn-ghost text-destructive p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto text-muted-foreground mb-4" size={64} />
          <p className="text-lg text-muted-foreground">لا يوجد موردين</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <SupplierModal 
          supplier={editingSupplier} 
          onClose={handleModalClose} 
        />
      )}
    </div>
  );
};
