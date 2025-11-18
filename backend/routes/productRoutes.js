import express from 'express';
import {addProduct, removeProduct, getAllProducts} from "../controllers/productController.js"
import { protect } from '../middleware/auth.js';
import multer from 'multer';
//using express for the routing where this routes functionality will be handled by the controllers
//the protect functionality is for the token authentication to restrict access to certain routes
const productRouter = express.Router();

//image storage engine
const storage = multer.diskStorage({
    destination:"upload/images",
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}-${file.originalname}`);
    }   
});

const upload = multer({storage:storage});

productRouter.post('/add-product', upload.single('product'), addProduct);

productRouter.post('/remove-product',  removeProduct);

productRouter.get('/all-products', getAllProducts);

export default productRouter;