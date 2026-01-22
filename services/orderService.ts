
import { ApiClient } from './api';
import { Order, OrderStatus } from '../types';

export const orderService = {
  async getAll(): Promise<Order[]> {
    return ApiClient.get<Order[]>('api/orders');
  },

  async create(order: Omit<Order, 'id'>): Promise<Order> {
    return ApiClient.post<Order>('api/orders', order);
  },

  async updateStatus(orderId: number, status: OrderStatus): Promise<void> {
    const orders = await this.getAll();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      await ApiClient.put('api/orders', orderId, { ...order, status });
      
      // If fulfilled, we log a special event for the simulator to pick up
      if (status === OrderStatus.FULFILLED) {
        const events = JSON.parse(localStorage.getItem('system_events') || '[]');
        events.push({
          type: 'ORDER_FULFILLED',
          orderId,
          customerName: order.customerName,
          timestamp: Date.now()
        });
        localStorage.setItem('system_events', JSON.stringify(events));
      }
    }
  }
};
