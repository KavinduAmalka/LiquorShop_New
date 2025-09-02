import express from 'express';
import { isAuth, login, logout, register, updateProfile } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import { 
  validateUserRegistration, 
  validateUserLogin, 
  validateProfileUpdate 
} from '../middlewares/validation.js';

const userRouter = express.Router();

userRouter.post('/register', validateUserRegistration, register)
userRouter.post('/login', validateUserLogin, login)

userRouter.get('/is-auth', authUser, isAuth)
userRouter.get('/logout', authUser, logout)
userRouter.post('/update-profile', authUser, validateProfileUpdate, updateProfile)

export default userRouter;