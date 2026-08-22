import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AdminService } from '../services/AdminService';

export class AdminController {
  static async listOrganizers(req: AuthRequest, res: Response) {
    try {
      const organizers = await AdminService.listOrganizers();
      return res.json({ organizers });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async createOrganizer(req: AuthRequest, res: Response) {
    try {
      const organizer = await AdminService.createOrganizer(req.body);
      return res.json({ success: true, organizer });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updatePassword(req: AuthRequest, res: Response) {
    try {
      await AdminService.updatePassword(req.params.id as string, req.body);
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const organizer = await AdminService.updateStatus(req.params.id as string, req.body);
      return res.json({ success: true, organizer });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateLimits(req: AuthRequest, res: Response) {
    try {
      const organizer = await AdminService.updateLimits(req.params.id as string, req.body);
      return res.json({ success: true, organizer });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
