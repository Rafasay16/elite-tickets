import { fetchApi } from '../lib/api';

export class CheckoutService {
  static async reserve(eventId: string, seatId: string) {
    const res = await fetchApi('/checkout', {
      method: 'POST',
      body: JSON.stringify({ eventId, seatId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao reservar assento');
    return data.reservation;
  }

  static async confirm(reservationId: string) {
    const res = await fetchApi('/checkout/confirm', {
      method: 'POST',
      body: JSON.stringify({ reservationId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao confirmar pagamento');
    return data;
  }

  static async deleteTicket(reservationId: string) {
    const res = await fetchApi(`/users/reservations/${reservationId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao excluir ingresso');
    return data;
  }
}
