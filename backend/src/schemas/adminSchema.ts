import { z } from 'zod';

export const adminSchema = {
  createOrganizer: z.object({
    body: z.object({
      name: z.string().min(2, 'O nome é obrigatório'),
      email: z.string().email('E-mail inválido'),
      password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
      cpf: z.string().min(11, 'CPF inválido'),
      cnpj: z.string().optional(),
      responsavel: z.string().min(2, 'Responsável é obrigatório')
    })
  }),
  updatePassword: z.object({
    params: z.object({
      id: z.string().uuid('ID inválido')
    }),
    body: z.object({
      password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres')
    })
  }),
  updateStatus: z.object({
    params: z.object({
      id: z.string().uuid('ID inválido')
    }),
    body: z.object({
      isActive: z.boolean()
    })
  }),
  updateLimits: z.object({
    params: z.object({
      id: z.string().uuid('ID inválido')
    }),
    body: z.object({
      feeRate: z.number().or(z.string().transform(Number)).optional(),
      eventLimit: z.number().int().or(z.string().transform(Number)).optional()
    })
  })
};
