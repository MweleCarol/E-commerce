import express from 'express';
import {addProduct, removeProduct, getAllProducts} from "../controllers/productController.js"
import { protect } from '../middleware/auth.js';
//using express for the routing where this routes functionality will be handled by the controllers
//the protect functionality is for the token authentication to restrict access to certain routes
const productRouter = express.Router();

productRouter.post('/addproduct', protect, addProduct);

productRouter.post('/removeproduct', protect,  removeProduct);

productRouter.get('/allproducts', getAllProducts);

export default productRouter;