import * as mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { createConnection } from "../database";
import { Router } from 'express';

export const partnerRoutes = Router();

partnerRoutes.post('/register', async (req, res) => {
    const { name, email, password, company_name } = req.body;

    const connection = await createConnection();
    try {
        const createdAt = new Date();
        const hashedPassword = bcrypt.hashSync(password, 10);
        const [userResult] = await connection.execute<mysql.ResultSetHeader>(
            'INSERT INTO user (name, email, password, created_at) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, createdAt]);

        const userId = userResult.insertId;
        const [partnerResult] = await connection.execute<mysql.ResultSetHeader>(
            'INSERT INTO partner (user_id, company_name, created_at) VALUES (?, ?, ?)',
            [userId, company_name, createdAt]
        );
        res.status(201).json({ id: partnerResult.insertId, name, email, password, user_id: userId, company_name, created_at: createdAt });
    } finally {
        connection.end();
    }
})


partnerRoutes.post('/events', async (req, res) => {
    const { name, description, date, location } = req.body;

    const userId = req.user!.id; // ! usado para indicar que o valor não é nulo
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
            "SELECT * FROM partner WHERE user_id = ?",
            [userId]
        );
        const partner = rows.length ? rows[0] : null;

        if (!partner) {
            res.status(403).json({ message: 'Not Authorized!' })
            return;
        }

        const eventDate = new Date(date);
        const createAt = new Date();

        const [eventResult] = await connection.execute<mysql.ResultSetHeader>(
            "INSERT INTO events (name, description, date, location, created_at, partner_id) VALUES (?, ?, ?, ?, ?, ?)",
            [name, description, eventDate, location, createAt, partner.id]
        );
        res.status(201).json({
            id: eventResult.insertId,
            name,
            description,
            date: eventDate,
            location,
            created_at: createAt,
            partner_id: partner.id
        });
    } finally {
        await connection.end();
    }
});

partnerRoutes.get('/events', async (req, res) => {
    const userId = req.user!.id; // ! usado para indicar que o valor não é nulo
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
            "SELECT * FROM events WHERE user_id = ?",
            [userId]
        );
        const partner = rows.length ? rows[0] : null;

        if (!partner) {
            res.status(403).json({ message: 'Not Authorized!' })
            return;
        }

        const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
            "SELECT * FROM events WHERE partner_id = ?",
            [partner.id]
        );
        res.status(201).json(eventRows);
    } finally {
        await connection.end();
    }
});

partnerRoutes.get('/events/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user!.id; // ! usado para indicar que o valor não é nulo
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
            "SELECT * FROM events WHERE user_id = ?",
            [userId]
        );
        const partner = rows.length ? rows[0] : null;

        if (!partner) {
            res.status(403).json({ message: 'Not Authorized!' })
            return;
        }

        const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
            "SELECT * FROM events WHERE partner_id = ? and id = ?",
            [partner.id, eventId]
        );

        const event = eventRows.length ? eventRows[0] : null;
        if (!event) {
            res.status(404).json({ message: 'Event not found!' })
            return;
        }

        res.json(event);
    } finally {
        await connection.end();
    }
});