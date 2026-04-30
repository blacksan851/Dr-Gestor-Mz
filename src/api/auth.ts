import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

interface User {
    id: string;
    email: string;
    name?: string;
    password: string;
}

export const createUser = async (email: string, password: string, name?: string) => {
    try {
          const hashedPassword = await bcrypt.hash(password, 10);
          const result = await query(
                  'INSERT INTO users (email, password, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, name',
                  [email, hashedPassword, name || '']
                );
          return { success: true, user: result.rows[0] };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};

export const authenticateUser = async (email: string, password: string) => {
    try {
          const result = await query('SELECT * FROM users WHERE email = $1', [email]);
          if (result.rows.length === 0) {
                  return { success: false, error: 'User not found' };
          }

      const user = result.rows[0];
          const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
              return { success: false, error: 'Invalid password' };
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
              expiresIn: JWT_EXPIRES_IN,
      });

      return { success: true, user, token };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};

export const verifyToken = (token: string) => {
    try {
          const decoded = jwt.verify(token, JWT_SECRET);
          return { valid: true, decoded };
    } catch (error: any) {
          return { valid: false, error: error.message };
    }
};

export const getCurrentUser = async (userId: string) => {
    try {
          const result = await query('SELECT id, email, name, created_at FROM users WHERE id = $1', [userId]);
          if (result.rows.length === 0) {
                  return { success: false, error: 'User not found' };
          }
          return { success: true, user: result.rows[0] };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};
