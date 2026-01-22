import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Product, AgentState, AgentConfig, ChatLog } from "../types";
import { settingsService } from "./settingsService";

/**
 * Lazily initialize the GoogleGenAI client to ensure it always uses
 * the most up-to-date API_KEY injected by the build system.
 */
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Please set API_KEY in your environment variables.");
    // Return a dummy client to prevent immediate crashes, though calls will fail
    return new GoogleGenAI({ apiKey: 'MISSING_API_KEY' });
  }
  return new GoogleGenAI({ apiKey });
};

const addToCartTool: FunctionDeclaration = {
  name: 'add_to_cart',
  parameters: {
    type: Type.OBJECT,
    description: 'Add a specific product to the customers shopping cart.',
    properties: {
      productId: {
        type: Type.NUMBER,
        description: 'The unique ID of the product.',
      },
      quantity: {
        type: Type.NUMBER,
        description: 'Number of units to add (default 1).',
      },
    },
    required: ['productId'],
  },
};

const recommendProductTool: FunctionDeclaration = {
  name: 'recommend_product',
  parameters: {
    type: Type.OBJECT,
    description: 'Suggest a complementary product from the catalog to increase order value.',
    properties: {
      productId: {
        type: Type.NUMBER,
        description: 'The unique ID of the product to recommend.',
      },
      reason: {
        type: Type.STRING,
        description: 'Short reason why this complements the cart (e.g., "matches the color").',
      }
    },
    required: ['productId', 'reason'],
  },
};

const initiateCheckoutTool: FunctionDeclaration = {
  name: 'initiate_checkout',
  parameters: {
    type: Type.OBJECT,
    description: 'Start the checkout and payment process when the user is ready to buy.',
    properties: {
      confirmation: {
        type: Type.BOOLEAN,
        description: 'Set to true if user explicitly confirmed checkout.',
      }
    },
    required: ['confirmation'],
  },
};

const getSystemInstruction = (config: AgentConfig, productsContext: string) => `
You are "${config.name}," a world-class AI Sales Co-Pilot.
VIBE: ${config.template.toUpperCase()} template. 
TONE: ${config.tone}.
EMOJI: ${config.favoriteEmoji}
LOCALE: ${config.includeSwahili ? 'Sprinkle in Swahili/Sheng (Safi, Karibu, Vipi, etc.).' : 'English.'}

CORE OBJECTIVE: Increase Average Order Value (AOV) and Conversion.

KNOWLEDGE BASE (RAG):
${config.knowledgeBase}

SALES BEHAVIOR:
1. UPSELL: If a user adds an item, use "recommend_product" to suggest one complementary item. 
2. SCARCITY: If intent is "pricing", mention that stock is moving fast.
3. FAQ: Use the Knowledge Base for all delivery/return questions.
4. CONCISION: Keep responses under 20 words.

CATALOG DATA:
${productsContext}

RESPONSE FORMAT (JSON ONLY):
{
  "reply": "Message to customer",
  "intent": "discovery|pricing|shipping|checkout|complaint|other",
  "reasoning": "Reason for intent and strategy chosen",
  "urgency": "low|medium|high",
  "sentiment": "positive|neutral|negative"
}
`;

export async function processAgentMessage(
  message: string,
  products: Product[],
  currentState: AgentState
): Promise<{ reply: string; intent: string; reasoning: string; urgency: string; sentiment: string; newState: AgentState }> {
  const config = settingsService.getConfig();
  const ai = getAIClient();
  
  const productsContext = products.map(p => 
    `ID: ${p.id} | Name: ${p.name} | Price: ${p.currency} ${p.price}`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: getSystemInstruction(config, productsContext),
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            intent: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            urgency: { type: Type.STRING },
            sentiment: { type: Type.STRING }
          },
          required: ['reply', 'intent', 'reasoning', 'urgency', 'sentiment']
        },
        tools: [{ functionDeclarations: [addToCartTool, initiateCheckoutTool, recommendProductTool] }],
      }
    });

    let newState = { ...currentState };
    let jsonRes = { reply: "", intent: "other", reasoning: "Parsing...", urgency: "low", sentiment: "neutral" };
    
    try {
      jsonRes = JSON.parse(response.text || "{}");
    } catch (e) {
      jsonRes = { reply: response.text || "Thinking...", intent: "other", reasoning: "Error", urgency: "low", sentiment: "neutral" };
    }

    if (response.functionCalls) {
      for (const fc of response.functionCalls) {
        if (fc.name === 'add_to_cart') {
          const args = fc.args as { productId: number; quantity?: number };
          const product = products.find(p => p.id === args.productId);
          if (product) {
            newState.cart.push({ productId: product.id, name: product.name, price: product.price, quantity: args.quantity || 1 });
          }
        } else if (fc.name === 'recommend_product') {
          const args = fc.args as { productId: number; reason: string };
          const product = products.find(p => p.id === args.productId);
          if (product && !jsonRes.reply.includes(product.name)) {
            jsonRes.reply += `\n\nBy the way, I recommend our ${product.name} because it ${args.reason}! ${config.favoriteEmoji}`;
          }
        } else if (fc.name === 'initiate_checkout') {
          newState.currentStep = 'collecting_address';
        }
      }
    }

    if (currentState.currentStep === 'collecting_address' && !currentState.address && message.length > 5) {
      newState.address = message;
      newState.currentStep = 'collecting_payment';
      const total = newState.cart.reduce((s, i) => s + (i.price * i.quantity), 0);
      jsonRes.reply = `Perfect. Total is KES ${total.toLocaleString()}. Ready to receive the M-Pesa push on your phone?`;
      jsonRes.intent = "checkout";
      jsonRes.urgency = "high";
    }

    return { 
      reply: jsonRes.reply, 
      intent: jsonRes.intent, 
      reasoning: jsonRes.reasoning, 
      urgency: jsonRes.urgency, 
      sentiment: jsonRes.sentiment,
      newState 
    };
  } catch (error) {
    console.error("AI Error:", error);
    return { reply: "I'm checking that for you...", intent: "other", reasoning: "Error", urgency: "low", sentiment: "neutral", newState: currentState };
  }
}

export async function generateRecoveryNudge(cart: any): Promise<string> {
  const config = settingsService.getConfig();
  const ai = getAIClient();
  const prompt = `Customer ${cart.customerName} left ${cart.items[0].name} (KES ${cart.total}) in cart. 
  Create a nudge message. 
  BONUS: Generate a one-time 10% discount code starting with "KARIBU" and mention it.
  Tone: ${config.tone}. Persona: ${config.name}. Max 25 words.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text || "Still interested? Use code KARIBU10 for 10% off!";
}

export async function analyzeIntents(logs: ChatLog[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  logs.forEach(l => {
    if (l.intent && l.sender === 'user') {
      counts[l.intent] = (counts[l.intent] || 0) + 1;
    }
  });
  return Object.keys(counts).length > 0 ? counts : { discovery: 10, pricing: 5, shipping: 3, checkout: 2 };
}

export async function generateProductImage(prompt: string): Promise<string> {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: `High-end e-commerce product photography for: ${prompt}. Studio lighting, clean background.` }] }],
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : '';
  } catch (e) { 
    console.error("Image Generation Error:", e);
    return ''; 
  }
}