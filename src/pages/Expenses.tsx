import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Download, Trash2, Plus, Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const EXPENSE_CATEGORIES = [
  'Salário',
  'Renda / Aluguer',
  'Energia',
  'Água',
  'Transporte / Combustível',
  'Manutenção',
  'Limpeza',
  'Marketing',
  'Impostos',
  'Outros'
];

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, user, settings } = useStore();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  
  const [dateFilter, setDateFilter] = useState('');

  const filteredExpenses = expenses.filter(e => {
    if (dateFilter) {
      return e.date.startsWith(dateFilter);
    }
    return true;
  });

  const totalFiltered = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) return;
    
    addExpense({
      description,
      amount: Number(amount),
      category,
      date: new Date().toISOString(),
      registeredBy: user?.name || 'Desconhecido'
    });
    
    setDescription('');
    setAmount('');
    setCategory(EXPENSE_CATEGORIES[0]);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Relatório de Despesas', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Empresa: ${settings.companyName}`, 14, 32);
    doc.text(`Data de Emissão: ${formatDate(new Date().toISOString())}`, 14, 40);

    let nextY = 50;
    if (dateFilter) {
      doc.text(`Filtro de Data: ${dateFilter}`, 14, nextY);
      nextY += 8;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38); // Red for expenses
    doc.text(`Total Gasto: ${formatCurrency(totalFiltered)}`, 14, nextY);
    
    nextY += 10;

    const tableData = filteredExpenses.map(expense => [
      formatDate(expense.date),
      expense.category,
      expense.description,
      expense.registeredBy,
      formatCurrency(expense.amount)
    ]);

    autoTable(doc, {
      startY: nextY,
      head: [['Data', 'Categoria', 'Descrição', 'Registado por', 'Valor']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [40, 40, 40] }
    });

    doc.save(`relatorio-despesas-${new Date().getTime()}.pdf`);
  };

  return (
    <div className="flex-1 overflow-auto bg-neutral-950 p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Despesas & Gastos</h1>
          <p className="text-neutral-400 mt-1">Registe e acompanhe os gastos operacionais da empresa</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button 
            onClick={handleExportPDF}
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Download size={20} />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nova Despesa */}
        <div className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 overflow-hidden lg:col-span-1">
          <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus size={20} className="text-emerald-500" /> Nova Despesa
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Valor (MZN)</label>
              <input 
                type="number" 
                required 
                min="0" 
                step="0.01" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none placeholder-neutral-600" 
                placeholder="Ex: 5000.00" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Categoria</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Descrição</label>
              <textarea 
                required 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none placeholder-neutral-600 resize-none h-24" 
                placeholder="Detalhes da despesa..." 
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-lg font-medium transition shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              Registar Despesa
            </button>
          </form>
        </div>

        {/* Lista de Despesas */}
        <div className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 overflow-hidden lg:col-span-2 flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt size={20} className="text-neutral-400" /> Histórico de Despesas
            </h2>
            <div className="text-sm font-medium">
              <span className="text-neutral-400 mr-2">Total Filtrado:</span>
              <span className="text-red-400 font-bold">{formatCurrency(totalFiltered)}</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                Nenhuma despesa registada para este filtro.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-neutral-800 text-neutral-300 text-xs px-2 py-0.5 rounded font-medium">
                          {expense.category}
                        </span>
                        <span className="text-sm text-neutral-500">{formatDate(expense.date)}</span>
                      </div>
                      <h3 className="text-white font-medium break-words">{expense.description}</h3>
                      <p className="text-xs text-neutral-500 mt-1">Registado por: {expense.registeredBy}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-red-400 font-bold">{formatCurrency(expense.amount)}</div>
                      </div>
                      
                      {user?.role === 'admin' && (
                        <button 
                          onClick={() => {
                            if (confirm('Tem a certeza que deseja eliminar esta despesa?')) {
                              deleteExpense(expense.id);
                            }
                          }}
                          className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                          title="Eliminar Despesa"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
