# Agentic Chat Commerce for WhatsApp + Instagram Sellers

## Core Value Proposition
"Convert WhatsApp and Instagram DMs into paid orders with AI-assisted agents that answer questions, guide product selection, and handle checkout, all without leaving the chat."

## Key Principles
- **Incremental adoption**: Start with one channel (WhatsApp), expand to Instagram later.
- **Focus on conversion, not full automation**: The main KPI is "chats -> paid orders".
- **AI is a sales assistant**, not a replacement for the merchant.
- **Phase 2**: Marketing campaigns, unified dashboard, Shopify/WooCommerce integration, human takeover mobile app.

## Primary ICP (Ideal Customer Profile)
- Small-to-medium Instagram + WhatsApp sellers (fashion, electronics, cosmetics, home goods).
- 50-500 inbound chats per week.
- Already using M-Pesa daily.
- Pain Point: Lost sales due to chat drop-offs and manual follow-up.

---

## MVP Scope (Must-Have Features)
1.  **WhatsApp Chat Interface**: A customer-facing interface for the entire sales flow (DM -> product -> cart -> checkout).
2.  **Product Catalog**: A system for merchants to list products with images.
3.  **Cart and Order State Machine**: Manages the customer's cart and the state of their order.
4.  **AI-Assisted Agent**: Handles FAQs and provides product guidance based on merchant-provided knowledge.
5.  **M-Pesa Payment Integration**: Includes STK push or a similar provider abstraction.
6.  **Abandoned Cart Recovery**: A reminder workflow to follow up on pending carts.
7.  **Minimal Merchant Dashboard**: A single view for orders, catalog, and conversations.

---

## Phase 2: Premium Features
- Instagram chat integration.
- Multi-channel unified dashboard.
- AI-powered full customer support.
- Campaigns / promotions.
- Analytics & reporting.
- Shopify/WooCommerce integration.

---

## Epics & Stories

### Epic 1: Customer Chat Flow
- **Story 1.1**: Product catalog browsing in WhatsApp chat.
  - *Acceptance Criteria*: Customer can type "catalog" -> receives a numbered/interactive product list with images and prices.
- **Story 1.2**: Add product to cart via chat.
  - *Acceptance Criteria*: Customer types "add 2 of item #3" -> cart is updated and confirmed.
- **Story 1.3**: View cart and checkout.
  - *Acceptance Criteria*: Customer types "cart" -> sees items + total. Typing "checkout" triggers the collection of delivery info.

### Epic 2: Payment Integration
- **Story 2.1**: M-Pesa STK Push.
  - *Acceptance Criteria*: After checkout, the customer receives an STK prompt. Payment is confirmed via webhook, and order status updates automatically.
- **Story 2.2**: Payment failure handling.
  - *Acceptance Criteria*: If payment fails, the customer is notified and can retry.

### Epic 3: AI-Assisted Sales Agent
- **Story 3.1**: Answer product FAQs.
  - *Acceptance Criteria*: Customer questions about price, availability, or delivery are answered by the AI agent with merchant-approved knowledge.
- **Story 3.2**: Lead qualification.
  - *Acceptance Criteria*: The AI tags conversations as "hot/warm/cold" based on intent to purchase.
- **Story 3.3**: Human takeover.
  - *Acceptance Criteria*: The merchant can override AI responses per conversation.

### Epic 4: Abandoned Cart Recovery
- **Story 4.1**: Automated reminders.
  - *Acceptance Criteria*: A cart pending payment for > X minutes triggers a WhatsApp reminder automatically.
- **Story 4.2**: Conversion tracking.
  - *Acceptance Criteria*: The system logs if a reminder resulted in a payment.

### Epic 5: Merchant Dashboard
- **Story 5.1**: Product management.
  - *Acceptance Criteria*: Merchant can create, update, and delete products.
- **Story 5.2**: Order management.
  - *Acceptance Criteria*: Merchant sees an order list with statuses (created -> pending -> paid -> fulfilled).
- **Story 5.3**: Conversation log.
  - *Acceptance Criteria*: Merchant can view chat threads with the AI and customers.

### Epic 6: Analytics & Reporting (Minimal for MVP)
- **Story 6.1**: Conversion dashboard.
  - *Acceptance Criteria*: The dashboard shows total chats, orders created, paid orders, and abandoned cart recovery.

---

## Acceptance Criteria Guidelines
- Every story must be testable end-to-end in a sandbox WhatsApp environment.
- AI responses must not break the checkout flow.
- Payment confirmations must reflect correctly in the merchant dashboard.
- Abandoned cart reminders should only trigger once per order.
- All core functionality must work on a mobile-first layout.
