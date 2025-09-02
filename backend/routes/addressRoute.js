import express from 'express';
import authAuth0 from '../middlewares/authAuth0.js';
import { addAddress, getAddress } from '../controllers/addressController.js';
import { validateAddress } from '../middlewares/validation.js';

const addressRouter = express.Router();

addressRouter.post('/add', authAuth0, validateAddress, addAddress);
addressRouter.get('/get', authAuth0, getAddress);

export default addressRouter;