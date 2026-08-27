import prisma from '../models/prisma';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import { TMDBService } from './TMDBService';
import { config } from '../config';
import { CreateEventInput, UpdateEventInput, IssueCortesiaInput } from '../types';
import { Prisma } from '@prisma/client';

export class EventService {
  static async listAll(city?: string, search?: string) {
    const whereClause: Prisma.EventWhereInput = { status: 'PUBLISHED' };
    if (city && city !== 'Todo o Brasil' && city !== 'Todas') {
      whereClause.city = city as string;
    }
    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      whereClause.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { category: { contains: term, mode: 'insensitive' } },
        { location: { contains: term, mode: 'insensitive' } },
      ];
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

  static async create(data: CreateEventInput, organizerId: string) {
    const organizador = await prisma.user.findUnique({
      where: { id: organizerId },
      include: { events: true }
    });

    if (!organizador) throw new Error('Organizador não encontrado');

    if (organizador.events.length >= organizador.eventLimit) {
      throw new Error(`Limite atingido (${organizador.eventLimit} eventos).`);
    }

    let rating = 'Livre'; // Padrão
    // Verifica se é um filme (não começa com SHOW) e se tem ID
    const isMovie = !data.externalId || !data.externalId.startsWith('SHOW');
    if (isMovie && data.externalId) {
      rating = await TMDBService.getMovieRating(data.externalId);
    }

    const event = await prisma.event.create({
      data: {
        externalId: data.externalId ?? null,
        title: data.title,
        description: data.description ?? null,
        category: data.category ?? null,
        posterUrl: data.posterUrl ?? null,
        backdropUrl: data.backdropUrl ?? null,
        date: new Date(data.date),
        location: data.location,
        city: data.city || 'São Paulo',
        priceInCents: Math.round(parseFloat(String(data.price)) * 100),
        capacity: Number(data.capacity),
        maxTicketsPerUser: Number(data.maxTicketsPerUser),
        organizerId: organizador.id,
        rating
      }
    });

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const capacityNum = Number(data.capacity);
    const seatsPerRow = Math.ceil(capacityNum / rows.length);
    let created = 0;
    
    let seatsData = [];

    for (const row of rows) {
      for (let i = 1; i <= seatsPerRow; i++) {
        if (created >= capacityNum) break;
        seatsData.push({
          eventId: event.id,
          row,
          number: i,
          status: 'AVAILABLE'
        });
        created++;
      }
      if (created >= capacityNum) break;
    }

    // Insert in chunks of 5000 to avoid database parameter limits
    const CHUNK_SIZE = 5000;
    for (let i = 0; i < seatsData.length; i += CHUNK_SIZE) {
      const chunk = seatsData.slice(i, i + CHUNK_SIZE);
      await prisma.seat.createMany({ data: chunk });
    }

    return event;
  }

  static async updateStatus(id: string, data: UpdateEventInput, organizerId: string) {
    const { status, title, description, category, date, location, price } = data;

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent || existingEvent.organizerId !== organizerId) {
      throw new Error('Evento não encontrado ou acesso negado');
    }

    const updatedData: Prisma.EventUpdateInput = {};
    if (status) updatedData.status = status;
    if (title) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;
    if (category) updatedData.category = category;
    if (date) updatedData.date = new Date(date);
    if (location) updatedData.location = location;
    if (price !== undefined) updatedData.priceInCents = Math.round(parseFloat(String(price)) * 100);

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

  static async issueCortesia(data: IssueCortesiaInput, organizerId: string) {
    const { eventId, seatId, guestName, guestEmail } = data;
    if (!eventId || !seatId) throw new Error('Evento e Assento são obrigatórios');

    return prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event || event.organizerId !== organizerId) {
        throw new Error('Evento não encontrado ou acesso negado');
      }

      // UPDATE atômico condicional: só muda se status = AVAILABLE
      const result = await tx.seat.updateMany({
        where: { id: seatId, status: 'AVAILABLE' },
        data: { status: 'CORTESIA' }
      });
      if (result.count === 0) throw new Error('Assento indisponível');

      const reservation = await tx.reservation.create({
        data: {
          userId: organizerId,
          eventId,
          seatId,
          status: 'PAID'
        }
      });

      const payload = { reservationId: reservation.id, eventId, seatId, cortesia: true, timestamp: Date.now() };
      const secret = config.jwtTicketSecret;
      const qrData = jwt.sign(payload, secret);
      const qrCodeUrl = await QRCode.toDataURL(qrData);

      // QR armazenado na tabela Ticket separada
      await tx.ticket.create({
        data: { reservationId: reservation.id, qrCodeData: qrData }
      });

      const updatedReservation = await tx.reservation.findUnique({
        where: { id: reservation.id },
        include: { ticket: true }
      });

      return updatedReservation;
    });
  }
}
