import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/models/prisma';
import { CheckoutService } from '../src/services/CheckoutService';
import { config } from '../src/config';

describe('Ticket Security & QR Code Validation', () => {
  let testUser: any;
  let testOrganizer: any;
  let testEvent: any;
  let testSeat: any;

  beforeAll(async () => {
    // Setup test users and event
    testUser = await prisma.user.create({
      data: {
        name: 'Carlos Cliente Teste',
        email: `cliente-${Date.now()}@test.com`,
        role: 'CLIENT',
      },
    });

    testOrganizer = await prisma.user.create({
      data: {
        name: 'Produtora Teste',
        email: `produtora-${Date.now()}@test.com`,
        role: 'ORGANIZER',
      },
    });

    testEvent = await prisma.event.create({
      data: {
        title: 'Show de Teste de Segurança',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: 'Arena Central',
        priceInCents: 5000,
        capacity: 10,
        organizerId: testOrganizer.id,
      },
    });

    testSeat = await prisma.seat.create({
      data: {
        eventId: testEvent.id,
        row: 'A',
        number: 1,
        status: 'AVAILABLE',
      },
    });
  });

  afterAll(async () => {
    // Clean up test data in correct referential order
    if (testEvent) {
      await prisma.reservation.deleteMany({ where: { eventId: testEvent.id } });
      await prisma.seat.deleteMany({ where: { eventId: testEvent.id } });
      await prisma.event.deleteMany({ where: { id: testEvent.id } });
    }
    if (testUser) {
      await prisma.user.deleteMany({ where: { id: { in: [testUser.id, testOrganizer.id] } } });
    }
  });

  it('1. Deve gerar ticket com payload opaco sem PII (customerName/guestName)', async () => {
    const reservation = await CheckoutService.reserve(
      { eventId: testEvent.id, seatId: testSeat.id },
      testUser.id
    );

    await CheckoutService.confirm({ reservationId: reservation.id }, testUser.id);

    const ticket = await prisma.ticket.findUnique({
      where: { reservationId: reservation.id },
    });

    expect(ticket).toBeDefined();
    expect(ticket?.qrCodeData).toBeDefined();

    // Decodifica o JWT para inspecionar o payload
    const decoded: any = jwt.verify(ticket!.qrCodeData, config.jwtTicketSecret);
    expect(decoded.reservationId).toBe(reservation.id);
    expect(decoded.customerName).toBeUndefined();
    expect(decoded.guestName).toBeUndefined();
    expect(decoded.name).toBeUndefined();
  });

  it('2. Deve rejeitar QR Code forjado com segredo incorreto ou inválido', async () => {
    const forgedToken = jwt.sign(
      { reservationId: 'random-fake-id', timestamp: Date.now() },
      'wrong-forged-secret-123'
    );

    await expect(
      CheckoutService.validateTicket(
        { qrCode: forgedToken, eventId: testEvent.id },
        testOrganizer.id
      )
    ).rejects.toThrow('QR Code inválido ou adulterado');
  });

  it('3. Deve rejeitar identificador cru ou prefixo parcial (anti-startsWith attack)', async () => {
    // Tentativa de passar UUID direto em vez de JWT assinado
    await expect(
      CheckoutService.validateTicket(
        { qrCode: 'f83a4291-8899-4c12', eventId: testEvent.id },
        testOrganizer.id
      )
    ).rejects.toThrow('QR Code inválido ou adulterado');
  });

  it('4. Deve validar com sucesso QR Code legítimo e resolver nome do cliente via DB', async () => {
    const freshSeat = await prisma.seat.create({
      data: {
        eventId: testEvent.id,
        row: 'B',
        number: 2,
        status: 'AVAILABLE',
      },
    });

    const reservation = await CheckoutService.reserve(
      { eventId: testEvent.id, seatId: freshSeat.id },
      testUser.id
    );

    await CheckoutService.confirm({ reservationId: reservation.id }, testUser.id);

    const ticket = await prisma.ticket.findUnique({
      where: { reservationId: reservation.id },
    });

    const result = await CheckoutService.validateTicket(
      { qrCode: ticket!.qrCodeData, eventId: testEvent.id },
      testOrganizer.id
    );

    expect(result.message).toBe('Acesso Liberado!');
    expect(result.customerName).toBe(testUser.name);
    expect(result.ticketId).toBe(reservation.id);
  });
});
