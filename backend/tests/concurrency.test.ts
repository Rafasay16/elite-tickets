import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/models/prisma';
import { CheckoutService } from '../src/services/CheckoutService';

describe('Concurrency & Uniqueness Guarantees', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let organizer: any;
  let event: any;

  beforeAll(async () => {
    user1 = await prisma.user.create({
      data: { name: 'Comprador 1', email: `user1-${Date.now()}@test.com`, role: 'CLIENT' },
    });
    user2 = await prisma.user.create({
      data: { name: 'Comprador 2', email: `user2-${Date.now()}@test.com`, role: 'CLIENT' },
    });
    user3 = await prisma.user.create({
      data: { name: 'Comprador 3', email: `user3-${Date.now()}@test.com`, role: 'CLIENT' },
    });
    organizer = await prisma.user.create({
      data: { name: 'Org Concorrencia', email: `org-${Date.now()}@test.com`, role: 'ORGANIZER' },
    });
    event = await prisma.event.create({
      data: {
        title: 'Festival de Teste de Concorrência',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'Espaço Concorrência',
        priceInCents: 7500,
        capacity: 20,
        organizerId: organizer.id,
      },
    });
  });

  afterAll(async () => {
    if (event) {
      await prisma.reservation.deleteMany({ where: { eventId: event.id } });
      await prisma.seat.deleteMany({ where: { eventId: event.id } });
      await prisma.event.deleteMany({ where: { id: event.id } });
    }
    await prisma.user.deleteMany({
      where: { id: { in: [user1.id, user2.id, user3.id, organizer.id] } },
    });
  });

  it('1. Deve impedir Double-Booking: 3 requisições concorrentes para o mesmo assento -> exatamente 1 tem sucesso', async () => {
    const seat = await prisma.seat.create({
      data: {
        eventId: event.id,
        row: 'C',
        number: 10,
        status: 'AVAILABLE',
      },
    });

    // 3 usuários tentam reservar o exato mesmo assento em paralelo (Promise.allSettled)
    const results = await Promise.allSettled([
      CheckoutService.reserve({ eventId: event.id, seatId: seat.id }, user1.id),
      CheckoutService.reserve({ eventId: event.id, seatId: seat.id }, user2.id),
      CheckoutService.reserve({ eventId: event.id, seatId: seat.id }, user3.id),
    ]);

    const successes = results.filter((r) => r.status === 'fulfilled');
    const failures = results.filter((r) => r.status === 'rejected');

    // Exatamente 1 deve ter sucesso
    expect(successes.length).toBe(1);
    // As outras 2 devem falhar com erro de assento indisponível
    expect(failures.length).toBe(2);

    failures.forEach((f: any) => {
      expect(f.reason.message).toContain('Assento indisponível');
    });

    // O status do assento no banco deve ser RESERVED
    const updatedSeat = await prisma.seat.findUnique({ where: { id: seat.id } });
    expect(updatedSeat?.status).toBe('RESERVED');
  });

  it('2. Deve impedir Double-Scan: 2 validações concorrentes do mesmo ingresso -> exatamente 1 liberada, 1 rejeitada com JÁ UTILIZADO', async () => {
    const seat = await prisma.seat.create({
      data: {
        eventId: event.id,
        row: 'D',
        number: 5,
        status: 'AVAILABLE',
      },
    });

    const reservation = await CheckoutService.reserve(
      { eventId: event.id, seatId: seat.id },
      user1.id
    );

    await CheckoutService.confirm({ reservationId: reservation.id }, user1.id);

    const ticket = await prisma.ticket.findUnique({
      where: { reservationId: reservation.id },
    });

    // Dois porteiros escaneiam o mesmo QR Code simultaneamente
    const scanResults = await Promise.allSettled([
      CheckoutService.validateTicket(
        { qrCode: ticket!.qrCodeData, eventId: event.id },
        organizer.id
      ),
      CheckoutService.validateTicket(
        { qrCode: ticket!.qrCodeData, eventId: event.id },
        organizer.id
      ),
    ]);

    const scanSuccesses = scanResults.filter((r) => r.status === 'fulfilled');
    const scanFailures = scanResults.filter((r) => r.status === 'rejected');

    expect(scanSuccesses.length).toBe(1);
    expect(scanFailures.length).toBe(1);

    scanFailures.forEach((f: any) => {
      expect(f.reason.message).toBe('JÁ UTILIZADO');
    });
  });
});
