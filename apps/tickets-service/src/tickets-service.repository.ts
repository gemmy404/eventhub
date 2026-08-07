import {Injectable} from '@nestjs/common';
import {PrismaService} from "@app/database";
import {Ticket, TicketStatus} from "@prisma/client";

@Injectable()
export class TicketsServiceRepository {

    constructor(
        private readonly prisma: PrismaService,
    ) {
    }

    async findAllTickets(query: {}, take: number, skip: number) {
        const [tickets, totalElements] = await Promise.all([
            this.prisma.ticket.findMany({
                where: query,
                take,
                skip,
                include: {
                    event: {
                        select: {
                            title: true,
                            description: true,
                            date: true,
                            location: true,
                        }
                    }
                },
                orderBy: {
                    purchasedAt: 'desc'
                }
            }),
            this.prisma.ticket.count({where: query}),
        ]);

        return {tickets, totalElements};
    }

    async findEventTickets(eventId: string, take: number, skip: number) {
        const [tickets, totalElements] = await Promise.all([
            this.prisma.ticket.findMany({
                where: {eventId},
                take,
                skip,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        }
                    }
                },
                orderBy: {
                    purchasedAt: 'desc'
                }
            }),
            this.prisma.ticket.count({where: {eventId}}),
        ]);

        return {tickets, totalElements};
    }

    async findTicketById(id: string) {
        return this.prisma.ticket.findUnique({
            where: {id},
            include: {
                event: {
                    select: {
                        title: true,
                        description: true,
                        date: true,
                        location: true,
                    }
                }
            },
        });
    }

    async findTicketByCode(ticketCode: string) {
        return this.prisma.ticket.findUnique({
            where: {ticketCode},
            include: {
                event: {
                    select: {
                        title: true,
                        description: true,
                        date: true,
                        location: true,
                        organizerId: true,
                    }
                }
            },
        });
    }

    async createTicket(ticket: Ticket) {
        return this.prisma.ticket.create({
            data: ticket,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            }
        });
    }

    async countSoldTickets(eventId: string): Promise<number> {
        const result = await this.prisma.ticket.aggregate({
                where: {
                    eventId,
                    status: TicketStatus.CONFIRMED
                },
                _sum: {
                    quantity: true
                },
            },
        );

        return result._sum.quantity ?? 0;
    }

    async updateTicket(id: string, ticket: Ticket) {
        return this.prisma.ticket.update({
            where: {id},
            data: ticket,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                event: {
                    select: {
                        title: true,
                    }
                }
            }
        });
    }

}
