import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EventService } from '../services/EventService';

export class EventController {
  static async listAll(req: AuthRequest, res: Response) {
    try {
      const { city, search } = req.query;
      const events = await EventService.listAll(city as string, search as string);
      return res.json(events);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getOne(req: AuthRequest, res: Response) {
    try {
      const event = await EventService.getOne(req.params.id as string);
      return res.json(event);
    } catch (error: any) {
      if (error.message === 'Evento não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async listMyEvents(req: AuthRequest, res: Response) {
    try {
      const events = await EventService.listMyEvents(req.user!.id);
      return res.json({ events });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const event = await EventService.create(req.body, req.user!.id);
      return res.json({ success: true, event });
    } catch (error: any) {
      if (error.message === 'Organizador não encontrado') {
        return res.status(401).json({ error: error.message });
      }
      if (error.message.startsWith('Limite atingido')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const event = await EventService.updateStatus(req.body.id, req.body, req.user!.id);
      return res.json({ success: true, event });
    } catch (error: any) {
      if (error.message === 'Evento não encontrado ou acesso negado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async getCortesiaSeats(req: AuthRequest, res: Response) {
    try {
      const seats = await EventService.getCortesiaSeats(req.query.eventId as string);
      return res.json({ seats });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async issueCortesia(req: AuthRequest, res: Response) {
    try {
      const reservation = await EventService.issueCortesia(req.body, req.user!.id);
      return res.json({ success: true, reservation });
    } catch (error: any) {
      if (error.message === 'Evento não encontrado ou acesso negado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
  }
}
