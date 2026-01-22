
import { AgentConfig, PersonaTemplate } from '../types';

export const PERSONA_PRESETS: Record<PersonaTemplate, Partial<AgentConfig>> = {
  curator: {
    tone: 'professional',
    favoriteEmoji: '✨',
    customInstructions: 'Focus on exclusivity and craftsmanship. Use words like "curated", "premium", and "limited edition".',
    includeSwahili: false
  },
  hustler: {
    tone: 'enthusiastic',
    favoriteEmoji: '🔥',
    customInstructions: 'High energy! Focus on the deal and speed. Use words like "best price", "flash sale", and "don\'t miss out".',
    includeSwahili: true
  },
  concierge: {
    tone: 'professional',
    favoriteEmoji: '🛎️',
    customInstructions: 'Helpful and service-oriented. Focus on solving problems and delivery convenience.',
    includeSwahili: false
  },
  friend: {
    tone: 'friendly',
    favoriteEmoji: '😊',
    customInstructions: 'Conversational and warm. Treat the customer like a neighbor. Use light humor.',
    includeSwahili: true
  }
};

const DEFAULT_CONFIG: AgentConfig = {
  name: "Amani",
  template: "friend",
  tone: "friendly",
  customInstructions: "Always be polite and helpful.",
  knowledgeBase: "Return Policy: 7-day money back. Shipping: Same-day for orders before 2pm. Locations: We serve the entire Nairobi metropolitan area.",
  takeoverActive: false,
  favoriteEmoji: "👋",
  includeSwahili: true
};

export const settingsService = {
  getConfig(): AgentConfig {
    const data = localStorage.getItem('agent_config');
    return data ? JSON.parse(data) : DEFAULT_CONFIG;
  },

  updateConfig(config: Partial<AgentConfig>): void {
    const current = this.getConfig();
    localStorage.setItem('agent_config', JSON.stringify({ ...current, ...config }));
  }
};
