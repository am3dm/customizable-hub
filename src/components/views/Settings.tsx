import { useState, useEffect } from 'react';
import { Save, Store, Percent, Globe, Receipt, Loader2 } from 'lucide-react';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useDatabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export const Settings = () => {
  const { data: storeSettings, isLoading } = useStoreSettings();
  const updateSettings = useUpdateStoreSettings();
  
  const [formData, setFormData] = useState({
    store_name: '',
    store_phone: '',
    store_email: '',
    store_address: '',
    currency: 'د.ع',
    tax_rate: 0,
    invoice_prefix: 'INV',
    language: 'ar',
  });

  useEffect(() => {
    if (storeSettings) {
      setFormData({
        store_name: storeSettings.store_name || '',
        store_phone: storeSettings.store_phone || '',
        store_email: storeSettings.store_email || '',
        store_address: storeSettings.store_address || '',
        currency: storeSettings.currency || 'د.ع',
        tax_rate: storeSettings.tax_rate || 0,
        invoice_prefix: storeSettings.invoice_prefix || 'INV',
        language: storeSettings.language || 'ar',
      });
    }
  }, [storeSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync(formData);
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  if (isLoading) {
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
            <div className="space-y-2">
              <Label htmlFor="store_name">اسم المتجر *</Label>
              <Input
                id="store_name"
                required
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                placeholder="اسم المتجر"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_phone">رقم الهاتف</Label>
              <Input
                id="store_phone"
                type="tel"
                value={formData.store_phone}
                onChange={(e) => setFormData({ ...formData, store_phone: e.target.value })}
                placeholder="07xxxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_email">البريد الإلكتروني</Label>
              <Input
                id="store_email"
                type="email"
                value={formData.store_email}
                onChange={(e) => setFormData({ ...formData, store_email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="store_address">العنوان</Label>
              <Textarea
                id="store_address"
                value={formData.store_address}
                onChange={(e) => setFormData({ ...formData, store_address: e.target.value })}
                placeholder="عنوان المتجر"
                rows={2}
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
            <div className="space-y-2">
              <Label htmlFor="currency">العملة</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر العملة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="د.ع">دينار عراقي (د.ع)</SelectItem>
                  <SelectItem value="$">دولار أمريكي ($)</SelectItem>
                  <SelectItem value="ر.س">ريال سعودي (ر.س)</SelectItem>
                  <SelectItem value="د.إ">درهم إماراتي (د.إ)</SelectItem>
                  <SelectItem value="د.ك">دينار كويتي (د.ك)</SelectItem>
                  <SelectItem value="ر.ع">ريال عماني (ر.ع)</SelectItem>
                  <SelectItem value="ر.ق">ريال قطري (ر.ق)</SelectItem>
                  <SelectItem value="د.ب">دينار بحريني (د.ب)</SelectItem>
                  <SelectItem value="ج.م">جنيه مصري (ج.م)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_rate">نسبة الضريبة (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
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

          <div className="space-y-2">
            <Label htmlFor="invoice_prefix">بادئة رقم الفاتورة</Label>
            <Input
              id="invoice_prefix"
              value={formData.invoice_prefix}
              onChange={(e) => setFormData({ ...formData, invoice_prefix: e.target.value })}
              placeholder="INV"
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">
              مثال: {formData.invoice_prefix}000001
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

          <div className="space-y-2">
            <Label htmlFor="language">اللغة</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => setFormData({ ...formData, language: value })}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="اختر اللغة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" disabled={updateSettings.isPending} className="gap-2">
          {updateSettings.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save size={20} />
              حفظ الإعدادات
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
