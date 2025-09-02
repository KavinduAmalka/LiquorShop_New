import express from 'express';
import authAuth0 from "../middlewares/authAuth0.js";
import { updateCart } from "../controllers/cartController.js";
import { validateCart } from '../middlewares/validation.js';

const cartRouter = express.Router();

cartRouter.post('/update', authAuth0, validateCart, updateCart)

export default cartRouter;