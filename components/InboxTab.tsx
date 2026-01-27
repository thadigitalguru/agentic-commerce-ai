import React from 'react';
import WhatsAppSimulator from './WhatsAppSimulator';
import { Product } from '../types';

interface InboxTabProps {
  products: Product[];
  onOrderCreated: () => void;
  onNewMessage: () => void;
}

const InboxTab: React.FC<InboxTabProps> = ({ products, onOrderCreated, onNewMessage }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 h-[calc(100vh-220px)]">
      <div className="lg:col-span-1 h-full flex flex-col space-y-6">
        {/* Currently, the WhatsApp simulator is directly here. In the future, this could be a list of conversations */}
        <WhatsAppSimulator products={products} onOrderCreated={onOrderCreated} onNewMessage={onNewMessage} />
      </div>
      <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm overflow-y-auto relative flex flex-col">
        <h3 className="text-2xl font-black mb-10 text-gray-900">Unified Inbox (Phase 2)</h3>
        <p className="text-gray-500">This section will eventually display conversations from multiple channels like WhatsApp and Instagram. For now, it provides a larger view area for the active chat.</p>
        {/* Future: Implement Instagram/other channel chat list and active chat view here */}
      </div>
    </div>
  );
};

export default InboxTab;