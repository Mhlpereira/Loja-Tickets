import { Router } from "express";
import { TicketService } from "../service/ticket-service";
import { PartnerService } from "../service/partner-service";


export const ticketRoutes = Router();

ticketRoutes.post('/:eventId/tickets', async (req, res) => {
    const userId = req.user!.id; // ! usado para indicar que o valor não é nulo
    const partnerService = new PartnerService();
    const partner = await partnerService.findUserById(userId);
    if (!partner) {
        res.status(403).json({ message: 'Not Authorized!' })
        return;
    }

    const { num_tickets, price } = req.body;
    const { eventId } = req.params;
    const ticketService = new TicketService();
    await ticketService.createMany({
        eventId: +eventId,
        numTickets: num_tickets,
        price
    })
    res.status(204).send()
})