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

## 🛠 Tech Stack

- **Frontend**: React 19, Tailwind CSS, Lucide React, Recharts.
- **AI Integration**: Google GenAI SDK (Gemini 2.5 & 3).
- **Build Tool**: Vite.
- **Deployment**: Vercel.

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

## 🌐 Deployment to Vercel

1. **Push this code to a GitHub repository.**
2. **Import the project into Vercel.**
3. **Add the Environment Variable**:
   - Key: `API_KEY`
   - Value: Your Google AI Studio API Key.
4. **Deploy!**

## 🏗 Project Structure

- `/components`: UI components including the WhatsApp Simulator.
- `/services`: Business logic and AI interaction handlers.
- `/types.ts`: Shared TypeScript interfaces.
- `App.tsx`: Main dashboard layout and routing.
