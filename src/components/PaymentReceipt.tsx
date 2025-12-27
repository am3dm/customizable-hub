import { forwardRef } from 'react';

interface PaymentReceiptProps {
  payment: {
    amount_paid: number;
    payment_date: string;
    payment_method: string;
    note?: string;
  };
  customer: {
    name: string;
    phone?: string;
    previousBalance: number;
    newBalance: number;
  };
  storeSettings: {
    store_name?: string;
    store_phone?: string;
    store_address?: string;
  } | null;
  receiptNumber: string;
}

// Format Iraqi Dinar without decimal fractions
const formatIQD = (amount: number): string => {
  return new Intl.NumberFormat('ar-IQ', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' د.ع';
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const PaymentReceipt = forwardRef<HTMLDivElement, PaymentReceiptProps>(
  ({ payment, customer, storeSettings, receiptNumber }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[80mm] mx-auto bg-white text-black p-4 font-mono text-sm"
        style={{ 
          fontFamily: 'monospace',
          direction: 'rtl',
        }}
      >
        {/* Store Header */}
        <div className="text-center border-b-2 border-dashed border-black pb-3 mb-3">
          <h1 className="text-xl font-bold mb-1">
            {storeSettings?.store_name || 'المتجر'}
          </h1>
          {storeSettings?.store_address && (
            <p className="text-xs">{storeSettings.store_address}</p>
          )}
          {storeSettings?.store_phone && (
            <p className="text-xs">هاتف: {storeSettings.store_phone}</p>
          )}
        </div>

        {/* Receipt Title */}
        <div className="text-center mb-3">
          <h2 className="text-lg font-bold bg-black text-white py-1 px-2">
            وصل قبض
          </h2>
          <p className="text-xs mt-1">رقم: {receiptNumber}</p>
          <p className="text-xs">{formatDate(payment.payment_date)}</p>
        </div>

        {/* Customer Info */}
        <div className="border-b border-dashed border-black pb-2 mb-2">
          <div className="flex justify-between">
            <span>العميل:</span>
            <span className="font-bold">{customer.name}</span>
          </div>
          {customer.phone && (
            <div className="flex justify-between text-xs">
              <span>الهاتف:</span>
              <span>{customer.phone}</span>
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="space-y-2 mb-3">
          <div className="flex justify-between">
            <span>الرصيد السابق:</span>
            <span>{formatIQD(customer.previousBalance)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold bg-gray-100 p-2 -mx-2">
            <span>المبلغ المستلم:</span>
            <span className="text-green-700">{formatIQD(payment.amount_paid)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-black pt-2">
            <span className="font-bold">الرصيد المتبقي:</span>
            <span className={`font-bold ${customer.newBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatIQD(customer.newBalance)}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="flex justify-between text-xs border-t border-dashed border-black pt-2">
          <span>طريقة الدفع:</span>
          <span>
            {payment.payment_method === 'cash' ? 'نقداً' : 
             payment.payment_method === 'card' ? 'بطاقة' : 
             payment.payment_method === 'transfer' ? 'تحويل' : payment.payment_method}
          </span>
        </div>

        {/* Note */}
        {payment.note && (
          <div className="mt-2 text-xs border-t border-dashed border-black pt-2">
            <p className="font-bold">ملاحظة:</p>
            <p>{payment.note}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-4 pt-3 border-t-2 border-dashed border-black">
          <p className="text-xs text-gray-600">شكراً لتعاملكم معنا</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date().toLocaleDateString('ar-IQ')}
          </p>
        </div>
      </div>
    );
  }
);

PaymentReceipt.displayName = 'PaymentReceipt';

export default PaymentReceipt;
