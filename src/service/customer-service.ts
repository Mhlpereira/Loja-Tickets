import { Database } from "../database";
import { UserModel } from '../model/user-model';
import { CustomerModel } from '../model/customer-model';


export class CustomerService {

    async register(data: {
        name: string;
        email: string;
        password: string;
        address: string;
        phone: string;
    }) {
        const { name, email, password, address, phone } = data;

        const connection = await Database.getInstance().getConnection();
        try {
            await connection.beginTransaction()
            const user = await UserModel.create({
                name,
                email,
                password
            })
            const customer = await CustomerModel.create({
                user_id: user.id,
                address,
                phone
            })
            await connection.commit();
            return {
                id: customer.id,
                name,
                user_id: user.id,
                address,
                phone,
                created_at: customer.created_at
            };
        } catch (e) {
            await connection.rollback();
            throw e;
        }
    }
}
