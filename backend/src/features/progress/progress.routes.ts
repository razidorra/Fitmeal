import { Router } from 'express';
import { z } from 'zod';
import { Checkin } from './checkin.model.js';
export const progressRouter = Router();
progressRouter.get('/:profileId', async (req, res) => res.json(await Checkin.find({ profileId: req.params.profileId }).sort({ date: 1 })));
progressRouter.post('/', async (req, res) => res.status(201).json(await Checkin.create(z.object({ profileId: z.string(), weightKg: z.number().min(30).max(350), note: z.string().max(300).optional() }).parse(req.body))));
