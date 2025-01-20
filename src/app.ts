import express from 'express';
import * as mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

function createConnection() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'tickets',
        port: 33060
    });
}
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json('Hello World');
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>
            ('SELECT * FROM user WHERE email = ?', [email]);
        const user = rows.length ? rows[0] : null;
        if (user && bcrypt.compareSync(password, user.password)){
            const token = jwt.sign({ id: user.id, email: user.email }, "123456", { expiresIn: "1h" })

            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } finally {
        connection.end();
    }
})

app.post('/partners', async (req, res) => {
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

app.post('/customer', async (req, res) => {
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

app.post('/partners/events', (req, res) => {
    const { name, description, date, location } = req.body;
})

app.get('/partners/events', (req, res) => {
})

app.get('/partners/events/:eventId', (req, res) => {
    const { eventId } = req.params;
    console.log(eventId);
    res.send();
})

app.get('/events', (req, res) => {
})

app.get('/events/:eventId', (req, res) => {
    const { eventId } = req.params;
    console.log(eventId);
    res.send();
})


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

