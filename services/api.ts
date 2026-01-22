
/**
 * Simulated Backend API Client
 * In a production app, BASE_URL would point to your FastAPI/Python backend.
 */

const API_DELAY = 600; // Simulate network latency

export class ApiClient {
  private static getStorage<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private static setStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static async get<T>(endpoint: string): Promise<T> {
    await new Promise(r => setTimeout(r, API_DELAY));
    const key = endpoint.split('/').pop() || '';
    return this.getStorage<T>(key) as unknown as T;
  }

  static async post<T>(endpoint: string, body: any): Promise<T> {
    await new Promise(r => setTimeout(r, API_DELAY));
    const key = endpoint.split('/').pop() || '';
    const current = this.getStorage<any>(key);
    const newItem = { ...body, id: Date.now() };
    this.setStorage(key, [...current, newItem]);
    return newItem as T;
  }

  static async put<T>(endpoint: string, id: number, body: any): Promise<T> {
    await new Promise(r => setTimeout(r, API_DELAY));
    const key = endpoint.split('/').pop() || '';
    const current = this.getStorage<any>(key);
    const updated = current.map((item: any) => item.id === id ? { ...item, ...body } : item);
    this.setStorage(key, updated);
    return body as T;
  }
}
