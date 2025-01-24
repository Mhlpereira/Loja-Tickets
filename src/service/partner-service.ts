import * as mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { Database } from "../database";
import { UserModel } from '../model/user-model';
import { PartnerModel } from '../model/partner-model';


export class PartnerService {

    async register(data: {
        name: string;
        email: string;
        password: string;
        company_name: string;
    }) {
        const { name, email, password, company_name } = data;

        const connection = await Database.getInstance().getConnection();
        try {
            await connection.beginTransaction();
            const user = await UserModel.create({
                name,
                email,
                password
            });

            const partner = await PartnerModel.create({
                company_name,
                user_id: user.id,
            })
            await connection.commit();
            return {
                id: partner.id,
                name,
                email,
                password,
                user_id: user.id,
                company_name,
                created_at: partner.created_at
            };
        }
        catch (e) {
            await connection.rollback();
            throw e;
        }
    }

    async findUserById(userId: number) {
        return PartnerModel.findById(userId);
    }
}
