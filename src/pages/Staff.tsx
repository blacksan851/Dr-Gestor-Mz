import React, { useState } from 'react';
import { useStore, StaffUser } from '../lib/store';
import { Edit, Trash2, Plus, Users, Shield, ShieldAlert, BadgeCheck, X } from 'lucide-react';

export default function Staff() {
  const { staff, addStaff, updateStaff, deleteStaff, user: currentUser } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [newStaffDetails, setNewStaffDetails] = useState<{ email: string, accessCode: string, link: string } | null>(null);

  const [formData, setFormData] = useState<Omit<StaffUser, 'id'>>({
    name: '',
    email: '',
    role: 'vendedor',
    status: 'ativo',
    accessCode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaffId) {
      updateStaff({ ...formData, id: editingStaffId });
      setEditingStaffId(null);
    } else {
      addStaff(formData);
      setIsAdding(false);
      setNewStaffDetails({
        email: formData.email,
        accessCode: formData.accessCode,
        link: `${window.location.origin}/login`
      });
    }
  };

  const handleEdit = (user: StaffUser) => {
    setFormData({ name: user.name, email: user.email, role: user.role, status: user.status, accessCode: user.accessCode });
    setEditingStaffId(user.id);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingStaffId(null);
    setFormData({ name: '', email: '', role: 'vendedor', status: 'ativo', accessCode: '' });
  };

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'gerente') {
    return (
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
        <p className="text-neutral-400">Apenas administradores e gerentes podem gerir a equipa.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Equipa & Acessos</h1>
          <p className="text-neutral-400">Faça a gestão dos funcionários e os seus níveis de acesso</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', email: '', role: 'vendedor', status: 'ativo', accessCode: '' });
            setIsAdding(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <Plus size={20} />
          <span>Novo Colaborador</span>
        </button>
      </div>

      {(isAdding || editingStaffId) && (
        <div className="bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">
              {editingStaffId ? 'Editar Colaborador' : 'Adicionar Novo Colaborador'}
            </h2>
            <button onClick={cancelEdit} className="p-2 hover:bg-neutral-800 rounded-full text-neutral-500 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Nome Completo</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Nível de Acesso</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              >
                <option value="vendedor">Vendedor (PDV e Vendas apenas)</option>
                <option value="gerente">Gerente (Estoque, Produtos, Clientes)</option>
                <option value="admin">Administrador (Acesso Total)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Estado</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Código de Acesso (Senha)</label>
              <input 
                type="text" 
                required
                value={formData.accessCode}
                onChange={(e) => setFormData({...formData, accessCode: e.target.value})}
                placeholder="Ex: 1234"
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none placeholder-neutral-600" 
              />
            </div>
            <div className="md:col-span-2 pt-2">
              <button 
                type="submit" 
                className="w-full md:w-auto px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-500 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                {editingStaffId ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-950/50 text-neutral-400 font-medium border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Email / Acesso</th>
                <th className="px-6 py-4">Nível de Acesso</th>
                <th className="px-6 py-4">Código PIN</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {staff.map(user => (
                <tr key={user.id} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white border-none">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-400 border-none">{user.email}</td>
                  <td className="px-6 py-4 border-none text-neutral-300">
                    <div className="flex items-center gap-1.5">
                      {user.role === 'admin' && <Shield className="w-4 h-4 text-purple-500" />}
                      {user.role === 'gerente' && <BadgeCheck className="w-4 h-4 text-orange-500" />}
                      {user.role === 'vendedor' && <Users className="w-4 h-4 text-emerald-400" />}
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-none font-mono text-neutral-400">
                    {user.accessCode || '----'}
                  </td>
                  <td className="px-6 py-4 border-none">
                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                      user.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right border-none">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                        title="Editar Utilizador"
                      >
                        <Edit size={18} />
                      </button>
                      {user.id !== currentUser?.id && (
                        <button 
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja apagar este utilizador?')) {
                              deleteStaff(user.id);
                            }
                          }}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          title="Apagar Colaborador"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {staff.length === 0 && (
            <div className="p-8 text-center text-neutral-500">
              Nenhum colaborador registado.
            </div>
          )}
        </div>
      </div>

      {newStaffDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setNewStaffDetails(null)} 
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <BadgeCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-white">Colaborador Criado!</h3>
              <p className="text-sm text-neutral-400 mt-1">
                Partilhe estas credenciais com o colaborador para aceder ao sistema.
              </p>
            </div>
            
            <div className="space-y-4 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Página de Login</label>
                <div className="text-emerald-400 font-mono text-sm break-all bg-emerald-500/10 p-2 rounded">{newStaffDetails.link}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Email</label>
                <div className="text-white font-medium">{newStaffDetails.email || 'Não definido'}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Código PIN (Senha)</label>
                <div className="text-white font-medium">{newStaffDetails.accessCode}</div>
              </div>
            </div>

            <div className="mt-6">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`Acesso ao Gestor MZ:\nLink: ${newStaffDetails.link}\nEmail: ${newStaffDetails.email}\nPIN: ${newStaffDetails.accessCode}`)
                  alert('Credenciais copiadas!');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg transition shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                Copiar para a Área de Transferência
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
