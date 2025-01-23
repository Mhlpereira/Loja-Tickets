import express from 'express';
import * as mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { createConnection } from './database';
import { authRoutes } from './controller/auth-controller';
import { partnerRoutes } from './controller/partner-controller';
import { customerRoutes } from './controller/customer-controller';
import { eventRoutes } from './controller/event-controller';


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

app.use('/auth', authRoutes);
app.use('/partners', partnerRoutes);
app.use('/customer', customerRoutes);
app.use('/events', eventRoutes);


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