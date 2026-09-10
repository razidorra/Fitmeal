import { Router } from 'express';
import { z } from 'zod';
import { trimmedText } from '../../shared/validation.js';
import { isContactEmailConfigured, sendContactEmail } from './contact.service.js';

export const contactRouter = Router();

const contactEmailSchema = z.object({
  senderName: trimmedText(2, 60),
  senderEmail: z.string().trim().email().max(254),
  topic: trimmedText(2, 80),
  message: trimmedText(1, 1500),
}).strict();

contactRouter.post('/', async (req, res, next) => {
  try {
    if (!isContactEmailConfigured()) {
      res.status(503).json({ message: 'Email delivery is temporarily unavailable.' });
      return;
    }

    const contact = contactEmailSchema.parse(req.body);
    await sendContactEmail(contact);
    res.status(202).json({ message: 'Your message was sent to FitMeal.' });
  } catch (error) {
    next(error);
  }
});
