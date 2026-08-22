import { z } from 'zod';

export const authSchema = {
  login: z.object({
    body: z.object({
      email: z.string().email('E-mail inválido'),
      password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres')
    })
  }),
  register: z.object({
    body: z.object({
      name: z.string().min(2, 'O nome é obrigatório'),
      email: z.string().email('E-mail inválido'),
      password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
      city: z.string().min(2, 'A cidade é obrigatória')
    })
  })
};
