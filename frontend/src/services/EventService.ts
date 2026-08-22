import { fetchApi } from '../lib/api';

export class EventService {
  static async listOrganizerEvents() {
    const res = await fetchApi(`/events/organizer/my-events?_t=${Date.now()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao buscar eventos');
    return data.events || [];
  }

  static async createEvent(payload: any) {
    const res = await fetchApi('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar evento');
    return data.event;
  }

  static async toggleStatus(id: string, status: string) {
    const res = await fetchApi('/events/status', {
      method: 'PUT',
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (!res.ok) {
      const details = data.details ? JSON.stringify(data.details) : '';
      throw new Error(`${data.error || 'Erro ao atualizar status'} ${details}`);
    }
    return data.event;
  }

  static async getCortesiaSeats(eventId: string) {
    const res = await fetchApi(`/events/cortesia/seats?eventId=${eventId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao buscar assentos');
    return data.seats || [];
  }

  static async issueCortesia(eventId: string, seatId: string, guestName: string, guestEmail?: string) {
    const res = await fetchApi('/events/cortesia', {
      method: 'POST',
      body: JSON.stringify({ eventId, seatId, guestName, guestEmail }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao emitir cortesia');
    return data.reservation;
  }
}
