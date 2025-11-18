import Product from "../models/productModel.js";

//function foe error handling
const handleError = (res, error, message = "An error occurred") => {
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

  //check if file is present
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  let image_filename = `${req.file.filename}`;

  console.log("Form body data:", req.body);

  try {

    //validate required fields
    const requiredFields = ['name', 'category', 'new_price', 'old_price'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    //convert price fields to numbers
    const new_price = parseFloat(req.body.new_price);
    const old_price = parseFloat(req.body.old_price);

    //validate price conversion
    if (isNaN(new_price) || isNaN(old_price)) {
      return res.status(400).json({
        success: false,
        message: "Invalid price format. Prices must be numbers.",
      });
    }


    //generate unique id for the product
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
      //means the product is available in the database
      let last_product_array = products.slice(-1);
      let last_product = last_product_array[0];
      id = last_product.id + 1; ///generate an id for the products in the database
    } else {
      id = 1;
    }

    //create a new product with data types
    const product = new Product({
      id: id,
      name: req.body.name,
      image : image_filename,
      category: req.body.category,
      new_price: new_price,
      old_price: old_price,

    });
    console.log("Product to save",product);
    await product.save();

    res.json({
      //to get response from front-end
      success: true,
      message: "Product added successfully",
      product: product,
    });
  } catch (error) {
    handleError(res, error, "Failed to add product");
  }
};

//remove product
//route endpoint: /api/products/remove product
//restrict access to authenticated users only

const removeProduct = async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({
      success: true,
      name: req.body.name,
    });
  } catch (error) {
    handleError(res, error, "Failed to remove product");
  }
};

//getting all the products in the database
//route endpoint: /api/products/allproducts
//public access
const getAllProducts = async (req, res) => {
  try {
    let products = await Product.find({});
    
    // Add full image URL to each product
    const productsWithImageUrls = products.map(product => ({
      ...product.toObject(),
      image_url: `http://localhost:4000/images/${product.image}`
    }));

    res.json({
      success: true,
      products: productsWithImageUrls,
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch products");
  }
};

export { addProduct, removeProduct, getAllProducts };
