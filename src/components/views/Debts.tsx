import { useState, useRef } from 'react';
import { 
  Search, 
  Receipt, 
  Printer,
  DollarSign,
  User,
  Phone,
  Calendar,
  Loader2,
  FileText
} from 'lucide-react';
import { useCustomers, useInvoices } from '@/hooks/useDatabase';
import { useStoreSettings } from '@/hooks/useDatabase';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface PaymentReceiptData {
  customerName: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  paymentMethod: string;
  date: Date;
  receiptNumber: string;
  notes?: string;
}

export const Debts = () => {
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: storeSettings } = useStoreSettings();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<PaymentReceiptData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const currency = storeSettings?.currency || 'د.ع';

  // Filter customers with debt (balance > 0)
  const customersWithDebt = customers.filter(c => (c.balance ?? 0) > 0);
  
  const filteredCustomers = customersWithDebt.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);
  
  // Get unpaid invoices for selected customer
  const customerInvoices = invoices.filter(
    inv => inv.customer_id === selectedCustomer && 
    inv.type === 'sale' && 
    (inv.remaining ?? 0) > 0
  );

  const handleOpenPaymentModal = (customerId: string) => {
    setSelectedCustomer(customerId);
    setPaymentAmount('');
    setPaymentNotes('');
    setIsPaymentModalOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedCustomer || !paymentAmount) {
      toast.error('يرجى إدخال مبلغ الدفع');
      return;
    }

    const amount = parseFloat(paymentAmount);
    const customer = customers.find(c => c.id === selectedCustomer);
    
    if (!customer) return;
    
    if (amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    if (amount > (customer.balance ?? 0)) {
      toast.error('المبلغ المدفوع أكبر من الرصيد المستحق');
      return;
    }

    setIsProcessing(true);

    try {
      const previousBalance = customer.balance ?? 0;
      const newBalance = previousBalance - amount;

      // Update customer balance
      const { error: updateError } = await supabase
        .from('customers')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCustomer);

      if (updateError) throw updateError;

      // Generate receipt number
      const receiptNumber = `REC${Date.now().toString().slice(-8)}`;

      // Prepare receipt data
      const receipt: PaymentReceiptData = {
        customerName: customer.name,
        amount,
        previousBalance,
        newBalance,
        paymentMethod: 'نقداً',
        date: new Date(),
        receiptNumber,
        notes: paymentNotes
      };

      setReceiptData(receipt);
      setIsPaymentModalOpen(false);
      setIsReceiptModalOpen(true);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      toast.success('تم تسجيل الدفعة بنجاح');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('حدث خطأ أثناء معالجة الدفعة');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (receiptRef.current) {
      const printContent = receiptRef.current.innerHTML;
      const printWindow = window.open('', '', 'width=300,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html dir="rtl">
            <head>
              <title>وصل قبض</title>
              <style>
                body { 
                  font-family: 'Arial', sans-serif; 
                  padding: 10px; 
                  max-width: 80mm;
                  margin: 0 auto;
                }
                .header { text-align: center; margin-bottom: 15px; }
                .store-name { font-size: 18px; font-weight: bold; }
                .receipt-title { font-size: 14px; margin: 10px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; }
                .row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 12px; }
                .total { font-size: 16px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
                .footer { text-align: center; margin-top: 20px; font-size: 10px; }
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

  if (customersLoading || invoicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalDebt = customersWithDebt.reduce((sum, c) => sum + (c.balance ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">إدارة الديون</h1>
          <p className="text-muted-foreground">تتبع وتحصيل ديون العملاء</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <DollarSign className="text-destructive" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الديون</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalDebt, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <User className="text-warning" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عملاء مدينون</p>
                <p className="text-2xl font-bold">{customersWithDebt.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Receipt className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">فواتير آجلة</p>
                <p className="text-2xl font-bold">
                  {invoices.filter(i => i.payment_method === 'credit' && (i.remaining ?? 0) > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          type="text"
          placeholder="بحث بالاسم أو رقم الهاتف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Customers with Debt */}
      <div className="grid gap-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone size={14} />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">الرصيد المستحق</p>
                      <p className="text-xl font-bold text-destructive">
                        {formatCurrency(customer.balance ?? 0, currency)}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleOpenPaymentModal(customer.id)}
                      className="gap-2"
                    >
                      <DollarSign size={18} />
                      تسديد
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="mx-auto mb-4" size={48} />
            <p className="text-lg">لا يوجد عملاء مدينون</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تسديد دفعة</DialogTitle>
          </DialogHeader>
          
          {selectedCustomerData && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedCustomerData.name}</p>
                <p className="text-sm text-muted-foreground">
                  الرصيد المستحق: {formatCurrency(selectedCustomerData.balance ?? 0, currency)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">مبلغ الدفع *</label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  max={selectedCustomerData.balance ?? 0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ملاحظات</label>
                <Input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="ملاحظات اختيارية..."
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handlePayment} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري المعالجة...
                </>
              ) : (
                'تأكيد الدفع'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>وصل قبض</DialogTitle>
          </DialogHeader>
          
          {receiptData && (
            <div ref={receiptRef} className="p-4 bg-white rounded-lg">
              <div className="header text-center mb-4">
                <div className="store-name text-xl font-bold">
                  {storeSettings?.store_name || 'المتجر'}
                </div>
                {storeSettings?.store_phone && (
                  <div className="text-sm text-muted-foreground">{storeSettings.store_phone}</div>
                )}
              </div>
              
              <div className="receipt-title text-center border-y border-dashed py-2 my-4">
                وصل قبض
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="row flex justify-between">
                  <span>رقم الوصل:</span>
                  <span>{receiptData.receiptNumber}</span>
                </div>
                <div className="row flex justify-between">
                  <span>التاريخ:</span>
                  <span>{receiptData.date.toLocaleDateString('ar-IQ')}</span>
                </div>
                <div className="row flex justify-between">
                  <span>العميل:</span>
                  <span>{receiptData.customerName}</span>
                </div>
                <div className="row flex justify-between">
                  <span>الرصيد السابق:</span>
                  <span>{formatCurrency(receiptData.previousBalance, currency)}</span>
                </div>
                <div className="row flex justify-between font-bold text-primary">
                  <span>المبلغ الواصل:</span>
                  <span>{formatCurrency(receiptData.amount, currency)}</span>
                </div>
                <div className="row flex justify-between border-t pt-2 mt-2 font-bold">
                  <span>الرصيد المتبقي:</span>
                  <span className={receiptData.newBalance > 0 ? 'text-destructive' : 'text-accent'}>
                    {formatCurrency(receiptData.newBalance, currency)}
                  </span>
                </div>
                {receiptData.notes && (
                  <div className="row flex justify-between">
                    <span>ملاحظات:</span>
                    <span>{receiptData.notes}</span>
                  </div>
                )}
              </div>
              
              <div className="footer text-center mt-6 text-xs text-muted-foreground">
                شكراً لتعاملكم معنا
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsReceiptModalOpen(false)}>
              إغلاق
            </Button>
            <Button onClick={handlePrintReceipt} className="gap-2">
              <Printer size={18} />
              طباعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
