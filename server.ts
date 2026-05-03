import express from 'express';
import { createServer as createViteServer } from 'vite';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Database Initialization - Creates tables if they don't exist
  async function initDatabase() {
    try {
      if (!process.env.POSTGRES_URL) {
        console.warn('POSTGRES_URL is not set. Database will not be initialized.');
        return;
      }
      
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          company_name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'owner',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      console.log('Database tables verified/created successfully.');
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  // Call the initialization
  initDatabase();

  // --- API Routes ---
  
  // Register Endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, companyName } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      if (!process.env.POSTGRES_URL) {
         return res.status(500).json({ error: 'Configuração do banco de dados (Vercel Postgres) não encontrada.' });
      }

      // Check if user already exists
      const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
      if (existingUser.rowCount > 0) {
        return res.status(409).json({ error: 'Email já está em uso' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert user
      const result = await sql`
        INSERT INTO users (name, email, password_hash, company_name)
        VALUES (${name}, ${email}, ${passwordHash}, ${companyName || ''})
        RETURNING id, name, email, company_name as "companyName", role;
      `;

      const user = result.rows[0];

      // Sign JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({ user, token });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  });

  // Login Endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      if (!process.env.POSTGRES_URL) {
         return res.status(500).json({ error: 'Configuração do banco de dados (Vercel Postgres) não encontrada.' });
      }

      // Find user
      const result = await sql`SELECT id, name, email, password_hash, company_name as "companyName", role FROM users WHERE email = ${email}`;
      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Mapeamento do usuário pra resposta (excluindo a senha)
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        role: user.role
      };

      // Sign JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      res.status(200).json({ user: userData, token });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Erro ao efetuar login' });
    }
  });

  // Health route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', usingDatabase: !!process.env.POSTGRES_URL });
  });

  // Vite Integration for React Frontend
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen to port if not in Vercel Serverless environment
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  
  return app;
}

const appPromise = startServer();
export default async function (req: any, res: any) {
  const app = await appPromise;
  app(req, res);
}
