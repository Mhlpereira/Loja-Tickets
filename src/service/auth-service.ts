import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { InvalidCredentialError } from "../error/invalid-credential";
import { UserModel } from "../model/user-model";


export class AuthService {

    async login(email: string, password: string) {
        const userModel = await UserModel.findByEmail(email);
        if (userModel && bcrypt.compareSync(password, userModel.password)) {
            return jwt.sign({ id: userModel.id, email: userModel.email }, "123456", {
                expiresIn: "1h"
            })
        } else {
            throw new InvalidCredentialError();
        }
    }
}