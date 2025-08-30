import express from 'express';
import authAuth0 from '../middlewares/authAuth0.js';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/cod', authAuth0, placeOrderCOD)
orderRouter.post('/stripe', authAuth0, placeOrderStripe)
orderRouter.get('/user', authAuth0, getUserOrders)
orderRouter.get('/seller', authSeller, getAllOrders)

export default orderRouter;