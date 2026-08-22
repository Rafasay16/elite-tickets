import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CheckoutService } from '../services/CheckoutService';

export class CheckoutController {
  static async reserve(req: AuthRequest, res: Response) {
    try {
      const reservation = await CheckoutService.reserve(req.body, req.user.id);
      return res.json({ success: true, reservation });
    } catch (error: any) {
      if (error.message === 'Faltam dados') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Evento não existe') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async confirm(req: AuthRequest, res: Response) {
    try {
      await CheckoutService.confirm(req.body, req.user.id);
      return res.json({ success: true });
    } catch (error: any) {
      if (error.message === 'Reserva não encontrada') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  static async validateTicket(req: AuthRequest, res: Response) {
    try {
      const details = await CheckoutService.validateTicket(req.body, req.user.id);
      return res.json({ success: true, details });
    } catch (error: any) {
      if (error.message === 'Inválido') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Faltam dados: qrCode ou eventId' || error.message === 'Evento errado' || error.message === 'JÁ UTILIZADO' || error.message === 'Ingresso não pago ou cancelado.') {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}
