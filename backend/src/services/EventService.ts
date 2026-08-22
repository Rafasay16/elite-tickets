import prisma from '../models/prisma';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

export class EventService {
  static async listAll(city?: string) {
    const whereClause: any = { status: 'PUBLISHED' };
    if (city && city !== 'Todo o Brasil') {
      whereClause.city = city as string;
    }
    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: { date: 'asc' }
    });
    return events;
  }

  static async getOne(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { seats: true, organizer: true }
    });
    if (!event) throw new Error('Evento não encontrado');
    return event;
  }

  static async listMyEvents(organizerId: string) {
    const events = await prisma.event.findMany({
      where: { organizerId },
      orderBy: { date: 'asc' }
    });
    return events;
  }

  static async create(data: any, organizerId: string) {
    const organizador = await prisma.user.findUnique({
      where: { id: organizerId },
      include: { events: true }
    });

    if (!organizador) throw new Error('Organizador não encontrado');

    if (organizador.events.length >= organizador.eventLimit) {
      throw new Error(`Limite atingido (${organizador.eventLimit} eventos).`);
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

    return event;
  }

  static async updateStatus(id: string, data: any, organizerId: string) {
    const { status, title, description, category, date, location, price } = data;

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent || existingEvent.organizerId !== organizerId) {
      throw new Error('Evento não encontrado ou acesso negado');
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

    return updatedEvent;
  }

  static async getCortesiaSeats(eventId: string) {
    if (!eventId) throw new Error('eventId é obrigatório');
    const seats = await prisma.seat.findMany({
      where: { eventId },
      orderBy: [{ row: 'asc' }, { number: 'asc' }]
    });
    return seats;
  }

  static async issueCortesia(data: any, organizerId: string) {
    const { eventId, seatId, guestName, guestEmail } = data;
    if (!eventId || !seatId) throw new Error('Evento e Assento são obrigatórios');

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.organizerId !== organizerId) {
      throw new Error('Evento não encontrado ou acesso negado');
    }

    const seat = await prisma.seat.findUnique({ where: { id: seatId } });
    if (!seat || seat.status !== 'AVAILABLE') throw new Error('Assento indisponível');

    await prisma.seat.update({ where: { id: seatId }, data: { status: 'CORTESIA' } });

    const reservation = await prisma.reservation.create({
      data: {
        userId: organizerId, // Assuming organizer generates it
        eventId,
        seatId,
        status: 'PAID'
      }
    });

    const payload = { reservationId: reservation.id, eventId, seatId, guestName, cortesia: true, timestamp: Date.now() };
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-123';
    const qrData = jwt.sign(payload, secret);
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    const updatedReservation = await prisma.reservation.update({
      where: { id: reservation.id },
      data: { qrCodeUrl }
    });

    return updatedReservation;
  }
}
