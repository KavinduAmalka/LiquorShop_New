import express from 'express';
import { upload } from '../confligs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { addProduct, changeStock, productByID, productList } from '../controllers/productController.js';
import { validateProduct, validateQuery, validateObjectId } from '../middlewares/validation.js';

const productRouter = express.Router();

productRouter.post('/add', upload.array(['images']), authSeller, validateProduct, addProduct);
productRouter.get('/list', validateQuery, productList)
productRouter.get('/id', validateObjectId, productByID)
productRouter.post('/stock', authSeller, changeStock)

export default productRouter;