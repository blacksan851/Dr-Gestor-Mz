import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gerente' | 'vendedor';
  status: 'ativo' | 'inativo';
  accessCode: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock?: number;
  category: string;
  barcode?: string;
  image?: string;
  imageUrl?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  nuit: string;
  status: 'ativo' | 'inativo';
  balance: number; // Balance for 'Fiados'
};

export type CartItem = Product & { quantity: number };

interface AppState {
  user: { id: string; name: string; email?: string; role: 'admin' | 'gerente' | 'vendedor'; companyName: string } | null;
  login: (identifier: string, password?: string, companyName?: string) => void;
  setAuth: (user: any) => void;
  logout: () => void;
  
  staff: StaffUser[];
  addStaff: (user: Omit<StaffUser, 'id'>) => void;
  updateStaff: (user: StaffUser) => void;
  deleteStaff: (id: string) => void;

  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;

  settings: {
    companyName: string;
    nuit: string;
    address: string;
    phone: string;
    email: string;
    logoUrl: string;
    receiptMessage: string;
  };
  updateSettings: (newSettings: Partial<AppState['settings']>) => void;

  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: (paymentMethod: string, customerId?: string) => void;
  sales: any[];
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
  setAuth: (user) => set((state) => {
    if (user) {
      return { 
        user,
        settings: {
          ...state.settings,
          companyName: user.companyName || state.settings.companyName,
          email: user.email || state.settings.email
        }
      };
    }
    return { user: null };
  }),
  login: (identifier, password, companyName) => set((state) => {
    // Check if it matches a staff member (Email + Access Code OR Just Access Code for fast login)
    const seller = state.staff.find(s => 
      ((s.email === identifier && s.accessCode === password) || s.accessCode === password) 
      && s.status === 'ativo'
    );
    
    if (seller) {
      return { user: { id: seller.id, name: seller.name, role: seller.role, companyName: 'Minha Empresa Lda' } };
    }

    // Default admin / generic email fallback
    return { user: { id: '1', name: identifier.split('@')[0] || identifier, role: 'admin', companyName: companyName || 'Minha Empresa Lda' } };
  }),
  logout: () => set({ user: null }),
  
  staff: [],
  addStaff: (user) => set((state) => ({ 
    staff: [...state.staff, { ...user, id: Math.random().toString(36).substr(2, 9) }] 
  })),
  updateStaff: (user) => set((state) => ({
    staff: state.staff.map(s => s.id === user.id ? user : s)
  })),
  deleteStaff: (id) => set((state) => ({
    staff: state.staff.filter(s => s.id !== id)
  })),

  customers: [],
  addCustomer: (customer) => set((state) => ({ 
    customers: [...state.customers, { ...customer, id: Math.random().toString(36).substr(2, 9) }] 
  })),
  updateCustomer: (customer) => set((state) => ({
    customers: state.customers.map(c => c.id === customer.id ? customer : c)
  })),
  deleteCustomer: (id) => set((state) => ({
    customers: state.customers.filter(c => c.id !== id)
  })),

  settings: {
    companyName: 'Minha Empresa Lda',
    nuit: '',
    address: '',
    phone: '',
    email: '',
    logoUrl: '',
    receiptMessage: 'Obrigado pela sua preferência! Volte sempre.',
  },
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  products: [],
  addProduct: (product) => set((state) => ({ 
    products: [...state.products, { ...product, id: Math.random().toString(36).substr(2, 9) }] 
  })),
  updateProduct: (product) => set((state) => ({
    products: state.products.map(p => p.id === product.id ? product : p)
  })),
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id)
  })),

  categories: [],
  addCategory: (category) => set((state) => ({
    categories: [...state.categories, { ...category, id: Math.random().toString(36).substr(2, 9) }]
  })),
  updateCategory: (category) => set((state) => ({
    categories: state.categories.map(c => c.id === category.id ? category : c)
  })),
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter(c => c.id !== id)
  })),

  cart: [],
  addToCart: (product) => set((state) => {
    const existing = state.cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return state; // Block adding more than stock
      return {
        cart: state.cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== productId)
  })),
  clearCart: () => set({ cart: [] }),
  
  sales: [],
  checkout: (paymentMethod, customerId) => set((state) => {
    if (state.cart.length === 0) return state;
    const total = state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalCost = state.cart.reduce((acc, item) => acc + (item.costPrice || 0) * item.quantity, 0);
    
    let customerName;
    let updatedCustomers = state.customers;

    if (paymentMethod === 'Fiado' && customerId) {
      const customer = state.customers.find(c => c.id === customerId);
      if (customer) {
        customerName = customer.name;
        updatedCustomers = state.customers.map(c => 
          c.id === customerId ? { ...c, balance: c.balance + total } : c
        );
      }
    }

    const newSale = {
      id: Math.random().toString(36).substr(2, 9),
      total,
      totalCost,
      paymentMethod,
      customerId,
      customerName,
      date: new Date().toISOString(),
      items: state.cart,
      sellerId: state.user?.id || 'unknown',
      sellerName: state.user?.name || 'Desconhecido'
    };
    
    // Decrease stock
    const updatedProducts = state.products.map(p => {
      const cartItem = state.cart.find(c => c.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.quantity } : p;
    });

    return { 
      cart: [], 
      sales: [newSale, ...state.sales],
      products: updatedProducts,
      customers: updatedCustomers
    };
  }),
  theme: 'dark',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    return { theme: newTheme };
  })
    }),
    {
      name: 'gestor-mz-storage',
      partialize: (state) => ({ 
        products: state.products,
        categories: state.categories,
        sales: state.sales,
        staff: state.staff,
        customers: state.customers,
        theme: state.theme,
        settings: state.settings,
        user: state.user
      }),
    }
  )
);
