import { describe, it, expect, afterAll } from 'vitest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/models/prisma';
import { AuthService } from '../src/services/AuthService';
import { CheckoutService } from '../src/services/CheckoutService';
import { config } from '../src/config';

describe('Auth & Secret Separation Tests', () => {
  const createdUserEmails: string[] = [];

  afterAll(async () => {
    if (createdUserEmails.length > 0) {
      await prisma.user.deleteMany({
        where: { email: { in: createdUserEmails } },
      });
    }
  });

  it('1. Deve registrar um novo usuário e autenticar com sucesso gerando token válido', async () => {
    const email = `novo-usuario-${Date.now()}@test.com`;
    createdUserEmails.push(email);

    const registerResult = await AuthService.register({
      name: 'Maria Oliveira',
      email,
      password: 'senhaSegura123',
      city: 'São Paulo',
    });

    expect(registerResult.token).toBeDefined();
    expect(registerResult.role).toBe('CLIENT');

    // Decodifica o token usando a chave de autenticação
    const decoded: any = jwt.verify(registerResult.token, config.jwtAuthSecret);
    expect(decoded.email).toBe(email);
    expect(decoded.name).toBe('Maria Oliveira');

    // Login com as mesmas credenciais
    const loginResult = await AuthService.login({
      email,
      password: 'senhaSegura123',
    });

    expect(loginResult.token).toBeDefined();
  });

  it('2. Deve separar estritamente os segredos: Token de autenticação não pode validar ingresso', async () => {
    const authSessionToken = jwt.sign(
      { id: 'fake-user-id', email: 'fake@test.com', role: 'CLIENT' },
      config.jwtAuthSecret
    );

    // Tenta usar um token de sessão de login como se fosse um QR Code de ingresso
    await expect(
      CheckoutService.validateTicket(
        { qrCode: authSessionToken, eventId: 'any-event-id' },
        'any-staff-id'
      )
    ).rejects.toThrow('QR Code inválido ou adulterado');
  });

  it('3. Deve rejeitar credenciais incorretas', async () => {
    const email = `cliente-login-${Date.now()}@test.com`;
    createdUserEmails.push(email);

    await AuthService.register({
      name: 'Login Test',
      email,
      password: 'correctPassword',
      city: 'Rio de Janeiro',
    });

    await expect(
      AuthService.login({
        email,
        password: 'wrongPassword',
      })
    ).rejects.toThrow('Credenciais inválidas');
  });
});
