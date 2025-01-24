import { Router } from 'express';
import { PartnerService } from '../service/partner-service';
import { EventService } from '../service/event-service';

export const partnerRoutes = Router();

partnerRoutes.post('/register', async (req, res) => {
    const { name, email, password, company_name } = req.body;
    const partnerService = new PartnerService();
    const result = await partnerService.register({
        name,
        email,
        password,
        company_name
    });
    res.status(201).json(result);
})


partnerRoutes.post('/events', async (req, res) => {
    const { name, description, date, location } = req.body;

    const userId = req.user!.id; // ! usado para indicar que o valor não é nulo
    const partnerService = new PartnerService();
    const partner = await partnerService.findUserById(userId);
    if (!partner) {
        res.status(403).json({ message: 'Not Authorized!' })
        return;
    }

    const eventService = new EventService();
    const result = await eventService.create({
        name,
        description,
        date: new Date(date),
        location,
        partnerId: partner.id
    })
    res.status(201).json(result);
});

partnerRoutes.get('/events', async (req, res) => {
    const userId = req.user!.id; // ! usado para indicar que o valor não é nulo
    const partnerService = new PartnerService();
    const partner = await partnerService.findUserById(userId);

    if (!partner) {
        res.status(403).json({ message: 'Not Authorized!' })
        return;
    }

    const eventService = new EventService();
    const result = await eventService.findAll(partner.id);
    res.json(result);

});

partnerRoutes.get('/events/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user!.id; // ! usado para indicar que o valor não é nulo

    const partnerService = new PartnerService();
    const partner = await partnerService.findUserById(userId);

    if (!partner) {
        res.status(403).json({ message: 'Not Authorized!' })
        return;
    }

    const eventService = new EventService();
    const event = await eventService.findById(+eventId);

    if (!event || event.partner_id !== partner.id) {
        res.status(404).json({ message: 'Event not found!' })
        return;
    }

    res.json(event);

});