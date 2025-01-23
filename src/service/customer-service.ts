import * as mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { createConnection } from "../database";


export class CustomerService{

    async register(data: {
        name: string;
        email: string;
        password: string; 
        address: string;
        phone: string;
    }){
        const { name, email, password, address, phone } = data;
        
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
               return{ 
                id: customerResult.insertId, 
                name, 
                user_id: userId, 
                address, 
                phone, 
                created_at: createdAt 
            };
            } finally {
                connection.end();
            }
    }
}