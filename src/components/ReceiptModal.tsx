import React, { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useStore } from '../lib/store';

interface ReceiptModalProps {
  sale: any;
  onClose: () => void;
}

export default function ReceiptModal({ sale, onClose }: ReceiptModalProps) {
  const { settings } = useStore();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;
    
    // Creating a hidden iframe to print
    const printWindow = document.createElement('iframe');
    printWindow.style.position = 'absolute';
    printWindow.style.top = '-1000px';
    document.body.appendChild(printWindow);
    
    const doc = printWindow.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Recibo via Gestor MZ</title>
            <style>
              body {
                font-family: monospace;
                margin: 0;
                padding: 10px;
                color: #000;
                background: #fff;
                width: 300px;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .mb-1 { margin-bottom: 4px; }
              .mb-2 { margin-bottom: 8px; }
              .mb-4 { margin-bottom: 16px; }
              .mt-4 { margin-top: 16px; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .border-b { border-bottom: 1px dashed #000; padding-bottom: 8px; }
              .border-t { border-top: 1px dashed #000; padding-top: 8px; }
              .text-sm { font-size: 12px; }
              .text-xs { font-size: 10px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { text-align: left; vertical-align: top; font-size: 12px; }
              th.text-right, td.text-right { text-align: right; }
              .item-name { max-width: 150px; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      doc.close();
      
      printWindow.contentWindow?.focus();
      setTimeout(() => {
        printWindow.contentWindow?.print();
        document.body.removeChild(printWindow);
      }, 250);
    }
  };

  if (!sale) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-xl shadow-xl border border-neutral-800 w-full max-w-sm flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">Recibo da Venda</h2>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto bg-white text-black" style={{ minHeight: '300px' }}>
          {/* Printable Area Starts */}
          <div ref={printRef} className="font-mono text-sm">
            <div className="text-center mb-4">
              {settings.logoUrl && (
                <div className="flex justify-center mb-2">
                  <img src={settings.logoUrl} alt="Logo" style={{ maxHeight: '50px', filter: 'grayscale(100%)' }} />
                </div>
              )}
              <div className="font-bold text-base mb-1">{settings.companyName}</div>
              <div className="text-xs">NUIT: {settings.nuit}</div>
              <div className="text-xs">{settings.address}</div>
              <div className="text-xs">Tel: {settings.phone}</div>
              <div className="text-xs">Email: {settings.email}</div>
            </div>

            <div className="border-b border-dashed border-neutral-300 pb-2 mb-2 text-xs">
              <div className="flex justify-between">
                <span>Data:</span>
                <span>{new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Recibo N°:</span>
                <span className="uppercase">{sale.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Operador:</span>
                <span>{sale.sellerName}</span>
              </div>
            </div>

            <table className="w-full mb-2">
              <thead>
                <tr className="border-b border-dashed border-neutral-300">
                  <th className="pb-1">Qtd</th>
                  <th className="pb-1 text-left px-2">Item</th>
                  <th className="pb-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-1">{item.quantity}</td>
                    <td className="py-1 px-2 item-name">{item.name} <br/> <span className="text-xs">{formatCurrency(item.price)} un</span></td>
                    <td className="py-1 text-right">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-neutral-300 pt-2 mb-4">
              <div className="flex justify-between font-bold text-base">
                <span>TOTAL:</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
              <div className="flex justify-between mt-1 text-xs">
                <span>Pagamento:</span>
                <span className="uppercase">{sale.paymentMethod}</span>
              </div>
            </div>

            <div className="text-center text-xs mt-6 mb-2">
              <p>{settings.receiptMessage}</p>
              <p className="mt-2 text-[10px]">Documento gerado por Gestor MZ</p>
            </div>
          </div>
          {/* Printable Area Ends */}
        </div>

        <div className="p-4 border-t border-neutral-800 bg-neutral-900 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition"
          >
            Fechar
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Printer size={18} />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
