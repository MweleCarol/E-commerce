import Product from "../models/productModel.js";




//function foe error handling 
const handleError = (res, error , message = "An error occurred") => {

    console.error(error);
    //return response where it shows the status code , message and the error
    res.status(500).json({
        success: false,
        message: message,
        error: error.message,
    });
};

//create a new product entry
//route endpoint: /api/products
//restrict access to authenticated users only


//add product
//route endpoint: /api/products/addproduct
//restrict access to authenticated users only

const addProduct = async (req, res) => {
    

   try{
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
    await product.save();

    res.json({//to get responce from front-end
      success: true,
      name:req.body.name,
      image:req.body.image,
      category:req.body.category,
      new_price:req.body.new_price,
      old_price:req.body.old_price,
    })
    }catch(error){
        handleError(res, error, "Failed to add product");
    }
}



//remove product
//route endpoint: /api/products/removeproduct
//restrict access to authenticated users only

const removeProduct = async (req, res) => {
    try{
        await Product.findOneAndDelete({id:req.body.id});
        res.json({
            success: true,
            name:req.body.name,
        })
    }catch(error){
        handleError(res, error, "Failed to remove product");
    }
}



//getting all the products in the database
//route endpoint: /api/products/allproducts
//public access
const getAllProducts = async (req, res) => {
    try{
        let products = await Product.find({});
        res.json({
            success: true,
            products: products,
        });
    }catch(error){
        handleError(res, error, "Failed to fetch products");
    }
}


export { addProduct, removeProduct, getAllProducts };