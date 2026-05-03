import express from 'express';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const app = express();
app.use(express.json());

// Database Initialization - Creates tables if they don't exist
async function initDatabase() {
  try {
    if (!process.env.POSTGRES_URL) {
      console.warn('POSTGRES_URL is not set. Database will not be initialized.');
      return;
    }
    
    // 1. Users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'owner',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        display_name VARCHAR(255),
        email VARCHAR(255),
        phone_number VARCHAR(50)
      );
    `;

    // 2. Products
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        category VARCHAR(255),
        barcode VARCHAR(255)
      );
    `;

    // 3. Customers
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        phone_number VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        credit_limit DECIMAL(10, 2),
        current_credit_balance DECIMAL(10, 2) DEFAULT 0
      );
    `;

    // 4. Sales
    await sql`
      CREATE TABLE IF NOT EXISTS sales (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        sale_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_by_id UUID REFERENCES users(id),
        customer_id UUID REFERENCES customers(id)
      );
    `;

    // 5. Sale Items
    await sql`
      CREATE TABLE IF NOT EXISTS sale_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        discount DECIMAL(10, 2) DEFAULT 0
      );
    `;

    // 6. Credit Transactions
    await sql`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        amount DECIMAL(10, 2) NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
        sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
        description TEXT
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
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email} OR username = ${email}`;
    if ((existingUser.rowCount ?? 0) > 0) {
      return res.status(409).json({ error: 'Email já está em uso' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await sql`
      INSERT INTO users (username, display_name, email, password_hash, role)
      VALUES (${email}, ${name}, ${email}, ${passwordHash}, 'owner')
      RETURNING id, display_name as name, email, role;
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
    const result = await sql`SELECT id, display_name as name, username, email, password_hash, role FROM users WHERE email = ${email} OR username = ${email}`;
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

export default app;
