import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Users as UsersIcon, Phone, Mail } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/utils';
import { Customer } from '@/types';
import { CustomerModal } from '../modals/CustomerModal';

export const Customers = () => {
  const { customers, deleteCustomer, settings } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      deleteCustomer(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">العملاء</h1>
          <p className="text-muted-foreground">إدارة بيانات العملاء</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          إضافة عميل
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="بحث عن عميل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pr-10"
        />
      </div>

      {/* Customers Table */}
      <div className="data-table">
        <table className="w-full">
          <thead>
            <tr>
              <th>العميل</th>
              <th>الهاتف</th>
              <th>البريد الإلكتروني</th>
              <th>الرصيد</th>
              <th>إجمالي المشتريات</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <UsersIcon className="text-primary" size={18} />
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      {customer.address && (
                        <p className="text-xs text-muted-foreground">{customer.address}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  {customer.phone && (
                    <div className="flex items-center gap-1 text-sm">
                      <Phone size={14} className="text-muted-foreground" />
                      {customer.phone}
                    </div>
                  )}
                </td>
                <td>
                  {customer.email && (
                    <div className="flex items-center gap-1 text-sm">
                      <Mail size={14} className="text-muted-foreground" />
                      {customer.email}
                    </div>
                  )}
                </td>
                <td>
                  <span className={customer.balance > 0 ? 'text-destructive' : 'text-accent'}>
                    {formatCurrency(customer.balance, settings.currency)}
                  </span>
                </td>
                <td>{formatCurrency(customer.totalPurchases, settings.currency)}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(customer)} className="btn-ghost p-2">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(customer.id)} className="btn-ghost text-destructive p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto text-muted-foreground mb-4" size={64} />
          <p className="text-lg text-muted-foreground">لا يوجد عملاء</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CustomerModal 
          customer={editingCustomer} 
          onClose={handleModalClose} 
        />
      )}
    </div>
  );
};
