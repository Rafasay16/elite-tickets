import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      return res.json(result);
    } catch (error: any) {
      if (error.message === 'Email e senha são obrigatórios') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Credenciais inválidas') {
        return res.status(401).json({ error: error.message });
      }
      if (error.message === 'Conta de organizador inativa.') {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      return res.json(result);
    } catch (error: any) {
      if (error.message === 'Dados incompletos' || error.message === 'Email já cadastrado') {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}
