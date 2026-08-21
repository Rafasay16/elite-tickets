import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../models/prisma';
import QRCode from 'qrcode';

export class EventController {
  static async listAll(req: AuthRequest, res: Response) {
    try {
      const { city } = req.query;
      const whereClause: any = { status: 'PUBLISHED' };

      if (city && city !== 'Todo o Brasil') {
        whereClause.city = city as string;
      }

      const events = await prisma.event.findMany({
        where: whereClause,
        orderBy: { date: 'asc' }
      });
      return res.json(events);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getOne(req: AuthRequest, res: Response) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: req.params.id },
        include: { seats: true, organizer: true }
      });
      if (!event) return res.status(404).json({ error: 'Evento não encontrado' });
      return res.json(event);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async listMyEvents(req: AuthRequest, res: Response) {
    try {
      const events = await prisma.event.findMany({
        where: { organizerId: req.user.id },
        orderBy: { date: 'asc' }
      });
      return res.json({ events });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const data = req.body;
      const organizador = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { events: true }
      });

      if (!organizador) return res.status(401).json({ error: 'Organizador não encontrado' });

      if (organizador.events.length >= organizador.eventLimit) {
        return res.status(403).json({ error: `Limite atingido (${organizador.eventLimit} eventos).` });
      }

      const event = await prisma.event.create({
        data: {
          externalId: data.externalId,
          title: data.title,
          description: data.description,
          category: data.category,
          posterUrl: data.posterUrl,
          backdropUrl: data.backdropUrl,
          date: new Date(data.date),
          location: data.location,
          city: data.city || 'São Paulo',
          price: parseFloat(data.price),
          capacity: parseInt(data.capacity),
          maxTicketsPerUser: parseInt(data.maxTicketsPerUser),
          organizerId: organizador.id
        }
      });

      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const seatsPerRow = Math.ceil(data.capacity / rows.length);
      let created = 0;

      for (const row of rows) {
        for (let i = 1; i <= seatsPerRow; i++) {
          if (created >= data.capacity) break;
          await prisma.seat.create({
            data: { eventId: event.id, row, number: i, status: 'AVAILABLE' }
          });
          created++;
        }
        if (created >= data.capacity) break;
      }

      return res.json({ success: true, event });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id, status, title, description, category, date, location, price } = req.body;

      const existingEvent = await prisma.event.findUnique({ where: { id } });
      if (!existingEvent || existingEvent.organizerId !== req.user.id) {
        return res.status(404).json({ error: 'Evento não encontrado ou acesso negado' });
      }

      const updatedData: any = {};
      if (status) updatedData.status = status;
      if (title) updatedData.title = title;
      if (description !== undefined) updatedData.description = description;
      if (category) updatedData.category = category;
      if (date) updatedData.date = new Date(date);
      if (location) updatedData.location = location;
      if (price !== undefined) updatedData.price = parseFloat(price);

      const updatedEvent = await prisma.event.update({
        where: { id },
        data: updatedData
      });

      return res.json({ success: true, event: updatedEvent });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getCortesiaSeats(req: AuthRequest, res: Response) {
    try {
      const eventId = req.query.eventId as string;
      if (!eventId) return res.status(400).json({ error: 'eventId é obrigatório' });

      const seats = await prisma.seat.findMany({
        where: { eventId },
        orderBy: [{ row: 'asc' }, { number: 'asc' }]
      });
      return res.json({ seats });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async issueCortesia(req: AuthRequest, res: Response) {
    try {
      const { eventId, seatId, guestName, guestEmail } = req.body;
      if (!eventId || !seatId) return res.status(400).json({ error: 'Evento e Assento são obrigatórios' });

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event || event.organizerId !== req.user.id) {
        return res.status(404).json({ error: 'Evento não encontrado ou acesso negado' });
      }

      const seat = await prisma.seat.findUnique({ where: { id: seatId } });
      if (!seat || seat.status !== 'AVAILABLE') return res.status(400).json({ error: 'Assento indisponível' });

      await prisma.seat.update({ where: { id: seatId }, data: { status: 'CORTESIA' } });

      const qrData = JSON.stringify({ eventId, seatId, guestName, cortesia: true, timestamp: Date.now() });
      const qrCodeUrl = await QRCode.toDataURL(qrData);

      const reservation = await prisma.reservation.create({
        data: {
          userId: req.user.id,
          eventId,
          seatId,
          status: 'PAID',
          qrCodeUrl
        }
      });

      return res.json({ success: true, reservation });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
