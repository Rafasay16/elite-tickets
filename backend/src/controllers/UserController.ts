import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserService } from '../services/UserService';

export class UserController {
  static async getMyTickets(req: AuthRequest, res: Response) {
    try {
      const ingressos = await UserService.getMyTickets(req.user.id);
      return res.json({ ingressos });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteReservation(req: AuthRequest, res: Response) {
    try {
      await UserService.deleteReservation(req.params.id as string, req.user.id);
      return res.json({ success: true });
    } catch (error: any) {
      if (error.message === 'Acesso negado') {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const profile = await UserService.getProfile(req.user.id);
      return res.json({ profile });
    } catch (error: any) {
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const profile = await UserService.updateProfile(req.body, req.user.id);
      return res.json({ success: true, profile });
    } catch (error: any) {
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Senha atual incorreta' || error.message === 'Você não tem uma senha definida para atualizar') {
        return res.status(401).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async createPorteiro(req: AuthRequest, res: Response) {
    try {
      const porteiro = await UserService.createPorteiro(req.body, req.user.id);
      return res.json({ success: true, porteiro });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getPorteiros(req: AuthRequest, res: Response) {
    try {
      const porteiros = await UserService.getPorteiros(req.user.id);
      return res.json(porteiros);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deletePorteiro(req: AuthRequest, res: Response) {
    try {
      await UserService.deletePorteiro(req.params.id as string, req.user.id);
      return res.json({ success: true });
    } catch (error: any) {
      if (error.message === 'Você não tem permissão para excluir este usuário.') {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async resetPorteiroPassword(req: AuthRequest, res: Response) {
    try {
      const { password } = req.body;
      if (!password) return res.status(400).json({ error: 'A nova senha é obrigatória.' });
      
      await UserService.resetPorteiroPassword(req.params.id as string, password, req.user.id);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(403).json({ error: error.message });
    }
  }

  static async getPorteiroLogs(req: AuthRequest, res: Response) {
    try {
      const logs = await UserService.getPorteiroLogs(req.params.id as string, req.user.id);
      return res.json(logs);
    } catch (error: any) {
      return res.status(403).json({ error: error.message });
    }
  }
}
