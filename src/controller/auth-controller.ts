import { Router } from "express";
import { AuthService } from "../service/auth-service";
import { InvalidCredentialError } from "../error/invalid-credential";


export const authRoutes = Router();

authRoutes.post('/login', async (req, res) => {
    const {email, password} = req.body;
    const authService = new AuthService();
    try{
    const token = await authService.login(email, password);
    res.json({token});
    } catch(e){
        console.error(e); // para mostrar nos logs
        if(e instanceof InvalidCredentialError){
            res.status(401).json({message: 'invalid credentials'});
        }else{
            res.status(500).json({message: 'Unexpected error occurred'});
        }
    }
})