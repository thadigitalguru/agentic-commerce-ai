
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import WhatsAppSimulator from './components/WhatsAppSimulator';
import { 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  DollarSign, Plus, Trash2, TrendingUp, Loader2, X, Target, ArrowUpRight, MonitorPlay, 
  UserCheck, Zap, Save, Sparkles, ZapIcon, Crown, Coffee, Languages, Wand2, 
  ImageIcon, History, AlertCircle, Mic, MicOff, Volume2, MessageSquareText,
  ShoppingBag, Tag, CheckCircle2, BrainCircuit, Activity, Heart, ThumbsUp, ThumbsDown,
  ChevronRight, Box
} from 'lucide-react';
import { Product, Order, OrderStatus, ChatLog, AgentConfig, PersonaTemplate, AbandonedCart } from './types';
import { productService } from './services/productService';
import { orderService } from './services/orderService';
import { chatService } from './services/chatService';
import { settingsService, PERSONA_PRESETS } from './services/settingsService';
import { generateProductImage, analyzeIntents, generateRecoveryNudge } from './services/geminiService';

const COLORS = ['#16a34a', '#2563eb', '#9333ea', '#ea580c', '#ef4444', '#6b7280'];

const RADAR_DATA = [
  { subject: 'Speed', A: 95, fullMark: 100 },
  { subject: 'Conv.', A: 78, fullMark: 100 },
  { subject: 'Sentiment', A: 88, fullMark: 100 },
  { subject: 'Catalog', A: 92, fullMark: 100 },
  { subject: 'Retention', A: 65, fullMark: 100 },
];

const INTENT_COLORS: Record<string, string> = {
  discovery: 'bg-blue-100 text-blue-700 border-blue-200',
  pricing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  shipping: 'bg-purple-100 text-purple-700 border-purple-200',
  checkout: 'bg-green-100 text-green-700 border-green-200',
  complaint: 'bg-red-100 text-red-700 border-red-200',
  other: 'bg-gray-100 text-gray-500 border-gray-200'
};

const URGENCY_COLORS: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-orange-500',
  low: 'bg-green-500'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [abandoned, setAbandoned] = useState<AbandonedCart[]>([
    { id: 1, customerName: "Otieno J.", total: 4500, lastActive: "2 hours ago", items: [{ productId: 1, name: "Luxury Red Sneakers", price: 4500, quantity: 1 }], recoveryStatus: 'new' },
    { id: 2, customerName: "Sarah M.", total: 3200, lastActive: "4 hours ago", items: [{ productId: 2, name: "Smart Watch", price: 3200, quantity: 1 }], recoveryStatus: 'new' },
  ]);
  const [intents, setIntents] = useState<Record<string, number>>({ discovery: 15, pricing: 8, shipping: 4, checkout: 6, complaint: 2 });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoiceTesting, setIsVoiceTesting] = useState(false);
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(settingsService.getConfig());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [p, o, c] = await Promise.all([
        productService.getAll(),
        orderService.getAll(),
        chatService.getLogs()
      ]);
      setProducts(p);
      setOrders(o);
      setChatLogs(c);
      if (c.length > 5) {
        const analyzed = await analyzeIntents(c);
        setIntents(analyzed);
      }
    } catch (err) { console.error(err); } 
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateOrderStatus = async (orderId: number, status: OrderStatus) => {
    await orderService.updateStatus(orderId, status);
    fetchData();
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  const renderOverview = () => {
    const agentRevenue = orders.filter(o => o.attributedTo === 'agent').reduce((s, o) => s + o.totalAmount, 0);
    const humanRevenue = orders.filter(o => o.attributedTo === 'human').reduce((s, o) => s + o.totalAmount, 0);

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Revenue" value={`KES ${orders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}`} icon={DollarSign} trend={12.5} color="green" />
          <StatCard title="Agent Sales" value={`KES ${agentRevenue.toLocaleString()}`} icon={Sparkles} trend={8.2} color="blue" />
          <StatCard title="Active Carts" value={abandoned.length} icon={ShoppingBag} trend={-4.1} color="purple" />
          <StatCard title="AI Response" value="1.8s" icon={Zap} trend={14.1} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-gray-800 flex items-center">
                <MonitorPlay size={18} className="mr-2 text-green-600" /> Live Sales Feed
              </h3>
              <button onClick={async () => { await chatService.clear(); fetchData(); }} className="text-[10px] font-black text-gray-300 hover:text-red-500 uppercase tracking-widest">Wipe Memory</button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto max-h-[500px] pr-4 custom-scrollbar">
              {chatLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                  <MessageSquareText size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">Waiting for customer interactions...</p>
                </div>
              ) : (
                chatLogs.slice().reverse().map(log => (
                  <div key={log.id} className="flex items-start space-x-4 group">
                    <div className="flex flex-col items-center shrink-0 w-12 pt-1">
                      <div className={`p-2 rounded-xl text-[10px] font-black mb-2 ${
                        log.sender === 'user' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {log.sender.toUpperCase()}
                      </div>
                      {log.urgency && <div className={`w-1 h-8 rounded-full ${URGENCY_COLORS[log.urgency]}`}></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold text-gray-900">{log.customerName}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{log.timestamp}</span>
                        {log.intent && log.sender === 'user' && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-tighter ${INTENT_COLORS[log.intent] || INTENT_COLORS.other}`}>
                            {log.intent}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-2xl border border-transparent group-hover:border-gray-100 transition-colors">
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gray-900 rounded-[32px] p-8 text-white flex flex-col shadow-2xl">
            <h3 className="text-lg font-black mb-6 flex items-center">
              <Activity size={20} className="mr-2 text-green-400" /> Behavioral Pulse
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center">
               <div className="w-full h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} />
                      <Radar name="Agent" dataKey="A" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
               </div>
               <div className="w-full space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Revenue Attribution</p>
                     <p className="text-xl font-bold text-blue-400">{Math.round((agentRevenue / (agentRevenue + humanRevenue || 1)) * 100)}% AI</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Purchase Intent</p>
                     <p className="text-xl font-bold text-green-500">Very High</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'agent' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 h-[calc(100vh-220px)]">
          <div className="lg:col-span-1 h-full flex flex-col space-y-6">
             <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center">
                   <div className={`p-3 rounded-2xl mr-4 ${isVoiceTesting ? 'bg-green-100 text-green-600 shadow-[0_0_20px_rgba(22,163,74,0.2)]' : 'bg-gray-100 text-gray-400'}`}>
                      <Mic size={20} />
                   </div>
                   <div>
                      <span className="text-sm font-black text-gray-900 block uppercase tracking-tight">Sonic Testing</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Voice & Intent Mode</span>
                   </div>
                </div>
                <button onClick={() => setIsVoiceTesting(!isVoiceTesting)} className={`w-14 h-8 rounded-full p-1.5 transition-all ${isVoiceTesting ? 'bg-green-600' : 'bg-gray-200'}`}>
                   <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isVoiceTesting ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
             </div>
             {isVoiceTesting ? (
               <VoiceTrainingPanel config={agentConfig} />
             ) : (
               <WhatsAppSimulator products={products} onOrderCreated={fetchData} onNewMessage={fetchData} />
             )}
          </div>
          <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm overflow-y-auto relative flex flex-col">
            <h3 className="text-2xl font-black mb-10 flex items-center">
               <BrainCircuit size={24} className="mr-3 text-green-600" /> Neural Insight Terminal
            </h3>
            <div className="flex-1 p-8 bg-gray-950 rounded-[32px] font-mono text-xs text-green-400/90 leading-relaxed shadow-inner border border-white/5 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0 animate-[shimmer_2s_infinite]"></div>
                <p className="text-gray-500 mb-6 font-bold uppercase tracking-widest text-[10px]">// COGNITIVE TRACE ACTIVE v5.0</p>
                
                <div className="flex-1 space-y-4 opacity-90 custom-scrollbar overflow-y-auto pr-4">
                  {chatLogs.slice(-12).map(log => (
                    <div key={log.id} className="border-l-2 border-white/10 pl-4 py-2 hover:bg-white/5 transition-colors rounded-r-xl relative group">
                      <div className="flex justify-between items-center mb-1">
                         <span className={`font-black uppercase text-[10px] ${log.sender === 'user' ? 'text-blue-400' : 'text-green-400'}`}>
                            {log.sender.toUpperCase()} | {log.intent?.toUpperCase() || "OTHER"}
                         </span>
                         <div className="flex items-center space-x-2">
                           <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-green-400"><ThumbsUp size={12} /></button>
                           <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400"><ThumbsDown size={12} /></button>
                         </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-2">{log.message}</p>
                      {log.reasoning && (
                        <p className="text-[9px] text-yellow-500/80 font-bold bg-yellow-500/10 px-2 py-1 rounded inline-block">
                           LOGIC: {log.reasoning}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center space-x-2 py-4">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                    <p className="text-green-500/50 uppercase tracking-tighter font-bold text-[9px]">Analyzing incoming neural signals...</p>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'catalog' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Merchandise Studio</h3>
                <p className="text-sm text-gray-500">Your AI sells what you list here.</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-green-700 transition-all shadow-xl active:scale-95">
                <Plus size={20} /><span>ADD PRODUCT</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map(product => (
                <div key={product.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500">
                  <div className="relative overflow-hidden h-56">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-2 truncate">{product.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-green-600">KES {product.price.toLocaleString()}</span>
                      <div className="p-2 bg-gray-50 rounded-xl text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                         <ArrowUpRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {isModalOpen && <ProductModal onClose={() => setIsModalOpen(false)} onSave={fetchData} />}
        </div>
      )}
      {activeTab === 'analytics' && <AnalyticsTab intents={intents} />}
      {activeTab === 'settings' && <SettingsPanel config={agentConfig} setConfig={setAgentConfig} onSave={fetchData} />}
      {activeTab === 'orders' && (
        <OrdersTab 
          orders={orders} 
          onUpdateStatus={handleUpdateOrderStatus} 
          selectedOrder={selectedOrder} 
          setSelectedOrder={setSelectedOrder} 
        />
      )}
    </Layout>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      {trend !== undefined && <span className={`text-[10px] font-black px-3 py-1.5 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>}
    </div>
    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">{title}</h4>
    <p className="text-3xl font-black text-gray-900 mt-2">{value}</p>
  </div>
);

// Added explicit typing to props to fix "unknown" type error in JSX at line 321
const AnalyticsTab = ({ intents }: { intents: Record<string, number> }) => (
  <div className="space-y-10 animate-in fade-in duration-500 pb-20">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black mb-8 flex items-center">
          <Target size={20} className="mr-2 text-blue-600" /> Intelligent Intent Breakdown
        </h3>
        <div className="h-[350px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={Object.entries(intents).map(([k, v]) => ({ name: k, value: v }))} cx="50%" cy="50%" innerRadius={80} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                {Object.entries(intents).map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             {/* Use typed intents to ensure reduce returns a valid number/ReactNode */}
             <span className="text-3xl font-black text-gray-900">{Object.values(intents).reduce((a: number, b: number) => a + b, 0)}</span>
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interactions</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-4">
           {Object.keys(intents).map((k, i) => (
             <div key={k} className="flex items-center space-x-2">
               <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
               <span className="text-[10px] font-black uppercase text-gray-500">{k}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="bg-gray-900 p-10 rounded-[40px] text-white flex flex-col shadow-2xl">
         <h3 className="text-xl font-black mb-10 flex items-center">
            <Sparkles size={24} className="mr-3 text-yellow-400" /> Intent-Driven Insights
         </h3>
         <div className="space-y-6 flex-1">
            {[
              { title: "Price Sensitivity Identified", desc: "40% of customers have high 'Pricing' intent but low conversion. We recommend offering a limited Swahili 'Safaricom Friday' discount.", impact: "Revenue Drain" },
              { title: "Logistics Friction", desc: "Intent recognition shows recurring frustration with shipping timelines. We recommend updating FAQ with exact regional zones.", impact: "High Friction" }
            ].map(insight => (
              <div key={insight.title} className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                 <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-yellow-400">{insight.title}</h4>
                    <span className="text-[9px] font-black text-green-400 border border-green-400/30 px-2 py-0.5 rounded-full">{insight.impact}</span>
                 </div>
                 <p className="text-xs text-gray-400 leading-relaxed">{insight.desc}</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  </div>
);

const OrdersTab = ({ orders, onUpdateStatus, selectedOrder, setSelectedOrder }: any) => {
  return (
    <div className="relative h-full flex flex-col space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Order Detail Sidebar */}
      {selectedOrder && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 p-8 border-l animate-in slide-in-from-right duration-300">
           <div className="flex justify-between items-center mb-10">
              <h4 className="text-xl font-black tracking-tight uppercase">Order #ORD-{selectedOrder.id.toString().slice(-4)}</h4>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
           </div>
           <div className="space-y-8">
              <div className="p-4 bg-gray-50 rounded-2xl">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer</p>
                 <p className="font-bold text-gray-900">{selectedOrder.customerName}</p>
                 <p className="text-xs text-gray-500 mt-1">{selectedOrder.deliveryAddress || 'No address provided'}</p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Line Items</p>
                 <div className="space-y-3">
                    {selectedOrder.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center">
                         <span className="text-sm font-medium text-gray-600">{item.quantity}x {item.productName}</span>
                         <span className="text-sm font-black">KES {item.priceAtPurchase.toLocaleString()}</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="pt-8 border-t">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Management</p>
                 {selectedOrder.status === OrderStatus.PAID ? (
                   <button 
                    onClick={() => onUpdateStatus(selectedOrder.id, OrderStatus.FULFILLED)}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 shadow-xl"
                   >
                     <Box size={18} />
                     <span>Mark as Fulfilled</span>
                   </button>
                 ) : (
                   <div className="flex items-center space-x-2 text-green-600 font-black uppercase text-xs">
                      <CheckCircle2 size={18} />
                      <span>Order Completed</span>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Order</th>
              <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
              <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
              <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Attribution</th>
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.slice().reverse().map((order: Order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                <td className="px-8 py-6 font-black text-gray-900">#ORD-{order.id.toString().slice(-4)}</td>
                <td className="px-8 py-6 text-sm text-gray-600 font-medium">{order.customerName}</td>
                <td className="px-8 py-6">
                  <span className={`text-[10px] font-black px-4 py-2 rounded-2xl uppercase tracking-widest ${
                    order.status === OrderStatus.PAID ? 'bg-amber-100 text-amber-700' : 
                    order.status === OrderStatus.FULFILLED ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-8 py-6 font-black text-gray-900 text-lg">KES {order.totalAmount.toLocaleString()}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-2">
                    {order.attributedTo === 'agent' ? (
                      <div className="flex items-center text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full">
                        <Sparkles size={12} className="mr-1" /> AI Agent
                      </div>
                    ) : (
                      <div className="flex items-center text-[10px] font-black text-gray-600 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full">
                        <UserCheck size={12} className="mr-1" /> Merchant
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                   <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-900 transition-colors inline" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProductModal = ({ onClose, onSave }: any) => {
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', imageUrl: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const handleGenerate = async () => {
    setIsGenerating(true);
    const url = await generateProductImage(`${newProduct.name}: ${newProduct.description}`);
    if (url) setNewProduct(prev => ({ ...prev, imageUrl: url }));
    setIsGenerating(false);
  };
  const handleSave = async () => {
    await productService.add({ ...newProduct, price: parseFloat(newProduct.price), currency: 'KES', isActive: true } as any);
    onSave();
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
      <div className="bg-white rounded-[40px] w-full max-w-2xl p-12 relative shadow-2xl animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-10 right-10 text-gray-400 hover:text-gray-900 transition-colors"><X size={28} /></button>
        <h3 className="text-3xl font-black mb-2">AI Creative Studio</h3>
        <p className="text-gray-500 mb-10 font-medium">Define your product. Let the AI visualize it.</p>
        <div className="grid grid-cols-2 gap-10">
           <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Name</label>
                <input value={newProduct.name} onChange={e => setNewProduct(prev => ({...prev, name: e.target.value}))} className="w-full bg-gray-50 p-4 rounded-2xl border-none font-bold focus:ring-2 focus:ring-green-500/20 outline-none" placeholder="e.g. Leather Jacket" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Price (KES)</label>
                <input type="number" value={newProduct.price} onChange={e => setNewProduct(prev => ({...prev, price: e.target.value}))} className="w-full bg-gray-50 p-4 rounded-2xl border-none font-bold focus:ring-2 focus:ring-green-500/20 outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">AI Prompt</label>
                <textarea value={newProduct.description} onChange={e => setNewProduct(prev => ({...prev, description: e.target.value}))} className="w-full bg-gray-50 p-4 rounded-2xl border-none text-sm font-medium focus:ring-2 focus:ring-green-500/20 outline-none" rows={4} placeholder="Describe materials, color, style..." />
              </div>
           </div>
           <div className="flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-50 rounded-[32px] mb-6 overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center group relative shadow-inner">
                 {isGenerating ? (
                   <div className="flex flex-col items-center animate-pulse">
                      <Loader2 className="animate-spin text-green-600 mb-2" size={32} />
                      <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Painting...</span>
                   </div>
                 ) : newProduct.imageUrl ? (
                   <img src={newProduct.imageUrl} className="w-full h-full object-cover" alt="Generated Product" />
                 ) : (
                   <div className="text-center p-8">
                     <ImageIcon size={48} className="text-gray-200 mx-auto mb-4" />
                     <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">No Visual Generated</p>
                   </div>
                 )}
              </div>
              <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50">
                <Sparkles size={16} className="inline mr-2" /> CREATE IMAGE
              </button>
           </div>
        </div>
        <button onClick={handleSave} className="mt-12 w-full py-5 bg-green-600 text-white rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(22,163,74,0.3)] hover:bg-green-700 hover:shadow-green-600/40 transition-all">
          LIST ON CATALOG
        </button>
      </div>
    </div>
  );
};

const VoiceTrainingPanel = ({ config }: any) => {
  const [status, setStatus] = useState('Standby');
  const [isTalking, setIsTalking] = useState(false);
  return (
    <div className="h-full bg-gray-900 rounded-[40px] flex flex-col items-center justify-center p-12 text-center border border-white/5 relative overflow-hidden shadow-2xl">
       <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none"></div>
       <div className="flex items-end space-x-2 h-24 mb-12">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
            <div key={i} className={`w-2 bg-green-500 rounded-full transition-all duration-300 ${isTalking ? 'animate-pulse' : 'h-4 opacity-10'}`} style={{ height: isTalking ? `${Math.random() * 90 + 10}%` : '15%' }}></div>
          ))}
       </div>
       <h4 className="text-2xl font-black text-white mb-3 tracking-tight">{config.name} Live Persona</h4>
       <div className="flex items-center space-x-2 mb-10">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
          <p className="text-xs text-gray-500 font-black tracking-widest uppercase">System: <span className="text-green-400">{status}</span></p>
       </div>
       <button onMouseDown={() => { setStatus('Listening...'); setIsTalking(true); }} onMouseUp={() => { setStatus('Thinking...'); setIsTalking(false); }} className="group relative w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(22,163,74,0.4)] hover:shadow-[0_0_70px_rgba(22,163,74,0.6)] active:scale-90 transition-all cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-500 rounded-full"></div>
          <Mic size={40} className="relative z-10" />
       </button>
       <p className="mt-8 text-[11px] text-gray-500 font-black uppercase tracking-widest opacity-50">Hold to speak with brand neural core</p>
    </div>
  );
};

const SettingsPanel = ({ config, setConfig, onSave }: any) => {
  const handleSave = () => {
    settingsService.updateConfig(config);
    onSave();
    alert("Neural Vibe Synchronized!");
  };
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
             <h3 className="text-3xl font-black mb-10 text-gray-900">Persona Intelligence</h3>
             <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block tracking-widest">Agent Identity</label>
                   <input value={config.name} onChange={e => setConfig({...config, name: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-none font-black text-lg focus:ring-2 focus:ring-green-500/20" />
                </div>
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block tracking-widest">Favorite Emoji</label>
                   <input value={config.favoriteEmoji} onChange={e => setConfig({...config, favoriteEmoji: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-none font-black text-center text-3xl focus:ring-2 focus:ring-green-500/20" />
                </div>
             </div>
             <div className="space-y-10">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[24px]">
                   <div className="flex items-center">
                      <div className="p-3 bg-white rounded-2xl shadow-sm mr-4 text-green-600"><Languages size={24} /></div>
                      <div>
                        <span className="text-sm font-black text-gray-900 uppercase tracking-tight block">Local Swahili Phrases</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Includes 'Safi', 'Karibu', etc.</span>
                      </div>
                   </div>
                   <input type="checkbox" checked={config.includeSwahili} onChange={e => setConfig({...config, includeSwahili: e.target.checked})} className="w-8 h-8 rounded-xl accent-green-600" />
                </div>
                <div>
                   <label className="text-[11px] font-black text-gray-400 uppercase mb-4 block tracking-[0.2em]">Business Knowledge Base (RAG)</label>
                   <textarea value={config.knowledgeBase} onChange={e => setConfig({...config, knowledgeBase: e.target.value})} rows={6} className="w-full bg-gray-50 p-6 rounded-[24px] border-none text-sm font-medium leading-relaxed focus:ring-2 focus:ring-green-500/20" placeholder="Feed the AI facts about your store..." />
                </div>
             </div>
             <button onClick={handleSave} className="mt-12 bg-gray-900 text-white px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all">UPDATE BRAND CORE</button>
          </div>
          <div className="bg-gray-900 rounded-[40px] p-10 text-white h-fit shadow-2xl sticky top-24">
             <h3 className="text-xl font-black mb-10 flex items-center">
                <Crown size={24} className="mr-3 text-yellow-400" /> Executive Presets
             </h3>
             <div className="space-y-6">
                {Object.keys(PERSONA_PRESETS).map((p: any) => (
                  <button key={p} onClick={() => { const preset = PERSONA_PRESETS[p as PersonaTemplate]; setConfig((prev: any) => ({ ...prev, ...preset, template: p as PersonaTemplate })); }} className={`w-full p-6 rounded-3xl border transition-all text-left group ${config.template === p ? 'bg-white border-white' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[11px] font-black uppercase tracking-widest ${config.template === p ? 'text-gray-900' : 'text-gray-400'}`}>{p}</span>
                      {config.template === p && <CheckCircle2 size={16} className="text-green-600" />}
                    </div>
                    <p className={`text-xs font-bold ${config.template === p ? 'text-gray-600' : 'text-gray-500'}`}>Load {p} persona configuration.</p>
                  </button>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

export default App;
