
export enum OrderStatus {
  PENDING = 'pending_payment',
  PAID = 'paid',
  FAILED = 'failed',
  FULFILLED = 'fulfilled',
  ABANDONED = 'abandoned'
}

export type PersonaTemplate = 'curator' | 'hustler' | 'concierge' | 'friend';

export interface AgentConfig {
  name: string;
  template: PersonaTemplate;
  tone: 'professional' | 'friendly' | 'enthusiastic';
  customInstructions: string;
  knowledgeBase: string;
  takeoverActive: boolean;
  favoriteEmoji: string;
  includeSwahili: boolean;
}

export interface ChatLog {
  id: number;
  customerName: string;
  message: string;
  sender: 'user' | 'bot' | 'human';
  intent?: 'discovery' | 'pricing' | 'shipping' | 'checkout' | 'complaint' | 'other';
  reasoning?: string;
  urgency?: 'low' | 'medium' | 'high';
  sentiment?: 'positive' | 'neutral' | 'negative';
  timestamp: string;
  rating?: 'up' | 'down'; // Merchant feedback
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  isActive: boolean;
}

export interface Order {
  id: number;
  merchantId: number;
  customerId: number;
  customerName?: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress?: string;
  createdAt: string;
  items: OrderItem[];
  attributedTo: 'agent' | 'human';
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'bot' | 'human';
  content: string;
  intent?: string;
  reasoning?: string;
  urgency?: 'low' | 'medium' | 'high';
  sentiment?: 'positive' | 'neutral' | 'negative';
  timestamp: string;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface AbandonedCart {
  id: number;
  customerName: string;
  items: CartItem[];
  total: number;
  lastActive: string;
  recoveryStatus?: 'new' | 'nudged' | 'recovered';
}

export interface AgentState {
  cart: CartItem[];
  currentStep: 'chatting' | 'collecting_address' | 'collecting_payment' | 'complete';
  address?: string;
}
