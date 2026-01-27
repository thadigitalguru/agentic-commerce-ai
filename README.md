# Agentic Commerce Merchant Dashboard

An AI-powered commerce platform to turn WhatsApp and Instagram DMs into paid orders. This dashboard allows merchants to manage their product catalog, track orders, and monitor their Agentic AI sales bot in real-time.

## 🚀 MVP Features

Based on the official Product Requirements Document, the MVP scope includes:

- **WhatsApp Chat Interface**: Customer-facing chat for the entire sales flow.
- **Product Catalog**: Merchant ability to list products with images.
- **Cart & Order State Machine**: Manages customer carts and order statuses.
- **AI-Assisted Agent**: Handles FAQs and provides product guidance.
- **M-Pesa Payment Integration**: Native STK push for seamless checkout.
- **Abandoned Cart Recovery**: Automated reminders to recover lost sales.
- **Minimal Merchant Dashboard**: A unified interface for orders, catalog, and conversations.

## 💡 Implementation Notes

- **M-Pesa Integration**: The current implementation simulates the M-Pesa STK push and payment confirmation. A real-world application would require a backend service and webhook integration.
- **Abandoned Cart Recovery**: The recovery workflow is simulated using `localStorage` and periodic checks. A production-ready solution would involve a more robust backend scheduling service.

## 🛠 Tech Stack

- **Frontend**: React 19, Tailwind CSS, Lucide React, Recharts.
- **AI Integration**: Google GenAI SDK (Gemini 2.5 & 3).
- **Build Tool**: Vite.

## 🚀 Phase 2 Features (In Progress)

- **Instagram Chat Integration**: Connect Instagram DMs to the unified inbox.
- **Multi-Channel Unified Dashboard**: Manage conversations from WhatsApp and Instagram in one place.
- **Enhanced Analytics & Reporting**: Detailed charts for revenue, product performance, and conversion.

## 📦 Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables**:
   Create a `.env` file or export the variable directly:
   ```bash
   export API_KEY=your_gemini_api_key_here
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🏗 Project Structure

- `/components`: UI components including the WhatsApp Simulator.
- `/services`: Business logic and AI interaction handlers.
- `/types.ts`: Shared TypeScript interfaces.
- `App.tsx`: Main dashboard layout and routing.
