
import React, { useState, useEffect, useRef } from 'react';
import { Send, ShoppingCart, CheckCircle2, ShieldAlert, User, Cpu, Sparkles, MessageSquare, Box } from 'lucide-react';
import { Product, ChatMessage, AgentState, OrderStatus, Order } from '../types';
import { processAgentMessage } from '../services/geminiService';
import { orderService } from '../services/orderService';
import { chatService } from '../services/chatService';
import { settingsService } from '../services/settingsService';

interface WhatsAppSimulatorProps {
  products: Product[];
  onOrderCreated?: () => void;
  onNewMessage?: () => void;
}

const SENTIMENT_GLOW: Record<string, string> = {
  positive: 'shadow-[0_0_25px_rgba(34,197,94,0.4)]',
  neutral: 'shadow-[0_0_20px_rgba(0,0,0,0.1)]',
  negative: 'shadow-[0_0_25px_rgba(239,68,68,0.4)]'
};

const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({ products, onOrderCreated, onNewMessage }) => {
  const config = settingsService.getConfig();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'bot', content: `Habari! I'm ${config.name}, your shopping assistant. How can I help you today?`, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSentiment, setCurrentSentiment] = useState('neutral');
  const [isManualMode, setIsManualMode] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  
  const [agentState, setAgentState] = useState<AgentState>({
    cart: [],
    currentStep: 'chatting'
  });
  const [isSTKPushVisible, setIsSTKPushVisible] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Fulfillment listener
  useEffect(() => {
    const interval = setInterval(() => {
      const events = JSON.parse(localStorage.getItem('system_events') || '[]');
      if (events.length > 0) {
        events.forEach((event: any) => {
          if (event.type === 'ORDER_FULFILLED') {
            const fulfillmentMsg: ChatMessage = {
              id: Date.now() + Math.random(),
              sender: 'bot',
              content: `📦 UPDATE: Your order #ORD-${event.orderId.toString().slice(-4)} has been fulfilled and is being prepared for dispatch!`,
              timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            setMessages(prev => [...prev, fulfillmentMsg]);
          }
        });
        localStorage.setItem('system_events', '[]'); // Clear handled events
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      content: currentInput,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    setIsLoading(true);
    const result = await processAgentMessage(currentInput, products, agentState);
    const { reply, intent, reasoning, urgency, sentiment, newState } = result;
    
    setCurrentSentiment(sentiment);

    if (isManualMode) {
      setAiSuggestion(reply);
      await chatService.log({ 
        customerName: "Simulated User", message: currentInput, sender: 'user', 
        intent: intent as any, reasoning, urgency: urgency as any, sentiment: sentiment as any 
      });
      setIsLoading(false);
      if (onNewMessage) onNewMessage();
      return;
    }

    await chatService.log({ 
      customerName: "Simulated User", message: currentInput, sender: 'user', 
      intent: intent as any, reasoning, urgency: urgency as any, sentiment: sentiment as any
    });

    if (reply) {
      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setMessages(prev => [...prev, botMsg]);
      await chatService.log({ 
        customerName: "Simulated User", message: reply, sender: 'bot', 
        intent: intent as any, reasoning, urgency: urgency as any, sentiment: sentiment as any
      });
    }

    if (onNewMessage) onNewMessage();
    setAgentState(newState);
    setIsLoading(false);

    if (newState.currentStep === 'collecting_payment' && !isSTKPushVisible) {
      if (currentInput.toLowerCase().match(/(yes|ready|confirm|lipa|pay)/)) {
        setTimeout(() => setIsSTKPushVisible(true), 1000);
      }
    }
  };

  const handleManualReply = async (customMsg?: string) => {
    const textToUse = customMsg || input;
    if (!textToUse.trim()) return;

    const msg: ChatMessage = {
      id: Date.now(),
      sender: 'bot',
      content: textToUse,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setMessages(prev => [...prev, msg]);
    await chatService.log({ customerName: "Simulated User", message: textToUse, sender: 'human', intent: 'other' });
    if (!customMsg) setInput('');
    setAiSuggestion(null);
    if (onNewMessage) onNewMessage();
  };

  return (
    <div className={`flex flex-col h-full bg-[#E5DDD5] rounded-[40px] overflow-hidden border border-gray-300 shadow-2xl relative transition-all duration-700 ${SENTIMENT_GLOW[currentSentiment]}`}>
      {/* Header */}
      <div className={`p-6 flex items-center justify-between text-white transition-all duration-500 ${isManualMode ? 'bg-orange-600' : 'bg-[#075E54]'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold relative group">
            {isManualMode ? <User size={24} /> : <Cpu size={24} className="animate-pulse" />}
            {!isManualMode && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#075E54] rounded-full shadow-lg"></div>}
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-tight leading-none mb-1">{isManualMode ? 'Merchant Takeover' : `${config.name} (AI)`}</h3>
            <p className="text-[9px] font-black opacity-60 tracking-[0.2em] uppercase">{isManualMode ? 'Human Controlled' : 'Sonic Sales Mode'}</p>
          </div>
        </div>
        <button 
          onClick={() => { setIsManualMode(!isManualMode); setAiSuggestion(null); }}
          className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 border-2 ${
            isManualMode ? 'bg-white text-orange-600 border-white shadow-xl scale-105' : 'bg-black/10 text-white border-white/10 hover:bg-black/20'
          }`}
        >
          {isManualMode ? <Cpu size={14} /> : <User size={14} />}
          <span>{isManualMode ? 'Auto Pilot' : 'Take Control'}</span>
        </button>
      </div>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 p-6 space-y-4 overflow-y-auto bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-blend-soft-light">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm shadow-sm relative animate-in slide-in-from-bottom-2 ${
              m.sender === 'user' ? 'bg-[#DCF8C6] rounded-tr-none' : 'bg-white rounded-tl-none border border-gray-100'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed font-medium">{m.content}</p>
              <div className="text-[9px] text-gray-400 mt-2 flex justify-end font-bold uppercase tracking-widest italic">
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}
        {isLoading && !isManualMode && (
          <div className="flex justify-start">
            <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none text-sm shadow-sm flex items-center space-x-1.5 border border-gray-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* AI Suggestions for Merchant */}
      {aiSuggestion && isManualMode && (
        <div className="px-6 py-4 bg-gray-900 border-t border-white/5 animate-in slide-in-from-bottom-4">
          <div className="flex items-center space-x-2 mb-3">
             <div className="p-1 bg-green-500 rounded-md text-white"><Sparkles size={12} /></div>
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Sales Suggestion</span>
          </div>
          <p className="text-xs text-gray-300 italic mb-4 leading-relaxed line-clamp-2">"{aiSuggestion}"</p>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleManualReply(aiSuggestion)}
              className="flex-1 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-colors"
            >
              Use Suggestion
            </button>
            <button 
              onClick={() => setAiSuggestion(null)}
              className="px-4 py-2 bg-white/5 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10"
            >
              Ignore
            </button>
          </div>
        </div>
      )}

      {/* Cart Summary */}
      {agentState.cart.length > 0 && agentState.currentStep !== 'complete' && (
        <div className="bg-white/95 backdrop-blur p-4 mx-6 mb-3 rounded-3xl border border-green-100 shadow-xl flex items-center justify-between">
           <div className="flex items-center space-x-3 text-green-700 font-black text-[10px] uppercase tracking-[0.15em]">
              <ShoppingCart size={16} />
              <span>Checkout Queue</span>
           </div>
           <span className="text-sm font-black text-gray-900">KES {agentState.cart.reduce((a, b) => a + (b.price * b.quantity), 0).toLocaleString()}</span>
        </div>
      )}

      {/* M-Pesa Overlay */}
      {isSTKPushVisible && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-8 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-xs p-10 shadow-2xl text-center border border-gray-100">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={40} className="animate-pulse" />
            </div>
            <h4 className="font-black text-xl mb-2 text-gray-900 uppercase tracking-tight">STK PUSH SENT</h4>
            <p className="text-xs text-gray-500 mb-8 font-medium">Please enter your M-Pesa PIN on the phone ending in 07xx...xxx</p>
            <p className="text-sm text-gray-600 font-bold uppercase tracking-widest">Awaiting Payment Confirmation...</p>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-6 bg-white border-t border-gray-200 flex items-center space-x-3">
        <div className="flex-1 bg-gray-100 px-5 py-4 rounded-2xl flex items-center shadow-inner">
           <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (isManualMode ? handleManualReply() : handleSend())}
            placeholder={isManualMode ? "Type manual reply..." : "Talk to your AI Agent..."}
            className="w-full bg-transparent text-sm border-none outline-none font-medium text-gray-800 placeholder-gray-400"
          />
        </div>
        <button 
          onClick={isManualMode ? () => handleManualReply() : handleSend} 
          disabled={isLoading && !isManualMode} 
          className={`p-4 rounded-2xl text-white shadow-xl transition-all active:scale-90 ${
            isManualMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-[#075E54] hover:bg-[#128C7E]'
          }`}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default WhatsAppSimulator;
