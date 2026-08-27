import { z } from 'zod';

export const userSchema = {
  updateProfile: z.object({
    body: z.object({
      name: z.string().optional(),
      email: z.string().email('E-mail inválido').optional(),
      city: z.string().optional(),
      phone: z.string().optional(),
      photoUrl: z.string().url('URL inválida').optional(),
      preferences: z.string().optional(),
      currentPassword: z.string().optional(),
      newPassword: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres').optional()
    }).refine((data) => {
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    }, {
      message: 'currentPassword é obrigatório para alterar a senha',
      path: ['currentPassword']
    })
  }),
  createPorteiro: z.object({
    body: z.object({
      name: z.string().min(2, 'O nome é obrigatório'),
      email: z.string().email('E-mail inválido'),
      password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres')
    })
  })
};
