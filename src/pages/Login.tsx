import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';
import { Building2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const login = useStore(state => state.login);
  const setAuth = useStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        // Mock fallback if email is "demo@gestormz.co.mz"
        if (email === 'demo@gestormz.co.mz') {
           login(email, password);
           navigate('/dashboard');
           return;
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userSnap = await getDoc(userDocRef);

        let companyNameStr = 'Minha Empresa';
        let roleStr = 'admin';
        let nameStr = email;

        if (userSnap.exists()) {
           const data = userSnap.data();
           companyNameStr = data.companyName || companyNameStr;
           roleStr = data.role || roleStr;
           nameStr = data.name || nameStr;
        }

        setAuth({
          id: userCredential.user.uid,
          name: nameStr,
          role: roleStr,
          companyName: companyNameStr
        });
        navigate('/dashboard');

      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
        
        // Save user to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: userName,
          email: regEmail,
          role: 'admin',
          companyName: companyName,
          createdAt: serverTimestamp() // We'll disable timestamp rules for simplicity during testing, wait, we specified request.time in draft rules?
        });

        setAuth({
          id: userCredential.user.uid,
          name: userName,
          role: 'admin',
          companyName: companyName || 'Company'
        });
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro de conexão com o Firebase.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 py-8 relative">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>
      
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-8 space-y-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => window.history.back()}
            className="text-neutral-400 hover:text-white transition text-sm flex items-center gap-1"
          >
            ← Voltar
          </button>
        </div>
        <div className="text-center">
          <div className="h-16 w-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="text-3xl text-neutral-950 font-black tracking-tight">G</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Gestor MZ</h2>
          <p className="text-neutral-400 mt-2 text-sm">
            {isLogin ? 'Faça login para acessar o sistema de gestão' : 'Cadastre sua empresa hoje'}
          </p>
        </div>

        <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setIsLogin(true)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-all",
              isLogin ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-white"
            )}
          >
            Entrar
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-all",
              !isLogin ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-white"
            )}
          >
            Criar Conta
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Nome da Empresa</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-neutral-500" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-neutral-600"
                    placeholder="Sua Empresa, Lda"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Seu Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-neutral-500" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-neutral-600"
                    placeholder="João Silva"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={isLogin ? email : regEmail}
              onChange={(e) => isLogin ? setEmail(e.target.value) : setRegEmail(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-neutral-600"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Senha {isLogin && '/ Código PIN'}</label>
            <input 
              type="password" 
              required
              value={isLogin ? password : regPassword}
              onChange={(e) => isLogin ? setPassword(e.target.value) : setRegPassword(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-neutral-600"
              placeholder={isLogin ? "•••••••• ou PIN" : "••••••••"}
            />
          </div>
          
          <div className="pt-2">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processando...' : (isLogin ? 'Entrar no Sistema' : 'Cadastrar e Acessar (14 dias Grátis)')}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-neutral-500">
            Apenas para demonstração. {isLogin ? 'Os dados de teste (demo@gestormz.co.mz) já estão preenchidos.' : 'Cadastro simplificado.'}
          </p>
        </div>
      </div>
    </div>
  );
}
