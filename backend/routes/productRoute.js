import express from 'express';
import { upload } from '../confligs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { addProduct, changeStock, productByID, productList } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post('/add', upload.array(['images']), authSeller, addProduct);
productRouter.get('/list', productList)
productRouter.get('/id', productByID)
productRouter.post('/stock', authSeller, changeStock)

export default productRouter;