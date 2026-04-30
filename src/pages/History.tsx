import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import { Receipt, Download } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function History() {
  const { sales, settings } = useStore();
  const [selectedSale, setSelectedSale] = useState<any>(null);

  // Prepare data for the Payment Method Pie Chart
  const paymentData = sales.reduce((acc: any[], sale) => {
    const existing = acc.find(item => item.name === sale.paymentMethod);
    if (existing) {
      existing.value += sale.total;
    } else {
      acc.push({ name: sale.paymentMethod, value: sale.total });
    }
    return acc;
  }, []);

  // Prepare data for the Categories Pie Chart
  const categoryData = sales.reduce((acc: any[], sale) => {
    sale.items.forEach((item: any) => {
      const existing = acc.find(i => i.name === item.category);
      if (existing) {
        existing.value += (item.price * item.quantity);
      } else {
        acc.push({ name: item.category || 'Desconhecida', value: (item.price * item.quantity) });
      }
    });
    return acc;
  }, []);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Relatório de Vendas - ${settings.companyName}`, 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableColumn = ["ID", "Data", "Vendedor", "Pagamento", "Qtd. Itens", "Total", "Custo", "Lucro"];
    const tableRows: any[] = [];
    
    let sumTotal = 0;
    let sumCost = 0;
    let sumProfit = 0;

    sales.forEach(sale => {
      const dateStr = `${new Date(sale.date).toLocaleDateString()} ${new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      const totalCost = sale.totalCost || 0;
      const profit = sale.total - totalCost;
      
      sumTotal += sale.total;
      sumCost += totalCost;
      sumProfit += profit;

      const saleData = [
        sale.id.toUpperCase(),
        dateStr,
        sale.sellerName || 'Desconhecido',
        sale.paymentMethod,
        sale.items.length.toString(),
        formatCurrency(sale.total),
        formatCurrency(totalCost),
        formatCurrency(profit)
      ];
      tableRows.push(saleData);
    });

    tableRows.push([
      '', '', '', '', 'TOTAL GERAL', formatCurrency(sumTotal), formatCurrency(sumCost), formatCurrency(sumProfit)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] },
      didParseCell: function (data) {
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      }
    });
    
    doc.save(`gestor_mz_vendas_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-80px)]">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Histórico de Vendas</h1>
          <p className="text-neutral-400">Visualize transações e análises de vendas</p>
        </div>
        <button 
          onClick={handleExportPDF}
          className="flex justify-center items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          title="Exportar Vendas para PDF"
        >
          <Download size={18} />
          <span className="text-sm">Exportar Relatório PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
        <div className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 p-5">
          <h2 className="text-lg font-bold text-white mb-4">Vendas por Método de Pagamento</h2>
          <div className="h-48 w-full">
            {paymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#262626', borderRadius: '8px', color: '#E5E5E5' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-neutral-400 text-center py-10">Sem dados suficientes</p>
            )}
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 p-5">
          <h2 className="text-lg font-bold text-white mb-4">Vendas por Categoria de Produto</h2>
          <div className="h-48 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#262626', borderRadius: '8px', color: '#E5E5E5' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-neutral-400 text-center py-10">Sem dados suficientes</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 overflow-hidden flex-1 flex flex-col min-h-0">
        {sales.length > 0 ? (
          <div className="overflow-auto flex-1 relative">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-950/90 text-neutral-400 font-medium border-b border-neutral-800 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Data & ID</th>
                  <th className="px-6 py-4">Vendedor</th>
                  <th className="px-6 py-4">Método</th>
                  <th className="px-6 py-4">Itens</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {sales.map((sale: any) => (
                  <tr key={sale.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-xs text-neutral-500">#{sale.id.toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{sale.sellerName || 'Desconhecido'}</div>
                    </td>
                    <td className="px-6 py-4 capitalize text-neutral-300">{sale.paymentMethod}</td>
                    <td className="px-6 py-4 text-neutral-400">
                      {sale.items.length} produto(s)
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-white">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedSale(sale)}
                        className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <Receipt size={16} /> Recibo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-500">
            Nenhuma venda registrada ainda.
          </div>
        )}
      </div>

      {selectedSale && (
        <ReceiptModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
      )}
    </div>
  );
}
