import { EventModel } from "../model/event-model";
import { TicketModel, TicketStatus } from "../model/ticket-model";

export class TicketService {


    async createMany(data: { eventId: number; numTickets: number; price: number }) {

        const event = await EventModel.findById(data.eventId)

        if (!event) {
            throw new Error('Event not found');
        }

        const ticketsData = Array(data.numTickets).fill({})
            .map((_, index) => ({
                location: `Location ${index}`,
                event_id: data.eventId,
                price: data.price,
                status: TicketStatus.available
            }));

        await TicketModel.createMany(ticketsData);
    }
}