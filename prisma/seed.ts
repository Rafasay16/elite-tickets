import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.reservation.deleteMany()
  await prisma.seat.deleteMany()
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()

  const organizador = await prisma.user.create({
    data: { name: 'João Organizador', email: 'organizador@elite.com', role: 'ORGANIZER' }
  })

  const cliente1 = await prisma.user.create({
    data: { name: 'Maria Cliente', email: 'maria@cliente.com', role: 'CLIENT' }
  })

  const cliente2 = await prisma.user.create({
    data: { name: 'Pedro Cliente', email: 'pedro@cliente.com', role: 'CLIENT' }
  })

  const portaria = await prisma.user.create({
    data: { name: 'Carlos Portaria', email: 'portaria@elite.com', role: 'PORTARIA' }
  })

  const event1 = await prisma.event.create({
    data: {
      externalId: '101',
      title: 'Duna: Parte Dois',
      posterUrl: '/1pdfLvkbY9ohJlCjQH2JGjjcNsV.jpg',
      backdropUrl: '/8rpDcsfLJypbO6vtec0fsZbbLge.jpg',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      location: 'Cine Araújo - Sala VIP 1',
      price: 45.00,
      capacity: 50,
      organizerId: organizador.id
    }
  })

  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 10;
  for (const row of rows) {
    for (let i = 1; i <= seatsPerRow; i++) {
      await prisma.seat.create({
        data: {
          eventId: event1.id,
          row: row,
          number: i,
          status: 'AVAILABLE'
        }
      })
    }
  }

  const assentoA1 = await prisma.seat.findFirst({ where: { eventId: event1.id, row: 'A', number: 1 } })
  if (assentoA1) {
    await prisma.seat.update({ where: { id: assentoA1.id }, data: { status: 'SOLD' } })
    await prisma.reservation.create({
      data: {
        eventId: event1.id,
        userId: cliente1.id,
        seatId: assentoA1.id,
        status: 'PAID', // Pago e pronto para uso
        qrCode: 'valid-qr-code-maria' // Fixado para facilitar teste na portaria
      }
    })
  }

  console.log('Seed executado com sucesso! Dados iniciais criados.')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
