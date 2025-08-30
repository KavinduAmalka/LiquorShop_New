import express from 'express';
import authAuth0 from "../middlewares/authAuth0.js";
import { updateCart } from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.post('/update', authAuth0, updateCart)

export default cartRouter;