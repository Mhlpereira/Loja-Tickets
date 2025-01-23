import * as mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { createConnection } from '../database';

export class UserService {

    async findById(userId: number) {
        const connection = await createConnection();
        try {
            const [rows] = await connection.execute<mysql.RowDataPacket[]>
                ('SELECT * FROM user WHERE id = ?',
                    [userId]
                );
            return rows.length ? rows[0] : null;
        } finally {
            await connection.end();
        }
}

async findByEmail(email: number) {
    const connection = await createConnection();
    try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>
            ('SELECT * FROM user WHERE id = ?',
                [email]
            );
        return rows.length ? rows[0] : null;
    } finally {
        await connection.end();
    }
}

}