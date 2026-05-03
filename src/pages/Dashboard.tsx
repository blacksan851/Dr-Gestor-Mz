import { useStore } from '../lib/store';
import { ShoppingCart, Package, TrendingUp, Download, Upload, FileText, FileJson } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import React, { useRef, useState } from 'react';
import Papa from 'papaparse';

const COLORS = ['#10B981', '#34D399', '#059669', '#047857'];

export default function Dashboard() {
  const { user, products, sales, expenses, settings, categories } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);

  const totalSales = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalCost = sales.reduce((acc, sale) => acc + (sale.totalCost || 0), 0);
  const grossProfit = totalSales - totalCost;
  
  const totalExpenses = expenses ? expenses.reduce((acc, exp) => acc + exp.amount, 0) : 0;
  const netProfit = grossProfit - totalExpenses;

  const lowStock = products.filter(p => p.stock < 10).length;

  const paymentData = sales.reduce((acc: any[], sale) => {
    const existing = acc.find(item => item.name === sale.paymentMethod);
    if (existing) {
      existing.value += sale.total;
    } else {
      acc.push({ name: sale.paymentMethod, value: sale.total });
    }
    return acc;
  }, []);

  const getWeekData = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weekData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        name: days[d.getDay()], 
        dateString: d.toISOString().split('T')[0],
        vendas: 0 
      };
    });

    sales.forEach(sale => {
      const saleDate = new Date(sale.date).toISOString().split('T')[0];
      const weekDay = weekData.find(w => w.dateString === saleDate);
      if (weekDay) {
        weekDay.vendas += sale.total;
      }
    });

    return weekData;
  };

  const chartData = getWeekData();

  const handleExportDataJSON = () => {
    setShowExportMenu(false);
    const state = useStore.getState();
    const dataToExport = {
      products: state.products,
      sales: state.sales,
      categories: state.categories,
      customers: state.customers,
      settings: state.settings,
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gestor_mz_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportDataCSV = () => {
    setShowExportMenu(false);
    const csv = Papa.unparse(products.map(p => ({
      Nome: p.name,
      Preco: p.price,
      Custo: p.costPrice || '',
      Estoque: p.stock,
      Categoria: p.category,
      CodigoBarras: p.barcode || '',
    })));
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gestor_mz_produtos_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const currentCatNames = categories.map(c => c.name);
            const newProducts = results.data.map((row: any) => {
              // Create category if it doesn't exist
              if (row.Categoria && !currentCatNames.includes(row.Categoria)) {
                useStore.getState().addCategory({ name: row.Categoria });
                currentCatNames.push(row.Categoria);
              }
              
              return {
                id: Math.random().toString(36).substr(2, 9),
                name: row.Nome || 'Produto sem nome',
                price: Number(row.Preco) || 0,
                costPrice: row.Custo ? Number(row.Custo) : undefined,
                stock: Number(row.Estoque) || 0,
                category: row.Categoria || 'Geral',
                barcode: row.CodigoBarras || undefined,
                imageUrl: ''
              };
            });
            
            useStore.setState((state) => ({
              ...state,
              products: [...state.products, ...newProducts]
            }));
            alert(`Foram importados ${newProducts.length} produtos com sucesso!`);
          } catch (error) {
            alert('Erro ao interpretar o ficheiro CSV de produtos. Verifique as colunas (Nome, Preco, Custo, Estoque, Categoria, CodigoBarras).');
          }
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const importedData = JSON.parse(content);
          
          if (importedData.products || importedData.sales) {
            useStore.setState((state) => ({
              ...state,
              products: importedData.products || state.products,
              sales: importedData.sales || state.sales,
              categories: importedData.categories || state.categories,
              customers: importedData.customers || state.customers,
              settings: importedData.settings || state.settings,
            }));
            alert('Backup restaurado com sucesso! O Dashboard foi atualizado.');
          } else {
            alert('Arquivo de backup inválido ou corrompido.');
          }
        } catch (error) {
          alert('Erro ao ler o arquivo JSON. Certifique-se de que é um ficheiro válido.');
        }
      };
      reader.readAsText(file);
    }
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowImportMenu(false);
  };

  const triggerFileInput = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
    setShowImportMenu(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bom dia, {user?.name.split(' ')[0]}</h1>
          <p className="text-neutral-400">Aqui está o resumo de hoje para {user?.companyName || settings.companyName}</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto relative">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImportData}
            className="hidden" 
          />
          
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => setShowImportMenu(!showImportMenu)}
              className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition font-medium border border-neutral-700"
            >
              <Upload size={18} />
              <span className="text-sm">Importar</span>
            </button>
            {showImportMenu && (
              <div className="absolute top-full mt-2 left-0 right-0 md:w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-20 overflow-hidden">
                <button onClick={() => triggerFileInput('.csv')} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-neutral-800 text-left text-sm text-neutral-300">
                  <FileText size={16} className="text-emerald-400" />
                  Produtos (CSV)
                </button>
                <div className="h-px bg-neutral-800" />
                <button onClick={() => triggerFileInput('.json')} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-neutral-800 text-left text-sm text-neutral-300">
                  <FileJson size={16} className="text-blue-400" />
                  Backup (JSON)
                </button>
              </div>
            )}
          </div>

          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition shadow-[0_0_15px_rgba(16,185,129,0.3)] font-medium"
            >
              <Download size={18} />
              <span className="text-sm">Exportar</span>
            </button>
            {showExportMenu && (
              <div className="absolute top-full mt-2 right-0 md:w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-20 overflow-hidden">
                <button onClick={handleExportDataCSV} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-neutral-800 text-left text-sm text-neutral-300">
                  <FileText size={16} className="text-emerald-400" />
                  Produtos (CSV)
                </button>
                <div className="h-px bg-neutral-800" />
                <button onClick={handleExportDataJSON} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-neutral-800 text-left text-sm text-neutral-300">
                  <FileJson size={16} className="text-blue-400" />
                  Backup (JSON)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-neutral-900 rounded-xl p-4 shadow-sm border border-neutral-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-400 mb-1">Vendas Totais</p>
            <p className="text-xl font-bold text-white">{formatCurrency(totalSales)}</p>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl p-4 shadow-sm border border-neutral-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-400 mb-1">Lucro Bruto</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(grossProfit)}</p>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl p-4 shadow-sm border border-neutral-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-400 mb-1">Despesas</p>
            <p className="text-xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl p-4 shadow-sm border border-neutral-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-400 mb-1">Balanço Final</p>
            <p className="text-xl font-bold text-blue-400">{formatCurrency(netProfit)}</p>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl p-4 shadow-sm border border-neutral-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-400 mb-1">Estoque Baixo</p>
            <p className="text-xl font-bold text-red-500">{lowStock}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 p-5">
          <h2 className="text-lg font-bold text-white mb-4">Evolução de Vendas</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A3A3A3', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3A3A3', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#171717' }}
                  contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#262626', borderRadius: '8px', color: '#E5E5E5' }}
                  formatter={(value) => [formatCurrency(value as number), 'Vendas']}
                />
                <Bar dataKey="vendas" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 p-5">
            <h2 className="text-lg font-bold text-white mb-4">Vendas por Método</h2>
            <div className="h-44 w-full">
              {paymentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#262626', borderRadius: '8px', color: '#E5E5E5' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-neutral-400 text-center py-8">Sem dados</p>
              )}
            </div>
          </div>

          <div className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 p-5 overflow-hidden">
            <h2 className="text-lg font-bold text-white mb-4">Vendas Recentes</h2>
            <div className="space-y-4">
              {sales.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-4">Nenhuma venda registrada ainda.</p>
              ) : (
                sales.slice(0, 5).map(sale => (
                  <div key={sale.id} className="flex justify-between items-center pb-4 border-b border-neutral-800 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-white text-sm">Venda #{sale.id.toUpperCase()}</p>
                      <p className="text-xs text-neutral-400">{new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • Vendedor: {sale.sellerName || 'Desconhecido'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">{formatCurrency(sale.total)}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 capitalize">
                        {sale.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
