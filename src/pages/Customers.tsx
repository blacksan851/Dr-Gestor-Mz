import React, { useState } from 'react';
import { useStore, Customer } from '../lib/store';
import { Edit, Trash2, Plus, Phone, FileText, CheckCircle, Wallet, X } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '',
    phone: '',
    nuit: '',
    status: 'ativo',
    balance: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCustomer({ ...formData, id: editingId });
      setEditingId(null);
    } else {
      addCustomer(formData);
      setIsAdding(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({ 
      name: customer.name, 
      phone: customer.phone, 
      nuit: customer.nuit, 
      status: customer.status,
      balance: customer.balance
    });
    setEditingId(customer.id);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', nuit: '', status: 'ativo', balance: 0 });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes & Fiados</h1>
          <p className="text-neutral-400">Gestão de clientes e contas a receber (Crédito)</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', phone: '', nuit: '', status: 'ativo', balance: 0 });
            setIsAdding(true);
          }}
          className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-500 transition flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">
              {editingId ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <button onClick={cancelEdit} className="text-neutral-500 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Nome / Empresa</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Telefone</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">NUIT</label>
              <input type="text" value={formData.nuit} onChange={e => setFormData({...formData, nuit: e.target.value})} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Saldo em Dívida (Fiado)</label>
              <input type="number" min="0" value={formData.balance} onChange={e => setFormData({...formData, balance: Number(e.target.value)})} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none rounded-md" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-md mt-2 hover:bg-emerald-500 transition-colors">Salvar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-950/50 text-neutral-400 border-b border-neutral-800">
            <tr>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Contactos</th>
              <th className="px-6 py-4">Fiado Atual (Dívida)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-neutral-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                <td className="px-6 py-4 text-neutral-400">
                  <div className="flex flex-col text-xs space-y-1">
                    <span className="flex items-center gap-1"><Phone size={14}/> {c.phone || 'N/A'}</span>
                    <span className="flex items-center gap-1"><FileText size={14}/> {c.nuit || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-bold ${c.balance > 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                    {formatCurrency(c.balance)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">{c.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {c.balance > 0 && (
                      <button 
                        onClick={() => {
                          if(confirm(`Tem certeza que deseja liquidar a dívida de ${formatCurrency(c.balance)} do cliente ${c.name}?`)) {
                            updateCustomer({...c, balance: 0});
                          }
                        }} 
                        className="text-sm px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded text-emerald-400 font-medium transition-colors"
                      >
                        Liquidar Dívida
                      </button>
                    )}
                    <button onClick={() => handleEdit(c)} className="text-neutral-400 hover:text-emerald-400 p-2 rounded hover:bg-emerald-500/10 transition-colors"><Edit size={16}/></button>
                    <button onClick={() => { if(confirm('Apagar cliente?')) deleteCustomer(c.id) }} className="text-neutral-400 hover:text-red-500 p-2 rounded hover:bg-red-500/10 transition-colors"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
