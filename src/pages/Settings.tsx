import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Building2, Save } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings } = useStore();
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações da Empresa</h1>
          <p className="text-neutral-400">Detalhes para faturas, NUIT, logo e recibos</p>
        </div>
      </div>
      
      <div className="bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-800">
            <div className="h-16 w-16 bg-neutral-950 rounded-xl flex items-center justify-center border border-neutral-800">
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo" className="h-full w-full object-contain rounded-xl" />
              ) : (
                <Building2 className="h-8 w-8 text-neutral-600" />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-400 mb-1">URL do Logotipo</label>
              <input 
                type="url" 
                value={formData.logoUrl}
                onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Nome da Empresa</label>
              <input 
                type="text" 
                required
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">NUIT</label>
              <input 
                type="text" 
                required
                value={formData.nuit}
                onChange={(e) => setFormData({...formData, nuit: e.target.value})}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-400 mb-1">Endereço Completo</label>
              <input 
                type="text" 
                required
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Telefone</label>
              <input 
                type="text" 
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-400 mb-1">Mensagem de Rodapé (Recibos / Faturas)</label>
              <textarea 
                rows={3}
                value={formData.receiptMessage}
                onChange={(e) => setFormData({...formData, receiptMessage: e.target.value})}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                placeholder="Ex: Obrigado pela sua preferência!"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-500 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Save className="h-5 w-5" />
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
