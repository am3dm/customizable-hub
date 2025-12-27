import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Phone, MapPin, Mail, Save, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const setupSchema = z.object({
  storeName: z.string().min(2, 'اسم المتجر مطلوب'),
  storePhone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  storeAddress: z.string().min(5, 'العنوان مطلوب'),
  storeEmail: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  adminName: z.string().min(3, 'اسم المدير مطلوب'),
  adminEmail: z.string().email('البريد الإلكتروني غير صحيح'),
  adminPassword: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  pinCode: z.string().length(4, 'رمز PIN يجب أن يكون 4 أرقام'),
});

export default function Setup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'store' | 'admin'>('store');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    storeName: '',
    storePhone: '',
    storeAddress: '',
    storeEmail: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    pinCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 'store') {
      if (!formData.storeName || formData.storeName.length < 2) {
        newErrors.storeName = 'اسم المتجر مطلوب';
      }
      if (!formData.storePhone || formData.storePhone.length < 10) {
        newErrors.storePhone = 'رقم الهاتف غير صحيح';
      }
      if (!formData.storeAddress || formData.storeAddress.length < 5) {
        newErrors.storeAddress = 'العنوان مطلوب';
      }
    } else {
      if (!formData.adminName || formData.adminName.length < 3) {
        newErrors.adminName = 'اسم المدير مطلوب';
      }
      if (!formData.adminEmail || !/\S+@\S+\.\S+/.test(formData.adminEmail)) {
        newErrors.adminEmail = 'البريد الإلكتروني غير صحيح';
      }
      if (!formData.adminPassword || formData.adminPassword.length < 6) {
        newErrors.adminPassword = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      }
      if (!formData.pinCode || formData.pinCode.length !== 4 || !/^\d+$/.test(formData.pinCode)) {
        newErrors.pinCode = 'رمز PIN يجب أن يكون 4 أرقام';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep('admin');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) return;
    
    setLoading(true);

    try {
      // 1. Create admin user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.adminEmail,
        password: formData.adminPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.adminName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('فشل في إنشاء حساب المدير');
      }

      // 2. Update profile with PIN code
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ pin_code: formData.pinCode })
        .eq('user_id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // 3. Save store settings with is_setup_completed = true
      const { error: settingsError } = await supabase
        .from('store_settings')
        .insert([{
          store_name: formData.storeName,
          store_phone: formData.storePhone,
          store_address: formData.storeAddress,
          store_email: formData.storeEmail || null,
          currency: 'د.ع',
          language: 'ar',
          is_setup_completed: true,
        }]);

      if (settingsError) throw settingsError;

      // 4. Create audit log
      await supabase.from('audit_logs').insert([{
        user_id: authData.user.id,
        action: 'SYSTEM_SETUP',
        table_name: 'store_settings',
        details: 'تم إعداد النظام وإنشاء حساب المدير الأول',
      }]);

      toast.success('تم إعداد النظام بنجاح! يمكنك تسجيل الدخول الآن');
      navigate('/auth');
    } catch (error: any) {
      console.error('Setup error:', error);
      toast.error(error.message || 'حدث خطأ أثناء الإعداد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">إعداد نظام النخيل</CardTitle>
            <CardDescription className="text-lg mt-2">
              {step === 'store' ? 'الخطوة 1: معلومات المتجر' : 'الخطوة 2: إنشاء حساب المدير'}
            </CardDescription>
          </div>
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full transition-colors ${step === 'store' ? 'bg-primary' : 'bg-primary'}`} />
            <div className="w-8 h-0.5 bg-border" />
            <div className={`w-3 h-3 rounded-full transition-colors ${step === 'admin' ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 'store' ? (
              <div className="space-y-4 animate-slide-up">
                <div className="space-y-2">
                  <Label htmlFor="storeName">اسم المتجر *</Label>
                  <div className="relative">
                    <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="storeName"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      className="pr-10"
                      placeholder="متجر النخيل"
                    />
                  </div>
                  {errors.storeName && <p className="text-destructive text-sm">{errors.storeName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storePhone">رقم الهاتف *</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="storePhone"
                      name="storePhone"
                      value={formData.storePhone}
                      onChange={handleChange}
                      className="pr-10"
                      placeholder="07xx xxx xxxx"
                      dir="ltr"
                    />
                  </div>
                  {errors.storePhone && <p className="text-destructive text-sm">{errors.storePhone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeAddress">عنوان المتجر *</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="storeAddress"
                      name="storeAddress"
                      value={formData.storeAddress}
                      onChange={handleChange}
                      className="pr-10"
                      placeholder="بغداد، شارع الكرادة"
                    />
                  </div>
                  {errors.storeAddress && <p className="text-destructive text-sm">{errors.storeAddress}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeEmail">البريد الإلكتروني (اختياري)</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="storeEmail"
                      name="storeEmail"
                      type="email"
                      value={formData.storeEmail}
                      onChange={handleChange}
                      className="pr-10"
                      placeholder="store@example.com"
                      dir="ltr"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full btn-primary"
                >
                  التالي
                </Button>
              </div>
            ) : (
              <div className="space-y-4 animate-slide-up">
                <div className="space-y-2">
                  <Label htmlFor="adminName">اسم المدير *</Label>
                  <Input
                    id="adminName"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    placeholder="أحمد محمد"
                  />
                  {errors.adminName && <p className="text-destructive text-sm">{errors.adminName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">البريد الإلكتروني *</Label>
                  <Input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    dir="ltr"
                  />
                  {errors.adminEmail && <p className="text-destructive text-sm">{errors.adminEmail}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">كلمة المرور *</Label>
                  <Input
                    id="adminPassword"
                    name="adminPassword"
                    type="password"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  {errors.adminPassword && <p className="text-destructive text-sm">{errors.adminPassword}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pinCode" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    رمز PIN (للدخول السريع) *
                  </Label>
                  <Input
                    id="pinCode"
                    name="pinCode"
                    type="password"
                    value={formData.pinCode}
                    onChange={handleChange}
                    placeholder="4 أرقام"
                    maxLength={4}
                    dir="ltr"
                    className="text-center text-2xl tracking-widest"
                  />
                  {errors.pinCode && <p className="text-destructive text-sm">{errors.pinCode}</p>}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('store')}
                    className="flex-1"
                  >
                    السابق
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الإعداد...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        إنشاء النظام
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
