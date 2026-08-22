import { z } from 'zod';

export const eventSchema = {
  create: z.object({
    body: z.object({
      externalId: z.string().optional(),
      title: z.string().min(2, 'Título é obrigatório'),
      description: z.string().optional(),
      category: z.string().optional(),
      posterUrl: z.string().url('URL do pôster inválida').optional(),
      backdropUrl: z.string().url('URL do backdrop inválida').optional(),
      date: z.string().datetime({ message: 'Data inválida. Use o formato ISO.' }),
      location: z.string().min(2, 'Localização é obrigatória'),
      city: z.string().optional(),
      price: z.number().or(z.string().transform(Number)),
      capacity: z.number().int().or(z.string().transform(Number)),
      maxTicketsPerUser: z.number().int().or(z.string().transform(Number))
    })
  }),
  updateStatus: z.object({
    body: z.object({
      id: z.string().uuid('ID inválido'),
      status: z.enum(['PUBLISHED', 'DRAFT', 'CANCELLED', 'PAUSED']).optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      date: z.string().datetime().optional(),
      location: z.string().optional(),
      price: z.number().or(z.string().transform(Number)).optional()
    })
  }),
  getCortesiaSeats: z.object({
    query: z.object({
      eventId: z.string().uuid('ID do evento inválido')
    })
  }),
  issueCortesia: z.object({
    body: z.object({
      eventId: z.string().uuid('ID do evento inválido'),
      seatId: z.string().uuid('ID do assento inválido'),
      guestName: z.string().optional(),
      guestEmail: z.string().email('E-mail inválido').optional()
    })
  })
};
