import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ArrowRight, BarChart3, CheckCircle, Shield, Zap, ShoppingCart } from 'lucide-react';

const pieData = [
  { name: 'Mercearia', value: 400 },
  { name: 'Bebidas', value: 300 },
  { name: 'Padaria', value: 300 },
  { name: 'Higiene', value: 200 },
];
const COLORS = ['#10B981', '#34D399', '#059669', '#047857'];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="container mx-auto px-4 sm:px-6 py-6 flex sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 shrink-0 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/20">
            <span className="font-bold text-white text-lg">G</span>
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight hidden sm:block">Gestor MZ</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-emerald-600 font-medium hover:text-emerald-700 transition text-sm sm:text-base px-2 sm:px-0"
          >
            Acessar Conta
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 sm:px-5 sm:py-2 text-sm sm:text-base bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium transition-all shadow-lg shadow-emerald-500/30 whitespace-nowrap"
          >
            Teste Grátis
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center text-left gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-medium mb-6 sm:mb-8 leading-tight">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="inline-block">O número 1 em Gestão Escalonada em Moçambique</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 sm:mb-8 leading-tight text-gray-900">
            Faça sua empresa <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700">crescer.</span>
            <br />Nós cuidamos da gestão.
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Controle de estoque, frente de caixa (PDV), clientes, fiados e relatórios em tempo real. Tudo na nuvem. Simples, rápido e no seu bolso.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-emerald-500/40 flex items-center justify-center gap-2"
            >
              Começar Teste Grátis <ArrowRight />
            </button>
            <p className="text-gray-500 text-sm mt-2 sm:mt-0 sm:ml-4">
              Por apenas <span className="text-emerald-600 font-bold">1000 MT / Ano</span>
            </p>
          </div>
        </motion.div>

        {/* Animated Feature Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-xl shadow-2xl p-8 relative overflow-hidden"
        >
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">Acompanhe seu lucro com precisão.</h3>
              <ul className="space-y-4">
                {[
                  'Gráficos interativos de lucros e categorias',
                  'Frente de Caixa (PDV) ultarrápido',
                  'Controle Múltiplo de Vendedores',
                  'Gestão de Fiados (Clientes a Crédito)',
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.4 }}
                    className="flex items-center gap-3 text-gray-600"
                  >
                    <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            {/* Visual Chart Graphic */}
            <div className="h-64 relative bg-gray-50 rounded-xl border border-gray-200 p-4 shadow-inner">
              <div className="absolute top-4 left-4 font-medium text-gray-500 text-sm">Vendas por Categoria</div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    itemStyle={{ color: '#111827' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Value props */}
      <section className="bg-white border-t border-gray-100 pt-20 pb-24">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Zap size={24} />
            </div>
            <h4 className="text-xl font-bold text-gray-900">100% Nas Nuvens</h4>
            <p className="text-gray-500">Acesse sua loja do celular ou computador. Seus dados nunca se perdem e estão sempre seguros.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Shield size={24} />
            </div>
            <h4 className="text-xl font-bold text-gray-900">Gestão de Equipa</h4>
            <p className="text-gray-500">Crie perfis com limites. O vendedor apenas vende, o gerente vê lucros e estoque.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <h4 className="text-xl font-bold text-gray-900">Fiados e Dívidas</h4>
            <p className="text-gray-500">Tenha uma aba especial para "Contas a Receber", comum no comércio Moçambicano.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
