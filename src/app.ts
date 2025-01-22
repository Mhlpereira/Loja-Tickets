import express from 'express';
import * as mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createConnection } from './database';


const app = express();

app.use(express.json());

const unprotectedRoutes = [
    { method: 'POST', path: '/auth/login' },
    { method: 'POST', path: '/customer/register' },
    { method: 'POST', path: '/partners/register' },
    { method: 'GET', path: '/events' }
];

app.use(async (req, res, next) => {
    const isUnprotected = unprotectedRoutes.some(
        (route) => route.method === req.method && req.path.startsWith(route.path)
    );

    if(isUnprotected){
        return next();
    }

    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'No tokeno provider' });
        return;
    }

    try {
        const payload = jwt.verify(token, "123456") as {
            id: number;
            email: string;
        };
        const connection = await createConnection();
        const [rows] = await connection.execute<mysql.RowDataPacket[]>
            ('SELECT * FROM user WHERE id = ?', [payload.id]);

        const user = rows.length ? rows[0] : null;
        if (!user) {
            res.status(401).json({ message: 'Failed to authenticate token' });
            return;
        }
        req.user = user as { id: number, email: string };

        next();
    } catch (e) {
        res.send(401).json({ message: 'Invalid token' });
    }

})

app.get('/', (req, res) => {
    res.json('Hello World');
});



app.post('/partners/register', async (req, res) => {
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

app.post('/customer/register', async (req, res) => {
    const { name, email, password, address, phone } = req.body;

    const connection = await createConnection();
    try {
        const createdAt = new Date();
        const hashedPassword = bcrypt.hashSync(password, 10);
        const [userResult] = await connection.execute<mysql.ResultSetHeader>(
            'INSERT INTO user (name, email, password, created_at) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, createdAt]);

        const userId = userResult.insertId;
        const [customerResult] = await connection.execute<mysql.ResultSetHeader>(
            'INSERT INTO customer (user_id, address, phone, created_at) VALUES (?, ?, ?, ?)',
            [userId, address, phone, createdAt]
        );
        res.status(201).json({ id: customerResult.insertId, name, user_id: userId, address, phone, created_at: createdAt });
    } finally {
        connection.end();
    }
})

app.post('/partners/events', async (req, res) => {
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

app.get('/partners/events', async (req, res) => {
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

        const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
            "SELECT * FROM events WHERE partner_id = ?",
            [partner.id]
        );
        res.status(201).json(eventRows);
    } finally {
        await connection.end();
    }
});

app.get('/partners/events/:eventId', async (req, res) => {
    const { eventId } = req.params;
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

app.get('/events', async (req, res) => {
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT * FROM events'
        );
        res.json(rows);
    } finally {
        await connection.end();
    }
})

app.get('/events/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const connection = await createConnection();
    try {
        const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
            "SELECT * FROM events WHERE id = ?",
            [eventId]
        );
        const event = eventRows.length ? eventRows[0] : null;

        if (!event) {
            res.status(404).json({ message: "Event not found" });
            return;
        }

        res.json(event);
    } finally {
        await connection.end();
    }
});

app.listen(3000, async () => {
    const connection = await createConnection();
    await connection.execute('SET FOREIGN_KEY_CHECKS=0');
    await connection.execute('TRUNCATE TABLE user');
    await connection.execute('TRUNCATE TABLE partner');
    await connection.execute('TRUNCATE TABLE customer');
    await connection.execute('TRUNCATE TABLE events');
    await connection.execute('SET FOREIGN_KEY_CHECKS=1');
    console.log('Running on port 3000');
});