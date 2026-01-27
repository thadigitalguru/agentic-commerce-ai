import { AbandonedCart } from '../types';
import { generateRecoveryNudge } from './geminiService';

// This is a mock implementation using localStorage.
// In a real application, this would be handled by a backend service.

const ABANDONED_CARTS_KEY = 'abandoned_carts';

const getCarts = (): AbandonedCart[] => {
  try {
    const carts = localStorage.getItem(ABANDONED_CARTS_KEY);
    return carts ? JSON.parse(carts) : [
        // Pre-populate with some data for demonstration
        { id: 1, customerName: "Otieno J.", total: 4500, lastActive: new Date(Date.now() - 10 * 60 * 1000).toISOString(), items: [{ productId: 1, name: "Luxury Red Sneakers", price: 4500, quantity: 1 }], recoveryStatus: 'new' },
        { id: 2, customerName: "Sarah M.", total: 3200, lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(), items: [{ productId: 2, name: "Smart Watch", price: 3200, quantity: 1 }], recoveryStatus: 'sent' },
    ];
  } catch (error) {
    console.error("Failed to parse abandoned carts from localStorage", error);
    return [];
  }
};

const saveCarts = (carts: AbandonedCart[]) => {
  localStorage.setItem(ABANDONED_CARTS_KEY, JSON.stringify(carts));
};

const checkAndGenerateNudges = async (): Promise<AbandonedCart[]> => {
  const carts = getCarts();
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const updatedCarts = await Promise.all(carts.map(async (cart) => {
    if (cart.recoveryStatus === 'new' && new Date(cart.lastActive) < fiveMinutesAgo) {
      const nudge = await generateRecoveryNudge(cart);
      return { ...cart, recoveryStatus: 'generated', recoveryMessage: nudge };
    }
    return cart;
  }));

  saveCarts(updatedCarts);
  return updatedCarts;
};

const updateCartStatus = (cartId: number, status: 'sent' | 'recovered') => {
    const carts = getCarts();
    const updatedCarts = carts.map(cart => 
        cart.id === cartId ? { ...cart, recoveryStatus: status } : cart
    );
    saveCarts(updatedCarts);
};


export const cartService = {
  getCarts,
  checkAndGenerateNudges,
  updateCartStatus
};
