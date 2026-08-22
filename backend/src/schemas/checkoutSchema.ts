import { z } from 'zod';

export const checkoutSchema = {
  reserve: z.object({
    body: z.object({
      eventId: z.string().uuid('ID do evento inválido'),
      seatId: z.string().uuid('ID do assento inválido')
    })
  }),
  confirm: z.object({
    body: z.object({
      reservationId: z.string().uuid('ID da reserva inválido')
    })
  }),
  validateTicket: z.object({
    body: z.object({
      qrCode: z.string().min(1, 'QR Code é obrigatório'),
      eventId: z.string().uuid('ID do evento inválido')
    })
  })
};
