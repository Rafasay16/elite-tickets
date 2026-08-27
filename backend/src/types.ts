/**
 * Tipos explícitos para eliminar `any` dos services.
 * Cada interface corresponde ao payload esperado por um método de service.
 */

// ─── Auth ────────────────────────────────────────────────────────
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  city: string;
}

// ─── JWT Payload (sessão de autenticação) ────────────────────────
export interface JwtAuthPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  city?: string;
}

// ─── Checkout ────────────────────────────────────────────────────
export interface ReserveInput {
  eventId: string;
  seatId: string;
}

export interface ConfirmInput {
  reservationId: string;
}

export interface ValidateTicketInput {
  qrCode: string;
  eventId: string;
}

// ─── Event ───────────────────────────────────────────────────────
export interface CreateEventInput {
  externalId?: string;
  title: string;
  description?: string;
  category?: string;
  posterUrl?: string;
  backdropUrl?: string;
  date: string;
  location: string;
  city?: string;
  price: number | string;
  capacity: number | string;
  maxTicketsPerUser: number | string;
}

export interface UpdateEventInput {
  id: string;
  status?: string;
  title?: string;
  description?: string;
  category?: string;
  date?: string;
  location?: string;
  price?: number | string;
}

export interface IssueCortesiaInput {
  eventId: string;
  seatId: string;
  guestName?: string;
  guestEmail?: string;
}

// ─── Admin ───────────────────────────────────────────────────────
export interface CreateOrganizerInput {
  name: string;
  email: string;
  password: string;
  cpf: string;
  cnpj?: string;
  responsavel: string;
}

export interface UpdatePasswordInput {
  password: string;
}

export interface UpdateStatusInput {
  isActive: boolean;
}

export interface UpdateLimitsInput {
  feeRate?: number | string;
  eventLimit?: number | string;
}

// ─── User ────────────────────────────────────────────────────────
export interface UpdateProfileInput {
  name?: string;
  email?: string;
  city?: string;
  phone?: string;
  photoUrl?: string;
  preferences?: string;
  paymentMock?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface CreatePorteiroInput {
  name: string;
  email: string;
  password: string;
}
