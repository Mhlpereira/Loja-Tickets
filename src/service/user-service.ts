import * as mysql from 'mysql2/promise';
import { Database } from '../database';

export class UserService {

    async findById(userId: number) {
        const connection = Database.getInstance();
        const [rows] = await connection.execute<mysql.RowDataPacket[]>
            ('SELECT * FROM user WHERE id = ?',
                [userId]
            );
        return rows.length ? rows[0] : null;
    }

    async findByEmail(email: number) {
        const connection = Database.getInstance();
        const [rows] = await connection.execute<mysql.RowDataPacket[]>
            ('SELECT * FROM user WHERE id = ?',
                [email]
            );
        return rows.length ? rows[0] : null;
    }

}