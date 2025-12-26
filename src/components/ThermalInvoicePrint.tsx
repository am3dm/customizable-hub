import { forwardRef } from 'react';

interface InvoiceItem {
  product_name: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
}

interface ThermalInvoicePrintProps {
  invoice: {
    invoice_number: string;
    type: string;
    subtotal: number;
    discount?: number;
    tax?: number;
    total: number;
    paid?: number;
    remaining?: number;
    payment_method?: string;
    notes?: string;
    created_at: string;
  };
  items: InvoiceItem[];
  customer?: {
    name: string;
    phone?: string;
    balance?: number;
  } | null;
  storeSettings?: {
    store_name?: string;
    store_phone?: string;
    store_address?: string;
    currency?: string;
  } | null;
}

// Format currency for Iraqi Dinar (no decimals for large amounts)
const formatIQD = (amount: number, currency: string = 'د.ع'): string => {
  // Iraqi Dinar typically doesn't use decimals
  const formatted = Math.round(amount).toLocaleString('ar-IQ');
  return `${formatted} ${currency}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const typeLabels: Record<string, string> = {
  sale: 'فاتورة بيع',
  purchase: 'فاتورة شراء',
  return: 'فاتورة إرجاع',
};

const paymentMethodLabels: Record<string, string> = {
  cash: 'نقداً',
  card: 'بطاقة',
  credit: 'آجل',
  transfer: 'تحويل',
};

export const ThermalInvoicePrint = forwardRef<HTMLDivElement, ThermalInvoicePrintProps>(
  ({ invoice, items, customer, storeSettings }, ref) => {
    const currency = storeSettings?.currency || 'د.ع';

    return (
      <div 
        ref={ref} 
        className="thermal-invoice"
        style={{ 
          width: '80mm',
          maxWidth: '80mm',
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          padding: '5mm',
          direction: 'rtl',
          backgroundColor: 'white',
          color: 'black',
        }}
      >
        {/* Store Header */}
        <div style={{ textAlign: 'center', marginBottom: '10px', borderBottom: '1px dashed #000', paddingBottom: '10px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
            {storeSettings?.store_name || 'المتجر'}
          </div>
          {storeSettings?.store_address && (
            <div style={{ fontSize: '10px', marginBottom: '3px' }}>{storeSettings.store_address}</div>
          )}
          {storeSettings?.store_phone && (
            <div style={{ fontSize: '10px' }}>هاتف: {storeSettings.store_phone}</div>
          )}
        </div>

        {/* Invoice Type */}
        <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', margin: '8px 0', padding: '5px', border: '1px solid #000' }}>
          {typeLabels[invoice.type] || 'فاتورة'}
        </div>

        {/* Invoice Info */}
        <div style={{ marginBottom: '10px', fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>رقم الفاتورة:</span>
            <span style={{ fontWeight: 'bold' }}>{invoice.invoice_number}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>التاريخ:</span>
            <span>{formatDate(invoice.created_at)}</span>
          </div>
          {customer && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>العميل:</span>
                <span>{customer.name}</span>
              </div>
              {customer.phone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span>الهاتف:</span>
                  <span>{customer.phone}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Items Table */}
        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', marginBottom: '10px' }}>
          <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th style={{ textAlign: 'right', paddingBottom: '5px' }}>الصنف</th>
                <th style={{ textAlign: 'center', paddingBottom: '5px' }}>الكمية</th>
                <th style={{ textAlign: 'center', paddingBottom: '5px' }}>السعر</th>
                <th style={{ textAlign: 'left', paddingBottom: '5px' }}>المجموع</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px dotted #eee' }}>
                  <td style={{ paddingTop: '5px', paddingBottom: '5px', maxWidth: '25mm', wordBreak: 'break-word' }}>
                    {item.product_name}
                  </td>
                  <td style={{ textAlign: 'center', paddingTop: '5px', paddingBottom: '5px' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'center', paddingTop: '5px', paddingBottom: '5px' }}>{Math.round(item.price).toLocaleString('ar-IQ')}</td>
                  <td style={{ textAlign: 'left', paddingTop: '5px', paddingBottom: '5px' }}>{Math.round(item.total).toLocaleString('ar-IQ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ fontSize: '11px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>المجموع الفرعي:</span>
            <span>{formatIQD(invoice.subtotal, currency)}</span>
          </div>
          {(invoice.discount ?? 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#c00' }}>
              <span>الخصم:</span>
              <span>-{formatIQD(invoice.discount || 0, currency)}</span>
            </div>
          )}
          {(invoice.tax ?? 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span>الضريبة:</span>
              <span>{formatIQD(invoice.tax || 0, currency)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', borderTop: '1px solid #000', paddingTop: '5px', marginTop: '5px' }}>
            <span>الإجمالي:</span>
            <span>{formatIQD(invoice.total, currency)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div style={{ fontSize: '11px', marginBottom: '10px', padding: '8px', backgroundColor: '#f5f5f5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>طريقة الدفع:</span>
            <span>{paymentMethodLabels[invoice.payment_method || 'cash'] || invoice.payment_method}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>المدفوع:</span>
            <span>{formatIQD(invoice.paid || 0, currency)}</span>
          </div>
          {(invoice.remaining ?? 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#c00' }}>
              <span>المتبقي:</span>
              <span>{formatIQD(invoice.remaining || 0, currency)}</span>
            </div>
          )}
        </div>

        {/* Customer Balance (for credit sales) */}
        {customer && invoice.payment_method === 'credit' && (customer.balance ?? 0) > 0 && (
          <div style={{ fontSize: '11px', marginBottom: '10px', padding: '8px', backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>إجمالي ذمة العميل:</span>
              <span style={{ color: '#c00' }}>{formatIQD(customer.balance || 0, currency)}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div style={{ fontSize: '10px', marginBottom: '10px', padding: '5px', backgroundColor: '#f0f0f0' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>ملاحظات:</div>
            <div>{invoice.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '15px', paddingTop: '10px', borderTop: '1px dashed #000', fontSize: '10px' }}>
          <div style={{ marginBottom: '5px' }}>شكراً لتعاملكم معنا</div>
          <div style={{ color: '#666' }}>نتمنى لكم تجربة تسوق سعيدة</div>
        </div>
      </div>
    );
  }
);

ThermalInvoicePrint.displayName = 'ThermalInvoicePrint';
