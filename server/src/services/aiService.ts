import { GoogleGenAI } from '@google/genai';
import { config } from '../config';
import {
  EventRequirements,
  GeneratedPlan,
  generatedPlanSchema,
  generateSamplePlan,
} from '../../../shared/src';

export class AiServiceError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'AI_ERROR') {
    super(message);
    this.name = 'AiServiceError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export async function generateEventPlan(
  requirements: EventRequirements,
  forceDemoMode: boolean = false
): Promise<GeneratedPlan> {
  // If demo mode forced or API key missing, return deterministic high-quality sample plan
  if (forceDemoMode || !config.isAiConfigured) {
    if (forceDemoMode) {
      return generateSamplePlan(requirements);
    }

    // If API key is missing and user didn't ask for demo, explain transparently
    throw new AiServiceError(
      'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in your environment, or enable Demo Mode to explore with curated sample plans.',
      401,
      'API_KEY_MISSING'
    );
  }

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  const prompt = `
You are CelebrAI, an expert celebration and event planner.
Generate a comprehensive, customized, professional event plan for the following requirements:

Event Title: "${requirements.title}"
Event Type: ${requirements.eventType}
Event Date: ${requirements.eventDate}
Location: ${requirements.city}
Guest Count: ${requirements.guestCount}
Total Budget: ${requirements.currency} ${requirements.budget}
Theme Preference: ${requirements.themePreference || 'Refined & celebratory'}
Venue Preference: ${requirements.venuePreference}
Dietary Preferences: ${
    requirements.dietaryPreferences.length > 0
      ? requirements.dietaryPreferences.join(', ')
      : 'Standard diverse catering'
  }
Additional Instructions: ${requirements.additionalInstructions || 'None'}

CONSTRAINTS & RULES:
1. You MUST return ONLY a single, strictly valid JSON object adhering to the schema below. Do not wrap in markdown quotes if possible, or use standard JSON.
2. The event date is ${requirements.eventDate}. All task 'dueDate' fields in the timeline MUST be in 'YYYY-MM-DD' format and logically precede or follow the event date.
3. The sum of all 'estimatedAmount' in 'budgetItems' plus the 'contingencyReserve.amount' MUST NOT exceed the total budget of ${requirements.budget}.
4. Provide practical, insightful questions for each vendor category (questions to ask before hiring).
5. Do NOT invent fake vendor businesses, phone numbers, or claim vendors are booked or verified. Set 'vendorName', 'contactPerson', 'phone', 'email' to empty strings, allowing the user to fill them.
6. Set 'isDemoPlan' to false and 'modelUsed' to "${config.geminiModel}".
7. Set 'generatedAt' to the current ISO timestamp.

REQUIRED JSON SCHEMA STRUCTURE:
{
  "eventTitle": string,
  "summary": string,
  "planningAssumptions": string[],
  "recommendedTheme": {
    "name": string,
    "colorPalette": string[] (hex codes or color names, 3 to 5 items),
    "vibeDescription": string,
    "decorConcepts": string[] (at least 3 items)
  },
  "budgetItems": [
    {
      "id": string (e.g. "budget-1"),
      "category": string,
      "estimatedAmount": number,
      "actualAmount": 0,
      "notes": string,
      "isCustom": false
    }
  ],
  "contingencyReserve": {
    "amount": number,
    "percentage": number,
    "rationale": string
  },
  "timeline": [
    {
      "id": string (e.g. "task-1"),
      "title": string,
      "category": string,
      "phase": "3-6 months before" | "1-2 months before" | "2-4 weeks before" | "Week of event" | "Event day" | "Post-event",
      "dueDate": "YYYY-MM-DD",
      "completed": false,
      "priority": "low" | "medium" | "high" | "critical",
      "notes": string
    }
  ],
  "vendorCategories": [
    {
      "id": string (e.g. "vendor-1"),
      "category": string,
      "status": "research",
      "vendorName": "",
      "contactPerson": "",
      "phone": "",
      "email": "",
      "estimatedBudget": number,
      "actualCost": 0,
      "notes": string,
      "questionsToAsk": string[]
    }
  ],
  "personalizedIdeas": {
    "entertainment": string[],
    "diningExperience": string[],
    "guestExperience": string[],
    "ecoFriendlyTips": string[]
  },
  "riskAndContingencies": [
    {
      "risk": string,
      "mitigation": string,
      "severity": "low" | "medium" | "high"
    }
  ],
  "isDemoPlan": false,
  "generatedAt": string,
  "modelUsed": "${config.geminiModel}"
}
`;

  const candidateModels = [
    config.geminiModel,
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i);

  let rawResponseText = '';
  let successfulModel = config.geminiModel;
  let lastError: any = null;

  for (const modelToTry of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      try {
        const response = await ai.models.generateContent({
          model: modelToTry,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        rawResponseText = response.text || '';
        if (rawResponseText) {
          successfulModel = modelToTry;
          break;
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err: any) {
      lastError = err;
      const msg = err.message || String(err);
      // If error is authentication/quota, no point trying other models with same key
      if (
        msg.includes('API_KEY_INVALID') ||
        msg.includes('401') ||
        msg.includes('forbidden') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('429')
      ) {
        throw err;
      }
      // If model not found or unsupported, proceed to next candidate
      console.warn(`Model ${modelToTry} attempt failed, trying fallback:`, msg.slice(0, 100));
      continue;
    }
  }

  if (!rawResponseText) {
    if (lastError) {
      if (lastError.name === 'AbortError') {
        throw new AiServiceError('AI plan generation request timed out after 35 seconds.', 504, 'TIMEOUT');
      }
      const msg = lastError.message || String(lastError);
      if (msg.includes('API_KEY_INVALID') || msg.includes('401')) {
        throw new AiServiceError('Invalid Gemini API Key provided. Please verify GEMINI_API_KEY.', 401, 'INVALID_API_KEY');
      }
      if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
        throw new AiServiceError('Gemini API quota exceeded or rate limit reached. Please wait a moment or switch to Demo Mode.', 429, 'RATE_LIMIT_EXCEEDED');
      }
      throw new AiServiceError(`Gemini model generation failed: ${msg.slice(0, 150)}`, 502, 'GENERATION_FAILED');
    }
    throw new AiServiceError('Received empty response from Gemini model', 502, 'EMPTY_RESPONSE');
  }

  try {
    // Clean potential markdown fences & extract JSON boundary
    let cleanedJson = rawResponseText.trim();
    if (cleanedJson.startsWith('```json')) {
      cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const firstBrace = cleanedJson.indexOf('{');
    const lastBrace = cleanedJson.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(cleanedJson);
    } catch (parseErr) {
      console.error('JSON parsing error from model output:', cleanedJson.slice(0, 300));
      throw new AiServiceError(
        'Gemini returned malformed JSON. Please retry your generation request.',
        502,
        'MALFORMED_JSON'
      );
    }

    // Normalize potential minor deviations
    if (parsedData && typeof parsedData === 'object') {
      if (!parsedData.eventTitle) {
        parsedData.eventTitle = requirements.title;
      }
      if (Array.isArray(parsedData.budgetItems)) {
        parsedData.budgetItems = parsedData.budgetItems.map((b: any, i: number) => ({
          id: b.id || `budget-${i + 1}`,
          category: b.category || `Category ${i + 1}`,
          estimatedAmount: Math.max(0, Number(b.estimatedAmount) || 0),
          actualAmount: Math.max(0, Number(b.actualAmount) || 0),
          notes: b.notes || '',
          isCustom: Boolean(b.isCustom),
        }));
      }
      if (Array.isArray(parsedData.timeline)) {
        parsedData.timeline = parsedData.timeline.map((t: any, i: number) => ({
          id: t.id || `task-${i + 1}`,
          title: t.title || `Task ${i + 1}`,
          category: t.category || 'General',
          phase: t.phase || 'Week of event',
          dueDate: /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate) ? t.dueDate : requirements.eventDate,
          completed: Boolean(t.completed),
          priority: ['low', 'medium', 'high', 'critical'].includes(t.priority) ? t.priority : 'medium',
          notes: t.notes || '',
        }));
      }
      if (Array.isArray(parsedData.vendorCategories)) {
        parsedData.vendorCategories = parsedData.vendorCategories.map((v: any, i: number) => ({
          id: v.id || `vendor-${i + 1}`,
          category: v.category || `Vendor ${i + 1}`,
          status: ['research', 'shortlisted', 'contacted', 'booked'].includes(v.status) ? v.status : 'research',
          vendorName: v.vendorName || '',
          contactPerson: v.contactPerson || '',
          phone: v.phone || '',
          email: v.email || '',
          estimatedBudget: Math.max(0, Number(v.estimatedBudget) || 0),
          actualCost: Math.max(0, Number(v.actualCost) || 0),
          notes: v.notes || '',
          questionsToAsk: Array.isArray(v.questionsToAsk) ? v.questionsToAsk : [],
        }));
      }
      parsedData.isDemoPlan = false;
      parsedData.generatedAt = new Date().toISOString();
      parsedData.modelUsed = successfulModel;
    }

    // Validate using Zod schema
    const validationResult = generatedPlanSchema.safeParse(parsedData);
    if (!validationResult.success) {
      console.error('Schema validation failed for model output:', validationResult.error.format());
      throw new AiServiceError(
        'AI output did not strictly conform to expected event structure. Please retry.',
        502,
        'SCHEMA_VALIDATION_FAILED'
      );
    }

    return validationResult.data;
  } catch (error: any) {
    if (error instanceof AiServiceError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new AiServiceError('AI plan generation request timed out after 35 seconds.', 504, 'TIMEOUT');
    }

    const message = error.message || String(error);

    if (message.includes('API_KEY_INVALID') || message.includes('401')) {
      throw new AiServiceError(
        'Invalid Gemini API Key provided. Please verify GEMINI_API_KEY.',
        401,
        'INVALID_API_KEY'
      );
    }

    if (message.includes('RESOURCE_EXHAUSTED') || message.includes('429')) {
      throw new AiServiceError(
        'Gemini API quota exceeded or rate limit reached. Please wait a moment or switch to Demo Mode.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    console.error('Unexpected error during Gemini generation:', error);
    throw new AiServiceError(
      `AI generation service encountered an issue: ${message.slice(0, 150)}`,
      500,
      'GENERATION_FAILED'
    );
  }
}

/**
 * Validates a Gemini API Key live and identifies a functional model identifier.
 */
export async function testGeminiApiKey(
  apiKey: string,
  preferredModel: string = 'gemini-2.5-flash'
): Promise<{ success: boolean; model: string; message: string }> {
  if (!apiKey || apiKey.trim().length < 8) {
    throw new AiServiceError('Please provide a valid Gemini API Key string.', 400, 'KEY_TOO_SHORT');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  const candidateModels = [
    preferredModel,
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-flash',
  ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i);

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: 'Ping test for API verification. Reply with strictly: {"status":"ok"}',
      });

      if (response && response.text) {
        return {
          success: true,
          model,
          message: `Successfully connected to Google Gemini using ${model}!`,
        };
      }
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes('API_KEY_INVALID') || msg.includes('401') || msg.includes('forbidden')) {
        throw new AiServiceError('The provided Gemini API Key is invalid or rejected by Google.', 401, 'INVALID_API_KEY');
      }
      if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
        throw new AiServiceError('API Key is valid but Google Gemini quota is currently exhausted (429).', 429, 'RATE_LIMIT_EXCEEDED');
      }
      // If 404 model not found, try the next model candidate
      continue;
    }
  }

  throw new AiServiceError('Could not connect with candidate Gemini models. Please check your key permissions.', 502, 'CONNECTION_FAILED');
}
