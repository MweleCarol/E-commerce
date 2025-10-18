import { connectDb } from './config/db.js'
import express from 'express'

import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import multer from "multer"
import path from "path"
import cors from 'cors'
import 'dotenv/config'
import { type } from 'os'


const app = express()

app.use(express.json());
app.use(cors());

const port = process.env.PORT


connectDb();
//API CREATION
app.get("/", (req, res)=> {
    res.send("Express App is running")

})

//IMAGE STORAGE ENGINE
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})

//CREATING UPLOAD ENDPOINT FOR IMAGES
app.use('/images',express.static('upload/images'))

app.post("/upload", upload.single('product'),(req,res)=>{
    try {

        res.json({
        success: true,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })

    }catch(error){
        res.json({
            success:false,
            message:error
        })
    }
   
})

//SCHEMA FOR CREATING and storing PRODUCTS
const Product = mongoose.model("Product",{
     id:{
        type: Number,
        required:  true,
     },
     name:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    new_price:{
        type: Number,
        required: true,
    },
    old_price:{
        type: Number,
        required: true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type: Boolean,
        default: true,
    },
});

app.post('/addproduct',async (req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length > 0)//means the product is available in the database
    {
        let last_product_array = products.slice(-1); 
        let last_product = last_product_array[0];
        id = last_product.id + 1;///generate an id for the products in the database
    }else{
        id = 1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });
    console.log(product);
    await product.save();//save the added products
    console.log("Saved");
    res.json({//to get responce from front-end
      success: true,
      name:req.body.name,
    })
})
//Creating api for deliting products
app.post('/removeproduct',async (req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success: true,
        name:req.body.name,
    })
})

//Creating api for getting all products
app.get('/allproducts',async(req,res)=>{
    let products = await Product.find({});
    console.log("All products fetched");
    res.send(products);
})

app.listen(port , (error)=> {

    if(!error){
        console.log("Server running on Port "+port)
    }else{
        console.log("Error in running the server"+ error)

    }

})




