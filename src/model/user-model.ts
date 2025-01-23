import * as mysql from 'mysql2/promise';
import { createConnection } from '../database';

export class UserModel {
    id: number;
    name: string;
    email: string;
    password: string;
    created_at: Date;

    constructor(data: Partial<UserModel>) {
        this.fill(data);
    }


    static async create(data: { name: string; email: string; password: string }): Promise<UserModel> {
        const connection = await createConnection();
        const { name, email, password } = data;
        try {
            const createdAt = new Date();
            const [userResult] = await connection.execute<mysql.ResultSetHeader>(
                'INSERT INTO user (name, email, password, created_at) VALUES (?, ?, ?, ?)',
                [name, email, password, createdAt]);

            return new UserModel({
                ...data,
                created_at: createdAt,
                id: userResult.insertId
            })
        } finally {
            connection.end();
        }
    }

    update() {

    }

    delete() {

    }

    static findById() {

    }

    static async findByEmail(email: string): Promise<UserModel> {

    }

    findAll() {

    }

    fill(data: Partial<UserModel>): void {
        if (data.id !== undefined) this.id = data.id;
        if (data.name !== undefined) this.name = data.name;
        if (data.email !== undefined) this.email = data.email;
        if (data.password !== undefined) this.password = data.password;
        if (data.created_at !== undefined) this.created_at = data.created_at;
    }
}