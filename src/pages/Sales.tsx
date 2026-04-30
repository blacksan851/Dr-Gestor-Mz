import { useState } from 'react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, ShoppingCart, CheckCircle, Scan, Camera } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';

export default function Sales() {
  const { products, cart, addToCart, removeFromCart, checkout, clearCart, categories, sales } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory ? p.category === selectedCategory : true;
    return matchSearch && matchCat;
  });
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((a, b) => a + b.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    checkout(paymentMethod);
    
    // Pick the most recent sale from the store (it's un-updated in this render frame, so we use a small timeout or wait for next render)
    setTimeout(() => {
      const allSales = useStore.getState().sales;
      setLastSale(allSales[0]);
    }, 100);

    setIsCartOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col min-h-0 bg-neutral-950">
        <div className="p-4 border-b border-neutral-800 bg-neutral-900 shadow-sm z-10 shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 text-white rounded-xl focus:bg-neutral-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-neutral-600"
              />
            </div>
            <button 
              onClick={() => setIsScannerOpen(!isScannerOpen)}
              className={`p-3 rounded-xl border flex items-center justify-center transition-colors ${
                isScannerOpen 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
              title="Ler Código de Barras"
            >
              <Scan className="h-6 w-6" />
            </button>
          </div>
          
          {/* Categories Horizontal Scroll */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('')}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                selectedCategory === '' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              Todos
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  selectedCategory === c.name 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Video Scanner Area */}
        {isScannerOpen && (
          <div className="bg-black relative h-48 sm:h-64 flex-shrink-0 flex items-center justify-center border-b border-neutral-800 overflow-hidden">
             <div className="z-10 flex flex-col items-center p-4 text-center">
               <Camera className="w-8 h-8 text-neutral-500 mb-2" />
               <p className="text-sm text-neutral-400">Câmera indisponível no momento</p>
               <p className="text-xs text-neutral-500">Use para ler o código de barras (Video App)</p>
             </div>
             {/* Scanning line animation element */}
             <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-emerald-500 shadow-[0_0_12px_3px_rgba(16,185,129,0.6)] z-20 animate-pulse" />
             {/* Corner brackets */}
             <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-lg" />
             <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-lg" />
             <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-500/50 rounded-bl-lg" />
             <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-500/50 rounded-br-lg" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 pb-24 lg:pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className="flex flex-col p-4 bg-neutral-900 rounded-xl shadow-sm border border-neutral-800 hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/10 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="h-24 w-full rounded-lg mb-3 flex items-center justify-center overflow-hidden bg-neutral-950 border border-neutral-800">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-4xl text-neutral-800">📦</span>
                  )}
                </div>
                <h3 className="font-medium text-white line-clamp-2 text-sm leading-tight mb-1">{product.name}</h3>
                <div className="mt-auto flex items-center justify-between w-full">
                  <span className="font-bold text-emerald-400">{formatCurrency(product.price)}</span>
                  <span className="text-xs text-neutral-400 bg-neutral-800 px-2 py-1 rounded">Est: {product.stock}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Cart Trigger */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-neutral-900 border-t border-neutral-800 z-30 flex items-center justify-between">
        <div>
          <p className="text-neutral-400 text-sm">Total a cobrar</p>
          <p className="text-emerald-400 font-bold text-xl">{formatCurrency(cartTotal)}</p>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <ShoppingCart className="w-5 h-5" />
          Carrinho ({cartItemsCount})
        </button>
      </div>

      {/* Cart sidebar / Mobile bottom sheet */}
      {isCartOpen && (
        <div className="lg:hidden fixed inset-0 bg-neutral-950/80 z-40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      )}
      
      <div className={`fixed lg:relative inset-y-0 right-0 w-full md:w-[400px] lg:w-96 bg-neutral-900 border-l border-neutral-800 flex flex-col z-50 shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.5)] transition-transform duration-300 ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
          <h2 className="text-lg font-bold text-white">Carrinho ({cartItemsCount})</h2>
          <div className="flex gap-4">
            <button onClick={clearCart} className="text-sm font-medium text-red-600 hover:text-red-700">Limpar</button>
            <button onClick={() => setIsCartOpen(false)} className="lg:hidden text-neutral-400 font-bold">FECHAR</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 p-x bg-neutral-950/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500">
              <ShoppingCart className="h-12 w-12 mb-2 text-neutral-700" />
              <p>Adicione produtos para vender</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.map(item => (
                <li key={item.id} className="flex flex-col bg-neutral-900 p-3 rounded-xl border border-neutral-800 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm text-white pr-2">{item.name}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-neutral-500 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 bg-neutral-950 border border-neutral-800 rounded-lg p-1">
                      <button onClick={() => removeFromCart(item.id)} className="h-6 w-6 flex items-center justify-center text-neutral-400 hover:bg-neutral-800 rounded hover:text-white">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center text-white">{item.quantity}</span>
                      <button onClick={() => addToCart(item)} className="h-6 w-6 flex items-center justify-center text-neutral-400 hover:bg-neutral-800 rounded hover:text-white">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-bold text-white">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-neutral-800 bg-neutral-900">
          {/* Payment Method Selector */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Método de pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Dinheiro', icon: Banknote },
                { name: 'M-Pesa', icon: Smartphone },
                { name: 'e-Mola', icon: Smartphone },
                { name: 'Cartão', icon: CreditCard },
              ].map(method => (
                <button
                  key={method.name}
                  onClick={() => setPaymentMethod(method.name)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-sm font-medium transition-colors ${
                    paymentMethod === method.name 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  <method.icon className="h-5 w-5 mb-1 opacity-70" />
                  {method.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-neutral-400 font-medium">Total</span>
            <span className="text-2xl font-bold text-emerald-400">{formatCurrency(cartTotal)}</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
             className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:shadow-none"
          >
            <span>Finalizar Venda</span>
          </button>
        </div>
      </div>

      {lastSale && (
        <ReceiptModal sale={lastSale} onClose={() => setLastSale(null)} />
      )}
    </div>
  );
}
