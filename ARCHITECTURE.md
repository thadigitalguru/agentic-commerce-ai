# Architecture Overview

This document provides a high-level overview of the Agentic Commerce dashboard's architecture.

## Core Principles

-   **Conversion-Focused**: The primary goal is to convert chats into paid orders. The AI acts as a sales assistant, not a replacement for the merchant.
-   **Incremental Adoption**: The architecture is designed to start with WhatsApp and expand to other channels like Instagram in the future.
-   **Component-Based UI**: The frontend is built with React and TypeScript, emphasizing reusable and self-contained UI components.
-   **Service-Oriented Logic**: Business logic, AI interactions, and data management are separated into services.
-   **AI-Driven Core**: The core sales and analytics logic is powered by the Google Gemini family of models.

## Project Structure

-   `/src/components`: Contains all React components.
    -   `InboxTab.tsx`: A new component that serves as the unified inbox for multi-channel conversations.
    -   `WhatsAppSimulator.tsx`: The primary interface for simulating customer-agent interactions, now nested within the `InboxTab`.
    -   `Layout.tsx`: The main dashboard structure, including navigation.
    -   `App.tsx`: The root component that assembles the dashboard tabs and manages application-level state.
-   `/src/services`: Contains modules that handle specific business logic.
    -   `geminiService.ts`: The core of the AI functionality. It handles communication with the Gemini API for chat processing, image generation, and intent analysis.
    -   `productService.ts`, `orderService.ts`, `chatService.ts`: Mock services that use `localStorage` to simulate a database for products, orders, and chat logs.
    -   `settingsService.ts`: Manages the AI agent's persona and configuration.
-   `/src/types.ts`: Defines shared TypeScript interfaces and types used across the application (e.g., `Product`, `Order`, `ChatMessage`).

## Data Flow

The user journey follows a conversational commerce model, orchestrated by the AI and managed through the merchant dashboard.

1.  **Initiation**: A customer sends a message via WhatsApp (simulated in the `WhatsAppSimulator`).
2.  **AI Processing**: The message is sent to the `geminiService`, which uses the Gemini API to understand intent, answer FAQs from the knowledge base, and guide the customer through product discovery.
3.  **Cart Management**: The AI uses function calling (`add_to_cart`) to manage the user's shopping cart, which is maintained in the `AgentState`.
4.  **Checkout**: When the user is ready, the AI initiates the checkout process, collecting delivery information.
5.  **Payment**: The system triggers an M-Pesa STK push. The current implementation simulates this step. A production version would require a webhook to confirm payment.
6.  **Order Management**: Upon successful payment, an order is created and displayed in the merchant dashboard.
7.  **Abandoned Cart Recovery**: The system is designed to trigger automated reminders for carts that do not complete the checkout process (as outlined in the PRD, this is a core feature).

## State Management

The application currently uses React's built-in state management (`useState`, `useEffect`, `useCallback`) within `App.tsx` as the primary state container. This is sufficient for the current scale but could be migrated to a dedicated state management library like Zustand or Redux Toolkit if complexity increases.
