import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, Menu, Wallet, Settings, Shield, Moon, Sun, Download } from 'lucide-react';
import { useStore } from '../lib/store';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

export default function AppLayout() {
  const location = useLocation();
  const { user, logout, theme, toggleTheme } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleInstall = () => {
    alert('Para instalar o app, clique em "Adicionar à Tela Inicial" no seu navegador (Mobile) ou clique no ícone de instalação na barra de endereços (PC).');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'PDV / Vendas', path: '/sales', icon: ShoppingCart },
    { name: 'Produtos', path: '/products', icon: Package },
    { name: 'Clientes & Fiados', path: '/customers', icon: Users },
    { name: 'Histórico & Recibos', path: '/history', icon: Wallet },
    { name: 'Equipa & Acessos', path: '/staff', icon: Shield },
    { name: 'Configurações', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-neutral-900 border-r border-neutral-800">
        <div className="h-16 flex items-center px-6 border-b border-neutral-800">
          <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <span className="text-neutral-950 font-black text-lg">G</span>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Gestor MZ</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  location.pathname === item.path 
                    ? "bg-emerald-500/10 text-emerald-400" 
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-5 w-5",
                  location.pathname === item.path ? "text-emerald-400" : "text-neutral-500"
                )} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center mb-4">
            <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-neutral-500">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-500 rounded-lg hover:bg-red-500/10 transition-colors mb-2"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair do sistema
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex justify-center items-center py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800"
              title="Mudar Tema"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={handleInstall}
              className="flex-[2] flex justify-center items-center gap-2 py-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors border border-emerald-500/20"
              title="Baixar Aplicativo"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Baixar App</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex h-16 items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-2 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <span className="text-neutral-950 font-black">G</span>
            </div>
            <span className="font-bold text-white">Gestor MZ</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors border border-emerald-500/20 hidden sm:flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Instalar</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 text-neutral-400 hover:text-white rounded-lg"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-400 hover:text-white focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-neutral-900 border-l border-neutral-800 flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-neutral-800 flex justify-end">
                <button onClick={() => setMobileMenuOpen(false)} className="text-neutral-400">Voltar</button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-3 text-base font-medium rounded-lg",
                      location.pathname === item.path ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-400"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-neutral-800 space-y-2">
                <button
                  onClick={handleInstall}
                  className="flex items-center w-full px-3 py-3 text-emerald-400 font-medium rounded-lg hover:bg-emerald-500/10 border border-emerald-500/20"
                >
                  <Download className="mr-3 h-5 w-5" />
                  Baixar / Instalar App
                </button>
                <button onClick={logout} className="flex items-center w-full px-3 py-3 text-red-500 font-medium rounded-lg hover:bg-red-500/10">
                  <LogOut className="mr-3 h-5 w-5" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto bg-neutral-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
