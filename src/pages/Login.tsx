import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';
import { Building2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const login = useStore(state => state.login);
  const setAuth = useStore(state => state.setAuth);

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (pass.length === 0) return { label: '', color: 'bg-transparent' };
    if (score <= 2) return { label: 'Fraca', color: 'text-red-500', bar: 'bg-red-500 w-1/3' };
    if (score <= 4) return { label: 'Média', color: 'text-yellow-500', bar: 'bg-yellow-500 w-2/3' };
    return { label: 'Forte', color: 'text-emerald-500', bar: 'bg-emerald-500 w-full' };
  };

  const passStrength = checkPasswordStrength(regPassword);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('Um email com instruções de recuperação foi enviado para ' + email);
      setIsResetPassword(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao enviar email de recuperação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
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
          email: email,
          role: roleStr,
          companyName: companyNameStr
        });
        navigate('/dashboard');

      } else {
        if (regPassword !== regConfirmPassword) {
          setErrorMsg('As senhas não coincidem.');
          setIsLoading(false);
          return;
        }
        if (regPassword.length < 6) {
          setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
          setIsLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
        
        // Send email verification
        await sendEmailVerification(userCredential.user);

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
          email: regEmail,
          role: 'admin',
          companyName: companyName || 'Company'
        });
        
        setSuccessMsg('Conta criada com sucesso! Enviamos um link de confirmação para o seu email.');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 relative">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-emerald-500/20 blur-[120px] rounded-full mix-blend-multiply"></div>
      </div>
      
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-8 space-y-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-gray-900 transition text-sm flex items-center gap-1"
          >
            ← Voltar
          </button>
        </div>
        <div className="text-center">
          <div className="h-16 w-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
            <span className="text-3xl text-white font-black tracking-tight">G</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Gestor MZ</h2>
          <p className="text-gray-500 mt-2 text-sm">
            {isResetPassword ? 'Recupere sua senha' : (isLogin ? 'Faça login para acessar o sistema de gestão' : 'Cadastre sua empresa hoje')}
          </p>
        </div>

        {!isResetPassword && (
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                isLogin ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                !isLogin ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Criar Conta
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm p-3 rounded-lg text-center">
            {successMsg}
          </div>
        )}

        {isResetPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                placeholder="seu@email.com"
              />
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processando...' : 'Recuperar Senha'}
              </button>
              <button 
                type="button"
                onClick={() => setIsResetPassword(false)}
                className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Voltar ao Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                      placeholder="Sua Empresa, Lda"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                      placeholder="João Silva"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={isLogin ? email : regEmail}
                onChange={(e) => isLogin ? setEmail(e.target.value) : setRegEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha {isLogin && '/ Código PIN'}</label>
                {isLogin && (
                  <button 
                    type="button"
                    onClick={() => setIsResetPassword(true)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                required
                value={isLogin ? password : regPassword}
                onChange={(e) => isLogin ? setPassword(e.target.value) : setRegPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                placeholder={isLogin ? "•••••••• ou PIN" : "••••••••"}
              />
              
              {!isLogin && regPassword.length > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Força da senha:</span>
                    <span className={`text-xs font-bold ${passStrength.color}`}>{passStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${passStrength.bar}`}></div>
                  </div>
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                <input 
                  type="password" 
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
            )}
            
            <div className="pt-2">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processando...' : (isLogin ? 'Entrar no Sistema' : 'Cadastrar e Acessar')}
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            {isResetPassword ? 'Enviaremos as instruções pelo email.' : 'Gerencie seu negócio com segurança e eficiência.'}
          </p>
        </div>
      </div>
    </div>
  );
}
