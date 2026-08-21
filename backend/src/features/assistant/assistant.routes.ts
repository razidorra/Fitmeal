import { Router } from 'express';
import { z } from 'zod';
import { askGemini, GeminiError } from '../../shared/gemini.js';

const chatSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).max(20).optional(),
});

const systemPrompt = 'You are FitMeal AI, a friendly nutrition and meal-planning assistant embedded in the FitMeal app. '
  + 'Give practical, general guidance on meals, recipes, calories and macros, based on common nutrition knowledge. Keep replies short and conversational (a few sentences). '
  + 'You are not a doctor or registered dietitian: never diagnose conditions, prescribe treatment, or give individualised medical advice — if asked about a health condition, medication, or anything requiring personal medical care, recommend the person speak with a qualified professional instead.';

export const assistantRouter = Router();

assistantRouter.post('/chat', async (req, res, next) => {
  try {
    const { message, history } = chatSchema.parse(req.body);

    // Gemini uses "model" instead of "assistant" for the AI's turns.
    const contents = [
      ...(history ?? []).map((entry) => ({ role: entry.role === 'assistant' ? ('model' as const) : ('user' as const), parts: [{ text: entry.content }] })),
      { role: 'user' as const, parts: [{ text: message }] },
    ];

    const reply = await askGemini(systemPrompt, contents);
    res.json({ reply: reply || "Sorry, I couldn't come up with a reply just now." });
  } catch (error) {
    if (error instanceof GeminiError) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    next(error);
  }
});
