
import { ApiClient } from './api';
import { Product } from '../types';

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Luxury Red Sneakers", description: "Breathable mesh with premium leather accents", price: 4500, currency: "KES", imageUrl: "https://picsum.photos/seed/shoes/400/400", isActive: true },
  { id: 2, name: "Smart Bluetooth Watch", description: "Water-resistant with heart rate monitoring", price: 3200, currency: "KES", imageUrl: "https://picsum.photos/seed/watch/400/400", isActive: true },
  { id: 3, name: "Cotton Graphic Tee", description: "100% organic cotton, unisex fit", price: 1500, currency: "KES", imageUrl: "https://picsum.photos/seed/shirt/400/400", isActive: true },
  { id: 4, name: "Wireless Headphones", description: "Noise canceling with 20h battery life", price: 6800, currency: "KES", imageUrl: "https://picsum.photos/seed/audio/400/400", isActive: true },
];

export const productService = {
  async getAll(): Promise<Product[]> {
    const products = await ApiClient.get<Product[]>('api/products');
    if (!products || products.length === 0) {
      // Seed database if empty - Using a flag to prevent re-seeding if user deleted everything
      const hasSeeded = localStorage.getItem('has_seeded_products');
      if (!hasSeeded) {
        localStorage.setItem('products', JSON.stringify(INITIAL_PRODUCTS));
        localStorage.setItem('has_seeded_products', 'true');
        return INITIAL_PRODUCTS;
      }
      return [];
    }
    return products;
  },

  async add(product: Omit<Product, 'id'>): Promise<Product> {
    return ApiClient.post<Product>('api/products', product);
  },

  async delete(id: number): Promise<void> {
    const products = await this.getAll();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(filtered));
  }
};
