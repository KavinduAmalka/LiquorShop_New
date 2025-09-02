import express from 'express';
import { isSellerAuth, sellerLogin, sellerogout } from '../controllers/sellerController.js';
import authSeller from '../middlewares/authSeller.js';
import { validateSellerLogin } from '../middlewares/validation.js';

const sellerRouter = express.Router();

sellerRouter.post('/login', validateSellerLogin, sellerLogin);
sellerRouter.get('/is-auth', authSeller, isSellerAuth);
sellerRouter.get('/logout', sellerogout);

export default sellerRouter;