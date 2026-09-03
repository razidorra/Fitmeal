import { Router } from 'express';
import { z } from 'zod';
import { askGroq, GroqError } from '../../shared/groq.js';
import { requireUserId } from '../../shared/auth.js';
import { getFallbackAssistantReply } from './assistant.service.js';
import { trimmedText } from '../../shared/validation.js';

const chatSchema = z.object({
  message: trimmedText(1, 1000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: trimmedText(1, 2000),
  }).strict()).max(20).optional(),
}).strict();

const systemPrompt = 'You are FitMeal AI, a friendly nutrition and meal-planning assistant embedded in the FitMeal app. '
  + 'Give practical, general guidance on meals, recipes, calories and macros, based on common nutrition knowledge. Keep replies short and conversational (a few sentences). '
  + 'You are not a doctor or registered dietitian: never diagnose conditions, prescribe treatment, or give individualised medical advice — if asked about a health condition, medication, or anything requiring personal medical care, recommend the person speak with a qualified professional instead.';

export const assistantRouter = Router();

assistantRouter.post('/chat', async (req, res, next) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { message, history } = chatSchema.parse(req.body);

    const messages = [
      ...(history ?? []).map((entry) => ({ role: entry.role, content: entry.content })),
      { role: 'user' as const, content: message },
    ];

    const reply = await askGroq(systemPrompt, messages);
    res.json({ reply: reply || "Sorry, I couldn't come up with a reply just now." });
  } catch (error) {
    if (error instanceof GroqError) {
      const { message } = chatSchema.pick({ message: true }).parse(req.body);
      res.json({
        reply: getFallbackAssistantReply(message),
        isFallback: true,
        notice: 'Groq is unavailable right now, so this is FitMeal basic offline guidance.',
      });
      return;
    }
    next(error);
  }
});
