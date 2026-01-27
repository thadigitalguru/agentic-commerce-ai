
import { Order, OrderStatus } from '../types';

const ORDERS_KEY = 'orders';

const getOrders = (): Order[] => {
  try {
    const orders = localStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
  } catch (error) {
    console.error("Failed to parse orders from localStorage", error);
    return [];
  }
};

const saveOrders = (orders: Order[]) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const orderService = {
  async getAll(): Promise<Order[]> {
    return getOrders();
  },

  async create(order: Omit<Order, 'id'>): Promise<Order> {
    const orders = getOrders();
    const newOrder: Order = { ...order, id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1 };
    saveOrders([...orders, newOrder]);
    return newOrder;
  },

  async updateStatus(orderId: number, status: OrderStatus): Promise<void> {
    const orders = getOrders();
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
    saveOrders(updatedOrders);
      
    // If fulfilled, we log a special event for the simulator to pick up
    if (status === OrderStatus.FULFILLED) {
      const events = JSON.parse(localStorage.getItem('system_events') || '[]');
      events.push({
        type: 'ORDER_FULFILLED',
        orderId,
        timestamp: Date.now()
      });
      localStorage.setItem('system_events', JSON.stringify(events));
    }
  },

  async mockWebhookPaymentConfirmation(orderId: number): Promise<void> {
    console.log(`Simulating webhook payment confirmation for order ${orderId}`);
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
      const updatedOrders = [...orders];
      updatedOrders[orderIndex] = { ...updatedOrders[orderIndex], status: OrderStatus.PAID };
      saveOrders(updatedOrders);

      // Log payment confirmation for simulator
      const events = JSON.parse(localStorage.getItem('system_events') || '[]');
      events.push({
        type: 'PAYMENT_CONFIRMED',
        orderId,
        timestamp: Date.now()
      });
      localStorage.setItem('system_events', JSON.stringify(events));
    }
  }
};
