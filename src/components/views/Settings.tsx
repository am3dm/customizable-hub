import { useState } from 'react';
import { Save, Store, Percent, Globe, Receipt } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

export const Settings = () => {
  const { settings, updateSettings } = useStore();
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">الإعدادات</h1>
          <p className="text-muted-foreground">تخصيص إعدادات النظام والمتجر</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Store Info */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Store className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">معلومات المتجر</h2>
              <p className="text-sm text-muted-foreground">البيانات الأساسية للمتجر</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم المتجر *</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={formData.storePhone || ''}
                onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.storeEmail || ''}
                onChange={(e) => setFormData({ ...formData, storeEmail: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">العنوان</label>
              <textarea
                value={formData.storeAddress || ''}
                onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                className="input-field min-h-[80px]"
              />
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-accent/10">
              <Percent className="text-accent" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">الإعدادات المالية</h2>
              <p className="text-sm text-muted-foreground">العملة والضرائب</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">العملة</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="input-field"
              >
                <option value="ر.س">ريال سعودي (ر.س)</option>
                <option value="د.إ">درهم إماراتي (د.إ)</option>
                <option value="د.ك">دينار كويتي (د.ك)</option>
                <option value="ر.ع">ريال عماني (ر.ع)</option>
                <option value="ر.ق">ريال قطري (ر.ق)</option>
                <option value="د.ب">دينار بحريني (د.ب)</option>
                <option value="ج.م">جنيه مصري (ج.م)</option>
                <option value="$">دولار أمريكي ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">نسبة الضريبة (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-info/10">
              <Receipt className="text-info" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">إعدادات الفواتير</h2>
              <p className="text-sm text-muted-foreground">تخصيص أرقام الفواتير</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">بادئة رقم الفاتورة</label>
            <input
              type="text"
              value={formData.invoicePrefix}
              onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
              className="input-field max-w-xs"
              placeholder="INV-"
            />
            <p className="text-sm text-muted-foreground mt-1">
              مثال: {formData.invoicePrefix}000001
            </p>
          </div>
        </div>

        {/* Language Settings */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-warning/10">
              <Globe className="text-warning" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">إعدادات اللغة</h2>
              <p className="text-sm text-muted-foreground">لغة الواجهة والتنسيق</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">اللغة</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value as 'ar' | 'en' })}
              className="input-field max-w-xs"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary">
          <Save size={20} />
          حفظ الإعدادات
        </button>
      </form>
    </div>
  );
};
