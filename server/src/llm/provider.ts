import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "./prompt.js";

let openaiClient: OpenAI | null = null;
let grokClient: OpenAI | null = null;
let geminiClient: GoogleGenerativeAI | null = null;

// Determine the active provider based on environment variables
let activeProvider: "openai" | "grok" | "gemini" | null = null;

function initializeClients() {
  const openAiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const grokKey = process.env.GROK_API_KEY;

  const isValidKey = (key?: string) => key && !key.startsWith("your_");

  if (isValidKey(openAiKey)) {
    activeProvider = "openai";
    openaiClient = new OpenAI({ apiKey: openAiKey });
  } else if (isValidKey(geminiKey)) {
    activeProvider = "gemini";
    geminiClient = new GoogleGenerativeAI(geminiKey as string);
  } else if (isValidKey(grokKey)) {
    activeProvider = "grok";
    grokClient = new OpenAI({
      apiKey: grokKey,
      baseURL: "https://api.x.ai/v1",
    });
  } else {
    throw new Error(
      "No valid API key found. Please set OPENAI_API_KEY, GEMINI_API_KEY, or GROK_API_KEY in your .env file."
    );
  }
}

export async function extractReceiptData(
  imageBuffer: Buffer,
  mimeType: string
): Promise<string> {
  if (!activeProvider) {
    initializeClients();
  }

  const base64Image = imageBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  if (activeProvider === "openai" && openaiClient) {
    return extractWithOpenAI(openaiClient, dataUrl, "gpt-4.1");
  } else if (activeProvider === "grok" && grokClient) {
    return extractWithOpenAI(grokClient, dataUrl, "grok-vision-beta");
  } else if (activeProvider === "gemini" && geminiClient) {
    return extractWithGemini(geminiClient, base64Image, mimeType);
  }

  throw new Error("Active LLM provider not properly initialized.");
}

// Shared logic for OpenAI and Grok (since Grok uses the OpenAI SDK)
async function extractWithOpenAI(
  client: OpenAI,
  dataUrl: string,
  modelName: string
): Promise<string> {
  const response = await client.chat.completions.create({
    model: modelName,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all data from this receipt image. Return ONLY valid JSON.",
          },
          {
            type: "image_url",
            image_url: { url: dataUrl },
          },
        ],
      },
    ],
    temperature: 0.1,
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error("No response from LLM");
  }
  return text;
}

// Logic for Google Gemini
async function extractWithGemini(
  client: GoogleGenerativeAI,
  base64Image: string,
  mimeType: string
): Promise<string> {
  // Use gemini-1.5-flash or pro for vision tasks
  const model = client.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `Extract all data from this receipt image. Return ONLY valid JSON.\n\n${SYSTEM_PROMPT}`;
  const imageParts = [
    {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    },
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();

  if (!text) {
    throw new Error("No response from Gemini");
  }
  return text;
}
