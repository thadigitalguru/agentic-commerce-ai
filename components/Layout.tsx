
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Package,
  TrendingUp
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SidebarItem = ({ icon: Icon, label, id, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-6">
          <div className="flex items-center space-x-2 text-green-600">
            <TrendingUp size={28} />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Agentic Commerce</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Merchant Portal v1.0</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Overview" 
            id="overview" 
            active={activeTab === 'overview'} 
            onClick={setActiveTab} 
          />
          <SidebarItem 
            icon={Package} 
            label="Catalog" 
            id="catalog" 
            active={activeTab === 'catalog'} 
            onClick={setActiveTab} 
          />
          <SidebarItem 
            icon={ShoppingBag} 
            label="Orders" 
            id="orders" 
            active={activeTab === 'orders'} 
            onClick={setActiveTab} 
          />
          <SidebarItem 
            icon={MessageSquare} 
            label="AI Agent" 
            id="agent" 
            active={activeTab === 'agent'} 
            onClick={setActiveTab} 
          />
          <SidebarItem 
            icon={BarChart3} 
            label="Analytics" 
            id="analytics" 
            active={activeTab === 'analytics'} 
            onClick={setActiveTab} 
          />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            id="settings" 
            active={activeTab === 'settings'} 
            onClick={setActiveTab} 
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 capitalize">{activeTab}</h2>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-sm text-gray-500 font-medium">Agent Active</span>
             </div>
             <img src="https://picsum.photos/seed/merchant/32/32" className="rounded-full w-8 h-8 border" alt="Profile" />
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
