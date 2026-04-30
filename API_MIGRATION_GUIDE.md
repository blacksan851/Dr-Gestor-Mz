# Guia de Migração: Supabase → API Routes Customizadas

Este documento mostra como migrar o código React de Supabase para as novas API routes baseadas em banco de dados real.

## 1. Substituir Imports

### ANTES (Supabase)
```typescript
import { supabase, auth } from '@/lib/supabaseClient';
```

### DEPOIS (API Routes)
```typescript
// Não precisa mais de imports Supabase
// Use fetch nativo do navegador
```

## 2. Autenticação

### ANTES (Supabase)
```typescript
const { data, error } = await auth.signUp(email, password);
const { data, error } = await auth.signIn(email, password);
```

### DEPOIS (API Routes)
```typescript
// Sign Up
const response = await fetch('/api/auth/signup', {
  method: 'POST',
    headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
      });
      const { success, user, token } = await response.json();
      if (token) localStorage.setItem('authToken', token);

      // Sign In
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
          headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
            });
            const { success, user, token } = await response.json();
            if (token) localStorage.setItem('authToken', token);
            ```

            ## 3. Obter Dados (Produtos, Clientes, Vendas)

            ### ANTES (Supabase)
            ```typescript
            const { data, error } = await supabase
              .from('products')
                .select('*');
                ```

                ### DEPOIS (API Routes)
                ```typescript
                const response = await fetch('/api/products', {
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                  });
                  const { data } = await response.json();
                  ```

                  ## 4. Criar Dados

                  ### ANTES (Supabase)
                  ```typescript
                  const { data, error } = await supabase
                    .from('products')
                      .insert([{ name, barcode, price, stock }]);
                      ```

                      ### DEPOIS (API Routes)
                      ```typescript
                      const response = await fetch('/api/products', {
                        method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                                    },
                                      body: JSON.stringify({ name, barcode, category, price, stock })
                                      });
                                      const { data } = await response.json();
                                      ```

                                      ## 5. Atualizar Contexto de Autenticação

                                      Substituir o `AuthContext` para usar tokens JWT em localStorage:

                                      ```typescript
                                      interface AuthContextType {
                                        user: any | null;
                                          token: string | null;
                                            signIn: (email: string, password: string) => Promise<void>;
                                              signUp: (email: string, password: string, name: string) => Promise<void>;
                                                signOut: () => void;
                                                  loading: boolean;
                                                  }

                                                  const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

                                                  export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
                                                    const [user, setUser] = React.useState(null);
                                                      const [token, setToken] = React.useState(localStorage.getItem('authToken'));
                                                        const [loading, setLoading] = React.useState(false);

                                                          const signIn = async (email: string, password: string) => {
                                                              setLoading(true);
                                                                  const response = await fetch('/api/auth/signin', {
                                                                        method: 'POST',
                                                                              headers: { 'Content-Type': 'application/json' },
                                                                                    body: JSON.stringify({ email, password })
                                                                                        });
                                                                                            const { success, user: userData, token: newToken } = await response.json();
                                                                                                if (success) {
                                                                                                      setUser(userData);
                                                                                                            setToken(newToken);
                                                                                                                  localStorage.setItem('authToken', newToken);
                                                                                                                      }
                                                                                                                          setLoading(false);
                                                                                                                            };
                                                                                                                            
                                                                                                                              const signOut = () => {
                                                                                                                                  setUser(null);
                                                                                                                                      setToken(null);
                                                                                                                                          localStorage.removeItem('authToken');
                                                                                                                                            };
                                                                                                                                            
                                                                                                                                              return (
                                                                                                                                                  <AuthContext.Provider value={{ user, token, signIn, signUp, signOut, loading }}>
                                                                                                                                                        {children}
                                                                                                                                                            </AuthContext.Provider>
                                                                                                                                                              );
                                                                                                                                                              };
                                                                                                                                                              ```
                                                                                                                                                              
                                                                                                                                                              ## 6. Próximos Passos
                                                                                                                                                              
                                                                                                                                                              1. **Criar Express Routes** (arquivo `src/server.ts`):
                                                                                                                                                                 - `/api/auth/signin`
                                                                                                                                                                    - `/api/auth/signup`
                                                                                                                                                                       - `/api/products`
                                                                                                                                                                          - `/api/customers`
                                                                                                                                                                             - `/api/sales`
                                                                                                                                                                                - `/api/company`
                                                                                                                                                                                
                                                                                                                                                                                2. **Adicionar Middleware de Autenticação**:
                                                                                                                                                                                   - Validar JWT em todas as rotas protegidas
                                                                                                                                                                                      - Retornar 401 se token inválido
                                                                                                                                                                                      
                                                                                                                                                                                      3. **Testar Localmente**:
                                                                                                                                                                                         ```bash
                                                                                                                                                                                            npm run dev
                                                                                                                                                                                               ```
                                                                                                                                                                                               
                                                                                                                                                                                               4. **Deploy no Vercel**:
                                                                                                                                                                                                  - Adicione variáveis de ambiente no dashboard Vercel
                                                                                                                                                                                                     - Faça commit e push para disparar novo build
                                                                                                                                                                                                     
                                                                                                                                                                                                     ## 7. Variáveis de Ambiente (Vercel)
                                                                                                                                                                                                     
                                                                                                                                                                                                     Adicionar no Project Settings → Environment Variables:
                                                                                                                                                                                                     
                                                                                                                                                                                                     ```
                                                                                                                                                                                                     DB_HOST=your-db-host
                                                                                                                                                                                                     DB_PORT=5432
                                                                                                                                                                                                     DB_NAME=dr_gestor_mz
                                                                                                                                                                                                     DB_USER=postgres
                                                                                                                                                                                                     DB_PASSWORD=your-secure-password
                                                                                                                                                                                                     JWT_SECRET=your-jwt-secret-key
                                                                                                                                                                                                     JWT_EXPIRES_IN=7d
                                                                                                                                                                                                     NODE_ENV=production
                                                                                                                                                                                                     ```
