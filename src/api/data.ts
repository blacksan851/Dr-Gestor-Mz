import { query } from './database';

// ==================== CATEGORIES ====================
export const getCategories = async () => {
    try {
          const result = await query('SELECT * FROM categories ORDER BY name');
          return { success: true, data: result.rows };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};

export const createCategory = async (name: string) => {
    try {
          const result = await query(
                  'INSERT INTO categories (name, created_at) VALUES ($1, NOW()) RETURNING *',
                  [name]
                );
          return { success: true, data: result.rows[0] };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};

// ==================== PRODUCTS ====================
export const getProducts = async () => {
    try {
          const result = await query('SELECT * FROM products ORDER BY name');
          return { success: true, data: result.rows };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};

export const createProduct = async (name: string, barcode: string, category: string, price: number, stock: number) => {
    try {
          const result = await query(
                  'INSERT INTO products (name, barcode, category, price, stock, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
                  [name, barcode, category, price, stock]
                );
          return { success: true, data: result.rows[0] };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};

export const updateProduct = async (id: string, updates: any) => {
    try {
          const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
          const values = [id, ...Object.values(updates)];
          const result = await query(
                  `UPDATE products SET ${fields} WHERE id = $1 RETURNING *`,
                  values
                );
          return { success: true, data: result.rows[0] };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};

// ==================== CUSTOMERS ====================
export const getCustomers = async () => {
    try {
          const result = await query('SELECT * FROM customers ORDER BY name');
          return { success: true, data: result.rows };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};

export const createCustomer = async (name: string, phone?: string, nuit?: string) => {
    try {
          const result = await query(
                  'INSERT INTO customers (name, phone, nuit, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
                  [name, phone || null, nuit || null]
                );
          return { success: true, data: result.rows[0] };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};

// ==================== SALES ====================
export const getSales = async () => {
    try {
          const result = await query('SELECT * FROM sales ORDER BY created_at DESC LIMIT 100');
          return { success: true, data: result.rows };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};

export const createSale = async (total: number, payment_method: string, customer_id?: string) => {
    try {
          const result = await query(
                  'INSERT INTO sales (total, payment_method, customer_id, status, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
                  [total, payment_method, customer_id || null, 'completed']
                );
          return { success: true, data: result.rows[0] };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};

// ==================== SALE ITEMS ====================
export const addSaleItem = async (sale_id: string, product_id: string, quantity: number, price: number) => {
    try {
          const result = await query(
                  'INSERT INTO sale_items (sale_id, product_id, quantity, price, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
                  [sale_id, product_id, quantity, price]
                );
          return { success: true, data: result.rows[0] };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};

// ==================== COMPANY SETTINGS ====================
export const getCompanySettings = async () => {
    try {
          const result = await query('SELECT * FROM company_settings LIMIT 1');
          return { success: true, data: result.rows[0] || null };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};

export const updateCompanySettings = async (settings: any) => {
    try {
          const result = await query(
                  'INSERT INTO company_settings (name, nuit, address, logo_url, updated_at) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (id) DO UPDATE SET name=$1, nuit=$2, address=$3, logo_url=$4, updated_at=NOW() RETURNING *',
                  [settings.name, settings.nuit, settings.address, settings.logo_url]
                );
          return { success: true, data: result.rows[0] };
    } catch (error: any) {
          return { success: false, error: error.message };
    }
};
