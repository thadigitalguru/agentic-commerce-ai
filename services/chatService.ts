
import { ApiClient } from './api';
import { ChatLog } from '../types';

export const chatService = {
  async getLogs(): Promise<ChatLog[]> {
    return ApiClient.get<ChatLog[]>('api/chat_logs');
  },

  async log(entry: Omit<ChatLog, 'id' | 'timestamp'>): Promise<void> {
    await ApiClient.post('api/chat_logs', {
      ...entry,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  },

  async clear(): Promise<void> {
    localStorage.setItem('chat_logs', JSON.stringify([]));
  }
};
