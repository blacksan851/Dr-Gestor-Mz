import React, { useState } from 'react';
import { useStore, Product } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import { Plus, Search, Edit, Trash2, FolderEdit, X, Check, AlertTriangle, Package } from 'lucide-react';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // New Product Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [category, setCategory] = useState('');
  const [barcode, setBarcode] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Edit Product Form State
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editMinStock, setEditMinStock] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editBarcode, setEditBarcode] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock || !category) return;
    
    addProduct({
      name,
      price: Number(price),
      costPrice: costPrice.trim() ? Number(costPrice) : undefined,
      stock: Number(stock),
      minStock: minStock.trim() ? Number(minStock) : undefined,
      category,
      barcode: barcode.trim() ? barcode : undefined,
      imageUrl: imageUrl.trim() ? imageUrl : undefined
    });
    
    setName('');
    setPrice('');
    setCostPrice('');
    setStock('');
    setMinStock('');
    setCategory('');
    setBarcode('');
    setImageUrl('');
    setIsAdding(false);
  };

  const startEditing = (product: Product) => {
    setEditingProductId(product.id);
    setEditName(product.name);
    setEditPrice(product.price.toString());
    setEditCostPrice(product.costPrice?.toString() || '');
    setEditStock(product.stock.toString());
    setEditMinStock(product.minStock?.toString() || '');
    setEditCategory(product.category);
    setEditBarcode(product.barcode || '');
    setEditImageUrl(product.imageUrl || '');
  };

  const saveEdit = (id: string) => {
    if (!editName || !editPrice || !editStock || !editCategory) return;
    updateProduct({
      id,
      name: editName,
      price: Number(editPrice),
      costPrice: editCostPrice.trim() ? Number(editCostPrice) : undefined,
      stock: Number(editStock),
      minStock: editMinStock.trim() ? Number(editMinStock) : undefined,
      category: editCategory,
      barcode: editBarcode.trim() ? editBarcode : undefined,
      imageUrl: editImageUrl.trim() ? editImageUrl : undefined
    });
    setEditingProductId(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Produtos e Estoque</h1>
          <p className="text-neutral-400">Faça a gestão dos produtos da sua empresa</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsManagingCategories(true)}
            className="flex items-center px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium rounded-lg hover:bg-neutral-800 transition"
          >
            <FolderEdit className="mr-2 h-5 w-5" />
            Categorias
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-500 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Plus className="mr-2 h-5 w-5" />
            {isAdding ? 'Cancelar' : 'Novo Produto'}
          </button>
        </div>
      </div>

      {isManagingCategories && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900">Gerenciar Categorias</h2>
              <button onClick={() => setIsManagingCategories(false)} className="text-neutral-500 hover:text-neutral-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 border-b border-neutral-200">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (newCategoryName.trim()) {
                  addCategory({ name: newCategoryName.trim() });
                  setNewCategoryName('');
                }
              }} className="flex gap-2">
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nova categoria..."
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" 
                  required
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                  Adicionar
                </button>
              </form>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {categories.length === 0 ? (
                <p className="text-center text-neutral-500 py-4">Nenhuma categoria cadastrada</p>
              ) : (
                <ul className="space-y-2">
                  {categories.map(cat => (
                    <li key={cat.id} className="flex flex-row items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      {editingCategoryId === cat.id ? (
                        <div className="flex flex-1 items-center gap-2 mr-2">
                          <input 
                            type="text" 
                            value={editCategoryName} 
                            onChange={(e) => setEditCategoryName(e.target.value)} 
                            className="flex-1 px-2 py-1 border border-neutral-300 rounded focus:ring-2 focus:ring-blue-600 outline-none" 
                            autoFocus
                          />
                          <button 
                            onClick={() => { 
                              if (editCategoryName.trim()) { 
                                updateCategory({id: cat.id, name: editCategoryName.trim()}); 
                                setEditingCategoryId(null); 
                              } 
                            }} 
                            className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => setEditingCategoryId(null)} 
                            className="text-neutral-400 hover:text-neutral-600 p-1 rounded hover:bg-neutral-100"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium text-neutral-700">{cat.name}</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => { setEditingCategoryId(cat.id); setEditCategoryName(cat.name); }} 
                              className="text-neutral-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50" 
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => deleteCategory(cat.id)}
                              className="text-neutral-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 rounded-b-xl flex justify-end">
              <button onClick={() => setIsManagingCategories(false)} className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-800">
          <h2 className="text-lg font-bold text-white mb-4">Adicionar Novo Produto</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Nome</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none placeholder-neutral-600" placeholder="Ex: Arroz 1kg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Código de Barras</label>
              <input type="text" value={barcode} onChange={e => setBarcode(e.target.value)} className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none placeholder-neutral-600" placeholder="Opcional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Preço (MZN)</label>
              <input type="number" required min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none placeholder-neutral-600" placeholder="Ex: 50.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Custo (MZN) Opcional</label>
              <input type="number" min="0" step="0.01" value={costPrice} onChange={e => setCostPrice(e.target.value)} className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none placeholder-neutral-600" placeholder="Ex: 30.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">URL da Imagem (Opcional)</label>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none placeholder-neutral-600" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Estoque Inicial</label>
              <input type="number" required min="0" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none placeholder-neutral-600" placeholder="Ex: 100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Estoque Mínimo</label>
              <input type="number" min="0" value={minStock} onChange={e => setMinStock(e.target.value)} className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none placeholder-neutral-600" placeholder="Ex: 10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Categoria</label>
              <select 
                required 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">Selecione...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-6 flex justify-end mt-2">
              <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-500 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                Salvar Produto
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm placeholder-neutral-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-950/50 text-neutral-400 font-medium">
              <tr>
                <th className="px-6 py-3">Produto</th>
                <th className="px-6 py-3">Cód. Barras</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Preço / Custo</th>
                <th className="px-6 py-3">Estoque</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isLowStock = product.minStock !== undefined ? product.stock <= product.minStock : product.stock < 10;
                  return (
                  <tr key={product.id} className={`transition-colors ${isLowStock ? 'bg-red-950/20 hover:bg-red-900/30' : 'hover:bg-neutral-800/50'}`}>
                    {editingProductId === product.id ? (
                      <>
                        <td className="px-6 py-4 flex flex-col gap-2">
                          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 text-white rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Nome" />
                          <input type="text" value={editImageUrl} onChange={e => setEditImageUrl(e.target.value)} className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 text-white rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Reg. Imagem URL" />
                        </td>
                        <td className="px-6 py-4">
                          <input type="text" value={editBarcode} onChange={e => setEditBarcode(e.target.value)} placeholder="-" className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 text-white rounded focus:ring-2 focus:ring-emerald-500 outline-none" />
                        </td>
                        <td className="px-6 py-4">
                          <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full px-2 py-1 bg-neutral-950 border border-neutral-800 text-white rounded focus:ring-2 focus:ring-emerald-500 outline-none">
                            <option value="">Selecione...</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                        </td>
                        <td className="px-6 py-4 flex flex-col gap-2">
                          <input type="number" min="0" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-24 px-2 py-1 bg-neutral-950 border border-neutral-800 text-white rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Preço" />
                          <input type="number" min="0" step="0.01" value={editCostPrice} onChange={e => setEditCostPrice(e.target.value)} className="w-24 px-2 py-1 bg-neutral-950 border border-neutral-800 text-white rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Custo" />
                        </td>
                        <td className="px-6 py-4 flex flex-col gap-2">
                          <input type="number" min="0" value={editStock} onChange={e => setEditStock(e.target.value)} className="w-20 px-2 py-1 bg-neutral-950 border border-neutral-800 text-white rounded focus:ring-2 focus:ring-emerald-500 outline-none" title="Estoque Atual" placeholder="Qtd" />
                          <input type="number" min="0" value={editMinStock} onChange={e => setEditMinStock(e.target.value)} className="w-20 px-2 py-1 bg-neutral-950 border border-neutral-800 text-white rounded focus:ring-2 focus:ring-emerald-500 outline-none" title="Estoque Mínimo" placeholder="Mín" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => saveEdit(product.id)} className="text-emerald-500 hover:text-emerald-400 mr-3 p-1 rounded hover:bg-emerald-500/10">
                            <Check className="h-5 w-5" />
                          </button>
                          <button onClick={() => setEditingProductId(null)} className="text-neutral-500 hover:text-white p-1 rounded hover:bg-neutral-800">
                            <X className="h-5 w-5" />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
<td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-md object-cover border border-neutral-800" />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-neutral-950 flex items-center justify-center border border-neutral-800">
                                <Package className="h-5 w-5 text-neutral-600" />
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{product.name}</span>
                              {isLowStock && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 uppercase tracking-wider shrink-0" title="Estoque abaixo do recomendado">
                                  <AlertTriangle className="h-3 w-3" />
                                  Baixo
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-400">{product.barcode || '-'}</td>
                        <td className="px-6 py-4 text-neutral-400">{product.category}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{formatCurrency(product.price)}</div>
                          {product.costPrice !== undefined && (
                            <div className="text-xs text-neutral-400 mt-1">Custo: {formatCurrency(product.costPrice)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              isLowStock ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {product.stock} un.
                            </span>
                            {product.minStock !== undefined && (
                              <span className="text-[10px] text-neutral-500">
                                Min: {product.minStock} un.
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => startEditing(product)} className="text-neutral-500 hover:text-emerald-400 mr-3">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => deleteProduct(product.id)} className="text-neutral-500 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
